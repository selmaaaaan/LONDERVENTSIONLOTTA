import React, { useState, useEffect } from 'react';
import { Award, Trophy } from 'lucide-react';
import api from '../../services/api';

export default function AllResultsPrintView() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/result-entry/export/all-published')
            .then(res => {
                setResults(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                alert('Error loading results for print');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Generating report...</div>;
    }

    // Group results by category, then by programme
    const grouped = {};
    results.forEach(r => {
        if (!r.programme) return;
        const cat = r.programme.category || 'Uncategorized';
        const prog = r.programme.name;
        
        if (!grouped[cat]) grouped[cat] = {};
        if (!grouped[cat][prog]) grouped[cat][prog] = { programme: r.programme, results: [] };
        
        grouped[cat][prog].results.push(r);
    });

    // Sort categories, programmes, and results
    const order = ['BIDAYA', 'ULA', 'THANIYYAH', 'THANIYAH', 'THANAWIYYAH', 'ALIYA', 'ALIYAH', 'KULLIYYAH', 'GENERAL'];
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
        let ia = order.findIndex(x => a.toUpperCase().includes(x));
        let ib = order.findIndex(x => b.toUpperCase().includes(x));
        if (ia === -1) ia = 999;
        if (ib === -1) ib = 999;
        if (ia !== ib) return ia - ib;
        return a.localeCompare(b);
    });

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white text-black font-sans">
            <div className="max-w-[210mm] mx-auto bg-white p-8 print:w-[210mm] print:shadow-none shadow-xl min-h-[297mm]">
                <div className="border-b-4 border-black pb-4 mb-8 text-center">
                    <h1 className="text-4xl font-black uppercase tracking-tight">HUDA FESTIVAL</h1>
                    <h2 className="text-2xl font-black text-gray-600 mt-2 uppercase tracking-widest">Complete Published Results</h2>
                </div>

                {sortedCategories.length === 0 ? (
                    <div className="text-center text-gray-500">No published results found.</div>
                ) : (
                    sortedCategories.map(category => (
                        <div key={category} className="mb-12">
                            <h3 className="text-3xl font-black uppercase bg-black text-white px-4 py-2 mb-6 tracking-wider">{category}</h3>
                            
                            {Object.values(grouped[category]).sort((a, b) => a.programme.name.localeCompare(b.programme.name)).map(group => {
                                // sort results by rank (1,2,3)
                                const sortedResults = [...group.results].sort((a, b) => {
                                    if (a.rank && b.rank) return a.rank - b.rank;
                                    if (a.rank) return -1;
                                    if (b.rank) return 1;
                                    return 0;
                                });

                                return (
                                    <div key={group.programme._id} className="mb-8 pl-4 border-l-4 border-gray-200">
                                        <h4 className="text-xl font-bold uppercase mb-3 flex justify-between items-end border-b border-gray-300 pb-1">
                                            <span>{group.programme.name}</span>
                                            <span className="text-xs text-gray-500 tracking-widest">{group.programme.code}</span>
                                        </h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {sortedResults.map((res, idx) => {
                                                const cand = res.candidate || {};
                                                const teamName = cand.team?.name || 'Unknown';
                                                
                                                let rankLabel = '-';
                                                let rankColor = 'text-gray-400';
                                                if (res.rank === 1) { rankLabel = '1st'; rankColor = 'text-amber-500'; }
                                                else if (res.rank === 2) { rankLabel = '2nd'; rankColor = 'text-slate-400'; }
                                                else if (res.rank === 3) { rankLabel = '3rd'; rankColor = 'text-orange-500'; }

                                                return (
                                                    <div key={res._id} className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                                                        <div className="flex items-center gap-4 w-1/2">
                                                            <div className={`w-8 font-black text-lg ${rankColor}`}>{rankLabel}</div>
                                                            <div>
                                                                <div className="font-bold uppercase text-sm">{cand.name}</div>
                                                                <div className="text-[10px] font-bold text-gray-500 uppercase">{cand.admissionNo}</div>
                                                            </div>
                                                        </div>
                                                        <div className="w-1/4">
                                                            <div className="font-bold text-sm uppercase">{teamName}</div>
                                                        </div>
                                                        <div className="w-1/4 text-right">
                                                            {res.grade && <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded mr-2 uppercase">Grade {res.grade}</span>}
                                                            
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
            </div>

            <div className="fixed bottom-6 right-6 print:hidden">
                <button 
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-2 transition-transform hover:scale-105"
                >
                    Print / Save PDF
                </button>
            </div>
        </div>
    );
}
