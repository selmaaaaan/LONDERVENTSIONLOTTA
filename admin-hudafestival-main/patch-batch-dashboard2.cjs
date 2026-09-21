const fs = require('fs');
let code = fs.readFileSync('src/pages/result-entry/BatchDashboard.jsx', 'utf8');

const oldDeleteRegex = /const handleDelete = async \(e, batch\) => \{[\s\S]*?alert\('Failed to delete batch'\);\s*\}\s*\};/;
const newDelete = `const handleDelete = (e, batch) => {
        e.stopPropagation(); // prevent navigation
        showModal({
            title: 'Delete Batch',
            message: \`Delete batch '\${batch.name}'? This will not delete the saved results — they'll return to Ready Results.\`,
            confirmText: 'Delete Batch',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(\`/result-entry/batches/\${batch._id}\`);
                    showToast('Batch deleted', 'success');
                    fetchBatches();
                } catch (error) {
                    showToast('Failed to delete batch', 'error');
                }
            }
        });
    };`;

code = code.replace(oldDeleteRegex, newDelete);
code = code.replace(/alert\('Failed to update batch'\);/g, "showToast('Failed to update batch', 'error');");

fs.writeFileSync('src/pages/result-entry/BatchDashboard.jsx', code);
console.log("Patched BatchDashboard.jsx properly.");
