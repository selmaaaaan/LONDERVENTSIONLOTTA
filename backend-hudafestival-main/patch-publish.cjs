const fs = require('fs');

let code = fs.readFileSync('controllers/resultController.js', 'utf8');

const oldPublishBatchRegex = /const publishBatch = async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ message: 'Failed to publishBatch'[\s\S]*?\}\s*\n\s*\};/;

const newPublishBatch = `const publishBatch = async (req, res) => {
    try {
        let { programmeIds, batchId } = req.body;
        
        // If batchId is provided, we fetch all pending programmes in that batch
        if (batchId && (!programmeIds || programmeIds.length === 0)) {
            const Result = require('../models/Result');
            const pendingResults = await Result.find({ batchId, status: 'pending' });
            // Get unique programme IDs
            programmeIds = [...new Set(pendingResults.map(r => r.programme.toString()))];
        }

        if (!Array.isArray(programmeIds) || programmeIds.length === 0) {
            return res.status(400).json({ message: 'programmeIds array or valid batchId is required' });
        }
        
        const results = [];
        for (const pid of programmeIds) {
            results.push(await approveForProgramme(pid, req.user));
        }
        
        // Update batch status to published if a batchId was given
        if (batchId) {
            const Batch = require('../models/Batch');
            await Batch.updateOne({ _id: batchId }, { $set: { status: 'published' } });
        }
        
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'RESULT_BULK_PUBLISHED', entityType: 'Result', details: { programmeIds, batchId, results }, req });
        res.status(200).json({ message: \`Published \${programmeIds.length} programmes\`, results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to publishBatch', error: error.message || 'Unknown error' });
    }
};`;

code = code.replace(oldPublishBatchRegex, newPublishBatch);

fs.writeFileSync('controllers/resultController.js', code);
console.log("Patched publishBatch");
