const fs = require('fs');

let code = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');

// The current batch delete logic:
/*
// @desc    Delete a draft batch (unlinks results, does not delete them)
// @route   DELETE /api/result-entry/batches/:id
router.delete('/batches/:id', async (req, res) => {
    try {
        const batch = await Batch.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        if (batch.status === 'published') return res.status(400).json({ message: 'Published batches cannot be deleted this way' });
        
        // Unlink results and reset them to draft (so they return to Ready state even if they were pending)
        await Result.updateMany({ batchId: batch._id }, { $set: { batchId: null, status: 'draft' } });
        
        // Delete batch
        await batch.deleteOne();
        res.json({ message: 'Batch deleted and results returned to Ready state' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting batch' });
    }
});
*/

const oldRouteRegex = /\/\/ @desc\s*Delete a draft batch[\s\S]*?res\.status\(500\)\.json\(\{ message: 'Server error deleting batch' \};\n\s*\}\n\}\);/;

const newRoute = `
// @desc    Delete a batch (draft, submitted, or published)
// @route   DELETE /api/result-entry/batches/:id
router.delete('/batches/:id', async (req, res) => {
    try {
        const batch = await Batch.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        
        if (batch.status === 'published') {
            const results = await Result.find({ batchId: batch._id });
            
            for (const result of results) {
                if (result.status === 'approved' && result.totalPoints > 0) {
                    await Candidate.updateOne({ _id: result.candidate }, { $inc: { totalPoints: -result.totalPoints } });
                    const c = await Candidate.findById(result.candidate);
                    if (c && c.team) {
                        await Team.updateOne({ _id: c.team }, { $inc: { totalPoints: -result.totalPoints } });
                    }
                }
                await result.deleteOne();
            }
            
            await batch.deleteOne();
            return res.json({ message: 'Live batch and all approved results deleted successfully' });
        } else {
            // Draft or Submitted
            // Unlink results and reset them to draft
            await Result.updateMany({ batchId: batch._id }, { $set: { batchId: null, status: 'draft' } });
            
            // Delete batch
            await batch.deleteOne();
            return res.json({ message: 'Batch deleted and results returned to Ready state' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting batch' });
    }
});
`;

code = code.replace(oldRouteRegex, newRoute.trim());

// Also make sure Team is imported
if (!code.includes("const Team = require('../models/Team');")) {
    code = code.replace("const Candidate = require('../models/Candidate');", "const Candidate = require('../models/Candidate');\nconst Team = require('../models/Team');");
}

fs.writeFileSync('routes/resultEntryRoutes.js', code);
console.log("Patched backend batch delete route");
