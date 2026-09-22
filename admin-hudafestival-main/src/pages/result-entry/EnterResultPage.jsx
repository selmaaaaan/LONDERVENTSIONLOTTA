import React, { useState, useEffect } from 'react';
import { Search, Save, AlertCircle, Trash2 } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useResultUI } from '../../context/ResultEntryUIContext';

export default function EnterResultPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showModal, showToast } = useResultUI();
    const [searchQuery, setSearchQuery] = useState('');
    const [programmes, setProgrammes] = useState([]);
    const [selectedProg, setSelectedProg] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [resultsMap, setResultsMap] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        const editProgId = searchParams.get('programmeId');
        if (editProgId) {
            const loadEditProgramme = async () => {
                try {
                    const res = await api.get(`/result-entry/programmes/${editProgId}`);
                    selectProgramme(res.data);
                } catch (err) {
                    console.error("Failed to load programme for edit");
                }
            };
            loadEditProgramme();
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchProgrammes = async () => {
            if (searchQuery.length < 2) {
                setProgrammes([]);
                return;
            }
            try {
                const res = await api.get(`/result-entry/programmes/search?q=${searchQuery}`);
                setProgrammes(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        const timeoutId = setTimeout(fetchProgrammes, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const selectProgramme = async (prog) => {
        setSelectedProg(prog);
        setSearchQuery('');
        setProgrammes([]);
        setIsLoading(true);
        setSaveError(null);
        setSaveSuccess(false);
        try {
            const res = await api.get(`/result-entry/programmes/${prog._id}/candidates`);
            const regs = res.data.registrations || [];
            
                        // Flatten or Group candidates
            let allCands = [];
            if (prog.format === 'Group' || prog.category === 'KULLIYYAH') {
                regs.forEach(r => {
                    if (r.candidates && r.candidates.length > 0) {
                        const rep = r.candidates[0];
                        allCands.push({
                            ...rep,
                            name: r.team?.name || 'Unknown Team',
                            _originalCandidates: r.candidates,
                            isGroupRow: true
                        });
                    }
                });
            } else {
                regs.forEach(r => {
                    if(r.candidates) allCands = allCands.concat(r.candidates);
                });
            }
            setCandidates(allCands);

            const rMap = {};
            if (res.data.results) {
                res.data.results.forEach(r => {
                    rMap[r.candidate] = { rank: r.rank, grade: r.grade, remarks: r.remarks, batchId: r.batchId, status: r.status, _id: r._id };
                });
            }
            setResultsMap(rMap);
        } catch (err) {
            alert("Failed to fetch candidates");
        }
        setIsLoading(false);
    };

    const handleResultChange = (candidateId, field, value) => {
        setResultsMap(prev => ({
            ...prev,
            [candidateId]: {
                ...prev[candidateId],
                [field]: value
            }
        }));
    };

        const hasApproved = Object.values(resultsMap).some(r => r.status === 'approved');

    const handleClear = () => {
        // Check if any loaded result is approved
        showModal({
            title: hasApproved ? 'Delete Published Result?' : 'Clear Results?',
            message: hasApproved
                ? `This result is already public — deleting '${selectedProg.name}' will immediately update the live leaderboard and public site.`
                : `Delete '${selectedProg.name}'? This will permanently delete the drafted scores for this programme.`,
            confirmText: 'Delete Result',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/result-entry/standalone-results/${selectedProg._id}`);
                    showToast('Result deleted completely', 'success');
                    // Reset page
                    setSelectedProg(null);
                    navigate('/result-entry/enter', { replace: true });
                } catch (err) {
                    showToast('Failed to delete result', 'error');
                }
            }
        });
    };

    
    const handleDeleteSingleResult = (candidateId, cName) => {
        
        const promptRes = window.prompt(`This result is already public - deleting ${cName}'s result will immediately update the live leaderboard and public site.\n\nType the candidate's name to confirm:\n${cName}`);
        if (promptRes !== cName) {
            showToast('Candidate name did not match, delete cancelled.', 'error');
            return;
        }
        showModal({
            title: 'Delete Published Result?',
            message: `You are about to irreversibly delete ${cName}'s live result and reverse their points. Proceed?`,
            confirmText: 'Delete Live Result',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    const resultId = resultsMap[candidateId]?._id;
                    if (resultId) {
                        await api.delete(`/result-entry/published-results/${resultId}`);
                        showToast('Live result deleted and points reversed', 'success');
                        // Refresh data
                        const res = await api.get(`/result-entry/programmes/${selectedProg._id}/candidates`);
                        const rMap = {};
                        if (res.data.results) {
                            res.data.results.forEach(r => {
                                rMap[r.candidate] = { rank: r.rank, grade: r.grade, remarks: r.remarks, batchId: r.batchId, status: r.status, _id: r._id };
                            });
                        }
                        setResultsMap(rMap);
                    }
                } catch (err) {
                    showToast('Failed to delete live result', 'error');
                }
            }
        });
        
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);
        try {
            const payload = candidates.map(c => ({
                candidateId: c._id,
                rank: resultsMap[c._id]?.rank || null,
                grade: resultsMap[c._id]?.grade || null,
                remarks: resultsMap[c._id]?.remarks || '',
                // Keep it linked to a batch if it's already in one, otherwise null
                batchId: resultsMap[c._id]?.batchId || null 
            }));

            if (hasApproved) {
                await api.put('/result-entry/batches/legacy/published-results', {
                    programmeId: selectedProg._id,
                    results: payload
                });
            } else {
                await api.post('/result-entry/standalone-results', {
                    programmeId: selectedProg._id,
                    results: payload
                });
            }
            
            setSaveSuccess(true);
            setTimeout(() => {
                navigate('/result-entry/ready');
            }, 1500); // Wait a moment so they can read the success message
        } catch (err) {
            setSaveError(err.response?.data?.message || "Failed to save results. Check your connection.");
        }
        setIsSaving(false);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-[var(--color-text-heading)] mb-6">Enter Results</h1>
            
            {!selectedProg && (
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search for a programme by code or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-lg"
                    />

                    {programmes.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden z-10">
                            {programmes.map(prog => (
                                <div 
                                    key={prog._id} 
                                    onClick={() => selectProgramme(prog)}
                                    className="p-4 hover:bg-[var(--color-background)] cursor-pointer border-b border-[var(--color-border)] last:border-0"
                                >
                                    <div className="font-bold text-[var(--color-text-heading)]">{prog.code} - {prog.name}</div>
                                    <div className="text-sm text-[var(--color-text-muted)]">{prog.category}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {selectedProg && (
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-background)]/30 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--color-text-heading)]">{selectedProg.name}</h2>
                            <div className="text-sm text-[var(--color-text-muted)] mt-1">{selectedProg.code} • {selectedProg.category}</div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleClear}
                                className="px-4 py-2 bg-red-500/10 text-red-500 border border-transparent rounded-lg text-sm font-semibold hover:bg-red-500/20 transition-colors"
                            >
                                Clear Results
                            </button>
                            <button 
                                onClick={() => {
                                    setSelectedProg(null);
                                    // Remove URL param if they change programme
                                    navigate('/result-entry/enter', { replace: true });
                                }}
                                className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-semibold hover:bg-[var(--color-background)] transition-colors"
                            >
                                Change Programme
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                <Save size={18} className="mr-2" />
                                {isSaving ? 'Saving...' : 'Save Results'}
                            </button>
                        </div>
                    </div>

                    {saveError && (
                        <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-500 font-medium flex items-center">
                            <AlertCircle size={20} className="mr-2" />
                            {saveError}
                        </div>
                    )}
                    
                    {saveSuccess && (
                        <div className="p-4 bg-green-500/10 border-b border-green-500/20 text-green-600 font-bold flex items-center">
                            <Save size={20} className="mr-2" />
                            Result saved successfully! Redirecting...
                        </div>
                    )}

                    {isLoading ? (
                        <div className="p-12 text-center text-[var(--color-text-muted)]">Loading candidates...</div>
                    ) : candidates.length === 0 ? (
                        <div className="p-12 text-center text-[var(--color-text-muted)] flex flex-col items-center">
                            <AlertCircle size={48} className="mb-4 opacity-50" />
                            <p>No approved candidates found for this programme.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]/50">
                                        <th className="px-6 py-4 text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Candidate</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Position</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Grade</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.map(candidate => {
                                        const rData = resultsMap[candidate._id] || {};
                                        return (
                                            <tr key={candidate._id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-background)]/50 transition-colors">
                                                <td className="px-6 py-4">
    <div className="flex justify-between items-start">
        <div className="w-full">
            <div className="font-semibold text-[var(--color-text-heading)] uppercase tracking-wide">{candidate.name}</div>
            {!candidate.isGroupRow && (
                <div className="text-sm text-[var(--color-text-muted)]">{candidate.chestNo}</div>
            )}
            
            {candidate.isGroupRow && candidate._originalCandidates && (
                <div className="mt-2">
                    <button 
                        onClick={() => setExpandedGroups(prev => ({...prev, [candidate._id]: !prev[candidate._id]}))}
                        className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center"
                    >
                        {expandedGroups[candidate._id] ? 'Hide Members' : 'Show Members (' + candidate._originalCandidates.length + ')'}
                    </button>
                    {expandedGroups[candidate._id] && (
                        <div className="mt-2 pl-2 border-l-2 border-[var(--color-primary)]/30 space-y-1">
                            {candidate._originalCandidates.map(c => (
                                <div key={c._id} className="text-xs text-[var(--color-text-muted)]">
                                    <span className="font-medium text-gray-700">{c.name}</span> <span className="opacity-70">({c.chestNo})</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
        {hasApproved && rData.status === 'approved' && (
            <button 
                onClick={() => handleDeleteSingleResult(candidate._id, candidate.name)}
                className="text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors ml-4 flex-shrink-0" 
                title="Delete Live Result"
            >
                <Trash2 size={16} />
            </button>
        )}
    </div>
</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        {[1, 2, 3].map(pos => (
                                                            <label key={pos} className="flex items-center gap-1.5 cursor-pointer">
                                                                <input 
                                                                    type="radio" 
                                                                    name={`rank-${candidate._id}`}
                                                                    checked={rData.rank === pos}
                                                                    onChange={() => handleResultChange(candidate._id, 'rank', pos)}
                                                                    className="accent-[var(--color-primary)]"
                                                                />
                                                                <span className="text-sm font-medium">{pos}</span>
                                                            </label>
                                                        ))}
                                                        {rData.rank && (
                                                            <button 
                                                                onClick={() => handleResultChange(candidate._id, 'rank', null)}
                                                                className="ml-2 text-xs text-red-500 hover:underline"
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        {['A', 'B', 'C'].map(grade => (
                                                            <label key={grade} className="flex items-center gap-1.5 cursor-pointer">
                                                                <input 
                                                                    type="radio" 
                                                                    name={`grade-${candidate._id}`}
                                                                    checked={rData.grade === grade}
                                                                    onChange={() => handleResultChange(candidate._id, 'grade', grade)}
                                                                    className="accent-[var(--color-primary)]"
                                                                />
                                                                <span className="text-sm font-medium">{grade}</span>
                                                            </label>
                                                        ))}
                                                        {rData.grade && (
                                                            <button 
                                                                onClick={() => handleResultChange(candidate._id, 'grade', null)}
                                                                className="ml-2 text-xs text-red-500 hover:underline"
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Add a remark..."
                                                        value={rData.remarks || ''}
                                                        onChange={(e) => handleResultChange(candidate._id, 'remarks', e.target.value)}
                                                        className="w-full bg-transparent border border-[var(--color-border)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
