const fs = require('fs');
let content = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');

// 1. Fix projection query
const projQueryRegex = /const projectionResults = await Result\.find\(\{[\s\S]*?\$or: \[[\s\S]*?\{ status: 'approved', batchId: \{ \$ne: batch\._id \} \},[\s\S]*?\{ batchId: batch\._id \}[\s\S]*?\][\s\S]*?\}\)\.populate\(\{[\s\S]*?path: 'candidate',[\s\S]*?populate: \{ path: 'team' \}[\s\S]*?\}\);/;
const projQueryRep = `const projectionResults = await Result.find({
            $or: [
                { status: 'approved' },
                { batchId: { $ne: null } }
            ]
        }).populate('programme').populate({
            path: 'candidate',
            populate: { path: 'team' }
        });`;
content = content.replace(projQueryRegex, projQueryRep);

// 2. Fix the projection points calculation & add categoryTeamToppers
const pointsCalcRegex = /const teamPoints = \{\};\s*const candidatePoints = \{\};\s*projectionResults\.forEach\(r => \{\s*if \(\!r\.candidate\) return;\s*const c = r\.candidate;\s*if \(r\.totalPoints > 0\) \{\s*if \(c\.team\) \{\s*const tId = c\.team\._id\.toString\(\);\s*teamPoints\[tId\] = \(teamPoints\[tId\] \|\| 0\) \+ r\.totalPoints;\s*\}/;

const pointsCalcRep = `const teamPoints = {};
        const candidatePoints = {};
        const processedTeamProgrammes = new Set();
        const categoryTeamPoints = {}; // new for Prompt 3
        
        projectionResults.forEach(r => {
            if (!r.candidate) return;
            const c = r.candidate;
            if (r.totalPoints > 0) {
                if (c.team) {
                    const tId = c.team._id.toString();
                    const pId = r.programme?._id?.toString() || r.programme?.toString();
                    const format = r.programme?.format;
                    const category = r.programme?.category || c.category;
                    
                    let shouldAddTeamPoints = true;
                    if (format === 'Group' || category === 'KULLIYYAH') {
                        const teamProgKey = \`\${tId}-\${pId}\`;
                        if (processedTeamProgrammes.has(teamProgKey)) {
                            shouldAddTeamPoints = false;
                        } else {
                            processedTeamProgrammes.add(teamProgKey);
                        }
                    }
                    
                    if (shouldAddTeamPoints) {
                        teamPoints[tId] = (teamPoints[tId] || 0) + r.totalPoints;
                        
                        if (category) {
                            if (!categoryTeamPoints[category]) categoryTeamPoints[category] = {};
                            categoryTeamPoints[category][tId] = (categoryTeamPoints[category][tId] || 0) + r.totalPoints;
                        }
                    }
                }`;
content = content.replace(pointsCalcRegex, pointsCalcRep);

// 3. Output categoryTeamToppers
const responseRegex = /const categoryToppers = \{\};\s*allCandidatesArr\.forEach\(c => \{\s*if \(\!categoryToppers\[c\.category\]\) categoryToppers\[c\.category\] = \[\];\s*if \(categoryToppers\[c\.category\]\.length < 3\) categoryToppers\[c\.category\]\.push\(c\);\s*\}\);\s*res\.json\(\{ leaderboard, overallToppers, categoryToppers \}\);/;

const responseRep = `const categoryToppers = {};
        allCandidatesArr.forEach(c => {
            if (!categoryToppers[c.category]) categoryToppers[c.category] = [];
            if (categoryToppers[c.category].length < 3) categoryToppers[c.category].push(c);
        });

        const categoryTeamToppers = {};
        for (const [cat, teamsObj] of Object.entries(categoryTeamPoints)) {
            const sortedTeams = Object.keys(teamsObj).map(tId => ({
                teamId: tId,
                teamName: teamMap[tId] || 'Unknown',
                points: teamsObj[tId]
            })).sort((a,b) => b.points - a.points);
            if (sortedTeams.length > 0) {
                categoryTeamToppers[cat] = sortedTeams[0]; // just the leader
            }
        }

        res.json({ leaderboard, overallToppers, categoryToppers, categoryTeamToppers });`;
content = content.replace(responseRegex, responseRep);

fs.writeFileSync('routes/resultEntryRoutes.js', content);
console.log('Patched resultEntryRoutes.js');
