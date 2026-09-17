import GridLoader from '@/components/smoothui/grid-loader';
import React, { useState, useEffect } from "react";
import { Search, User, Calendar, BookOpen, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Button from "../components/Button";


export default function ProgrammeParticipantSearchPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("programme");
    
    // Programme Search State
    const [programmes, setProgrammes] = useState([]);
    const [selectedProgramme, setSelectedProgramme] = useState("");
    const [programmeCandidates, setProgrammeCandidates] = useState([]);
    const [loadingProg, setLoadingProg] = useState(false);
    
    // Candidate Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [candidateResults, setCandidateResults] = useState([]);
    const [loadingCand, setLoadingCand] = useState(false);

    useEffect(() => {
        api.get("/programmes").then(res => setProgrammes(res.data)).catch(console.error);
    }, []);

    const handleProgrammeSearch = async (progId) => {
        setSelectedProgramme(progId);
        if (!progId) {
            setProgrammeCandidates([]);
            return;
        }
        setLoadingProg(true);
        try {
            const res = await api.get(`/registrations?programme=${progId}&status=approved`);
            // res.data could be { registrations } or just array depending on backwards compat
            const list = res.data.registrations || res.data || [];
            
            // Group participants by registration so group programmes are shown in one cell
            let flatCandidates = [];
              list.forEach(reg => {
                  if (reg.candidates && Array.isArray(reg.candidates)) {
                      reg.candidates.forEach(c => {
                          flatCandidates.push({
                              _id: reg._id + '_' + c._id, // unique key for rendering
                              admissionNo: c.admissionNo,
                              name: c.name,
                              team: reg.team
                          });
                      });
                  }
              });
              setProgrammeCandidates(flatCandidates);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingProg(false);
        }
    };

    const handleCandidateSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoadingCand(true);
        setCandidateResults([]); // reset before each new search
        try {
            const res = await api.get(`/candidates/lookup?search=${encodeURIComponent(searchQuery)}`);
            // Guard: ensure we always set an array, never undefined/null
            const results = Array.isArray(res.data) ? res.data : [];
            setCandidateResults(results);
        } catch (err) {
            console.error(err);
            setCandidateResults([]);
        } finally {
            setLoadingCand(false);
        }
    };

    return (
        <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Programme & Participant Search</h1>
            
            {/* Tabs */}
            <div className="flex gap-4 border-b border-[var(--color-border)] pb-4">
                <button 
                    onClick={() => setActiveTab('programme')}
                    className={`px-4 py-2 font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === 'programme' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-body)]'}`}
                >
                    Search by Programme
                </button>
                <button 
                    onClick={() => setActiveTab('participant')}
                    className={`px-4 py-2 font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === 'participant' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-body)]'}`}
                >
                    Search by Participant
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === "programme" && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
                        <label className="block text-sm font-bold text-[var(--color-text-heading)] mb-2">Select Programme</label>
                        <select
                            className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-heading)]"
                            value={selectedProgramme}
                            onChange={(e) => handleProgrammeSearch(e.target.value)}
                        >
                            <option value="">-- Choose a Programme --</option>
                            {programmes.map(p => (
                                <option key={p._id} value={p._id}>{p.code} - {p.name} ({p.category})</option>
                            ))}
                        </select>
                    </div>

                    {loadingProg ? (
                        <div className="flex justify-center p-12"><GridLoader size="lg" color="#ea580c" mode="pulse" /></div>
                    ) : selectedProgramme && (
                        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface-elevated)]">
                                <h3 className="font-bold text-[var(--color-text-heading)]">Registered Candidates ({programmeCandidates.length})</h3>
                            </div>
                            {programmeCandidates.length === 0 ? (
                                <div className="p-12 text-center text-[var(--color-text-muted)]">No candidates found.</div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] text-xs uppercase tracking-wider border-b border-[var(--color-border)]">
                                            <th className="p-4 font-medium">AD No</th>
                                            <th className="p-4 font-medium">Candidate Name</th>
                                            <th className="p-4 font-medium">Team</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--color-border)] text-sm text-[var(--color-text-heading)]">
                                        {programmeCandidates.map(c => (
                                            <tr key={c._id} className="hover:bg-[var(--color-surface-elevated)] transition-colors">
                                                <td className="p-4 font-medium">{c.admissionNo}</td>
                                                <td className="p-4">{c.name}</td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded-md text-xs font-medium">
                                                        {c.team?.name || 'Unknown'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "participant" && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
                        <label className="block text-sm font-bold text-[var(--color-text-heading)] mb-2">Search Candidates</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Enter Name or AD Number..."
                                className="flex-1 max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-heading)]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCandidateSearch()}
                            />
                            <Button variant="primary" onClick={handleCandidateSearch} disabled={loadingCand}>
                                <Search size={18} className="mr-2" /> Search
                            </Button>
                        </div>
                    </div>

                    {loadingCand ? (
                        <div className="flex justify-center p-12"><GridLoader size="lg" color="#ea580c" mode="pulse" /></div>
                    ) : candidateResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {candidateResults.map(c => (
                                <div 
                                    key={c?._id || Math.random()} 
                                    onClick={() => c?._id && navigate(`/candidate-status/${c._id}`)}
                                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:shadow-md hover:border-[var(--color-primary)] transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[var(--color-text-heading)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">{c?.name || '—'}</h3>
                                            <p className="text-xs text-[var(--color-text-muted)] font-medium">AD: {c?.admissionNo || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 text-xs font-medium text-[var(--color-text-muted)]">
                                        <span className="px-2 py-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md">{c?.category || '—'}</span>
                                        <span className="px-2 py-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md">{c?.team?.name || 'Unknown Team'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searchQuery && !loadingCand ? (
                        <div className="p-12 text-center text-[var(--color-text-muted)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
                            <Search size={40} className="mx-auto mb-3 opacity-20" />
                            <p className="font-semibold text-[var(--color-text-heading)]">No candidates found</p>
                            <p className="text-sm mt-1">Try a different name or admission number.</p>
                        </div>
                    ) : null}

                </div>
            )}
        </div>
    );
}

