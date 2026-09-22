import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ScoreBreakdownModal = ({ entity, onClose }) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBreakdown = async () => {
            try {
                const endpoint = entity.type === 'team' 
                    ? '/leaderboards/breakdown/team/' + entity.id
                    : '/leaderboards/breakdown/candidate/' + entity.id;
                const res = await api.get(endpoint);
                setResults(res.data || []);
            } catch (err) {
                console.error('Error fetching breakdown', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBreakdown();
    }, [entity]);

    
    let displayResults = results;
    if (entity.type === 'team') {
        const grouped = {};
        displayResults.forEach(r => {
            if (r.programme?.format === 'Group' || r.programme?.category === 'KULLIYYAH') {
                const pid = r.programme._id;
                if (!grouped[pid]) grouped[pid] = r;
            } else {
                grouped[r._id || Math.random()] = r;
            }
        });
        displayResults = Object.values(grouped);
    }
    const totalPoints = displayResults.reduce((sum, r) => sum + (r.totalPoints || 0), 0);


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[85vh]">
                
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {entity.name}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {entity.type === 'team' ? 'Team Score Breakdown' : 'Candidate Score Breakdown'}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-primary)] border-t-transparent"></div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            No approved results found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                                <thead className="bg-gray-50 dark:bg-gray-750/50 text-gray-900 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Programme</th>
                                        {entity.type === 'team' && <th className="px-4 py-3 font-semibold">Candidate</th>}
                                        <th className="px-4 py-3 font-semibold text-center">Rank</th>
                                        <th className="px-4 py-3 font-semibold text-center">Grade</th>
                                        <th className="px-4 py-3 font-semibold text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {(() => {
                                        let displayResults = results;
                                        if (entity.type === 'team') {
                                            const grouped = {};
                                            displayResults.forEach(r => {
                                                if (r.programme?.format === 'Group' || r.programme?.category === 'KULLIYYAH') {
                                                    const pid = r.programme._id;
                                                    if (!grouped[pid]) {
                                                        grouped[pid] = { ...r, _groupNames: [] };
                                                    }
                                                    if (r.candidate && r.candidate.name) grouped[pid]._groupNames.push(r.candidate.name);
                                                } else {
                                                    grouped[r._id || Math.random()] = r;
                                                }
                                            });
                                            displayResults = Object.values(grouped).map(r => {
                                                if (r._groupNames && r._groupNames.length > 0) {
                                                    r.candidate = { ...r.candidate, name: r._groupNames.join(', ') };
                                                }
                                                return r;
                                            });
                                        }
                                        return displayResults.map((r, i) => (
                                        <tr key={r._id || i} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/30">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">{r.programme?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{r.programme?.category} � {r.programme?.format}</div>
                                            </td>
                                            {entity.type === 'team' && (
                                                <td className="px-4 py-3">
                                                    {r.candidate?.name || 'Unknown'}
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-center">
                                                {r.rank ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 font-semibold">{r.rank}</span> : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {r.grade ? <span className="font-semibold text-[var(--color-primary)]">{r.grade}</span> : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                                                +{r.totalPoints}
                                            </td>
                                        </tr>
                                    ));
                                })()}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-gray-750 border-t-2 border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <td colSpan={entity.type === 'team' ? 4 : 3} className="px-4 py-4 text-right font-bold text-gray-900 dark:text-white">
                                            Total Verified Points
                                        </td>
                                        <td className="px-4 py-4 text-right font-black text-[var(--color-primary)] text-lg">
                                            {totalPoints}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScoreBreakdownModal;
