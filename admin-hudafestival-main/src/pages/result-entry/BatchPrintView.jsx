import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Logo from '../../components/Logo';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

export default function BatchPrintView() {
    const { id } = useParams();
    const [batch, setBatch] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [overallToppers, setOverallToppers] = useState([]);
    const [categoryToppers, setCategoryToppers] = useState({});
    const [batchResults, setBatchResults] = useState([]);

    useEffect(() => {
        const fetchBatchData = async () => {
            try {
                const [batchRes, projRes] = await Promise.all([
                    api.get(`/result-entry/batches/${id}`),
                    api.get(`/result-entry/batches/${id}/projection`)
                ]);
                
                setBatch(batchRes.data.batch);
                setBatchResults(batchRes.data.batchResults || []);
                
                setLeaderboard(projRes.data.leaderboard || []);
                setOverallToppers(projRes.data.overallToppers || []);
                setCategoryToppers(projRes.data.categoryToppers || {});
                
                setTimeout(() => {
                    window.print();
                }, 1000);
            } catch (err) {
                console.error('Failed to load batch data for print');
            }
        };
        fetchBatchData();
    }, [id]);

    if (!batch) return <div className="!text-black p-8 font-sans">Loading report...</div>;

    return (
        <div className="!text-black font-sans bg-white text-black min-h-screen p-8 max-w-5xl mx-auto print:p-0 print:m-0">
            <div className="!text-black text-center mb-8 border-b-2 border-black pb-4">
                <div className="!text-black flex justify-center mb-4"><Logo className="!text-black w-48 grayscale" /></div>
                <h1 className="!text-black text-3xl font-black uppercase tracking-widest">Result Batch Report</h1>
                <div className="!text-black text-sm font-bold uppercase mt-2">Batch: {batch.name}</div>
                <div className="!text-black text-xs mt-1 text-gray-500">Generated on {new Date().toLocaleString()}</div>
            </div>

            <div className="!text-black space-y-8 mb-12">
                {batch.programmes.map(prog => {
                    let progResults = batchResults.filter(r => r.programme && r.programme._id === prog._id);

                    if (prog.format === 'Group' || prog.category === 'KULLIYYAH') {
                        const teamMap = {};
                        progResults.forEach(r => {
                            const tId = r.candidate?.team?._id || r.candidate?.team || r.team?._id || r.team || 'unknown';
                            if (!teamMap[tId]) teamMap[tId] = { ...r, _groupNames: [] };
                            if (r.candidate && r.candidate.name) teamMap[tId]._groupNames.push(r.candidate.name);
                        });
                        progResults = Object.values(teamMap).map(r => {
                            if (r._groupNames && r._groupNames.length > 0) {
                                r.candidate = { ...r.candidate, name: r._groupNames.join(', ') };
                            }
                            return r;
                        });
                    }

                    const scoredResults = progResults
                        .filter(r => r.rank || r.grade || r.totalPoints > 0)
                        .sort((a, b) => {
                            // Ranked candidates first (by rank ascending), then grade-only (by points desc)
                            if (a.rank && b.rank) return a.rank - b.rank;
                            if (a.rank && !b.rank) return -1;
                            if (!a.rank && b.rank) return 1;
                            return (b.totalPoints || 0) - (a.totalPoints || 0);
                        });
                    
                    if (scoredResults.length === 0) return null; 

                    return (
                        <div key={prog._id} className="!text-black border border-black p-6 rounded-lg break-inside-avoid">
                            <h2 className="!text-black text-xl font-bold uppercase border-b border-gray-300 pb-2 mb-4">
                                {prog.code} - {prog.name} <span className="!text-black text-sm font-normal text-gray-500">({prog.category})</span>
                            </h2>
                            <table className="!text-black w-full text-sm text-left">
                                <thead>
                                    <tr className="!text-black border-b border-black">
                                        <th className="!text-black py-2">Candidate</th>
                                        <th className="!text-black py-2">Team</th>
                                        <th className="!text-black py-2">Pos</th>
                                        <th className="!text-black py-2">Grade</th>
                                        <th className="!text-black py-2 text-right">Prev Total</th>
                                        <th className="!text-black py-2 text-right">Marks</th>
                                        <th className="!text-black py-2 text-right">Grand Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scoredResults.map((r, idx) => (
                                        <tr key={idx} className="!text-black border-b border-gray-200 last:border-0">
                                            <td className="!text-black py-2 font-bold">{r.candidate?.name || 'Unknown'}</td>
                                            <td className="!text-black py-2 text-gray-700">{r.candidate?.team?.name || r.team?.name || 'Unknown'}</td>
                                            <td className="!text-black py-2 font-bold">{r.rank || '-'}</td>
                                            <td className="!text-black py-2 font-bold">{r.grade || '-'}</td>
                                            <td className="!text-black py-2 text-right text-gray-500">{r.previousTotal || 0}</td>
                                            <td className="!text-black py-2 font-bold text-right">{r.totalPoints} pts</td>
                                            <td className="!text-black py-2 font-bold text-right">{(r.previousTotal || 0) + (r.totalPoints || 0)} pts</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>

            <div className="!text-black break-before-page pt-8">
                <div className="flex items-center justify-between bg-[var(--color-primary)] rounded-xl p-6 mb-10" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: 'var(--color-primary)' }}>
                    <div>
                        <h2 className="text-white text-2xl font-black uppercase tracking-widest" style={{ color: '#ffffff' }}>Cumulative Projections</h2>
                        <div className="text-white/90 text-xs mt-1 font-medium" style={{ color: '#f8fafc' }}>Calculated inclusive of this batch</div>
                    </div>
                    <Trophy className="text-white opacity-90" size={40} strokeWidth={1.5} style={{ color: '#ffffff' }} />
                </div>

                <div className="!text-black grid grid-cols-2 gap-12">
                    <div>
                        <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-200 pb-2">
                            <Trophy className="text-[var(--color-primary)]" size={20} style={{ color: 'var(--color-primary)' }} />
                            <h3 className="text-lg font-black uppercase !text-black">Team Leaderboard</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            {leaderboard.map((team, idx) => {
                                let rankBg = "bg-gray-50";
                                let rankBorder = "border-gray-200";
                                let rankText = "text-gray-600";
                                let bgHex = "#f9fafb";
                                let borderHex = "#e5e7eb";
                                let textHex = "#4b5563";
                                
                                if (idx === 0) { rankBg = "bg-amber-50"; rankBorder = "border-amber-300"; rankText = "text-amber-700"; bgHex = "#fffbeb"; borderHex = "#fcd34d"; textHex = "#b45309"; }
                                else if (idx === 1) { rankBg = "bg-slate-50"; rankBorder = "border-slate-300"; rankText = "text-slate-700"; bgHex = "#f8fafc"; borderHex = "#cbd5e1"; textHex = "#334155"; }
                                else if (idx === 2) { rankBg = "bg-orange-50"; rankBorder = "border-orange-300"; rankText = "text-orange-800"; bgHex = "#fff7ed"; borderHex = "#fdba74"; textHex = "#9a3412"; }

                                return (
                                    <div key={team.teamId} className={`flex items-center justify-between p-3 rounded-xl border-2 ${rankBorder} ${rankBg}`} style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: bgHex, borderColor: borderHex }}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black bg-white shadow-sm border ${rankBorder} ${rankText}`} style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#ffffff', borderColor: borderHex, color: textHex }}>
                                                {idx + 1}
                                            </div>
                                            <span className="font-black text-sm uppercase !text-black tracking-wide">{team.teamName}</span>
                                        </div>
                                        <div className="font-black text-lg !text-black">{team.points} <span className="text-[10px] font-bold text-gray-500">PTS</span></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="!text-black space-y-10">
                        <div>
                            <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-200 pb-2">
                                <Medal className="text-[var(--color-primary)]" size={20} style={{ color: 'var(--color-primary)' }} />
                                <h3 className="text-lg font-black uppercase !text-black">Overall Top 3</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {overallToppers.map((ind, idx) => {
                                    let RankIcon = Medal;
                                    let iconColor = "text-gray-400";
                                    let iconHex = "#9ca3af";
                                    if (idx === 0) { RankIcon = Trophy; iconColor = "text-amber-500"; iconHex = "#f59e0b"; }
                                    else if (idx === 1) { iconColor = "text-slate-400"; iconHex = "#94a3b8"; }
                                    else if (idx === 2) { iconColor = "text-orange-500"; iconHex = "#f97316"; }

                                    return (
                                        <div key={ind.candidateId} className="flex items-center p-3 border-2 border-gray-100 bg-gray-50 rounded-xl gap-4" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#f9fafb', borderColor: '#f3f4f6' }}>
                                            <div className={`flex-shrink-0 ${iconColor}`} style={{ color: iconHex }}>
                                                <RankIcon size={28} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="font-black uppercase !text-black text-sm tracking-tight">{ind.name}</div>
                                                <div className="text-[10px] !text-gray-500 font-bold mt-0.5 uppercase">{ind.teamName}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black !text-black text-base">{ind.points} <span className="text-[10px] text-gray-500">PTS</span></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-200 pb-2">
                                <Crown className="text-[var(--color-primary)]" size={20} style={{ color: 'var(--color-primary)' }} />
                                <h3 className="text-lg font-black uppercase !text-black">Category Champions</h3>
                            </div>
                            <div className="flex flex-col gap-3">
                                {Object.entries(categoryToppers).map(([category, winners]) => (
                                    <div key={category} className="flex items-center p-3 border-2 border-pink-100 bg-pink-50 rounded-xl gap-4" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#fdf2f8', borderColor: '#fce7f3' }}>
                                        <div className="flex-shrink-0 text-[var(--color-primary)]" style={{ color: 'var(--color-primary)' }}>
                                            <Award size={24} strokeWidth={2.5} />
                                        </div>
                                        <div className="w-24 font-black uppercase text-[10px] tracking-wider !text-black leading-tight">{category}</div>
                                        <div className="flex-grow border-l-2 pl-3 border-pink-200" style={{ borderColor: '#fbcfe8' }}>
                                            {winners.length > 0 ? (
                                                <div>
                                                    <div className="font-black !text-black text-xs uppercase">{winners[0].name}</div>
                                                    <div className="text-[10px] !text-gray-500 font-bold mt-0.5 uppercase">{winners[0].teamName}</div>
                                                </div>
                                            ) : <div className="!text-gray-400 italic text-xs">None</div>}
                                        </div>
                                        {winners.length > 0 && (
                                            <div className="text-right font-black !text-black text-sm whitespace-nowrap">
                                                {winners[0].points} <span className="text-[10px] text-gray-500">PTS</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="break-before-page pt-12 pb-8 px-8 w-[210mm] mx-auto bg-white min-h-[297mm]">
                <div className="border-b-4 border-black pb-4 mb-8">
                    <h2 className="text-3xl font-black uppercase tracking-tight !text-black text-center">FESTIVAL STANDINGS AFTER THIS BATCH</h2>
                    <p className="text-center font-bold text-gray-500 mt-2 uppercase tracking-widest">Cumulative Grand Total</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                    {leaderboard.map((team, idx) => (
                        <div key={team.teamId} className="flex items-center p-6 border-2 border-gray-200 bg-gray-50 rounded-2xl gap-6" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#f9fafb' }}>
                            <div className="flex-shrink-0 text-4xl font-black text-gray-300 w-16 text-center">#{idx + 1}</div>
                            <div className="flex-grow">
                                <div className="font-black uppercase !text-black text-2xl tracking-tight">{team.teamName}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-black !text-black text-4xl">{team.points}</div>
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Total Points</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="!text-black fixed bottom-4 right-4 print:hidden">
                <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg">
                    Print Report
                </button>
            </div>
        </div>
    );
}
