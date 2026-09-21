const fs = require('fs');
let code = fs.readFileSync('src/pages/result-entry/BatchWorkspace.jsx', 'utf8');

// Add Undo icon import
code = code.replace(
    "import { Plus, Printer, Send, Search, Filter, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';",
    "import { Plus, Printer, Send, Search, Filter, Trash2, AlertTriangle, ArrowLeft, Undo } from 'lucide-react';"
);

// Add handleRecall logic
const handleRecallStr = `
        const handleRecall = () => {
        showModal({
            title: 'Recall Batch',
            message: "Recall this batch from Admin? It will be pulled back to Draft status here and removed from Admin's Pending Results list until you resubmit it.",
            confirmText: 'Recall',
            onConfirm: async () => {
                try {
                    await api.put(\`/result-entry/batches/\${id}/recall\`);
                    showToast('Batch recalled successfully!', 'success');
                    fetchBatch();
                } catch (err) {
                    showToast(err.response?.data?.message || 'Error recalling batch', 'error');
                }
            }
        });
    };

        const handleSubmitToAdmin = () => {
`;
code = code.replace(
    "        const handleSubmitToAdmin = () => {",
    handleRecallStr
);

// Add Recall button to UI
const recallButtonStr = `
                        {batch.status === 'submitted' && (
                            <button 
                                onClick={handleRecall}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold flex items-center hover:bg-orange-600 transition-colors shadow-sm"
                            >
                                <Undo size={16} className="mr-2" />
                                Recall from Admin
                            </button>
                        )}
`;
code = code.replace(
    "{batch.status === 'draft' && batch.programmes?.length > 0 && (",
    recallButtonStr + "\n                        {batch.status === 'draft' && batch.programmes?.length > 0 && ("
);

fs.writeFileSync('src/pages/result-entry/BatchWorkspace.jsx', code);
console.log("Patched BatchWorkspace.jsx");
