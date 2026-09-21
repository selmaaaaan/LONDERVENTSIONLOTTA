const fs = require('fs');
let fb = fs.readFileSync('src/pages/result-entry/BatchWorkspace.jsx', 'utf8');

// Add states
fb = fb.replace("const [submitting, setSubmitting] = useState(false);", "const [submitting, setSubmitting] = useState(false);\n    const [isEditingPublished, setIsEditingPublished] = useState(false);");

// Update isLocked
fb = fb.replace("const isLocked = batch.status !== 'draft';", "const isLocked = batch.status !== 'draft' && !isEditingPublished;");

// Update Header Buttons
const oldHeaderBtns = `<div className="flex gap-3">
                    <Button variant="outline" onClick={handleSaveDraft} disabled={isLocked || saving}>
                        <Save size={18} className="mr-2" /> {saving ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button variant="primary" onClick={handleSubmitBatch} disabled={isLocked || submitting}>
                        <Send size={18} className="mr-2" /> {submitting ? 'Submitting...' : 'Submit to Admin'}
                    </Button>
                </div>`;

const newHeaderBtns = `<div className="flex gap-3">
                    {batch.status === 'published' && !isEditingPublished && (
                        <Button variant="danger" onClick={() => setIsEditingPublished(true)}>
                            <AlertTriangle size={18} className="mr-2" /> Unlock for Editing
                        </Button>
                    )}
                    {isEditingPublished && (
                        <Button variant="danger" onClick={handleSaveLiveChanges} disabled={saving}>
                            <Save size={18} className="mr-2" /> {saving ? 'Applying...' : 'Save Live Changes'}
                        </Button>
                    )}
                    {!isEditingPublished && (
                        <>
                            <Button variant="outline" onClick={handleSaveDraft} disabled={isLocked || saving || batch.status === 'published'}>
                                <Save size={18} className="mr-2" /> {saving ? 'Saving...' : 'Save Draft'}
                            </Button>
                            <Button variant="primary" onClick={handleSubmitBatch} disabled={isLocked || submitting || batch.status === 'published'}>
                                <Send size={18} className="mr-2" /> {submitting ? 'Submitting...' : 'Submit to Admin'}
                            </Button>
                        </>
                    )}
                </div>`;
fb = fb.replace(oldHeaderBtns, newHeaderBtns);

// Add handleSaveLiveChanges function right after handleSaveDraft
const handleSaveLiveChanges = `
    const handleSaveLiveChanges = async () => {
        if (!window.confirm("This result is already public. Changing it will immediately update the live leaderboard and public site. Are you sure you want to proceed?")) return;
        
        if (!selectedProgId) return;
        setSaving(true);
        try {
            const currentRegs = registrations.filter(r => r.programme === selectedProgId);
            const payload = [];
            currentRegs.forEach(reg => {
                reg.candidates.forEach(candidate => {
                    const cId = candidate._id;
                    payload.push({
                        candidateId: cId,
                        rank: resultsMap[cId]?.rank || null,
                        grade: resultsMap[cId]?.grade || null,
                        remarks: resultsMap[cId]?.remarks || ''
                    });
                });
            });

            await api.put(\`/result-entry/batches/\${id}/published-results\`, {
                programmeId: selectedProgId,
                results: payload
            });
            alert('Live changes applied and Leaderboards updated.');
            setIsEditingPublished(false);
            loadBatch();
        } catch (error) {
            alert('Failed to save live changes');
        } finally {
            setSaving(false);
        }
    };
`;
fb = fb.replace("const handleSubmitBatch =", handleSaveLiveChanges + "\n    const handleSubmitBatch =");

fs.writeFileSync('src/pages/result-entry/BatchWorkspace.jsx', fb);
