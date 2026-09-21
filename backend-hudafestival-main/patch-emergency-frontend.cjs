const fs = require('fs');

let rp = fs.readFileSync('../admin-hudafestival-main/src/pages/ResultsPage.jsx', 'utf8');

// Add state
rp = rp.replace("const [activeTab, setActiveTab] = useState('Results Entry');", "const [activeTab, setActiveTab] = useState('Results Entry');\n    const [emergencyOverride, setEmergencyOverride] = useState(false);");

// Reset override on load
rp = rp.replace("setHasUnsavedChanges(false);", "setHasUnsavedChanges(false);\n        setEmergencyOverride(false);");

// Add to handleSaveDraft payload
rp = rp.replace(/const payload = \{\n\s+batchId: batchId,\n\s+results: Object\.keys\(resultsMap\)\.map\(regId => \(\{/, `const payload = {\n            batchId: batchId,\n            isEmergencyOverride: emergencyOverride,\n            results: Object.keys(resultsMap).map(regId => ({`);

// Add UI banner
const uiBanner = `{activeTab === 'Results Entry' && (
                                        <div className="mx-6 mb-4 mt-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-4">
                                            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
                                            <div className="flex-1">
                                                <h3 className="text-red-500 font-bold text-sm mb-1">EMERGENCY OVERRIDE</h3>
                                                <p className="text-red-500/80 text-xs mb-3">Result entry is locked to the Result Portal. Only use this if the portal is completely unavailable.</p>
                                                <label className="flex items-center gap-2 text-xs font-semibold text-red-500 cursor-pointer">
                                                    <input type="checkbox" checked={emergencyOverride} onChange={(e) => setEmergencyOverride(e.target.checked)} className="accent-red-500" />
                                                    Enable Emergency Score Editing
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'Results Entry' && (
                                        <table`;
rp = rp.replace(/\{activeTab === 'Results Entry' && \(\s*<table/, uiBanner);

// Disable inputs if !emergencyOverride
rp = rp.replace(/disabled=\{isPublished\}/g, "disabled={isPublished || !emergencyOverride}");

fs.writeFileSync('../admin-hudafestival-main/src/pages/ResultsPage.jsx', rp);
