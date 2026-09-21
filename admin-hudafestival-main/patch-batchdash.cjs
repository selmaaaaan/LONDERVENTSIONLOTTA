const fs = require('fs');
let code = fs.readFileSync('src/pages/result-entry/BatchDashboard.jsx', 'utf8');

// Add Undo/Recall icon import
code = code.replace(
    "import { Plus, Clock, FileText, Trash2, Edit2, Layers } from 'lucide-react';",
    "import { Plus, Clock, FileText, Trash2, Edit2, Layers, Undo } from 'lucide-react';"
);

// Add handleRecall
const handleRecallStr = `
    const handleRecall = async (e, batch) => {
        e.stopPropagation();
        showModal(
            "Recall Batch",
            \`Recall '\${batch.name}' from Admin? It will be pulled back to Draft status here and removed from Admin's Pending Results list until you resubmit it.\`,
            "Recall",
            "cancel",
            async () => {
                try {
                    await api.put(\`/result-entry/batches/\${batch._id}/recall\`);
                    showToast(\`Batch '\${batch.name}' recalled successfully.\`);
                    fetchBatches();
                } catch (err) {
                    showToast(err.response?.data?.message || 'Error recalling batch.', 'error');
                }
            }
        );
    };

    const handleDelete = async (e, batch) => {
`;

code = code.replace(
    "    const handleDelete = async (e, batch) => {",
    handleRecallStr
);

// Add the Recall button to UI
const buttonsStr = `
                            {/* Action Buttons */}
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
                            {batch.status === 'draft' && (
`;

code = code.replace(
    "{/* Action Buttons */}\n                            {batch.status === 'draft' && (",
    buttonsStr
);

fs.writeFileSync('src/pages/result-entry/BatchDashboard.jsx', code);
console.log("Patched BatchDashboard.jsx");
