const Result = require('../models/Result.js');
const { logAction } = require('../utils/logAction');
const Programme = require('../models/Programme.js');
const Candidate = require('../models/Candidate.js');
const Team = require('../models/Team.js');
const Settings = require('../models/Settings.js');



// @desc    Save results as 'pending'
const savePendingResults = async (req, res) => {
    const { results } = req.body;
    const { id: programmeId } = req.params;
    const Programme = require('../models/Programme');
    const prog = await Programme.findById(programmeId);
    if (prog && prog.isResultPublished) return res.status(400).json({ message: 'Programme is published. Unpublish first.' });
    
    const { POSITION_POINTS, GRADE_POINTS } = require('../config/bylawRules');
    
    try {
        for (const resultData of results) {
            const { candidateId, rank, grade } = resultData;
            const tempResult = { rank: rank || null, grade: grade || null };
            const { pointsFromRank, pointsFromGrade, totalPoints } = calculatePointsForResult(tempResult, prog, POSITION_POINTS, GRADE_POINTS);

            // THE FIX: Explicitly set points and set status on every save.
            // This prevents old 'approved' results from being stuck.
            await Result.findOneAndUpdate(
                { programme: programmeId, candidate: candidateId },
                { 
                    rank: tempResult.rank, 
                    grade: tempResult.grade, 
                    status: 'pending',
                    pointsFromRank,
                    pointsFromGrade,
                    totalPoints
                },
                { upsert: true, new: true }
            );
        }
        res.status(201).json({ message: 'Results saved as pending.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to savePendingResults', error: error.message || 'Unknown error' });
    }
};


const calculatePointsForResult = (result, programme, POSITION_POINTS, GRADE_POINTS) => {
    let tier = 'individual';
    if (programme.category === 'KULLIYYAH') {
        tier = 'kulliyyah';
    } else if (programme.isStarred) {
        tier = 'starred';
    } else if (programme.format === 'Group') {
        tier = 'group';
    }

    let gradeTier = programme.isStarred ? 'starred' : 'standard';

    const pointsFromRank = result.rank ? (POSITION_POINTS[tier]?.[result.rank] || 0) : 0;
    const pointsFromGrade = result.grade ? (GRADE_POINTS[gradeTier]?.[result.grade] || 0) : 0;
    
    return { pointsFromRank, pointsFromGrade, totalPoints: pointsFromRank + pointsFromGrade };
};

const approveForProgramme = async (programmeId, user) => {
    const programme = await Programme.findById(programmeId);
    if (!programme) throw new Error(`Programme not found: ${programmeId}`);

    const pendingResults = await Result.find({ programme: programmeId, status: 'pending' });
    if (pendingResults.length === 0) {
        return { programmeId, success: false, message: 'No pending results to approve.' };
    }
    
    const { POSITION_POINTS, GRADE_POINTS } = require('../config/bylawRules');
    
        for (const result of pendingResults) {
        const { pointsFromRank, pointsFromGrade, totalPoints } = calculatePointsForResult(result, programme, POSITION_POINTS, GRADE_POINTS);

        result.pointsFromRank = pointsFromRank;
        result.pointsFromGrade = pointsFromGrade;
        result.totalPoints = totalPoints;
        result.status = 'approved';
        await result.save();

        await Candidate.updateOne({ _id: result.candidate  }, { $inc: { totalPoints: totalPoints  } }, { isSystemScoreUpdate: true });
        const candidate = await Candidate.findById(result.candidate);
        if (candidate) {
             await Team.updateOne({ _id: candidate.team  }, { $inc: { totalPoints: totalPoints  } }, { isSystemScoreUpdate: true });
        }
    }
    
    programme.isResultPublished = true;
    await programme.save();
    return { programmeId, success: true, count: pendingResults.length };
};

// @desc    Approve pending results and calculate points
const unpublishResults = async (req, res) => {
    const { id: programmeId } = req.params;
    try {
        const programme = await Programme.findById(programmeId);
        if (!programme) return res.status(404).json({ message: 'Programme not found' });
        
        if (!programme.isResultPublished) {
            return res.status(400).json({ message: 'Results are not currently published.' });
        }

        const approvedResults = await Result.find({ programme: programmeId, status: 'approved' });
        
        for (const result of approvedResults) {
            const pointsToRevert = result.totalPoints || 0;
            
            // Revert candidate points
            await Candidate.updateOne({ _id: result.candidate  }, { $inc: { totalPoints: -pointsToRevert  } }, { isSystemScoreUpdate: true });
            
            // Revert team points
            const candidate = await Candidate.findById(result.candidate);
            if (candidate) {
                await Team.updateOne({ _id: candidate.team  }, { $inc: { totalPoints: -pointsToRevert  } }, { isSystemScoreUpdate: true });
            }
            
            // Set result back to pending
            result.status = 'pending';
            result.pointsFromRank = 0;
            result.pointsFromGrade = 0;
            result.totalPoints = 0;
            await result.save();
        }

        programme.isResultPublished = false;
        await programme.save();

        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'RESULT_UNPUBLISHED', entityType: 'Result', details: { programmeId }, req });

        res.status(200).json({ message: 'Results unpublished successfully! You can now edit them.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to unpublishResults', error: error.message || 'Unknown error' });
    }
};

