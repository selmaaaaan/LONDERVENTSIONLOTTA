import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckCircle, Package, Archive, Layers, AlertCircle, FileText, Send, SendIcon } from 'lucide-react';
import api from '../../services/api';

export default function ResultDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/result-entry/dashboard-stats');
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) {
        return (
            <div className="p-8 h-full flex items-center justify-center">
                <div className="text-[var(--color-text-muted)] animate-pulse">Loading dashboard...</div>
            </div>
        );
    }

    const { programmes, batches } = stats;
    const progressPercent = programmes.total > 0 
        ? Math.round((programmes.totalScored / programmes.total) * 100) 
        : 0;

    return (
        <div className="flex flex-col h-full bg-[var(--color-background)]">
            <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4">
                <h2 className="text-xl font-bold text-[var(--color-text-heading)] flex items-center">
                    <LayoutDashboard size={20} className="mr-2 text-[var(--color-primary)]" />
                    Result Entry Overview
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Track the overall progress of result entry and batch submissions.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Progress Bar Header */}
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--color-text-heading)]">Overall Progress</h3>
                                <p className="text-sm text-[var(--color-text-muted)]">{programmes.totalScored} of {programmes.total} programmes scored</p>
                            </div>
                            <div className="text-2xl font-bold text-[var(--color-primary)]">{progressPercent}%</div>
                        </div>
                        <div className="w-full bg-[var(--color-background)] rounded-full h-3 overflow-hidden border border-[var(--color-border)]">
                            <div 
                                className="bg-[var(--color-primary)] h-3 rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Programmes Pipeline */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">Programme Pipeline</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => navigate('/result-entry/enter')}
                                    className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-gray-400 transition-colors text-left flex flex-col items-start group shadow-sm"
                                >
                                    <AlertCircle size={24} className="text-red-500 mb-3 group-hover:scale-110 transition-transform" />
                                    <div className="text-3xl font-bold text-[var(--color-text-heading)]">{programmes.notEntered}</div>
                                    <div className="text-sm font-medium text-[var(--color-text-muted)] mt-1">Not Entered</div>
                                </button>
                                
                                <button 
                                    onClick={() => navigate('/result-entry/ready')}
                                    className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-blue-400 transition-colors text-left flex flex-col items-start group shadow-sm"
                                >
                                    <FileText size={24} className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                                    <div className="text-3xl font-bold text-[var(--color-text-heading)]">{programmes.ready}</div>
                                    <div className="text-sm font-medium text-[var(--color-text-muted)] mt-1">Ready (Unbatched)</div>
                                </button>

                                <button 
                                    onClick={() => navigate('/result-entry/batches')}
                                    className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-orange-400 transition-colors text-left flex flex-col items-start group shadow-sm"
                                >
                                    <Layers size={24} className="text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                                    <div className="text-3xl font-bold text-[var(--color-text-heading)]">{programmes.inBatch}</div>
                                    <div className="text-sm font-medium text-[var(--color-text-muted)] mt-1">In a Batch (Draft/Submitted)</div>
                                </button>

                                <button 
                                    onClick={() => navigate('/result-entry/batches?filter=published')}
                                    className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-green-400 transition-colors text-left flex flex-col items-start group shadow-sm"
                                >
                                    <CheckCircle size={24} className="text-green-500 mb-3 group-hover:scale-110 transition-transform" />
                                    <div className="text-3xl font-bold text-[var(--color-text-heading)]">{programmes.published}</div>
                                    <div className="text-sm font-medium text-[var(--color-text-muted)] mt-1">Published (Live)</div>
                                </button>
                            </div>
                        </div>

                        {/* Batch Pipeline */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">Batch Pipeline</h3>
                            <div className="flex flex-col gap-4">
                                <button 
                                    onClick={() => navigate('/result-entry/batches?filter=draft')}
                                    className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-gray-400 transition-colors flex items-center justify-between group shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-[var(--color-background)] rounded-lg">
                                            <Package size={24} className="text-gray-500 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-lg font-bold text-[var(--color-text-heading)]">Draft Batches</div>
                                            <div className="text-sm text-[var(--color-text-muted)]">Currently being compiled</div>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-[var(--color-text-heading)]">{batches.draft}</div>
                                </button>

                                <button 
                                    onClick={() => navigate('/result-entry/batches?filter=submitted')}
                                    className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-orange-400 transition-colors flex items-center justify-between group shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-[var(--color-background)] rounded-lg">
                                            <Send size={24} className="text-orange-500 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-lg font-bold text-[var(--color-text-heading)]">Submitted to Admin</div>
                                            <div className="text-sm text-[var(--color-text-muted)]">Awaiting approval</div>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-[var(--color-text-heading)]">{batches.submitted}</div>
                                </button>

                                <button 
                                    onClick={() => navigate('/result-entry/batches?filter=published')}
                                    className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl hover:border-green-400 transition-colors flex items-center justify-between group shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-[var(--color-background)] rounded-lg">
                                            <Archive size={24} className="text-green-500 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-lg font-bold text-[var(--color-text-heading)]">Published Batches</div>
                                            <div className="text-sm text-[var(--color-text-muted)]">Live on public portal</div>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-[var(--color-text-heading)]">{batches.published}</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
