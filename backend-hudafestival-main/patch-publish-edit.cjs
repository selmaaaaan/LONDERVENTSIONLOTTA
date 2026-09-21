const fs = require('fs');

let rw = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');

const newRoute = `// @desc    Edit published results directly (Post-Publish Edit)
// @route   PUT /api/result-entry/batches/:id/published-results
router.put('/batches/:id/published-results', async (req, res) => {
    const { results, programmeId } = req.body;
    try {
        const batch = await Batch.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        if (batch.status !== 'published') {
            return res.status(400).json({ message: 'This endpoint is only for already-published batches.' });
        }
        
        const programme = await Programme.findById(programmeId);
        const Candidate = require('../models/Candidate');
        const Team = require('../models/Team');

        // Note: For a true atomic update, we'd use a Mongoose transaction here
        // We'll process each changed result sequentially
        for (const rData of results) {
            const existingResult = await Result.findOne({ 
                programme: programmeId, 
                candidate: rData.candidateId, 
                batchId: batch._id,
                status: 'approved' 
            });

            if (!existingResult) continue; // Skip if no approved result found

            // 1. Reverse the old points
            const oldPoints = existingResult.totalPoints || 0;
            const candidate = await Candidate.findById(existingResult.candidate);
            
            if (candidate) {
                candidate.points = Math.max(0, (candidate.points || 0) - oldPoints);
                await candidate.save();
                
                if (candidate.team) {
                    const team = await Team.findById(candidate.team);
                    if (team) {
                        team.points = Math.max(0, (team.points || 0) - oldPoints);
                        await team.save();
                    }
                }
            }

            // 2. Apply the new points
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

            // 3. Add new points to Candidate & Team
            if (candidate) {
                candidate.points += calculated.totalPoints;
                await candidate.save();

                if (candidate.team) {
                    const team = await Team.findById(candidate.team);
                    if (team) {
                        team.points += calculated.totalPoints;
                        await team.save();
                    }
                }
            }

            // 4. Log Action
            const { logAction } = require('../middlewares/logMiddleware');
            await logAction({
                actor: req.user._id,
                actorRole: req.user.role,
                action: 'RESULT_EDITED_POST_PUBLISH',
                entityType: 'Result',
                entityId: existingResult._id,
                details: { 
                    programme: programme.name, 
                    candidateId: rData.candidateId, 
                    oldPoints, 
                    newPoints: calculated.totalPoints 
                },
                req
            });
        }

        res.json({ message: 'Live changes applied and Leaderboards updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during post-publish edit' });
    }
});

module.exports = router;`;

rw = rw.replace("module.exports = router;", newRoute);

fs.writeFileSync('routes/resultEntryRoutes.js', rw);
