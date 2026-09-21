import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Edit2, Undo, Eye } from 'lucide-react';
import api from '../../services/api';
import { useResultUI } from '../../context/ResultEntryUIContext';

export default function AllResultsPage() {
    const [pipeline, setPipeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    
    const navigate = useNavigate();
    const { showModal, showToast } = useResultUI();

    const fetchPipeline = async () => {
        setLoading(true);
        try {
            const res = await api.get('/result-entry/programmes-pipeline');
            setPipeline(res.data);
        } catch (err) {
            console.error('Failed to fetch pipeline', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPipeline();
    }, []);

    const handleRecall = (batchId, pName) => {
        showModal({
            title: 'Recall Batch',
            message: `Recall the batch containing '${pName}' from Admin? It will be pulled back to Draft status here and removed from Admin's Pending Results list until you resubmit it.`,
            confirmText: 'Recall',
            onConfirm: async () => {
                try {
                    await api.put(`/result-entry/batches/${batchId}/recall`);
                    showToast('Batch recalled successfully!', 'success');
                    fetchPipeline();
                } catch (err) {
                    showToast(err.response?.data?.message || 'Error recalling batch', 'error');
                }
            }
        });
    };

    const filtered = pipeline.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'all' || p.pipelineStatus === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status) => {
        switch(status) {
            case 'not_entered': return <span className="px-2 py-1 bg-gray-500/10 text-gray-500 text-[10px] uppercase font-bold rounded-full">Not Entered</span>;
            case 'ready': return <span className="px-2 py-1 bg-pink-500/10 text-pink-500 text-[10px] uppercase font-bold rounded-full">Ready (Unbatched)</span>;
            case 'in_batch': return <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-[10px] uppercase font-bold rounded-full">In a Batch (Draft)</span>;
            case 'submitted': return <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-[10px] uppercase font-bold rounded-full">Submitted</span>;
            case 'published': return <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] uppercase font-bold rounded-full">Published (Live)</span>;
            default: return null;
        }
    };

    return (
        <div className="h-full flex flex-col p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-heading)]">All Results</h1>
                    <p className="text-[var(--color-text-muted)] mt-1">Full pipeline view of all programmes.</p>
                </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex-1 flex flex-col overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--color-border)] flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-2">
                        {['all', 'not_entered', 'ready', 'in_batch', 'submitted', 'published'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
                                    activeFilter === filter 
                                        ? 'bg-[var(--color-primary)] text-white' 
                                        : 'bg-[var(--color-background)] text-[var(--color-text-body)] hover:bg-[var(--color-border)]'
                                }`}
                            >
                                {filter.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={16} />
                        <input
                            type="text"
                            placeholder="Search programmes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 w-64 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] text-[var(--color-text-body)]"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full text-[var(--color-text-muted)] animate-pulse">Loading pipeline...</div>
                    ) : filtered.length === 0 ? (
                        <div className="flex justify-center items-center h-full text-[var(--color-text-muted)]">No programmes match the selected filters.</div>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map(p => (
                                <div key={p._id} className="flex items-center justify-between p-4 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold">
                                            {p.code}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[var(--color-text-heading)]">{p.name}</h3>
                                            <p className="text-xs text-[var(--color-text-muted)]">{p.category}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        {getStatusBadge(p.pipelineStatus)}
                                        
                                        <div className="w-24 flex justify-end">
                                            {(p.pipelineStatus === 'not_entered' || p.pipelineStatus === 'ready' || p.pipelineStatus === 'published') && (
                                                <button 
                                                    onClick={() => navigate(`/result-entry/enter?programme=${p._id}`)}
                                                    className="p-2 text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 rounded-lg flex items-center gap-2"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                            {p.pipelineStatus === 'in_batch' && (
                                                <button 
                                                    onClick={() => navigate(`/result-entry/batches/${p.batchId}`)}
                                                    className="p-2 text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg"
                                                    title="View in Batch"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                            {p.pipelineStatus === 'submitted' && (
                                                <button 
                                                    onClick={() => handleRecall(p.batchId, p.name)}
                                                    className="p-2 text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg flex items-center gap-2"
                                                    title="Recall Batch"
                                                >
                                                    <Undo size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
