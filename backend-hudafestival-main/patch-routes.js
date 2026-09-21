const fs = require('fs');
let fileContent = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');

const oldGetBatch = `// @desc    Get a specific Batch & localized leaderboard
router.get('/batches/:id', async (req, res) => {
    try {
        const batch = await Batch.findOne({ _id: req.params.id, createdBy: req.user._id })
            .populate('programmes', 'name code category');
            
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        
        const results = await Result.find({ batchId: batch._id }).populate('candidate programme');
        
        // Calculate localized leaderboard (Team Points)
        const teamPoints = {};
        const categoryToppers = {};

        // We need team details. Let's fetch all teams to map easily
        const teams = await Team.find({});
        const teamMap = {};
        teams.forEach(t => teamMap[t._id.toString()] = t.name);

        results.forEach(r => {
            if (!r.candidate || !r.programme) return;
            const c = r.candidate;
            if (c.team && r.totalPoints > 0) {
                const tId = c.team.toString();
                teamPoints[tId] = (teamPoints[tId] || 0) + r.totalPoints;
            }

            // Category toppers
            if (r.rank === 1) {
                const cat = r.programme.category;
                if (!categoryToppers[cat]) categoryToppers[cat] = [];
                categoryToppers[cat].push({
                    candidateName: c.name,
                    programmeName: r.programme.name,
                    teamName: c.team ? teamMap[c.team.toString()] : 'Unknown',
                    points: r.totalPoints
                });
            }
        });

        const leaderboard = Object.keys(teamPoints).map(tId => ({
            teamId: tId,
            teamName: teamMap[tId] || 'Unknown',
            points: teamPoints[tId]
        })).sort((a,b) => b.points - a.points);

        res.json({ batch, leaderboard, categoryToppers, resultsCount: results.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});`;

const newGetBatch = `// @desc    Get a specific Batch & CUMULATIVE leaderboard
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

        res.json({ 
            batch, 
            leaderboard, 
            overallToppers,
            categoryToppers, 
            batchResults,
            resultsCount: batchResults.length 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});`;

fileContent = fileContent.replace(oldGetBatch, newGetBatch);
fs.writeFileSync('routes/resultEntryRoutes.js', fileContent);
console.log("Updated resultEntryRoutes.js");
