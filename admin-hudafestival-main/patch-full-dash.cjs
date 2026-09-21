const fs = require('fs');

let code = fs.readFileSync('src/pages/result-entry/BatchDashboard.jsx', 'utf8');

// Replace the handleDelete completely
const oldHandleDeleteRegex = /const handleDelete = \(e, batch\) => \{[\s\S]*?\}\s*\}\);\s*\};/;
const newHandleDelete = `
    const handleDelete = (e, batch) => {
        e.stopPropagation();
        
        if (batch.status === 'published') {
            const batchNamePrompt = window.prompt(\`This result is LIVE on the public site. Deleting it will immediately remove it from the public leaderboard and results page. This cannot be undone.\\n\\nType the exact batch name to confirm:\\n\${batch.name}\`);
            if (batchNamePrompt !== batch.name) {
                showToast('Batch name did not match, delete cancelled.', 'error');
                return;
            }
            
            showModal({
                title: 'Confirm Live Data Deletion',
                message: \`You are about to irreversibly delete '\${batch.name}' and reverse its points from live candidate scores. Proceed?\`,
                confirmText: 'Delete Live Batch',
                isDestructive: true,
                onConfirm: async () => {
                    try {
                        await api.delete(\`/result-entry/batches/\${batch._id}\`);
                        showToast('Live batch deleted successfully', 'success');
                        fetchBatches();
                    } catch (error) {
                        showToast(error.response?.data?.message || 'Failed to delete live batch', 'error');
                    }
                }
            });
            return;
        }

        const msg = batch.status === 'submitted' 
            ? "This batch is awaiting admin approval. Deleting it will pull it back and its results return to Ready Results."
            : \`Delete batch '\${batch.name}'? This will not delete the saved results — they'll return to Ready Results.\`;
            
        showModal({
            title: 'Delete Batch',
            message: msg,
            confirmText: 'Delete Batch',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(\`/result-entry/batches/\${batch._id}\`);
                    showToast('Batch deleted', 'success');
                    fetchBatches();
                } catch (error) {
                    showToast(error.response?.data?.message || 'Failed to delete batch', 'error');
                }
            }
        });
    };
`;

code = code.replace(oldHandleDeleteRegex, newHandleDelete);

// Rewrite the action buttons completely
const oldButtonsRegex = /\{\/\* Action Buttons \*\/\}([\s\S]*?)<\/div>\s*\)\}/;
const newButtons = `{/* Action Buttons */}
                            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {batch.status === 'draft' && (
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
                                )}
                                {batch.status === 'submitted' && typeof handleRecall === 'function' && (
                                    <button 
                                        onClick={(e) => handleRecall(e, batch)}
                                        className="p-1.5 text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 rounded flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                                    >
                                        <Undo size={14} />
                                        Recall
                                    </button>
                                )}
                                <button 
                                    onClick={(e) => handleDelete(e, batch)}
                                    className="p-1.5 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>`;

code = code.replace(oldButtonsRegex, newButtons);

// Make sure handleRecall is actually defined, if it was missing
if (!code.includes('const handleRecall =')) {
    const handleRecallStr = `
    const handleRecall = async (e, batch) => {
        e.stopPropagation();
        showModal({
            title: "Recall Batch",
            message: \`Recall '\${batch.name}' from Admin? It will be pulled back to Draft status here and removed from Admin's Pending Results list until you resubmit it.\`,
            confirmText: "Recall",
            onConfirm: async () => {
                try {
                    await api.put(\`/result-entry/batches/\${batch._id}/recall\`);
                    showToast(\`Batch '\${batch.name}' recalled successfully.\`);
                    fetchBatches();
                } catch (err) {
                    showToast(err.response?.data?.message || 'Error recalling batch.', 'error');
                }
            }
        });
    };
    `;
    code = code.replace('const handleDelete =', handleRecallStr + '\n' + 'const handleDelete =');
}

fs.writeFileSync('src/pages/result-entry/BatchDashboard.jsx', code);
console.log("Patched BatchDashboard fully");
