import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Download, Plus, Trash2, Trophy, Medal, PenTool } from 'lucide-react';
import api from '../../services/api';
import { useResultUI } from '../../context/ResultEntryUIContext';
import EditProgrammeModal from '../../components/EditProgrammeModal';


const ProgrammeDrilldownModal = ({ programme, results, onClose }) => {
    let displayResults = results;
    if (programme.format === 'Group' || programme.category === 'KULLIYYAH') {
        const teamMap = {};
        displayResults.forEach(r => {
            const tId = r.candidate?.team?._id || r.candidate?.team || r.team?._id || r.team || 'unknown';
            if (!teamMap[tId]) teamMap[tId] = { ...r, _groupNames: [] };
            if (r.candidate && r.candidate.name) teamMap[tId]._groupNames.push(r.candidate.name);
        });
        displayResults = Object.values(teamMap).map(r => {
            if (r._groupNames && r._groupNames.length > 0) {
                r.candidate = { ...r.candidate, name: r._groupNames.join(', ') };
            }
            return r;
        });
    }

    displayResults = displayResults.filter(r => r.rank || r.grade || r.totalPoints > 0).sort((a, b) => {
        if (a.rank && b.rank) return a.rank - b.rank;
        if (a.rank && !b.rank) return -1;
        if (!a.rank && b.rank) return 1;
        return (b.totalPoints || 0) - (a.totalPoints || 0);
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{programme.name}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Programme Results Drill-down</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">X</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {displayResults.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">No scored results found.</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-900 border-b">
                                <tr>
                                    <th className="px-4 py-3">Candidate</th>
                                    <th className="px-4 py-3">Team</th>
                                    <th className="px-4 py-3 text-center">Pos</th>
                                    <th className="px-4 py-3 text-center">Grade</th>
                                    <th className="px-4 py-3 text-right">Pts</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {displayResults.map((r, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3 font-medium">{r.candidate?.name || 'Unknown'}</td>
                                        <td className="px-4 py-3 text-gray-600">{r.candidate?.team?.name || r.team?.name || 'Unknown'}</td>
                                        <td className="px-4 py-3 text-center font-bold">{r.rank || '-'}</td>
                                        <td className="px-4 py-3 text-center font-bold">{r.grade || '-'}</td>
                                        <td className="px-4 py-3 text-right font-bold">{r.totalPoints || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function BatchWorkspace() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showModal, showToast } = useResultUI();
    const [batch, setBatch] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [overallToppers, setOverallToppers] = useState([]);
    const [categoryToppers, setCategoryToppers] = useState({});
    const [categoryTeamToppers, setCategoryTeamToppers] = useState({});
    const [batchResults, setBatchResults] = useState([]);
    
    const [showAddModal, setShowAddModal] = useState(false);
    const [readyProgrammes, setReadyProgrammes] = useState([]);
    const [selectedToAttach, setSelectedToAttach] = useState([]);
    const [editingProgramme, setEditingProgramme] = useState(null);
    const [selectedProgrammeDrilldown, setSelectedProgrammeDrilldown] = useState(null);

    const fetchBatchData = async () => {
        try {
            const res = await api.get(`/result-entry/batches/${id}`);
            setBatch(res.data.batch);
            setBatchResults(res.data.batchResults || []);
        } catch (err) {
            showToast('Failed to load batch data', 'error');
            navigate('/result-entry/batches');
        }
    };

    const fetchProjection = async () => {
        try {
            const res = await api.get(`/result-entry/batches/${id}/projection`);
            setLeaderboard(res.data.leaderboard || []);
            setOverallToppers(res.data.overallToppers || []);
            setCategoryToppers(res.data.categoryToppers || {});
            setCategoryTeamToppers(res.data.categoryTeamToppers || {});
            setCategoryTeamToppers(res.data.categoryTeamToppers || {});
            setCategoryTeamToppers(res.data.categoryTeamToppers || {});
        } catch (err) {
            console.error('Failed to load projection', err);
        }
    };

    useEffect(() => {
        fetchBatchData();
        fetchProjection();
    }, [id]);

    const openAddModal = async () => {
        try {
            const res = await api.get('/result-entry/ready-results');
            setReadyProgrammes(res.data);
            setSelectedToAttach([]);
            setShowAddModal(true);
        } catch (err) {
            showToast('Failed to fetch ready results', 'error');
        }
    };

    const attachProgrammes = async () => {
        if (selectedToAttach.length === 0) return setShowAddModal(false);
        try {
            await api.put(`/result-entry/batches/${id}/attach`, {
                programmeIds: selectedToAttach
            });
            setShowAddModal(false);
            fetchBatchData();
            fetchProjection();
        } catch (err) {
            showToast('Failed to attach programmes', 'error');
        }
    };

        
    const clearProgramme = (progId, progName) => {
        const isPublished = batch.status === 'published';
        
        showModal({
            title: isPublished ? 'Delete Published Result?' : 'Delete Result?',
            message: isPublished 
                ? `This result is already public — deleting '${progName}' will immediately update the live leaderboard and public site.`
                : `Delete '${progName}'? This will permanently delete the drafted scores for this programme.`,
            confirmText: 'Delete Result',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/result-entry/standalone-results/${progId}`);
                    showToast('Result deleted completely', 'success');
                    fetchBatchData();
                    fetchProjection();
                } catch (err) {
                    showToast('Failed to delete result', 'error');
                }
            }
        });
    };

    const detachProgramme = (progId) => {
        showModal({
            title: 'Remove Programme',
            message: 'Remove this programme from the batch? It will go back to Ready Results.',
            confirmText: 'Remove',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.put(`/result-entry/batches/${id}/detach`, {
                        programmeId: progId
                    });
                    fetchBatchData();
                    fetchProjection();
                    showToast('Programme removed', 'success');
                } catch (err) {
                    showToast('Failed to detach programme', 'error');
                }
            }
        });
    };


        const handleRecall = () => {
        showModal({
            title: 'Recall Batch',
            message: "Recall this batch from Admin? It will be pulled back to Draft status here and removed from Admin's Pending Results list until you resubmit it.",
            confirmText: 'Recall',
            onConfirm: async () => {
                try {
                    await api.put(`/result-entry/batches/${id}/recall`);
                    showToast('Batch recalled successfully!', 'success');
                    fetchBatchData();
                    fetchProjection();
                } catch (err) {
                    showToast(err.response?.data?.message || 'Error recalling batch', 'error');
                }
            }
        });
    };

        const handleSubmitToAdmin = () => {

        showModal({
            title: 'Submit Batch',
            message: 'Are you sure you want to submit this batch to Admin? It will be locked for editing.',
            confirmText: 'Submit to Admin',
            onConfirm: async () => {
                try {
                    await api.post(`/result-entry/batches/${id}/submit`);
                    showToast('Batch submitted to Admin successfully!', 'success');
                    navigate('/result-entry/batches');
                } catch (err) {
                    showToast('Failed to submit batch', 'error');
                }
            }
        });
    };

    if (!batch) return <div className="p-8">Loading...</div>;

    const isLocked = batch.status !== 'draft';

    return (
        <div className="flex flex-col h-full bg-[var(--color-background)]">
            {/* --- WEB UI (Hidden when printing) --- */}
            <div className="print:hidden flex flex-col h-full">
                {/* Header */}
                <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/result-entry/batches')} className="p-2 hover:bg-[var(--color-background)] rounded-lg text-[var(--color-text-muted)] transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-[var(--color-text-heading)]">{batch.name}</h2>
                            <div className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] mt-1">STATUS: {batch.status}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => window.open(`/result-entry/batches/${id}/print`, "_blank")} className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-semibold hover:bg-[var(--color-surface)] flex items-center">
                            <Download size={16} className="mr-2" />
                            Export PDF
                        </button>
                        {!isLocked && (
                            <button 
                                onClick={handleSubmitToAdmin}
                                className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm font-semibold flex items-center hover:bg-pink-600 transition-colors shadow-sm"
                            >
                                <Send size={16} className="mr-2" />
                                Submit to Admin
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-8">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Left Col: Bundled Programmes */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-[var(--color-text-heading)] flex items-center">
                                    Bundled Programmes
                                    <span className="ml-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] py-0.5 px-2 rounded-full text-xs">{batch.programmes.length}</span>
                                </h3>
                                {!isLocked && (
                                    <button onClick={openAddModal} className="text-sm font-semibold text-[var(--color-primary)] flex items-center hover:underline">
                                        <Plus size={16} className="mr-1" /> Add
                                    </button>
                                )}
                            </div>

                            {batch.programmes.length === 0 ? (
                                <div className="p-6 border border-dashed border-[var(--color-border)] rounded-xl text-center text-[var(--color-text-muted)] text-sm">
                                    No programmes in this batch yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {batch.programmes.map(p => (
                                        <div key={p._id} onClick={() => setSelectedProgrammeDrilldown(p)} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex justify-between items-center group cursor-pointer hover:border-[var(--color-primary)]">
                                            <div>
                                                <div className="font-bold text-sm text-[var(--color-text-heading)]">{p.name}</div>
                                                <div className="text-xs text-[var(--color-text-muted)]">{p.code} • {p.category}</div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isLocked && (
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingProgramme(p); }} className="text-[var(--color-primary)] p-2 hover:bg-[var(--color-primary)]/10 rounded-lg" title="Edit Results">
                                                        <PenTool size={16} />
                                                    </button>
                                                )}
                                                {!isLocked && (
                                                    <button onClick={(e) => { e.stopPropagation(); detachProgramme(p._id); }} className="text-orange-500 p-2 hover:bg-orange-500/10 rounded-lg" title="Remove from Batch (Return to Ready)">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                                    </button>
                                                )}
                                                <button onClick={() => clearProgramme(p._id, p.name)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg" title="Delete Result Entirely">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Col: Live Preview */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Leaderboard Preview */}
                            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-background)]">
                                    <h3 className="text-lg font-bold text-[var(--color-text-heading)] flex items-center">
                                        <Trophy size={20} className="mr-2 text-yellow-500" />
                                        Cumulative Leaderboard Projection
                                    </h3>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">Includes all other batches' results + this batch's results.</p>
                                </div>
                                <div className="p-0">
                                    {leaderboard.length === 0 ? (
                                        <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">No team points calculated yet.</div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]/50">
                                                    <th className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Rank</th>
                                                    <th className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Team</th>
                                                    <th className="p-4 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Points</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leaderboard.map((team, idx) => (
                                                    <tr key={team.teamId} className="border-b border-[var(--color-border)] last:border-0">
                                                        <td className="p-4 font-bold text-[var(--color-text-muted)]">#{idx + 1}</td>
                                                        <td className="p-4 font-bold text-[var(--color-text-heading)]">{team.teamName}</td>
                                                        <td className="p-4 font-bold text-[var(--color-primary)] text-right">{team.points} pts</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>

                            {/* Category Toppers Preview */}
                            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-background)]">
                                    <h3 className="text-lg font-bold text-[var(--color-text-heading)] flex items-center">
                                        <Medal size={20} className="mr-2 text-blue-500" />
                                        Cumulative Individual Toppers
                                    </h3>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">Calculated across all historical approved results + this batch.</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    {overallToppers.length === 0 ? (
                                        <div className="text-center text-sm text-[var(--color-text-muted)]">No individual points assigned yet.</div>
                                    ) : (
                                        <>
                                            <div>
                                                <h4 className="font-bold text-sm text-[var(--color-primary)] uppercase tracking-wider mb-3">Overall Top 3 (Festival-Wide)</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    {overallToppers.map((w, i) => (
                                                        <div key={i} className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)]">
                                                            <div className="text-xs font-bold text-yellow-500 mb-1">#{i+1} OVERALL</div>
                                                            <div className="font-bold text-[var(--color-text-heading)] mb-1">{w.name}</div>
                                                            <div className="text-xs font-medium text-[var(--color-text-muted)] mb-2">{w.teamName}</div>
                                                            <div className="text-lg font-bold text-[var(--color-primary)]">{w.points} pts</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <hr className="border-[var(--color-border)]" />
                                            <div>
                                                <h4 className="font-bold text-sm text-[var(--color-text-muted)] uppercase tracking-wider mb-4">Category-Wise Champions</h4>
                                                <div className="space-y-4">
                                                    {Object.entries(categoryToppers).map(([category, winners]) => (
                                                        <div key={category}>
                                                            <div className="font-bold text-sm text-[var(--color-text-heading)] mb-2">{category}</div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                {winners.slice(0, 1).map((w, i) => ( // Show only Top 1 here for brevity
                                                                    <div key={i} className="p-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] flex justify-between items-center">
                                                                        <div>
                                                                            <div className="font-bold text-sm text-[var(--color-text-heading)]">{w.name}</div>
                                                                            <div className="text-xs text-[var(--color-text-muted)]">{w.teamName}</div>
                                                                        </div>
                                                                        <div className="font-bold text-[var(--color-primary)]">{w.points} pts</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
                    <div className="bg-[var(--color-surface)] w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-border)]">
                        <div className="p-6 border-b border-[var(--color-border)]">
                            <h3 className="text-xl font-bold text-[var(--color-text-heading)]">Attach Ready Programmes</h3>
                            <p className="text-sm text-[var(--color-text-muted)] mt-1">Select from standalone results that are ready to be batched.</p>
                        </div>
                        
                        <div className="p-6 flex-1 overflow-y-auto">
                            {readyProgrammes.length === 0 ? (
                                <div className="text-center text-[var(--color-text-muted)] py-8">No ready results available.</div>
                            ) : (
                                <div className="space-y-2">
                                    {readyProgrammes.map(p => (
                                        <label key={p._id} className="flex items-center p-4 border border-[var(--color-border)] rounded-xl cursor-pointer hover:bg-[var(--color-background)] transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedToAttach.includes(p._id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedToAttach([...selectedToAttach, p._id]);
                                                    else setSelectedToAttach(selectedToAttach.filter(id => id !== p._id));
                                                }}
                                                className="w-5 h-5 accent-[var(--color-primary)] mr-4"
                                            />
                                            <div>
                                                <div className="font-bold text-[var(--color-text-heading)]">{p.name}</div>
                                                <div className="text-sm text-[var(--color-text-muted)]">{p.code} • {p.category}</div>
                                            </div>
                                            <div className="ml-auto text-sm font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full">
                                                {p.resultCount} Scored
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-background)]/50 flex gap-3 justify-end shrink-0">
                            <button 
                                onClick={() => setShowAddModal(false)}
                                className="px-5 py-2.5 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={attachProgrammes}
                                className="px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md"
                            >
                                Attach Selected
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedProgrammeDrilldown && (
                  <ProgrammeDrilldownModal programme={selectedProgrammeDrilldown} results={batchResults.filter(r => r.programme && r.programme._id === selectedProgrammeDrilldown._id)} onClose={() => setSelectedProgrammeDrilldown(null)} />
              )}
              {editingProgramme && (
                <div className="print:hidden">
                    <EditProgrammeModal 
                        programme={editingProgramme} 
                        batchId={batch._id} isPublished={batch.status === 'published'} 
                        onClose={() => setEditingProgramme(null)}
                        onSaved={() => {
                            setEditingProgramme(null);
                            fetchBatchData(); // Refresh UI instantly
                            fetchProjection();
                        }}
                    />
                </div>
            )}
        </div>
    );
}
