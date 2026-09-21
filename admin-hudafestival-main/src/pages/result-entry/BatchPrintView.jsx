import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Logo from '../../components/Logo';

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
                const res = await api.get(`/result-entry/batches/${id}`);
                setBatch(res.data.batch);
                setLeaderboard(res.data.leaderboard || []);
                setOverallToppers(res.data.overallToppers || []);
                setCategoryToppers(res.data.categoryToppers || {});
                setBatchResults(res.data.batchResults || []);
                
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
                <h1 className="!text-black text-3xl font-black uppercase tracking-widest !text-black">Result Batch Report</h1>
                <div className="!text-black text-sm font-bold uppercase mt-2">Batch: {batch.name}</div>
                <div className="!text-black text-xs mt-1 text-gray-500">Generated on {new Date().toLocaleString()}</div>
            </div>

            <div className="!text-black space-y-8 mb-12">
                {batch.programmes.map(prog => {
                    const progResults = batchResults.filter(r => r.programme && r.programme._id === prog._id);
                    const scoredResults = progResults.filter(r => r.position && r.position !== '-' && r.points > 0);
                    
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
                                        <th className="!text-black py-2 text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scoredResults.map((r, idx) => (
                                        <tr key={idx} className="!text-black border-b border-gray-200 last:border-0">
                                            <td className="!text-black py-2 font-bold">{r.candidate?.name || 'Unknown'}</td>
                                            <td className="!text-black py-2 text-gray-700">{r.team?.name || 'Unknown'}</td>
                                            <td className="!text-black py-2 font-bold">{r.position}</td>
                                            <td className="!text-black py-2 font-bold">{r.grade}</td>
                                            <td className="!text-black py-2 font-bold text-right">{r.points} pts</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>

            <div className="!text-black break-before-page">
                <div className="!text-black text-center mb-8 border-b-2 border-black pb-4">
                    <h2 className="!text-black text-2xl font-black uppercase tracking-widest !text-black">Cumulative Projections</h2>
                    <div className="!text-black text-xs mt-1 text-gray-500">Calculated inclusive of this batch</div>
                </div>

                <div className="!text-black grid grid-cols-2 gap-12">
                    <div>
                        <h3 className="!text-black text-lg font-bold uppercase mb-4 bg-gray-200 p-2 text-center !text-black">Team Leaderboard</h3>
                        <table className="!text-black w-full text-sm">
                            <tbody>
                                {leaderboard.map((team, idx) => (
                                    <tr key={team.teamId} className="!text-black border-b border-gray-200">
                                        <td className="!text-black py-2 font-bold w-12">#{idx + 1}</td>
                                        <td className="!text-black py-2">{team.teamName}</td>
                                        <td className="!text-black py-2 font-bold text-right">{team.points} pts</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="!text-black space-y-8">
                        <div>
                            <h3 className="!text-black text-lg font-bold uppercase mb-4 bg-gray-200 p-2 text-center !text-black">Overall Top 3</h3>
                            <table className="!text-black w-full text-sm">
                                <tbody>
                                    {overallToppers.map((ind, idx) => (
                                        <tr key={ind.candidateId} className="!text-black border-b border-gray-200">
                                            <td className="!text-black py-2 font-bold w-12">#{idx + 1}</td>
                                            <td className="!text-black py-2">
                                                <div className="!text-black font-bold">{ind.name}</div>
                                                <div className="!text-black text-xs text-gray-500">{ind.teamName}</div>
                                            </td>
                                            <td className="!text-black py-2 font-bold text-right">{ind.points} pts</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h3 className="!text-black text-lg font-bold uppercase mb-4 bg-gray-200 p-2 text-center !text-black">Category Champions</h3>
                            <table className="!text-black w-full text-sm">
                                <tbody>
                                    {Object.entries(categoryToppers).map(([category, winners]) => (
                                        <tr key={category} className="!text-black border-b border-gray-200">
                                            <td className="!text-black py-2 font-bold">{category}</td>
                                            <td className="!text-black py-2">
                                                {winners.length > 0 ? (
                                                    <div>
                                                        <div className="!text-black font-bold">{winners[0].name}</div>
                                                        <div className="!text-black text-xs text-gray-500">{winners[0].teamName}</div>
                                                    </div>
                                                ) : <div className="!text-black text-gray-400 italic">None</div>}
                                            </td>
                                            <td className="!text-black py-2 font-bold text-right">{winners.length > 0 ? `${winners[0].points} pts` : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="!text-black fixed bottom-4 right-4 print:hidden">
                <button onClick={() => window.print()} className="bg-blue-600 text-white text-white px-6 py-3 rounded-full font-bold shadow-lg">
                    Print Report
                </button>
            </div>
        </div>
    );
}
