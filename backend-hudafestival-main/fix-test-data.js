const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const Result = require('./models/Result');
    const Candidate = require('./models/Candidate');
    const Team = require('./models/Team');

    // 1. Initial Query
    const candidate = await Candidate.findOne({ name: 'MUHAMMED ABDUL SALEEM K' });
    const team = await Team.findOne({ name: 'Tahrir' });
    
    console.log("=== STEP 1: CURRENT LIVE DB STATE ===");
    console.log(`Candidate: ${candidate.name} | totalPoints: ${candidate.totalPoints}`);
    console.log(`Team: ${team.name} | totalPoints: ${team.totalPoints}`);

    const resultsForCand = await Result.find({ candidate: candidate._id, status: 'approved' });
    
    // The test in Prompt 15 changed it to Rank 2, Grade B, 6 pts. Find that specific result.
    let targetResult = resultsForCand.find(r => r.totalPoints === 6 || r.grade === 'B');
    if (!targetResult) {
        // Fallback in case it's the only one, or something weird happened.
        targetResult = resultsForCand[0];
    }
    
    if (targetResult) {
        console.log(`Target Result: Rank ${targetResult.rank}, Grade ${targetResult.grade}, Total Points ${targetResult.totalPoints}`);
    } else {
        console.log("Could not find any approved result for this candidate.");
    }

    // 2. Fix the state
    console.log("\n=== STEP 2: FIXING STATE ===");
    console.log("Restoring target result to Rank 1, Grade A, Total Points 10...");
    if (targetResult) {
        targetResult.rank = 1;
        targetResult.grade = 'A';
        targetResult.pointsFromRank = 5; // Reverting to original points logic based on Prompt 15 log
        targetResult.pointsFromGrade = 5;
        targetResult.totalPoints = 10;
        await targetResult.save();
    }

    console.log("Recalculating candidate points from scratch...");
    const allCandResults = await Result.find({ candidate: candidate._id, status: 'approved' });
    const correctCandPoints = allCandResults.reduce((sum, r) => sum + (r.totalPoints || 0), 0);
    candidate.totalPoints = correctCandPoints;
    await candidate.save();

    console.log("Recalculating team points from scratch...");
    const teamCandidates = await Candidate.find({ team: team._id });
    let correctTeamPoints = 0;
    for (const tc of teamCandidates) {
         correctTeamPoints += (tc.totalPoints || 0);
    }
    team.totalPoints = correctTeamPoints;
    await team.save();

    // 3. Final Query
    console.log("\n=== STEP 3: FINAL VERIFICATION ===");
    const finalCandidate = await Candidate.findById(candidate._id);
    const finalTeam = await Team.findById(team._id);
    const finalResult = await Result.findById(targetResult._id);
    
    console.log(`Candidate: ${finalCandidate.name} | totalPoints: ${finalCandidate.totalPoints}`);
    console.log(`Team: ${finalTeam.name} | totalPoints: ${finalTeam.totalPoints}`);
    console.log(`Result: Rank ${finalResult.rank}, Grade ${finalResult.grade}, Total Points ${finalResult.totalPoints}`);
    
    process.exit(0);
}
run();
