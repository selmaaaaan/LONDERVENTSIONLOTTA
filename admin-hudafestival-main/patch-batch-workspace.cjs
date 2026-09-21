const fs = require('fs');
let code = fs.readFileSync('src/pages/result-entry/BatchWorkspace.jsx', 'utf8');

if (!code.includes('useResultUI')) {
    code = code.replace(
        "import api from '../../services/api';",
        "import api from '../../services/api';\nimport { useResultUI } from '../../context/ResultEntryUIContext';"
    );
    
    code = code.replace(
        "const navigate = useNavigate();",
        "const navigate = useNavigate();\n    const { showModal, showToast } = useResultUI();"
    );

    code = code.replace(/alert\("Failed to load batch data"\);/g, "showToast('Failed to load batch data', 'error');");
    code = code.replace(/alert\("Failed to fetch ready results"\);/g, "showToast('Failed to fetch ready results', 'error');");
    code = code.replace(/alert\("Failed to attach programmes"\);/g, "showToast('Failed to attach programmes', 'error');");
    code = code.replace(/alert\("Failed to detach programme"\);/g, "showToast('Failed to detach programme', 'error');");
    code = code.replace(/alert\('Batch submitted to Admin successfully!'\);/g, "showToast('Batch submitted to Admin successfully!', 'success');");
    code = code.replace(/alert\('Failed to submit batch'\);/g, "showToast('Failed to submit batch', 'error');");

    const oldDetach = `    const detachProgramme = async (progId) => {
        if (!window.confirm("Remove this programme from the batch? It will go back to Ready Results.")) return;
        try {
            await api.put(\`/result-entry/batches/\${id}/detach\`, {
                programmeId: progId
            });
            fetchBatchData();
        } catch (err) {
            showToast('Failed to detach programme', 'error');
        }
    };`;
    
    const newDetach = `    const detachProgramme = (progId) => {
        showModal({
            title: 'Remove Programme',
            message: 'Remove this programme from the batch? It will go back to Ready Results.',
            confirmText: 'Remove',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.put(\`/result-entry/batches/\${id}/detach\`, {
                        programmeId: progId
                    });
                    fetchBatchData();
                    showToast('Programme removed', 'success');
                } catch (err) {
                    showToast('Failed to detach programme', 'error');
                }
            }
        });
    };`;

    code = code.replace(/const detachProgramme = async \(progId\) => \{[\s\S]*?showToast\('Failed to detach programme', 'error'\);\s*\}\s*\};/, newDetach);

    const oldSubmit = `    const handleSubmitToAdmin = async () => {
        if (!window.confirm('Are you sure you want to submit this batch to Admin? It will be locked for editing.')) return;
        try {
            await api.post(\`/result-entry/batches/\${id}/submit\`);
            showToast('Batch submitted to Admin successfully!', 'success');
            navigate('/result-entry/batches');
        } catch (err) {
            showToast('Failed to submit batch', 'error');
        }
    };`;

    const newSubmit = `    const handleSubmitToAdmin = () => {
        showModal({
            title: 'Submit Batch',
            message: 'Are you sure you want to submit this batch to Admin? It will be locked for editing.',
            confirmText: 'Submit to Admin',
            onConfirm: async () => {
                try {
                    await api.post(\`/result-entry/batches/\${id}/submit\`);
                    showToast('Batch submitted to Admin successfully!', 'success');
                    navigate('/result-entry/batches');
                } catch (err) {
                    showToast('Failed to submit batch', 'error');
                }
            }
        });
    };`;

    code = code.replace(/const handleSubmitToAdmin = async \(\) => \{[\s\S]*?showToast\('Failed to submit batch', 'error'\);\s*\}\s*\};/, newSubmit);

    fs.writeFileSync('src/pages/result-entry/BatchWorkspace.jsx', code);
    console.log("Patched BatchWorkspace.jsx properly.");
}
