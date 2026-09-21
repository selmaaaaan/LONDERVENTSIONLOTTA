const fs = require('fs');

let code = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');

const helpers = `
async function adjustCandidatePoints(candidateId, pointDelta) {
    if (!pointDelta || pointDelta === 0) return;
    const Candidate = require('../models/Candidate');
    const Team = require('../models/Team');
    
    const candidate = await Candidate.findById(candidateId);
    if (candidate) {
        candidate.totalPoints = Math.max(0, (candidate.totalPoints || 0) + pointDelta);
        await candidate.save();
        
        if (candidate.team) {
            const team = await Team.findById(candidate.team);
            if (team) {
                team.totalPoints = Math.max(0, (team.totalPoints || 0) + pointDelta);
                await team.save();
            }
        }
    }
}
`;

// 1. Insert helpers
code = code.replace(/const mongoose = require\('mongoose'\);/, `const mongoose = require('mongoose');\n${helpers}`);

// 2. Patch PUT /batches/:id/published-results
const oldPutPublished = /router\.put\('\/batches\/:id\/published-results'[\s\S]*?res\.status\(500\)\.json\(\{ message: 'Server error' \}\);\s*\}\s*\}\);/;
const newPutPublished = `router.put('/batches/:id/published-results', async (req, res) => {
    const { results, programmeId } = req.body;
    try {
        let batchIdQuery = null;
        if (req.params.id !== 'legacy') {
            const batch = await Batch.findOne({ _id: req.params.id, createdBy: req.user._id });
            if (!batch) return res.status(404).json({ message: 'Batch not found' });
            if (batch.status !== 'published') {
                return res.status(400).json({ message: 'This endpoint is only for already-published batches.' });
            }
            batchIdQuery = batch._id;
        }

        const programme = await Programme.findById(programmeId);
        const { logAction } = require('../utils/logAction');

        for (const rData of results) {
            const query = { 
                programme: programmeId, 
                candidate: rData.candidateId, 
                status: 'approved' 
            };
            if (batchIdQuery) query.batchId = batchIdQuery;
            
            const existingResult = await Result.findOne(query);
            if (!existingResult) continue;

            const oldPoints = existingResult.totalPoints || 0;
            await adjustCandidatePoints(existingResult.candidate, -oldPoints);

            const tempResult = { rank: rData.rank, grade: rData.grade };
            const calculated = calculatePointsForResult(tempResult, programme, POSITION_POINTS, GRADE_POINTS);

            existingResult.rank = rData.rank || null;
            existingResult.grade = rData.grade || null;
            existingResult.remarks = rData.remarks || null;
            existingResult.pointsFromRank = calculated.pointsFromRank;
            existingResult.pointsFromGrade = calculated.pointsFromGrade;
            existingResult.totalPoints = calculated.totalPoints;
            existingResult.submittedBy = req.user._id;
            await existingResult.save();

            await adjustCandidatePoints(existingResult.candidate, calculated.totalPoints);

            await logAction({
                actor: req.user._id, actorRole: req.user.role,
                action: 'RESULT_EDITED_POST_PUBLISH',
                entityType: 'Result', entityId: existingResult._id,
                details: { programme: programme.name, candidateId: rData.candidateId, oldPoints, newPoints: calculated.totalPoints },
                req
            });
        }
        res.json({ message: 'Live changes applied.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});`;

code = code.replace(oldPutPublished, newPutPublished);

// 3. Add DELETE /published-results/:id
const deletePublished = `
// @desc    Delete a single published result
router.delete('/published-results/:id', async (req, res) => {
    try {
        const existingResult = await Result.findById(req.params.id).populate('programme candidate');
        if (!existingResult) return res.status(404).json({ message: 'Result not found' });
        if (existingResult.status !== 'approved') return res.status(400).json({ message: 'Result is not published' });

        const oldPoints = existingResult.totalPoints || 0;
        await adjustCandidatePoints(existingResult.candidate._id, -oldPoints);
        
        const { logAction } = require('../utils/logAction');
        await logAction({
            actor: req.user._id, actorRole: req.user.role,
            action: 'RESULT_DELETED_POST_PUBLISH',
            entityType: 'Result', entityId: existingResult._id,
            details: { programme: existingResult.programme.name, candidateId: existingResult.candidate._id, pointsReversed: oldPoints },
            req
        });

        await existingResult.deleteOne();
        res.json({ message: 'Live result deleted and points reversed.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
`;

// Append deletePublished before module.exports
code = code.replace(/module\.exports = router;/, `${deletePublished}\nmodule.exports = router;`);

// 4. Update DELETE /batches/:id
const oldDeleteBatch = /router\.delete\('\/batches\/:id'[\s\S]*?res\.status\(500\)\.json\(\{ message: 'Server error deleting batch' \}\);\s*\}\s*\}\);/;
const newDeleteBatch = `router.delete('/batches/:id', async (req, res) => {
    try {
        const batch = await Batch.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        
        if (batch.status === 'published') {
            const results = await Result.find({ batchId: batch._id, status: 'approved' });
            for (const r of results) {
                await adjustCandidatePoints(r.candidate, -(r.totalPoints || 0));
                await r.deleteOne();
            }
            
            const { logAction } = require('../utils/logAction');
            await logAction({
                actor: req.user._id, actorRole: req.user.role,
                action: 'PUBLISHED_BATCH_DELETED',
                entityType: 'Batch', entityId: batch._id,
                details: { batchName: batch.name, resultsCount: results.length },
                req
            });
            await batch.deleteOne();
            return res.json({ message: 'Published batch deleted and all points reversed.' });
        }
        
        // Unlink results and reset them to draft (so they return to Ready state even if they were pending)
        await Result.updateMany({ batchId: batch._id }, { $set: { batchId: null, status: 'draft' } });
        
        // Delete batch
        await batch.deleteOne();
        res.json({ message: 'Batch deleted and results returned to Ready state' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting batch' });
    }
});`;

code = code.replace(oldDeleteBatch, newDeleteBatch);

fs.writeFileSync('patch-result-entry.cjs', code);
console.log("Created patch script");
