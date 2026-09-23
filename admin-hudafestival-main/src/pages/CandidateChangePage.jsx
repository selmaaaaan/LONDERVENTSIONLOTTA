import React, { useState, useEffect } from 'react';
import { Search, Save, AlertTriangle, CheckCircle, RefreshCcw, UserMinus, UserPlus } from 'lucide-react';
import api from '../services/api';

export default function CandidateChangePage() {
    const [registrations, setRegistrations] = useState([]);
    const [filteredRegs, setFilteredRegs] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const [selectedReg, setSelectedReg] = useState(null);
    const [oldCandidateId, setOldCandidateId] = useState('');
    const [newCandidateId, setNewCandidateId] = useState('');
    const [substituteCandidates, setSubstituteCandidates] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            // Fetch all approved/pending registrations
            const res = await api.get('/registrations?limit=1000');
            setRegistrations(res.data.registrations || []);
            setFilteredRegs(res.data.registrations || []);
        } catch (err) {
            console.error('Failed to load registrations', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    useEffect(() => {
        if (search.trim() === '') {
            setFilteredRegs(registrations);
        } else {
            const lower = search.toLowerCase();
            setFilteredRegs(registrations.filter(r => 
                r.programme?.name?.toLowerCase().includes(lower) ||
                r.team?.name?.toLowerCase().includes(lower) ||
                r.candidates?.some(c => c.name?.toLowerCase().includes(lower) || c.admissionNo?.toLowerCase().includes(lower))
            ));
        }
    }, [search, registrations]);

    useEffect(() => {
        if (selectedReg && oldCandidateId) {
            const fetchSubs = async () => {
                try {
                    const res = await api.get(`/candidates/team/${selectedReg.team._id}`);
                    const oldCand = selectedReg.candidates.find(c => c._id === oldCandidateId);
                    if (!oldCand) return;
                    
                    const eligible = res.data.filter(c => c._id !== oldCandidateId);
                    setSubstituteCandidates(eligible);
                } catch (err) {
                    console.error('Failed to fetch subs', err);
                }
            };
            fetchSubs();
        } else {
            setSubstituteCandidates([]);
            setNewCandidateId('');
        }
    }, [selectedReg, oldCandidateId]);

    const handleSubstitute = async () => {
        if (!selectedReg || !oldCandidateId || !newCandidateId) {
            setMessage({ text: 'Please select both old and new candidates.', type: 'error' });
            return;
        }

        setSubmitting(true);
        setMessage({ text: '', type: '' });
        try {
            await api.patch(`/registrations/${selectedReg._id}/substitute`, {
                oldCandidateId,
                newCandidateId
            });
            setMessage({ text: 'Candidate successfully changed everywhere (Registration, Results, etc.)!', type: 'success' });
            setSelectedReg(null);
            setOldCandidateId('');
            setNewCandidateId('');
            fetchRegistrations();
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Substitution failed', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-full">
            <h1 className="text-2xl font-bold mb-6 text-[var(--color-text-heading)]">Candidate Change Portal</h1>
            <p className="text-[var(--color-text-muted)] mb-8">
                Swap candidates securely. This will automatically update the registration, Code Letters, and any drafted/published Results to reflect the new candidate.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 min-h-0">
                
                {/* Left Col: Search & Select */}
                <div className="md:col-span-2 flex flex-col bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <div className="p-4 border-b border-[var(--color-border)]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by programme, team, or candidate name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-heading)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loading ? (
                            <div className="text-center py-10 text-[var(--color-text-muted)]">Loading registrations...</div>
                        ) : filteredRegs.length === 0 ? (
                            <div className="text-center py-10 text-[var(--color-text-muted)]">No registrations found.</div>
                        ) : (
                            filteredRegs.map(reg => {
                                const isSelected = selectedReg?._id === reg._id;
                                return (
                                    <div 
                                        key={reg._id}
                                        onClick={() => { setSelectedReg(reg); setOldCandidateId(''); setNewCandidateId(''); setMessage({text:'', type:''}); }}
                                        className={`p-4 border rounded-xl cursor-pointer transition-colors ${isSelected ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)]'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-[var(--color-text-heading)]">{reg.programme?.name}</div>
                                                <div className="text-xs text-[var(--color-text-muted)]">{reg.programme?.category} • {reg.programme?.type}</div>
                                            </div>
                                            <div className="px-2 py-1 bg-[var(--color-background)] rounded text-xs font-bold text-[var(--color-text-muted)] border border-[var(--color-border)]">
                                                {reg.team?.name}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {reg.candidates?.map(c => (
                                                <span key={c._id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--color-background)] text-xs font-medium rounded-full border border-[var(--color-border)] text-[var(--color-text-heading)]">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    {c.name} ({c.admissionNo})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Right Col: Action Panel */}
                <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm p-6 flex flex-col h-fit">
                    <h3 className="text-lg font-bold text-[var(--color-text-heading)] flex items-center mb-6">
                        <RefreshCcw size={18} className="mr-2 text-[var(--color-primary)]" />
                        Execute Change
                    </h3>

                    {selectedReg ? (
                        <div className="space-y-6 flex-1">
                            
                            <div>
                                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <UserMinus size={14} className="text-red-500" />
                                    Original Candidate
                                </label>
                                <select
                                    value={oldCandidateId}
                                    onChange={(e) => setOldCandidateId(e.target.value)}
                                    className="w-full px-4 py-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-heading)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none appearance-none cursor-pointer"
                                >
                                    <option value="">-- Select Candidate to Replace --</option>
                                    {selectedReg.candidates?.map(c => (
                                        <option key={c._id} value={c._id}>{c.name} ({c.admissionNo})</option>
                                    ))}
                                </select>
                            </div>

                            {oldCandidateId && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                    <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <UserPlus size={14} className="text-emerald-500" />
                                        New Candidate
                                    </label>
                                    <select
                                        value={newCandidateId}
                                        onChange={(e) => setNewCandidateId(e.target.value)}
                                        className="w-full px-4 py-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-heading)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">-- Select Replacement --</option>
                                        {substituteCandidates.map(c => (
                                            <option key={c._id} value={c._id}>{c.name} ({c.admissionNo})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {message.text && (
                                <div className={`p-4 rounded-xl text-sm font-medium flex items-start gap-3 ${message.type === 'error' ? 'bg-red-500/10 text-red-600 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'}`}>
                                    {message.type === 'error' ? <AlertTriangle size={18} className="shrink-0 mt-0.5" /> : <CheckCircle size={18} className="shrink-0 mt-0.5" />}
                                    <div className="leading-snug">{message.text}</div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                            <div className="w-16 h-16 rounded-full bg-[var(--color-background)] flex items-center justify-center mb-4 border border-[var(--color-border)]">
                                <Search size={24} className="opacity-50" />
                            </div>
                            <p className="text-center text-sm">Select a registration from the list<br/>to start a candidate change.</p>
                        </div>
                    )}

                    {selectedReg && (
                        <div className="pt-6 mt-6 border-t border-[var(--color-border)]">
                            <button
                                onClick={handleSubstitute}
                                disabled={submitting || !oldCandidateId || !newCandidateId}
                                className="w-full py-3 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-bold flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[var(--color-primary)]/20"
                            >
                                {submitting ? 'Processing...' : 'Confirm Change'}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
