const fs = require('fs');
let code = fs.readFileSync('src/pages/result-entry/EnterResultPage.jsx', 'utf8');

// We need to add useResultUI to imports
if (!code.includes('useResultUI')) {
    code = code.replace(
        "import api from '../../services/api';",
        "import api from '../../services/api';\nimport { useResultUI } from '../../context/ResultEntryUIContext';"
    );
    
    code = code.replace(
        "const navigate = useNavigate();",
        "const navigate = useNavigate();\n    const { showModal, showToast } = useResultUI();"
    );

    // Add handleClear function
    const clearFn = `    const handleClear = () => {
        // Check if any loaded result is approved
        const hasApproved = Object.values(resultsMap).some(r => r.status === 'approved');
        
        showModal({
            title: hasApproved ? 'Delete Published Result?' : 'Clear Results?',
            message: hasApproved
                ? \`This result is already public — deleting '\${selectedProg.name}' will immediately update the live leaderboard and public site.\`
                : \`Delete '\${selectedProg.name}'? This will permanently delete the drafted scores for this programme.\`,
            confirmText: 'Delete Result',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(\`/result-entry/standalone-results/\${selectedProg._id}\`);
                    showToast('Result deleted completely', 'success');
                    // Reset page
                    setSelectedProg(null);
                    navigate('/result-entry/enter', { replace: true });
                } catch (err) {
                    showToast('Failed to delete result', 'error');
                }
            }
        });
    };`;

    code = code.replace("const handleSave = async () => {", clearFn + "\n\n    const handleSave = async () => {");

    // Add button next to Save Results
    const btns = `<button 
                                onClick={handleClear}
                                className="px-4 py-2 bg-red-500/10 text-red-500 border border-transparent rounded-lg text-sm font-semibold hover:bg-red-500/20 transition-colors"
                            >
                                Clear Results
                            </button>
                            <button`;
    code = code.replace('<button', btns); // wait, replace all '<button'? No.

    const exactBtnHTML = `<div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setSelectedProg(null);
                                    // Remove URL param if they change programme
                                    navigate('/result-entry/enter', { replace: true });
                                }}
                                className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-semibold hover:bg-[var(--color-background)] transition-colors"
                            >
                                Change Programme
                            </button>
                            <button 
                                onClick={handleClear}
                                className="px-4 py-2 bg-red-500/10 text-red-500 border border-transparent rounded-lg text-sm font-semibold hover:bg-red-500/20 transition-colors"
                            >
                                Clear Results
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}`;

    const oldBtnHTML = `<div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setSelectedProg(null);
                                    // Remove URL param if they change programme
                                    navigate('/result-entry/enter', { replace: true });
                                }}
                                className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-semibold hover:bg-[var(--color-background)] transition-colors"
                            >
                                Change Programme
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}`;
    
    code = code.replace(oldBtnHTML, exactBtnHTML);

    fs.writeFileSync('src/pages/result-entry/EnterResultPage.jsx', code);
    console.log("Patched EnterResultPage.jsx");
}
