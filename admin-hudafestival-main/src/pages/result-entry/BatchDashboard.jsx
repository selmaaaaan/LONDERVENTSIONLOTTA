import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Clock, FileText, Trash2, Edit2, Layers, Undo } from 'lucide-react';
import api from '../../services/api';
import { useResultUI } from '../../context/ResultEntryUIContext';

export default function BatchDashboard() {
    const [batches, setBatches] = useState([]);
    const [showNewBatch, setShowNewBatch] = useState(false);
    const [newBatchName, setNewBatchName] = useState('');
    const [editingBatch, setEditingBatch] = useState(null);
    const [editBatchName, setEditBatchName] = useState('');

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'all';
    const { showModal, showToast } = useResultUI();

    const fetchBatches = async () => {
        try {
            const res = await api.get('/result-entry/batches');
            setBatches(res.data);
        } catch (err) {
            showToast('Failed to load batches', 'error');
        }
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/result-entry/batches', {
                name: newBatchName
            });
            setShowNewBatch(false);
            setNewBatchName('');
            navigate(`/result-entry/batches/${res.data._id}`);
        } catch (error) {
            alert('Failed to create batch');
        }
    };

    const handleDelete = (e, batch) => {
        e.stopPropagation(); // prevent navigation
        showModal({
            title: 'Delete Batch',
            message: `Delete batch '${batch.name}'? This will not delete the saved results — they'll return to Ready Results.`,
            confirmText: 'Delete Batch',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/result-entry/batches/${batch._id}`);
                    showToast('Batch deleted', 'success');
                    fetchBatches();
                } catch (error) {
                    showToast('Failed to delete batch', 'error');
                }
            }
        });
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/result-entry/batches/${editingBatch._id}`, { name: editBatchName });
            setEditingBatch(null);
            fetchBatches();
        } catch (error) {
            showToast('Failed to update batch', 'error');
        }
    };

    const filteredBatches = batches.filter(b => filter === 'all' || b.status === filter);
    
    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Batches</h1>
                    <p className="text-[var(--color-text-muted)] mt-1">Group ready results into batches to submit to admin.</p>
                </div>
                <button 
                    onClick={() => setShowNewBatch(true)}
                    className="bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center hover:opacity-90 transition-all shadow-md hover:shadow-lg"
                >
                    <Plus size={18} className="mr-2" />
                    New Batch
                </button>
            </div>

            {filteredBatches.length === 0 ? (
                <div className="p-12 text-center bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-2xl">
                    <Layers size={48} className="mx-auto text-[var(--color-border)] mb-4" />
                    <h2 className="text-lg font-bold text-[var(--color-text-heading)] mb-2">No batches found</h2>
                    <p className="text-sm text-[var(--color-text-muted)] mb-6">You don't have any batches matching this filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBatches.map(batch => (
                        <div 
                            key={batch._id}
                            onClick={() => navigate(`/result-entry/batches/${batch._id}`)}
                            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 cursor-pointer hover:border-[var(--color-primary)] hover:shadow-lg transition-all group relative"
                        >
                            {/* Action Buttons */}
                            {batch.status === 'draft' && (
                                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingBatch(batch);
                                            setEditBatchName(batch.name);
                                        }}
                                        className="p-1.5 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 rounded"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button 
                                        onClick={(e) => handleDelete(e, batch)}
                                        className="p-1.5 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4 pr-16">
                                <h3 className="font-bold text-[var(--color-text-heading)] text-lg group-hover:text-[var(--color-primary)] transition-colors">{batch.name}</h3>
                            </div>
                            
                            <div className="mb-4">
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                                    batch.status === 'draft' ? 'bg-orange-500/10 text-orange-500' :
                                    batch.status === 'submitted' ? 'bg-blue-500/10 text-blue-500' :
                                    'bg-green-500/10 text-green-500'
                                }`}>
                                    {batch.status}
                                </span>
                            </div>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm text-[var(--color-text-muted)]">
                                    <FileText size={16} className="mr-3 text-[var(--color-primary)]/70" />
                                    <span className="font-medium text-[var(--color-text-heading)]">{batch.programmes.length}</span>
                                    <span className="ml-1">programmes bundled</span>
                                </div>
                                <div className="flex items-center text-sm text-[var(--color-text-muted)]">
                                    <Clock size={16} className="mr-3 text-[var(--color-primary)]/70" />
                                    <span>Created {new Date(batch.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5">
                                {batch.programmes.slice(0, 3).map(p => (
                                    <span key={p._id} className="text-xs px-2 py-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded text-[var(--color-text-muted)]">
                                        {p.code}
                                    </span>
                                ))}
                                {batch.programmes.length > 3 && (
                                    <span className="text-xs px-2 py-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded text-[var(--color-text-muted)]">
                                        +{batch.programmes.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            {showNewBatch && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--color-surface)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-border)]">
                        <div className="p-6 border-b border-[var(--color-border)]">
                            <h3 className="text-xl font-bold text-[var(--color-text-heading)]">Create New Batch</h3>
                        </div>
                        <form onSubmit={handleCreateBatch}>
                            <div className="p-6">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--color-text-heading)] mb-2">Batch Name</label>
                                    <input 
                                        type="text" 
                                        value={newBatchName}
                                        onChange={(e) => setNewBatchName(e.target.value)}
                                        placeholder="e.g. Saturday Morning Sessions"
                                        className="w-full px-4 py-2.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-[var(--color-text-heading)]"
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-background)]/50 flex gap-3 justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => setShowNewBatch(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md"
                                >
                                    Create Batch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingBatch && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--color-surface)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-border)]">
                        <div className="p-6 border-b border-[var(--color-border)]">
                            <h3 className="text-xl font-bold text-[var(--color-text-heading)]">Rename Batch</h3>
                        </div>
                        <form onSubmit={handleEditSave}>
                            <div className="p-6">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--color-text-heading)] mb-2">Batch Name</label>
                                    <input 
                                        type="text" 
                                        value={editBatchName}
                                        onChange={(e) => setEditBatchName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-[var(--color-text-heading)]"
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-background)]/50 flex gap-3 justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => setEditingBatch(null)}
                                    className="px-5 py-2.5 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-5 py-2.5 bg-[var(--color-primary)] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
