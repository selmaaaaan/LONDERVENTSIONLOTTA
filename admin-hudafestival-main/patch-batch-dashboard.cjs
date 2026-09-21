const fs = require('fs');
let code = fs.readFileSync('src/pages/result-entry/BatchDashboard.jsx', 'utf8');

if (!code.includes('useResultUI')) {
    code = code.replace(
        "import api from '../../services/api';",
        "import api from '../../services/api';\nimport { useResultUI } from '../../context/ResultEntryUIContext';"
    );
    
    code = code.replace(
        "const filter = searchParams.get('filter') || 'all';",
        "const filter = searchParams.get('filter') || 'all';\n    const { showModal, showToast } = useResultUI();"
    );

    code = code.replace(/alert\('Failed to load batches'\);/g, "showToast('Failed to load batches', 'error');");
    code = code.replace(/alert\("Failed to create batch"\);/g, "showToast('Failed to create batch', 'error');");
    code = code.replace(/alert\('Failed to rename batch'\);/g, "showToast('Failed to rename batch', 'error');");

    // Replace handleDelete logic
    const oldDelete = `    const handleDelete = async (e, batch) => {
        e.stopPropagation(); // prevent navigation
        if (!window.confirm(\`Delete batch '\${batch.name}'? This will not delete the saved results — they'll return to Ready Results.\`)) return;

        try {
            await api.delete(\`/result-entry/batches/\${batch._id}\`);
            fetchBatches();
        } catch (error) {
            console.error(error);
        }
    };`;
    
    const newDelete = `    const handleDelete = (e, batch) => {
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
    
    // There is a weird dash encoding in window.confirm in PS earlier: `?"`
    // We will just use regex to replace the function.
    code = code.replace(/const handleDelete = async \(e, batch\) => \{[\s\S]*?fetchBatches\(\);\s*\} catch \(error\) \{\s*console\.error\(error\);\s*\}\s*\};/, newDelete);

    fs.writeFileSync('src/pages/result-entry/BatchDashboard.jsx', code);
    console.log("Patched BatchDashboard.jsx");
}