const approvePendingResults = async (req, res) => {
    const { id: programmeId } = req.params;
    try {
        const result = await approveForProgramme(programmeId, req.user);
        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'RESULT_PUBLISHED', entityType: 'Result', details: { programmeId }, req });
        res.status(200).json({ message: 'Results approved and published successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to approvePendingResults', error: error.message || 'Unknown error' });
    }
};

const publishBatch = async (req, res) => {
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
        res.status(200).json({ message: `Published ${programmeIds.length} programmes`, results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to publishBatch', error: error.message || 'Unknown error' });
    }
};

// @desc    Get all results for a specific programme
const getProgrammeResults = async (req, res) => {
    try {
        const results = await Result.find({ programme: req.params.id, status: 'approved' });
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Failed to getProgrammeResults', error: error.message || 'Unknown error' });
    }
};

// @desc    Bulk upsert results as 'pending'
const savePendingResultsBulk = async (req, res) => {
    const { results, batchId, isEmergencyOverride } = req.body;
    
    if (req.user.role === 'admin' && isEmergencyOverride !== true) {
        return res.status(403).json({ message: 'Admin score editing requires explicit emergency override flag.' });
    } // Array of { candidateId, rank, grade, remarks }
    const { id: programmeId } = req.params;
    
    const Programme = require('../models/Programme');
    const programme = await Programme.findById(programmeId);
    if (!programme) return res.status(404).json({ message: 'Programme not found' });
    if (programme.isResultPublished) return res.status(400).json({ message: 'Programme is published. Unpublish first.' });
    if (!Array.isArray(results)) {
        return res.status(400).json({ message: 'Results must be an array.' });
    }

    const { POSITION_POINTS, GRADE_POINTS } = require('../config/bylawRules');
    try {
        const bulkOps = results.map(resultData => {
            const tempResult = { rank: resultData.rank || null, grade: resultData.grade || null };
            const { pointsFromRank, pointsFromGrade, totalPoints } = calculatePointsForResult(tempResult, programme, POSITION_POINTS, GRADE_POINTS);

            return {
                updateOne: {
                    filter: { programme: programmeId, candidate: resultData.candidateId },
                    update: {
                        $set: {
                            rank: tempResult.rank,
                            grade: tempResult.grade,
                            remarks: resultData.remarks || null,
                            status: 'pending',
                            batchId: batchId || null,
                            submittedBy: req.user._id,
                            pointsFromRank,
                            pointsFromGrade,
                            totalPoints
                        }
                    },
                    upsert: true
                }
            };
        });

        if (bulkOps.length > 0) {
            await Result.bulkWrite(bulkOps);
        }
        
        if (req.user.role === 'admin' && isEmergencyOverride === true) {
            await logAction({ 
                actor: req.user._id, actorRole: req.user.role, 
                action: 'EMERGENCY_SCORE_OVERRIDE', 
                entityType: 'Programme', entityId: programmeId, 
                details: { programme: programme.name, count: results.length, batchId, payload: results }, 
                req 
            });
        } else {
            await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'RESULT_SAVED', entityType: 'Result', details: { programmeId, count: results.length, batchId }, req });
        }
        res.status(201).json({ message: 'Results saved as pending in bulk.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to savePendingResultsBulk', error: error.message || 'Unknown error' });
    }
};

const updateResult = async (req, res) => {
    const { rank, grade } = req.body;
    try {
        const result = await Result.findById(req.params.resultId).populate('programme');
        if (!result) return res.status(404).json({ message: 'Result not found' });
        
        if (result.status === 'approved') {
            return res.status(403).json({ message: 'This result is published — unpublish its batch first.' });
        }

        result.rank = rank || null;
        result.grade = grade || null;
        
        const { POSITION_POINTS, GRADE_POINTS } = require('../config/bylawRules');
        const { pointsFromRank, pointsFromGrade, totalPoints } = calculatePointsForResult(result, result.programme, POSITION_POINTS, GRADE_POINTS);
        
        result.pointsFromRank = pointsFromRank;
        result.pointsFromGrade = pointsFromGrade;
        result.totalPoints = totalPoints;
        
        await result.save();
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'RESULT_UPDATED', entityType: 'Result', entityId: result._id, details: { rank, grade, totalPoints }, req });
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update result', error: error.message || 'Unknown error' });
    }
};

