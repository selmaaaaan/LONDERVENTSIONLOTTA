const fs = require('fs');
let code = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');

// Fix logAction import
code = code.replace(
    "const { logAction } = require('../middlewares/logMiddleware');",
    "const { logAction } = require('../utils/logAction');"
);

// We need to make sure logAction is imported at the top of the file if not already.
if (!code.includes("const { logAction } = require('../utils/logAction');")) {
    code = code.replace(
        "const mongoose = require('mongoose');",
        "const mongoose = require('mongoose');\nconst { logAction } = require('../utils/logAction');"
    );
}

// Replace the delete standalone results route
const oldDeleteRoute = `router.delete('/standalone-results/:programmeId', async (req, res) => {
    try {
        await Result.deleteMany({ 
            programme: req.params.programmeId, 
            status: 'draft', 
            batchId: null 
        });
        res.json({ message: 'Results cleared.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});`;

const newDeleteRoute = `router.delete('/standalone-results/:programmeId', async (req, res) => {
    try {
        const programmeId = req.params.programmeId;
        const results = await Result.find({ programme: programmeId });
        
        if (!results.length) {
            return res.json({ message: 'No results to clear.' });
        }

        let hasApproved = false;

        // Cascade delete loop
        for (const result of results) {
            if (result.status === 'approved' && result.totalPoints > 0) {
                hasApproved = true;
                await Candidate.updateOne({ _id: result.candidate }, { $inc: { totalPoints: -result.totalPoints } });
                const candidate = await Candidate.findById(result.candidate);
                if (candidate && candidate.team) {
                    await Team.updateOne({ _id: candidate.team }, { $inc: { totalPoints: -result.totalPoints } });
                }
            }
            await result.deleteOne();
        }

        // Unlink from any batch
        await Batch.updateMany(
            { programmes: programmeId },
            { $pull: { programmes: programmeId } }
        );

        // Reset Programme status if it was published
        if (hasApproved) {
            await Programme.updateOne({ _id: programmeId }, { $set: { isResultPublished: false } });
        }

        // Log action
        await logAction({
            actor: req.user._id,
            actorRole: req.user.role,
            action: 'RESULT_DELETED_FROM_PORTAL',
            entityType: 'Programme',
            entityId: programmeId,
            req
        });

        res.json({ message: 'Results cleared successfully.' });
    } catch (error) {
        console.error('Error clearing results:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});`;

code = code.replace(oldDeleteRoute, newDeleteRoute);

fs.writeFileSync('routes/resultEntryRoutes.js', code);
console.log("Patched resultEntryRoutes.js successfully");
