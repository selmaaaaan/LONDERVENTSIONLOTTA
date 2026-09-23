const Team = require('../models/Team');
const Candidate = require('../models/Candidate');

// @desc    Get all leaderboards (teams and top students by category)
// @route   GET /api/leaderboards
// @access  Public
const getLeaderboards = async (req, res) => {
    try {
        // --- 1. Get Team Leaderboard (No change here) ---
        const teamLeaderboard = await Team.find({}).sort({ totalPoints: -1 });

        // --- 2. Get Top Student Leaderboards (THIS IS THE UPDATED PART) ---
        const categoryTopStudents = await Candidate.aggregate([
            { $match: { totalPoints: { $gt: 0 } } },
            { $sort: { totalPoints: -1 } },
            // THE FIX: We use $lookup to join with the 'teams' collection
            {
                $lookup: {
                    from: 'teams', // The collection to join with
                    localField: 'team', // The field from the Candidate document
                    foreignField: '_id', // The field from the Team document
                    as: 'teamInfo' // The name of the new array field to add
                }
            },
            // $lookup creates an array, so we use $unwind to flatten it
            {
                $unwind: '$teamInfo'
            },
            {
                $group: {
                    _id: "$category",
                    candidates: { 
                        $push: { 
                            _id: "$_id",
                            name: "$name",
                            totalPoints: "$totalPoints",
                            image: "$image",
                            // Now we push the populated team object
                            team: { _id: "$teamInfo._id", name: "$teamInfo.name", color: "$teamInfo.color", motto: "$teamInfo.motto" }
                        }
                    }
                }
            },
            {
                $project: {
                    category: "$_id",
                    candidates: { $slice: ["$candidates", 5] },
                    _id: 0
                }
            }
        ]);
        
        // --- 3. Get Overall Top Students (No change here) ---
        const overallTopStudents = await Candidate.find({})
            .sort({ totalPoints: -1 })
            .limit(10)
            .populate('team', 'name color motto');

        // --- 4. Category Team Leaders: which team leads in each category ---
        const Programme = require('../models/Programme');
        const approvedResults = await Result.find({ status: 'approved' })
            .populate({ path: 'candidate', select: 'team category' })
            .populate('programme', 'category format');

        const categoryTeamPoints = {};
        const processedTeamProgrammes = new Set();

        approvedResults.forEach(r => {
            if (!r.candidate || !r.programme || !r.totalPoints) return;
            const candidateTeamId = r.candidate.team?.toString();
            if (!candidateTeamId) return;
            
            const category = r.programme.category || r.candidate.category;
            if (!category) return;
            
            const pId = r.programme._id.toString();
            const format = r.programme.format;

            // Prevent double-counting Group/KULLIYYAH events per team
            let shouldAdd = true;
            if (format === 'Group' || category === 'KULLIYYAH') {
                const key = `${candidateTeamId}-${pId}`;
                if (processedTeamProgrammes.has(key)) {
                    shouldAdd = false;
                } else {
                    processedTeamProgrammes.add(key);
                }
            }

            if (shouldAdd) {
                if (!categoryTeamPoints[category]) categoryTeamPoints[category] = {};
                categoryTeamPoints[category][candidateTeamId] = 
                    (categoryTeamPoints[category][candidateTeamId] || 0) + r.totalPoints;
            }
        });

        // Build categoryTeamToppers: for each category, the team with highest points
        const allTeams = await Team.find({}).lean();
        const teamLookup = {};
        allTeams.forEach(t => { teamLookup[t._id.toString()] = t; });

        const categoryTeamToppers = {};
        for (const [cat, teamsObj] of Object.entries(categoryTeamPoints)) {
            const sorted = Object.entries(teamsObj)
                .map(([tId, pts]) => ({
                    teamId: tId,
                    teamName: teamLookup[tId]?.name || 'Unknown',
                    teamColor: teamLookup[tId]?.color || '#ccc',
                    points: pts
                }))
                .sort((a, b) => b.points - a.points);
            if (sorted.length > 0) {
                categoryTeamToppers[cat] = sorted[0];
            }
        }
        
        res.status(200).json({
            teamLeaderboard,
            categoryTopStudents,
            overallTopStudents,
            categoryTeamToppers,
        });

    } catch (error) {
        console.error("Error fetching leaderboards:", error);
        res.status(500).json({ message: 'Failed to getLeaderboards', error: error.message || 'Unknown error' });
    }
};

const Result = require('../models/Result');

const getTeamBreakdown = async (req, res) => {
    try {
        const { teamId } = req.params;
        const candidates = await Candidate.find({ team: teamId }).select('_id');
        const candidateIds = candidates.map(c => c._id);
        
        const results = await Result.find({ candidate: { $in: candidateIds }, status: 'approved' })
            .populate('programme', 'name category format')
            .populate('candidate', 'name admissionNo category')
            .sort({ totalPoints: -1 });
            
        res.status(200).json(results);
    } catch(err) {
        res.status(500).json({ message: 'Failed to fetch team breakdown', error: err.message });
    }
};

const getCandidateBreakdown = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const results = await Result.find({ candidate: candidateId, status: 'approved' })
            .populate('programme', 'name category format')
            .populate('candidate', 'name admissionNo category')
            .sort({ totalPoints: -1 });
            
        res.status(200).json(results);
    } catch(err) {
        res.status(500).json({ message: 'Failed to fetch candidate breakdown', error: err.message });
    }
};
module.exports = { getLeaderboards, getTeamBreakdown, getCandidateBreakdown };

