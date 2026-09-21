const fs = require('fs');
let code = fs.readFileSync('src/pages/result-entry/BatchWorkspace.jsx', 'utf8');

// Add clearProgramme function
const clearProgStr = `
    const clearProgramme = (progId, progName) => {
        const isPublished = batch.status === 'published';
        
        showModal({
            title: isPublished ? 'Delete Published Result?' : 'Delete Result?',
            message: isPublished 
                ? \`This result is already public — deleting '\${progName}' will immediately update the live leaderboard and public site.\`
                : \`Delete '\${progName}'? This will permanently delete the drafted scores for this programme.\`,
            confirmText: 'Delete Result',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(\`/result-entry/standalone-results/\${progId}\`);
                    showToast('Result deleted completely', 'success');
                    fetchBatchData();
                } catch (err) {
                    showToast('Failed to delete result', 'error');
                }
            }
        });
    };
`;

code = code.replace(
    "const detachProgramme = (progId) => {",
    clearProgStr + "\n    const detachProgramme = (progId) => {"
);

// We need to change the UI loop:
// From:
/*
{!isLocked && (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditingProgramme(p)} className="text-[var(--color-primary)] p-2 hover:bg-[var(--color-primary)]/10 rounded-lg">
            <PenTool size={16} />
        </button>
        <button onClick={() => detachProgramme(p._id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
            <Trash2 size={16} />
        </button>
    </div>
)}
*/

const oldLoop = `{!isLocked && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditingProgramme(p)} className="text-[var(--color-primary)] p-2 hover:bg-[var(--color-primary)]/10 rounded-lg">
                                                        <PenTool size={16} />
                                                    </button>
                                                    <button onClick={() => detachProgramme(p._id)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}`;

const newLoop = `<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!isLocked && (
                                                    <button onClick={() => setEditingProgramme(p)} className="text-[var(--color-primary)] p-2 hover:bg-[var(--color-primary)]/10 rounded-lg" title="Edit Results">
                                                        <PenTool size={16} />
                                                    </button>
                                                )}
                                                {!isLocked && (
                                                    <button onClick={() => detachProgramme(p._id)} className="text-orange-500 p-2 hover:bg-orange-500/10 rounded-lg" title="Remove from Batch (Return to Ready)">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                                    </button>
                                                )}
                                                <button onClick={() => clearProgramme(p._id, p.name)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg" title="Delete Result Entirely">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>`;

code = code.replace(oldLoop, newLoop);

fs.writeFileSync('src/pages/result-entry/BatchWorkspace.jsx', code);
console.log("Patched BatchWorkspace.jsx for clear feature.");
