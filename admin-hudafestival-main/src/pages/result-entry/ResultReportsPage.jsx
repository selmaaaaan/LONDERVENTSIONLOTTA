import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import { Printer, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#3B82F6', '#14B8A6'];

export default function ResultReportsPage() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const exportToExcel = async () => {
        try {
            const { data: candidates } = await api.get('/candidates');
            const sorted = candidates.sort((a, b) => {
                const classA = a.classLevel || '';
                const classB = b.classLevel || '';
                if (classA !== classB) {
                    return classA.localeCompare(classB, undefined, { numeric: true });
                }
                return (b.totalPoints || 0) - (a.totalPoints || 0);
            });

            const excelData = sorted.map(c => ({
                'Class Level': c.classLevel || 'Unspecified',
                'Admission No': c.admissionNo,
                'Name': c.name,
                'Category': c.category,
                'Team': c.team?.name || 'Unknown',
                'Total Points': c.totalPoints || 0
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Student Points");
            
            worksheet['!cols'] = [
                {wch: 15}, {wch: 15}, {wch: 30}, {wch: 15}, {wch: 25}, {wch: 15}
            ];

            XLSX.writeFile(workbook, "All_Students_Points_Classwise.xlsx");
        } catch (err) {
            console.error("Export error:", err);
            alert("Failed to export. Check console.");
        }
    };


    useEffect(() => {
        api.get('/result-entry/export/all-published')
            .then(res => {
                setResults(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Analyzing festival data...</div>;
    }

    // 1. Calculate Class-wise scores
    const classScores = {};
    results.forEach(r => {
        if (!r.candidates) return;
        r.candidates.forEach(cItem => {
            if (cItem.candidate && cItem.candidate.classLevel) {
                const cls = `Class ${cItem.candidate.classLevel}`;
                if (!classScores[cls]) classScores[cls] = 0;
                // Add the result points to this class tally
                classScores[cls] += (r.totalPoints || 0);
            }
        });
    });
    const categoryData = Object.keys(classScores).map(c => ({
        name: c,
        points: classScores[c]
    })).sort((a, b) => b.points - a.points);

    // 2. Language-wise breakdown of published results
    const languageCounts = { ENG: 0, MLM: 0, ARB: 0, URD: 0, HIN: 0, OTH: 0 };
    const progSet = new Set();
    
    results.forEach(r => {
        if (!r.programme) return;
        if (progSet.has(r.programme._id)) return; // Only count each programme once
        progSet.add(r.programme._id);

        const pName = r.programme.name.toUpperCase();
        if (pName.includes('ENG')) languageCounts.ENG++;
        else if (pName.includes('MLM') || pName.includes('MALAYALAM')) languageCounts.MLM++;
        else if (pName.includes('ARB') || pName.includes('ARABIC')) languageCounts.ARB++;
        else if (pName.includes('URD') || pName.includes('URDU')) languageCounts.URD++;
        else if (pName.includes('HIN') || pName.includes('HINDI')) languageCounts.HIN++;
        else languageCounts.OTH++;
    });

    const langData = Object.keys(languageCounts)
        .filter(k => languageCounts[k] > 0)
        .map(k => ({
            name: k,
            value: languageCounts[k]
        }));

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto print:p-0">
            <div className="flex items-center justify-between mb-8 print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-heading)]">Analytics & Reports</h1>
                    <p className="text-[var(--color-text-muted)] mt-1">Festival-wide statistics and breakdowns</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg transition-colors shadow-lg"
                    >
                        <FileSpreadsheet size={18} />
                        Export Excel
                    </button>
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-heading)] rounded-lg transition-colors"
                    >
                        <Printer size={18} />
                        Print Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Category Points Chart */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 print:break-inside-avoid">
                    <h2 className="text-xl font-bold text-[var(--color-text-heading)] mb-6">Which Class Scored More?</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3D" horizontal={false} />
                                <XAxis type="number" stroke="#94A3B8" />
                                <YAxis dataKey="name" type="category" stroke="#94A3B8" width={80} />
                                <Tooltip contentStyle={{ backgroundColor: '#1E2230', borderColor: '#2A2F3D', color: '#F1F5F9' }} />
                                <Bar dataKey="points" fill="#6366F1" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Language Breakdown Chart */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 print:break-inside-avoid">
                    <h2 className="text-xl font-bold text-[var(--color-text-heading)] mb-6">Language-wise Programmes</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={langData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {langData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1E2230', borderColor: '#2A2F3D', color: '#F1F5F9' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
            
            <div className="mt-8 text-center print:block hidden text-gray-500">
                Generated from Huda Festival Admin Console
            </div>
        </div>
    );
}