// @desc    Get all results including remarks (admin only)
// @route   GET /api/results/judgment-feedback
// @access  Private/Admin
const getJudgmentFeedback = async (req, res) => {
    try {
        // Query results and explicitly select remarks
        const results = await Result.find({})
            .select('+remarks')
            .populate('programme', 'name code category isStarred format type')
            .populate({
                path: 'candidate',
                select: 'name admissionNo team',
                populate: { path: 'team', select: 'name' }
            })
            .populate('submittedBy', 'name userName')
            .sort({ updatedAt: -1 });
            
        // We also need to map the CodeLetter for each candidate to show what the judge saw
        const CodeLetter = require('../models/CodeLetter');
        
        // Fetch all code letters and create a lookup map
        const allCodeLetters = await CodeLetter.find({});
        const codeLetterMap = {}; // "programmeId_candidateId" -> letter
        
        allCodeLetters.forEach(cl => {
            const key = `${cl.programme.toString()}_${cl.candidate.toString()}`;
            codeLetterMap[key] = cl.letter;
        });
        
        // Attach the code letter to each result for the frontend
        const enrichedResults = results.map(result => {
            const resultObj = result.toObject();
            if (resultObj.programme && resultObj.candidate) {
                const key = `${resultObj.programme._id.toString()}_${resultObj.candidate._id.toString()}`;
                resultObj.codeLetter = codeLetterMap[key] || 'N/A';
            }
            return resultObj;
        });

        res.status(200).json(enrichedResults);
    } catch (error) {
        console.error("Error fetching judgment feedback:", error);
        res.status(500).json({ message: 'Failed to fetch judgment feedback', error: error.message || 'Unknown error' });
    }
};

const deleteResult = async (req, res) => {
    try {
        const result = await Result.findById(req.params.id);
        if (!result) return res.status(404).json({ message: 'Result not found' });
        
        if (result.status === 'approved') {
            return res.status(403).json({ message: 'This result is published � unpublish its batch first.' });
        }

        
        // Cascade point reversal in case points were orphaned or result was somehow approved
        const pointsToRevert = result.totalPoints || 0;
        if (pointsToRevert > 0) {
            const Candidate = require('../models/Candidate');
            const Team = require('../models/Team');
            await Candidate.updateOne({ _id: result.candidate  }, { $inc: { totalPoints: -pointsToRevert  } }, { isSystemScoreUpdate: true });
            const candidate = await Candidate.findById(result.candidate);
            if (candidate && candidate.team) {
                await Team.updateOne({ _id: candidate.team  }, { $inc: { totalPoints: -pointsToRevert  } }, { isSystemScoreUpdate: true });
            }
        }
        await Result.findByIdAndDelete(result._id);
        
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'RESULT_DELETED', entityType: 'Result', entityId: result._id, req });
        res.status(200).json({ message: 'Result deleted successfully' });
    } catch (error) {
        console.error('Error deleting result:', error);
        res.status(500).json({ message: 'Failed to delete result', error: error.message || 'Unknown error' });
    }
};

const revertBatch = async (req, res) => {
    try {
        const { batchId } = req.body;
        if (!batchId) return res.status(400).json({ message: 'batchId is required' });

        const approvedResults = await Result.find({ batchId, status: 'approved' });
        
        // Collect affected programme IDs so we can reset isResultPublished
        const affectedProgrammeIds = new Set();

        for (const result of approvedResults) {
            const pointsToRevert = result.totalPoints || 0;
            if (pointsToRevert > 0) {
                await Candidate.updateOne({ _id: result.candidate  }, { $inc: { totalPoints: -pointsToRevert  } }, { isSystemScoreUpdate: true });
                const candidate = await Candidate.findById(result.candidate);
                if (candidate && candidate.team) {
                    await Team.updateOne({ _id: candidate.team  }, { $inc: { totalPoints: -pointsToRevert  } }, { isSystemScoreUpdate: true });
                }
            }
            
            // Track which programmes are affected
            if (result.programme) {
                affectedProgrammeIds.add(result.programme.toString());
            }

            // Zero out points and revert status (match unpublishResults behavior)
            result.status = 'pending';
            result.pointsFromRank = 0;
            result.pointsFromGrade = 0;
            result.totalPoints = 0;
            await result.save();
        }

        // Reset isResultPublished for each affected programme
        for (const progId of affectedProgrammeIds) {
            await Programme.updateOne({ _id: progId }, { $set: { isResultPublished: false } });
        }

        const Batch = require('../models/Batch');
        await Batch.updateOne({ _id: batchId }, { $set: { status: 'submitted' } });
        
        await logAction({ actor: req.user._id, actorRole: req.user.role, action: 'RESULT_BULK_REVERTED', entityType: 'Batch', entityId: batchId, req });
        
        res.status(200).json({ message: `Reverted ${approvedResults.length} results back to pending.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { revertBatch, calculatePointsForResult, deleteResult,  savePendingResults, savePendingResultsBulk, approvePendingResults, unpublishResults, getProgrammeResults, publishBatch, updateResult, getJudgmentFeedback };





