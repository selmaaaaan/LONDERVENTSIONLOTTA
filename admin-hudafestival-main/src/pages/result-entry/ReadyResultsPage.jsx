import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenTool, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useResultUI } from '../../context/ResultEntryUIContext';

export default function ReadyResultsPage() {
    const [readyProgrammes, setReadyProgrammes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { showModal, showToast } = useResultUI();

    const fetchReady = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/result-entry/ready-results');
            setReadyProgrammes(res.data);
        } catch (err) {
            console.error(err);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchReady();
    }, []);

    const handleDelete = (progId) => {
        showModal({
            title: 'Clear Results',
            message: 'Are you sure you want to clear these results? This will permanently delete the drafted scores for this programme.',
            confirmText: 'Clear Results',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/result-entry/standalone-results/${progId}`);
                    showToast("Results cleared successfully", "success");
                    fetchReady();
                } catch (err) {
                    showToast("Failed to clear results", "error");
                }
            }
        });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-[var(--color-text-heading)] mb-2">Ready Results</h1>
            <p className="text-[var(--color-text-muted)] mb-8">Results that are saved and ready to be bundled into a batch.</p>

            {isLoading ? (
                <div className="text-center text-[var(--color-text-muted)] p-12">Loading...</div>
            ) : readyProgrammes.length === 0 ? (
                <div className="text-center text-[var(--color-text-muted)] p-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
                    No ready results found. Go enter some results!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {readyProgrammes.map(prog => (
                        <div key={prog._id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-[var(--color-text-heading)] mb-1">{prog.name}</h3>
                                <div className="text-sm text-[var(--color-text-muted)] mb-4">
                                    {prog.code} • {prog.category}
                                </div>
                                <div className="inline-flex items-center px-3 py-1 bg-green-500/10 text-green-600 font-semibold text-sm rounded-full mb-6">
                                    {prog.resultCount} scores saved
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border)]">
                                <button 
                                    onClick={() => navigate(`/result-entry/enter?programmeId=${prog._id}`)}
                                    className="text-sm font-semibold text-[var(--color-primary)] flex items-center hover:underline"
                                >
                                    <PenTool size={14} className="mr-1" /> Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(prog._id)}
                                    className="text-sm font-semibold text-red-500 flex items-center hover:underline"
                                >
                                    <Trash2 size={14} className="mr-1" /> Clear
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
