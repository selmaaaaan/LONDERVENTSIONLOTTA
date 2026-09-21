import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, X, Trash2 } from 'lucide-react';
import { useResultUI } from '../context/ResultEntryUIContext';
import api from '../services/api';

export default function EditProgrammeModal({ programme, batchId, isPublished, onClose, onSaved }) {
    const { showModal, showToast } = useResultUI();
    const [candidates, setCandidates] = useState([]);
    const [resultsMap, setResultsMap] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await api.get(`/result-entry/programmes/${programme._id}/candidates`);
                const regs = res.data.registrations || [];
                
                let allCands = [];
                regs.forEach(r => {
                    if(r.candidates) allCands = allCands.concat(r.candidates);
                });
                setCandidates(allCands);

                const rMap = {};
                if (res.data.results) {
                    res.data.results.forEach(r => {
                        // Keep their existing batchId if they have one
                        rMap[r.candidate] = { rank: r.rank, grade: r.grade, remarks: r.remarks, batchId: r.batchId, status: r.status, _id: r._id };
                    });
                }
                setResultsMap(rMap);
            } catch (err) {
                setError("Failed to fetch candidates");
            }
            setIsLoading(false);
        };
        fetchCandidates();
    }, [programme._id]);

    const handleResultChange = (candidateId, field, value) => {
        setResultsMap(prev => ({
            ...prev,
            [candidateId]: {
                ...prev[candidateId],
                [field]: value
            }
        }));
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
                        onSaved();
                    }
                } catch (err) {
                    showToast('Failed to delete live result', 'error');
                }
            }
        });
        
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = candidates.map(c => ({
                candidateId: c._id,
                rank: resultsMap[c._id]?.rank || null,
                grade: resultsMap[c._id]?.grade || null,
                remarks: resultsMap[c._id]?.remarks || '',
                // Force it to stay in this batch
                batchId: batchId 
            }));

            if (isPublished) {
                await api.put(`/result-entry/batches/${batchId || 'legacy'}/published-results`, {
                    programmeId: programme._id,
                    results: payload
                });
            } else {
                await api.post('/result-entry/standalone-results', {
                    programmeId: programme._id,
                    results: payload,
                    batchId: batchId
                });
            }
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save results");
        }
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-surface)] w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-border)]">
                <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-background)]">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--color-text-heading)]">Edit {programme.name}</h2>
                        <p className="text-sm text-[var(--color-text-muted)]">{programme.code} • {programme.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {error && <span className="text-red-500 text-sm font-medium mr-2">{error}</span>}
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--color-surface)] rounded-lg text-[var(--color-text-muted)]"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="p-12 text-center text-[var(--color-text-muted)]">Loading candidates...</div>
                    ) : candidates.length === 0 ? (
                        <div className="p-12 text-center text-[var(--color-text-muted)] flex flex-col items-center">
                            <AlertCircle size={48} className="mb-4 opacity-50" />
                            <p>No approved candidates found for this programme.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto border border-[var(--color-border)] rounded-xl">
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
        <div>
            <div className="font-semibold text-[var(--color-text-heading)]">{candidate.name}</div>
            <div className="text-sm text-[var(--color-text-muted)]">{candidate.chestNo}</div>
        </div>
        {isPublished && rData.status === 'approved' && (
            <button 
                onClick={() => handleDeleteSingleResult(candidate._id, candidate.name)}
                className="text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors ml-4" 
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
                                                                    name={`modal-rank-${candidate._id}`}
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
                                                                    name={`modal-grade-${candidate._id}`}
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

                <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-background)] flex gap-3 justify-end shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || candidates.length === 0}
                        className="px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 flex items-center"
                    >
                        <Save size={16} className="mr-2" />
                        {isSaving ? 'Saving...' : 'Save & Update Leaderboard'}
                    </button>
                </div>
            </div>
        </div>
    );
}
