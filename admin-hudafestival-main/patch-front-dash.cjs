const fs = require('fs');

let code = fs.readFileSync('src/pages/result-entry/BatchDashboard.jsx', 'utf8');

const oldHandleDelete = `    const handleDelete = (e, batch) => {
        e.stopPropagation(); // prevent navigation
        showModal({
            title: 'Delete Batch',
            message: \`Delete batch '\${batch.name}'? This will not delete the saved results ?" they'll return to Ready Results.\`,
            confirmText: 'Delete Batch',
            isDestructive: true,
            onConfirm: async () => {`;

const newHandleDelete = `    const handleDelete = (e, batch) => {
        e.stopPropagation(); // prevent navigation
        const msg = batch.status === 'submitted' 
            ? "Delete this batch? It is currently awaiting admin approval — deleting it will remove it from Admin's queue and its results will return to Ready Results."
            : \`Delete batch '\${batch.name}'? This will not delete the saved results — they'll return to Ready Results.\`;
            
        showModal({
            title: 'Delete Batch',
            message: msg,
            confirmText: 'Delete Batch',
            isDestructive: true,
            onConfirm: async () => {`;

code = code.replace(oldHandleDelete, newHandleDelete);

// The actual delete icon rendering was under:
// {batch.status === 'draft' && (
// Let's replace the logic that shows edit/delete to also show delete if submitted.
// But we already added Recall under `batch.status === 'submitted'`.
// Wait, in my previous patch I did:
/*
                            {batch.status === 'submitted' && (
                                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => handleRecall(e, batch)}
                                        className="p-1.5 text-orange-500 bg-orange-500/10 hover:bg-orange-500/20 rounded flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
                                    >
                                        <Undo size={14} />
                                        Recall
                                    </button>
                                </div>
                            )}
*/
// I can just add the Delete icon next to the Recall button!
const submittedButtonsOld = `                                        <Undo size={14} />
                                        Recall
                                    </button>
                                </div>`;
const submittedButtonsNew = `                                        <Undo size={14} />
                                        Recall
                                    </button>
                                    <button 
                                        onClick={(e) => handleDelete(e, batch)}
                                        className="p-1.5 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>`;

code = code.replace(submittedButtonsOld, submittedButtonsNew);

fs.writeFileSync('src/pages/result-entry/BatchDashboard.jsx', code);
console.log("Patched BatchDashboard delete logic");
