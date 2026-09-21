const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Result = require('../models/Result');
const Programme = require('../models/Programme');
const Registration = require('../models/Registration');
const Candidate = require('../models/Candidate');
const Team = require('../models/Team');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { calculatePointsForResult } = require('../controllers/resultController');
const { POSITION_POINTS, GRADE_POINTS } = require('../config/bylawRules');
const mongoose = require('mongoose');

async function adjustCandidatePoints(candidateId, pointDelta) {
    if (!pointDelta || pointDelta === 0) return;
    const Candidate = require('../models/Candidate');
    const Team = require('../models/Team');
    
    const candidate = await Candidate.findById(candidateId);
    if (candidate) { console.log('Adjusting ', candidateId, ' by ', pointDelta, ' old: ', candidate.totalPoints);
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


router.use(protect);
router.use(authorize('result_entry'));

// @desc    Get dashboard statistics for Result Entry portal
// @route   GET /api/result-entry/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
    try {
        const totalProgrammes = await Programme.countDocuments();

        const scoredProgrammes = await Result.aggregate([
            {
                $group: {
                    _id: "$programme",
                    status: { $first: "$status" },
                    batchId: { $first: "$batchId" }
                }
            }
        ]);

        let ready = 0;
        let inBatch = 0;
        let published = 0;

        scoredProgrammes.forEach(prog => {
            if (prog.status === 'approved') {
                published++;
            } else if (prog.batchId) {
                inBatch++;
            } else {
                ready++;
            }
        });

        const notEntered = totalProgrammes - scoredProgrammes.length;
        const totalScored = scoredProgrammes.length;

        const batchStatsAgg = await Batch.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const batchStats = { draft: 0, submitted: 0, published: 0 };
        batchStatsAgg.forEach(b => {
            if (batchStats[b._id] !== undefined) {
                batchStats[b._id] = b.count;
            }
        });

        res.json({
            programmes: {
                total: totalProgrammes,
                totalScored,
                notEntered,
                ready,
                inBatch,
                published
            },
            batches: batchStats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});



// @desc    Get pipeline status for all programmes
// @route   GET /api/result-entry/programmes-pipeline
router.get('/programmes-pipeline', async (req, res) => {
    try {
        const programmes = await Programme.find().lean();
        const results = await Result.aggregate([
            {
                $group: {
                    _id: "$programme",
                    status: { $first: "$status" },
                    batchId: { $first: "$batchId" }
                }
            }
        ]);
        
        let batchMap = {};
        if (results.length > 0) {
            const batchIds = results.filter(r => r.batchId).map(r => r.batchId);
            const batches = await Batch.find({ _id: { $in: batchIds } }).lean();
            batchMap = batches.reduce((acc, b) => {
                acc[b._id.toString()] = b.status;
                return acc;
            }, {});
        }

        const resultMap = results.reduce((acc, r) => {
            let pStatus = 'ready';
            if (r.status === 'approved') pStatus = 'published';
            else if (r.batchId) {
                const bStat = batchMap[r.batchId.toString()];
                if (bStat === 'draft') pStatus = 'in_batch';
                else if (bStat === 'submitted') pStatus = 'submitted';
                else if (bStat === 'published') pStatus = 'published';
                else pStatus = 'in_batch'; // fallback
            }
            acc[r._id.toString()] = { pipelineStatus: pStatus, batchId: r.batchId };
            return acc;
        }, {});

        const pipeline = programmes.map(p => {
            const rData = resultMap[p._id.toString()] || { pipelineStatus: 'not_entered', batchId: null };
            return {
                _id: p._id,
                name: p.name,
                code: p.code,
                category: p.category,
                pipelineStatus: rData.pipelineStatus,
                batchId: rData.batchId
            };
        });

        res.json(pipeline);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// @desc    Search programmes for standalone scoring
// @route   GET /api/result-entry/programmes/search
router.get('/programmes/search', async (req, res) => {
    try {
        const { q } = req.query;
        let query = {};
        if (q) {
            query = {
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { code: { $regex: q, $options: 'i' } }
                ]
            };
        }
        
        // Find programmes that actually have approved candidates
        const approvedRegs = await Registration.find({ status: 'approved' }).distinct('programme');
        query._id = { $in: approvedRegs };

        const programmes = await Programme.find(query).limit(10);
        res.json(programmes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get candidates for a specific programme
// @route   GET /api/result-entry/programmes/:id/candidates

// @desc    Get programme details
// @route   GET /api/result-entry/programmes/:id
router.get('/programmes/:id', async (req, res) => {
    try {
        const prog = await Programme.findById(req.params.id);
        if (!prog) return res.status(404).json({ message: 'Programme not found' });
        res.json(prog);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/programmes/:id/candidates', async (req, res) => {
    try {
        const registrations = await Registration.find({ 
            programme: req.params.id, 
            status: 'approved' 
        }).populate('candidates team');

        // Also fetch existing standalone results (batchId: null) or results in draft
        // So the user can edit them
        const results = await Result.find({ 
            programme: req.params.id,
            status: 'draft' 
        });

        res.json({ registrations, results });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Save standalone results
// @route   POST /api/result-entry/standalone-results

// @desc    Get results for a specific programme
// @route   GET /api/result-entry/standalone-results/:programmeId
router.get('/standalone-results/:programmeId', async (req, res) => {
    try {
        const results = await Result.find({ programme: req.params.programmeId });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching results' });
    }
});

router.post('/standalone-results', async (req, res) => {
    const { results, programmeId, batchId } = req.body;
    try {
        const programme = await Programme.findById(programmeId);
        
        const approvedRegs = await Registration.find({ programme: programmeId, status: 'approved' });
        const validCandidateIds = new Set();
        approvedRegs.forEach(reg => {
            reg.candidates.forEach(c => validCandidateIds.add(c.toString()));
        });

        for (const rData of results) {
            if (!validCandidateIds.has(rData.candidateId.toString())) {
                return res.status(400).json({ message: `Candidate ${rData.candidateId} is not an approved participant.` });
            }
        }

        const bulkOps = results.map(resultData => {
            const tempResult = { rank: resultData.rank, grade: resultData.grade };
            const calculated = calculatePointsForResult(tempResult, programme, POSITION_POINTS, GRADE_POINTS);
            
            return {
                updateOne: {
                    // Match by candidate and programme. Don't strictly tie to a batch ID for the filter
                    // so we overwrite any existing draft for this candidate
                    filter: { programme: programmeId, candidate: resultData.candidateId, status: 'draft' },
                    update: {
                        $set: {
                            rank: resultData.rank || null,
                            grade: resultData.grade || null,
                            remarks: resultData.remarks || null,
                            status: 'draft',
                            submittedBy: req.user._id,
                            pointsFromRank: calculated.pointsFromRank,
                            pointsFromGrade: calculated.pointsFromGrade,
                            totalPoints: calculated.totalPoints,
                            batchId: batchId || null
                        }
                    },
                    upsert: true
                }
            };
        });

        if (bulkOps.length > 0) {
            await Result.bulkWrite(bulkOps);
        }
        
        res.json({ message: 'Results saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get all ready results (batchId: null, status: draft)
// @route   GET /api/result-entry/ready-results
router.get('/ready-results', async (req, res) => {
    try {
        const results = await Result.find({ batchId: null, status: 'draft' }).populate('programme');
        
        // Group by programme
        const progMap = new Map();
        results.forEach(r => {
            if (r.programme) {
                if (!progMap.has(r.programme._id.toString())) {
                    progMap.set(r.programme._id.toString(), {
                        _id: r.programme._id,
                        name: r.programme.name,
                        code: r.programme.code,
                        category: r.programme.category,
                        resultCount: 0
                    });
                }
                if (r.rank || r.grade) {
                    progMap.get(r.programme._id.toString()).resultCount++;
                }
            }
        });

        res.json(Array.from(progMap.values()));
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete standalone result by programme
// @route   DELETE /api/result-entry/standalone-results/:programmeId
router.delete('/standalone-results/:programmeId', async (req, res) => {
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
});


// ==========================================
// BATCH ENDPOINTS
// ==========================================

// @desc    Get all batches
router.get('/batches', async (req, res) => {
    try {
        const batches = await Batch.find({ createdBy: req.user._id })
            .populate('programmes', 'name code category')
            .sort({ createdAt: -1 });
        res.json(batches);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create an empty Batch
router.post('/batches', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Batch name required' });

    try {
        const batch = await Batch.create({
            name,
            programmes: [],
            createdBy: req.user._id,
            status: 'draft'
        });
        res.status(201).json(batch);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Attach programmes to a batch
// @route   PUT /api/result-entry/batches/:id/attach

// @desc    Rename a batch
// @route   PUT /api/result-entry/batches/:id
router.put('/batches/:id', async (req, res) => {
    try {
        const batch = await Batch.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        if (batch.status !== 'draft') return res.status(400).json({ message: 'Only draft batches can be modified' });
        
        batch.name = req.body.name || batch.name;
        await batch.save();
        res.json(batch);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating batch' });
    }
});

// @desc    Delete a draft batch (unlinks results, does not delete them)
// @route   DELETE /api/result-entry/batches/:id
router.delete('/batches/:id', async (req, res) => {
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
});

router.put('/batches/:id/attach', async (req, res) => {
    const { programmeIds } = req.body;
    try {
        const batch = await Batch.findOne({ _id: req.params.id, createdBy: req.user._id, status: 'draft' });
        if (!batch) return res.status(404).json({ message: 'Batch not found or not editable' });

        // Update batch doc
        const newProgrammes = [...new Set([...batch.programmes.map(p=>p.toString()), ...programmeIds])];
        batch.programmes = newProgrammes;
        await batch.save();

        // Update all standalone results for these programmes to point to this batch
        await Result.updateMany(
            { programme: { $in: programmeIds }, status: 'draft', batchId: null },
            { $set: { batchId: batch._id } }
        );

        res.json(batch);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Detach a programme from a batch
// @route   PUT /api/result-entry/batches/:id/detach
router.put('/batches/:id/detach', async (req, res) => {
    const { programmeId } = req.body;
    try {
        const batch = await Batch.findOne({ _id: req.params.id, createdBy: req.user._id, status: 'draft' });
        if (!batch) return res.status(404).json({ message: 'Batch not found or not editable' });

        batch.programmes = batch.programmes.filter(p => p.toString() !== programmeId);
        await batch.save();

        await Result.updateMany(
            { programme: programmeId, status: 'draft', batchId: batch._id },
            { $set: { batchId: null } }
        );

        res.json(batch);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get a specific Batch & CUMULATIVE leaderboard
router.get('/batches/:id', async (req, res) => {
    try {
        const batch = await Batch.findOne({ _id: req.params.id, createdBy: req.user._id })
            .populate('programmes', 'name code category');
            
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        
        // Fetch ALL published results PLUS this batch's current results
        const results = await Result.find({
            $or: [
                { status: 'approved' },
                { batchId: batch._id }
            ]
        }).populate({
            path: 'candidate',
            populate: { path: 'team' }
        }).populate('programme');
        
        const teamPoints = {};
        const candidatePoints = {};
        
        results.forEach(r => {
            if (!r.candidate || !r.programme) return;
            const c = r.candidate;
            
            // Exclude non-scoring or unranked
            if (r.totalPoints > 0) {
                // Team Aggregation
                if (c.team) {
                    const tId = c.team._id.toString();
                    teamPoints[tId] = (teamPoints[tId] || 0) + r.totalPoints;
                }
                
                // Individual Aggregation
                const cId = c._id.toString();
                if (!candidatePoints[cId]) {
                    candidatePoints[cId] = {
                        candidateId: cId,
                        name: c.name,
                        teamName: c.team ? c.team.name : 'Unknown',
                        category: c.category,
                        points: 0
                    };
                }
                candidatePoints[cId].points += r.totalPoints;
            }
        });

        // 1. Team Leaderboard
        const teams = await Team.find({});
        const teamMap = {};
        teams.forEach(t => teamMap[t._id.toString()] = t.name);

        const leaderboard = Object.keys(teamPoints).map(tId => ({
            teamId: tId,
            teamName: teamMap[tId] || 'Unknown',
            points: teamPoints[tId]
        })).sort((a,b) => b.points - a.points);

        // 2. Overall Top 3 Individuals
        const allCandidatesArr = Object.values(candidatePoints).sort((a,b) => b.points - a.points);
        const overallToppers = allCandidatesArr.slice(0, 3);

        // 3. Category Toppers (Top 1 per category)
        const categoryToppers = {};
        allCandidatesArr.forEach(c => {
            if (!categoryToppers[c.category]) {
                categoryToppers[c.category] = [];
            }
            // Add top 3 per category for flexibility
            if (categoryToppers[c.category].length < 3) {
                categoryToppers[c.category].push(c);
            }
        });

        // Also fetch candidate-specific results mapped for the batch's programmes so the PDF has full details
        // We only want the details of results belonging to THIS batch for the programme printouts
        const batchResults = results.filter(r => r.batchId && r.batchId.toString() === batch._id.toString());

        // Compute previousTotal for each candidate: sum of approved points from results NOT in this batch
        const batchProgrammeIds = new Set(batch.programmes.map(p => p._id.toString()));
        const previousTotals = {};

        results.forEach(r => {
            if (!r.candidate) return;
            const cId = r.candidate._id.toString();
            // Only count approved results that are NOT in this batch's programmes
            if (r.status === 'approved' && r.programme && !batchProgrammeIds.has(r.programme._id.toString())) {
                previousTotals[cId] = (previousTotals[cId] || 0) + (r.totalPoints || 0);
            }
        });

        // Enrich batchResults with previousTotal and grandTotal
        const enrichedBatchResults = batchResults.map(r => {
            const rObj = r.toObject ? r.toObject() : { ...r };
            const cId = r.candidate ? r.candidate._id.toString() : null;
            const prevTotal = cId ? (previousTotals[cId] || 0) : 0;
            rObj.previousTotal = prevTotal;
            rObj.grandTotal = prevTotal + (r.totalPoints || 0);
            return rObj;
        });

        res.json({ 
            batch, 
            leaderboard, 
            overallToppers,
            categoryToppers, 
            batchResults: enrichedBatchResults,
            resultsCount: enrichedBatchResults.length 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Submit Batch to Admin
router.post('/batches/:id/submit', async (req, res) => {
    try {
        const batch = await Batch.findOne({ _id: req.params.id, createdBy: req.user._id, status: 'draft' });
        if (!batch) return res.status(403).json({ message: 'Unauthorized or batch already submitted' });

        await Batch.updateOne({ _id: batch._id }, { $set: { status: 'submitted' } });
        await Result.updateMany(
            { batchId: batch._id, status: 'draft' }, 
            { $set: { status: 'pending' } }
        );

        res.json({ message: 'Batch submitted to Admin successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// @desc    Recall a submitted batch
// @route   PUT /api/result-entry/batches/:id/recall
router.put('/batches/:id/recall', async (req, res) => {
    try {
        const batch = await Batch.findOne({ _id: req.params.id, createdBy: req.user._id, status: 'submitted' });
        if (!batch) return res.status(404).json({ message: 'Batch not found or not recallable' });
        
        await Result.updateMany({ batchId: batch._id, status: 'pending' }, { $set: { status: 'draft' } });
        await Batch.updateOne({ _id: batch._id }, { $set: { status: 'draft' } });
        
        res.json({ message: 'Batch recalled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error recalling batch' });
    }
});


// @desc    Edit published results directly (Post-Publish Edit)
router.put('/batches/:id/published-results', async (req, res) => {
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
            
            const existingResult = await Result.findOne(query); console.log('Query:', query, 'Result:', !!existingResult); if (!existingResult) continue;

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
});


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

module.exports = router;
