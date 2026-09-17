import Pagination from '../components/Pagination';
import { useAlert } from '../context/AlertContext';
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Table2, CheckCircle, Clock, AlertTriangle, Users } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';


const CATEGORIES = ['All', 'BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'];
const STAGES = ['All Stages', 'Stage', 'Non-Stage'];

export default function TeamRegistrationListPage() {
  const alertAction = useAlert();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo?.role === 'admin';

    // Filters
    const [selectedTeam, setSelectedTeam] = useState(isAdmin ? '' : userInfo.team);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStage, setSelectedStage] = useState('All Stages');
    const [searchQuery, setSearchQuery] = useState('');
    const [showOnlyPending, setShowOnlyPending] = useState(false);
    const [showOpenQuotasOnly, setShowOpenQuotasOnly] = useState(false);

    // Data state
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Grid Data
    const [candidates, setCandidates] = useState([]);
    const [programmes, setProgrammes] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [cellError, setCellError] = useState({ cellId: null, message: '' });
    const [pendingChanges, setPendingChanges] = useState({});
    const [saving, setSaving] = useState(false);
    const [groupModal, setGroupModal] = useState({ isOpen: false, prog: null, candidate: null, selectedIds: [], editRegId: null });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState({ isOpen: false, regId: null, progName: '', candId: null, candName: '' });
    const [groupSaving, setGroupSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveErrorsList, setSaveErrorsList] = useState([]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (Object.keys(pendingChanges).length > 0) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [pendingChanges]);

    useEffect(() => {
        if (isAdmin) {
            api.get('/teams').then(res => setTeams(res.data)).catch(console.error);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (!selectedTeam || !selectedCategory) return;
        setPendingChanges({});
        fetchGrid();
    }, [selectedTeam, selectedCategory, selectedStage]);

    const fetchGrid = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/teams/${selectedTeam}/registration-grid`, {
                params: { category: selectedCategory, stageType: selectedStage, page: currentPage }
            });
            setCandidates(res.data.candidates || []);
            if (res.data.totalPages) setTotalPages(res.data.totalPages);
            setProgrammes(res.data.programmes || []);
            setRegistrations(res.data.registrations || []);
        } catch (err) {
            console.error('Failed to fetch grid', err);
        } finally {
            setLoading(false);
        }
    };

    
    const handleCellClick = (cand, prog) => {
        const cellId = `${cand._id}-${prog._id}`;
        const isCurrentlySavedLocal = registrations.some(r => r.programme?._id === prog._id && r.candidates?.includes(cand._id));
        
        // If it's already saved in the database (group or individual), pop the removal confirmation
        if (isCurrentlySavedLocal) {
            const reg = registrations.find(r => r.programme?._id === prog._id && r.candidates?.includes(cand._id));
            if (reg) {
                setConfirmDeleteModal({ 
                    isOpen: true, 
                    regId: reg._id, 
                    progName: prog.name, 
                    candId: cand._id, 
                    candName: cand.name 
                });
            }
            return;
        }

        // If it's a Group programme and they are adding, show the Group selection modal
        if (prog.format === 'Group' || prog.type === 'Group') {
            setGroupModal({ isOpen: true, prog, candidate: cand, selectedIds: [cand._id] });
            return;
        }

        const isCurrentlyDraft = cellId in pendingChanges;
        const willBeAdded = !isCurrentlySavedLocal && !isCurrentlyDraft;

        if (willBeAdded) {

            // Check Quota before allowing the tick
            const savedCount = registrations.filter(r => r.programme?._id === prog._id).reduce((acc, r) => acc + (r.candidates?.length || 0), 0);
            const draftAddCount = Object.keys(pendingChanges).filter(k => k.endsWith(`-${prog._id}`) && pendingChanges[k] === true).length;
            const draftRemoveCount = Object.keys(pendingChanges).filter(k => k.endsWith(`-${prog._id}`) && pendingChanges[k] === false).length;
            
            const currentCount = savedCount + draftAddCount - draftRemoveCount;
            if (currentCount >= (prog.maxParticipants || 1)) {
                setCellError({ cellId, message: `Quota full (${prog.maxParticipants || 1} max)` });
                setTimeout(() => setCellError({ cellId: null, message: '' }), 3000);
                return;
            }

            // Check Individual Candidate limits (skip for Group/Kulliyyah)
            if (prog.format !== 'Group' && prog.category !== 'KULLIYYAH') {
                const draftAddIndiv = Object.keys(pendingChanges).filter(k => k.startsWith(`${cand._id}-`) && pendingChanges[k] === true && programmes.find(p => p._id === k.split('-')[1])?.stageType === prog.stageType && programmes.find(p => p._id === k.split('-')[1])?.format !== 'Group').length;
                const draftRemoveIndiv = Object.keys(pendingChanges).filter(k => k.startsWith(`${cand._id}-`) && pendingChanges[k] === false && programmes.find(p => p._id === k.split('-')[1])?.stageType === prog.stageType && programmes.find(p => p._id === k.split('-')[1])?.format !== 'Group').length;
                
                const baseCount = prog.stageType === 'stage' ? (cand.bylawStatus?.stageCount) : (cand.bylawStatus?.nonStageCount);
                const limit = prog.stageType === 'stage' ? cand.bylawStatus?.limits?.stage : cand.bylawStatus?.limits?.nonStage;
                
                if (limit && (baseCount + draftAddIndiv - draftRemoveIndiv) >= limit) {
                    setCellError({ cellId, message: `Limit reached: ${limit} ${prog.stageType === 'stage' ? 'STG' : 'NSTG'} items` });
                    setTimeout(() => setCellError({ cellId: null, message: '' }), 3000);
                    return;
                }
            }
        }

        setPendingChanges(prev => {
            const next = { ...prev };
            if (cellId in next) {
                // Revert draft
                delete next[cellId];
            } else {
                // Add draft
                next[cellId] = !isCurrentlySavedLocal;
            }
            return next;
        });
    };

    const confirmDeleteGroup = async () => {
        setGroupSaving(true);
        try {
            await api.delete(`/registrations/${confirmDeleteModal.regId}`);
            await fetchGrid();
            setConfirmDeleteModal({ isOpen: false, regId: null, progName: '' });
        } catch (err) {
            console.error('Failed to remove group registration', err);
            alertAction(err.response?.data?.message || 'Removal failed');
        } finally {
            setGroupSaving(false);
        }
    };

    const handleGroupSave = async (e) => {
        e.preventDefault();
        if (groupSaving) return;
        const { prog, selectedIds } = groupModal;
        if (selectedIds.length !== prog.groupSize) {
            alertAction(`Please select exactly ${prog.groupSize} candidates.`);
            return;
        }

        setGroupSaving(true);
        try {
            await api.post('/registrations', {
                programmeId: prog._id,
                teamId: selectedTeam,
                candidateIds: selectedIds
            });
            await fetchGrid();
            setGroupModal({ isOpen: false, prog: null, candidate: null, selectedIds: [], editRegId: null });
        } catch (err) {
            console.error('Failed to create group registration', err);
            alertAction(err.response?.data?.message || 'Failed to create group registration');
        } finally {
            setGroupSaving(false);
        }
    };

    const handleSave = async () => {
        if (saving) return;
        setSaving(true);
        setSaveError('');
        setSaveErrorsList([]);
        try {
            const promises = [];

            Object.entries(pendingChanges).forEach(([cellId, isAdding]) => {
                const [candId, progId] = cellId.split('-');
                if (isAdding) {
                    const cand = candidates.find(c => c._id === candId);
                    const prog = programmes.find(p => p._id === progId);
                    promises.push(
                        api.post('/registrations', { programmeId: progId, teamId: selectedTeam, candidateIds: [candId] })
                        .catch(err => {
                            throw { message: err.response?.data?.message || 'Addition failed', detail: `${cand?.name || 'Unknown Candidate'} - ${prog?.name || 'Unknown Programme'}` };
                        })
                    );
                } else {
                    const reg = registrations.find(r => r.programme?._id === progId && r.candidates?.includes(candId));
                    if (reg) {
                        promises.push(
                            api.delete(`/registrations/${reg._id}`)
                            .catch(err => {
                                throw { message: err.response?.data?.message || 'Deletion failed', detail: 'Removing a registration' };
                            })
                        );
                    }
                }
            });

            const results = await Promise.allSettled(promises);
            const errors = results.filter(r => r.status === 'rejected').map(r => r.reason);
            
            if (errors.length > 0) {
                setSaveErrorsList(errors);
            }
            
            setPendingChanges({});
            await fetchGrid();
        } catch (err) {
            setSaveError('An unexpected error occurred.');
            fetchGrid();
        } finally {
            setSaving(false);
        }
    };

    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPending = showOnlyPending ? !c.bylawStatus?.isCompliant : true;
            return matchesSearch && matchesPending;
        });
    }, [candidates, searchQuery, showOnlyPending]);

    
    const filteredProgrammes = useMemo(() => {
        return programmes.filter(p => {
            if (showOpenQuotasOnly) {
                return p.quotaInfo?.status === 'OPEN';
            }
            return true;
        });
    }, [programmes, showOpenQuotasOnly]);


    const stats = useMemo(() => {
        const total = candidates.length;
        const compliant = candidates.filter(c => c.bylawStatus?.isCompliant).length;
        const pending = total - compliant;
        const openQuotas = programmes.filter(p => p.quotaInfo?.status === 'OPEN').length;
        return { total, compliant, pending, openQuotas };
    }, [candidates, programmes]);

    return (
        <div className="p-8 h-full flex flex-col w-full bg-[var(--color-background)]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Registration List</h1>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">Spreadsheet view of team programme compliance and assignments.</p>
                </div>
                {Object.keys(pendingChanges).length > 0 && (
                    <Button variant="primary" onClick={handleSave} loading={saving}>
                        Save Changes ({Object.keys(pendingChanges).length})
                    </Button>
                )}
            </div>

            {saveError && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-3">
                    <AlertTriangle size={20} />
                    <span className="font-medium">{saveError}</span>
                </div>
            )}

            {Object.keys(pendingChanges).length > 0 && (
                <div className="mb-6 p-4 bg-orange-50 text-orange-800 border border-orange-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-pulse">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={24} className="text-orange-500" />
                        <div>
                            <h3 className="font-bold">Unsaved Changes!</h3>
                            <p className="text-sm opacity-90">You have {Object.keys(pendingChanges).length} pending change(s). Please click "Save Changes" or your changes will be lost.</p>
                        </div>
                    </div>
                    <Button variant="primary" onClick={handleSave} loading={saving}>
                        Save Now
                    </Button>
                </div>
            )}

            {/* Top Bar: Stats & Filters */}
            <div className="flex justify-between items-end gap-6 mb-6">
                <div className="flex gap-4">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 w-40">
                        <div className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase mb-1">Total Students</div>
                        <div className="text-2xl font-bold text-[var(--color-text-heading)]">{stats.total}</div>
                    </div>
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 w-40">
                        <div className="text-[11px] font-bold text-green-600 uppercase mb-1">Compliant</div>
                        <div className="text-2xl font-bold text-[var(--color-text-heading)]">{stats.compliant}</div>
                    </div>
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 w-40">
                        <div className="text-[11px] font-bold text-orange-500 uppercase mb-1">Pending</div>
                        <div className="text-2xl font-bold text-[var(--color-text-heading)]">{stats.pending}</div>
                    </div>
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 w-40">
                        <div className="text-[11px] font-bold text-blue-500 uppercase mb-1">Open Quotas</div>
                        <div className="text-2xl font-bold text-[var(--color-text-heading)]">{stats.openQuotas}</div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    {isAdmin && (
                        <select 
                            value={selectedTeam} 
                            onChange={e => setSelectedTeam(e.target.value)}
                            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-sm"
                        >
                            <option value="">-- Select Team --</option>
                            {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                    )}
                    <div className="flex gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${selectedCategory === cat ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)]'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            {STAGES.map(stage => (
                                <button
                                    key={stage}
                                    onClick={() => setSelectedStage(stage)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${selectedStage === stage ? 'bg-[var(--color-primary)] text-white border-transparent' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)]'}`}
                                >
                                    {stage}
                                </button>
                            ))}
                        </div>
                        <div className="h-6 w-px bg-[var(--color-border)]"></div>
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input type="checkbox" checked={showOpenQuotasOnly} onChange={e => setShowOpenQuotasOnly(e.target.checked)} className="accent-[var(--color-primary)]" />
                            Show Open Quotas Only
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input type="checkbox" checked={showOnlyPending} onChange={e => setShowOnlyPending(e.target.checked)} className="accent-[var(--color-primary)]" />
                            Show Pending Only
                        </label>
                        <div className="relative ml-2">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                            <input 
                                type="text"
                                placeholder="Search student..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm w-48 focus:outline-none focus:border-[var(--color-primary)]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
                {!selectedTeam ? (
                    <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)]">Select a team to view grid</div>
                ) : loading ? (
                    <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)]">Loading grid...</div>
                ) : (
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm border-collapse min-w-max">
                            <thead className="bg-[var(--color-surface-elevated)] sticky top-0 z-30 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 border-b border-r border-[var(--color-border)] font-bold text-xs text-[var(--color-text-muted)] uppercase bg-[var(--color-surface-elevated)] sticky left-0 z-40 w-12">#</th>
                                    <th className="px-4 py-3 border-b border-r border-[var(--color-border)] font-bold text-xs text-[var(--color-text-muted)] uppercase bg-[var(--color-surface-elevated)] sticky left-12 z-40 w-24">Ad No</th>
                                    <th className="px-4 py-3 border-b border-r border-[var(--color-border)] font-bold text-xs text-[var(--color-text-muted)] uppercase bg-[var(--color-surface-elevated)] sticky left-36 z-40 w-48">Student Name</th>
                                    <th className="px-4 py-3 border-b border-r border-[var(--color-border)] font-bold text-xs text-[var(--color-text-muted)] uppercase bg-[var(--color-surface-elevated)] sticky left-[21rem] z-40 w-32">Bylaw Status</th>
                                    
                                    {filteredProgrammes.map(prog => (
                                        <th key={prog._id} className="px-3 py-3 border-b border-r border-[var(--color-border)] text-center min-w-[120px] max-w-[150px]">
                                            <div className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-1.5 py-0.5 rounded inline-block mb-1">{prog.code || '—'}</div>
                                            <div className="text-xs font-semibold text-[var(--color-text-heading)] truncate" title={prog.name}>{prog.name}</div>
                                            <div className="text-[10px] text-[var(--color-text-muted)] mt-1">{prog.type}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {filteredCandidates.map((cand, idx) => {
                                    const isCompliant = cand.bylawStatus?.isCompliant;
                                    
                                    const draftAddStage = Object.keys(pendingChanges).filter(k => k.startsWith(`${cand._id}-`) && pendingChanges[k] === true && programmes.find(p => p._id === k.split('-')[1])?.stageType === 'stage' && programmes.find(p => p._id === k.split('-')[1])?.format !== 'Group').length;
                                    const draftRemoveStage = Object.keys(pendingChanges).filter(k => k.startsWith(`${cand._id}-`) && pendingChanges[k] === false && programmes.find(p => p._id === k.split('-')[1])?.stageType === 'stage' && programmes.find(p => p._id === k.split('-')[1])?.format !== 'Group').length;
                                    const currentStage = ((cand.bylawStatus?.stageCount) || 0) + draftAddStage - draftRemoveStage;

                                    const draftAddNonStage = Object.keys(pendingChanges).filter(k => k.startsWith(`${cand._id}-`) && pendingChanges[k] === true && programmes.find(p => p._id === k.split('-')[1])?.stageType === 'non-stage' && programmes.find(p => p._id === k.split('-')[1])?.format !== 'Group').length;
                                    const draftRemoveNonStage = Object.keys(pendingChanges).filter(k => k.startsWith(`${cand._id}-`) && pendingChanges[k] === false && programmes.find(p => p._id === k.split('-')[1])?.stageType === 'non-stage' && programmes.find(p => p._id === k.split('-')[1])?.format !== 'Group').length;
                                    const currentNonStage = ((cand.bylawStatus?.nonStageCount) || 0) + draftAddNonStage - draftRemoveNonStage;

                                    
                                    return (
                                        <tr key={cand._id} className="hover:bg-[var(--color-surface-elevated)]/30 transition-colors">
                                            <td className="px-4 py-3 border-r border-[var(--color-border)] font-medium text-[var(--color-text-heading)] bg-[var(--color-surface)] sticky left-0 z-20">{idx + 1}</td>
                                            <td className="px-4 py-3 border-r border-[var(--color-border)] font-medium text-[var(--color-text-muted)] bg-[var(--color-surface)] sticky left-12 z-20">{cand.admissionNo}</td>
                                            <td className="px-4 py-3 border-r border-[var(--color-border)] bg-[var(--color-surface)] sticky left-36 z-20">
                                                <div className="font-semibold text-[var(--color-text-heading)] truncate">{cand.name}</div>
                                                <div className="flex flex-col gap-1 mt-1">
                                                    <div className="text-[10px] text-[var(--color-text-muted)]">{cand.classLevel || '-'}</div>
                                                    {cand.bylawStatus?.limits && (
                                                        <div className="flex gap-1.5 text-[9px] font-semibold tracking-wide">
                                                            <span className={currentStage > cand.bylawStatus.limits.stage ? "text-red-500" : (currentStage === cand.bylawStatus.limits.stage ? "text-green-500" : "text-[var(--color-text-muted)]")}>
                                                                {currentStage}/{cand.bylawStatus.limits.stage} STG
                                                            </span>
                                                            <span className="text-[var(--color-border)]">•</span>
                                                            <span className={currentNonStage > cand.bylawStatus.limits.nonStage ? "text-red-500" : (currentNonStage === cand.bylawStatus.limits.nonStage ? "text-green-500" : "text-[var(--color-text-muted)]")}>
                                                                {currentNonStage}/{cand.bylawStatus.limits.nonStage} NSTG
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 border-r border-[var(--color-border)] bg-[var(--color-surface)] sticky left-[21rem] z-20">
                                                                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                                                    cand.bylawStatus?.status === 'compliant' ? 'bg-green-500/10 text-green-600' :
                                                    cand.bylawStatus?.status === 'violated' ? 'bg-red-500/10 text-red-600' :
                                                    'bg-orange-500/10 text-orange-600'
                                                }`}>
                                                    {cand.bylawStatus?.status === 'compliant' ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                                                    {cand.bylawStatus?.status === 'compliant' ? 'Compliant' : cand.bylawStatus?.status === 'violated' ? 'Violated' : 'Pending'}
                                                </div>
                                                <div className="text-[9px] text-[var(--color-text-muted)] mt-1 ml-1 text-nowrap">
                                                    S: {cand.bylawStatus?.stageCount} | N: {cand.bylawStatus?.nonStageCount}
                                                </div>
                                            </td>
                                            
                                            {filteredProgrammes.map(prog => {
                                                const isSaved = registrations.some(r => r.programme?._id === prog._id && r.candidates?.includes(cand._id));
                                                const cellId = `${cand._id}-${prog._id}`;
                                                const hasError = cellError.cellId === cellId;
                                                const hasDraft = cellId in pendingChanges;
                                                const draftState = pendingChanges[cellId];
                                                const isChecked = hasDraft ? draftState : isSaved;

                                                let cellClasses = 'w-full h-full min-h-[50px] flex items-center justify-center transition-colors ';
                                                
                                                if (hasDraft && draftState === true) {
                                                    // Draft Add -> Red
                                                    cellClasses += 'bg-red-50 text-red-500 hover:bg-red-100';
                                                } else if (hasDraft && draftState === false) {
                                                    // Draft Remove -> Shows empty
                                                    cellClasses += 'bg-red-50/30 text-transparent hover:bg-red-50/50';
                                                } else if (isSaved) {
                                                    // Saved -> Green
                                                    cellClasses += 'bg-green-50 text-green-600 hover:bg-green-100';
                                                } else {
                                                    // Empty
                                                    cellClasses += 'text-transparent hover:bg-[var(--color-surface-elevated)]';
                                                }

                                                return (
                                                    <td key={prog._id} className="border-r border-[var(--color-border)] p-0 relative">
                                                        <button 
                                                            onClick={() => handleCellClick(cand, prog)}
                                                            className={cellClasses}
                                                        >
                                                            {isChecked && <CheckCircle size={18} />}
                                                        </button>
                                                        {hasError && (
                                                            <div className="absolute inset-0 bg-red-500/90 text-white text-[10px] font-medium flex items-center justify-center p-1 text-center z-10 leading-tight">
                                                                {cellError.message}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-[var(--color-surface-elevated)] sticky bottom-0 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 border-r border-[var(--color-border)] font-bold text-right text-[var(--color-text-heading)] bg-[var(--color-surface-elevated)] sticky left-0 z-40">
                                        QUOTA SUMMARY
                                    </td>
                                    {filteredProgrammes.map(prog => {
                                        const { registeredCount, maxAllowed, status } = prog.quotaInfo || {};
                                        const isFull = status === 'FULL';
                                        
                                        return (
                                            <td key={prog._id} className="px-2 py-3 border-r border-t border-[var(--color-border)] text-center">
                                                <div className="text-xs font-bold text-[var(--color-text-heading)] mb-1">
                                                    {registeredCount} / {maxAllowed === Infinity ? '∞' : maxAllowed}
                                                </div>
                                                <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block ${isFull ? 'bg-rose-500/10 text-rose-600' : 'bg-green-500/10 text-green-600'}`}>
                                                    {isFull ? 'FULL' : 'OPEN'}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                isOpen={saveErrorsList.length > 0}
                onClose={() => setSaveErrorsList([])}
                title="Save Completed with Errors"
            >
                <div className="space-y-4">
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Some changes could not be saved because they violate constraints:
                    </p>
                    <ul className="space-y-3">
                        {saveErrorsList.map((err, idx) => (
                            <li key={idx} className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200">
                                <div className="font-bold text-sm">{err.detail}</div>
                                <div className="text-xs opacity-90">{err.message}</div>
                            </li>
                        ))}
                    </ul>
                    <Button onClick={() => setSaveErrorsList([])} className="w-full justify-center">Acknowledge</Button>
                </div>
            </Modal>

            <Modal 
                isOpen={confirmDeleteModal.isOpen} 
                onClose={() => setConfirmDeleteModal({ isOpen: false, regId: null, progName: '', candId: null, candName: '' })} 
                title="Remove Registration"
            >
                <div className="space-y-6">
                    <p className="text-[var(--color-text-body)]">
                        Are you sure you want to remove <strong className="text-[var(--color-text-heading)]">{confirmDeleteModal.candName || 'this candidate'}</strong> from <strong className="text-[var(--color-text-heading)]">{confirmDeleteModal.progName}</strong>?
                    </p>
                    <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                        <Button type="button" variant="ghost" onClick={() => setConfirmDeleteModal({ isOpen: false, regId: null, progName: '', candId: null, candName: '' })}>
                            Cancel
                        </Button>
                        <Button type="button" variant="danger" loading={groupSaving} onClick={confirmDeleteGroup}>
                            Remove
                        </Button>
                    </div>
                </div>
            </Modal>


            <Modal 
                isOpen={groupModal.isOpen} 
                onClose={() => setGroupModal({ isOpen: false, prog: null, candidate: null, selectedIds: [], editRegId: null })} 
                title="Group Registration"
            >
                {groupModal.prog && (
                    <form onSubmit={handleGroupSave} className="space-y-6">
                        <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] p-4 rounded-xl border border-[var(--color-primary)]/20">
                            <h3 className="font-bold mb-1">{groupModal.prog.name}</h3>
                            <p className="text-sm">Requires exactly <strong>{groupModal.prog.groupSize}</strong> candidates.</p>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-[var(--color-text-heading)]">Select Candidates ({groupModal.selectedIds.length}/{groupModal.prog.groupSize})</label>
                            <div className="border border-[var(--color-border)] rounded-xl divide-y divide-[var(--color-border)] max-h-60 overflow-y-auto">
                                {candidates.map(c => (
                                    <label key={c._id} className="flex items-center gap-3 p-3 hover:bg-[var(--color-surface-elevated)] cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 accent-[var(--color-primary)] rounded border-[var(--color-border)]"
                                            checked={groupModal.selectedIds.includes(c._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    if (groupModal.selectedIds.length < groupModal.prog.groupSize) {
                                                        setGroupModal(prev => ({ ...prev, selectedIds: [...prev.selectedIds, c._id] }));
                                                    }
                                                } else {
                                                    setGroupModal(prev => ({ ...prev, selectedIds: prev.selectedIds.filter(id => id !== c._id) }));
                                                }
                                            }}
                                            disabled={!groupModal.selectedIds.includes(c._id) && groupModal.selectedIds.length >= groupModal.prog.groupSize}
                                        />
                                        <div>
                                            <div className="font-bold text-sm text-[var(--color-text-heading)]">{c.name}</div>
                                            <div className="text-xs text-[var(--color-text-muted)]">AD NO: {c.admissionNo}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                            <Button type="button" variant="ghost" onClick={() => setGroupModal({ isOpen: false, prog: null, candidate: null, selectedIds: [], editRegId: null })}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" loading={groupSaving} disabled={groupModal.selectedIds.length !== groupModal.prog.groupSize}>
                                Register Group
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
