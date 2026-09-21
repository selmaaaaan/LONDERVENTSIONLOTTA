const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const Result = require('./models/Result');
    const Batch = require('./models/Batch');
    const Programme = require('./models/Programme');
    const Candidate = require('./models/Candidate');
    const Team = require('./models/Team');
    const User = require('./models/User');
    const { calculatePointsForResult } = require('./controllers/resultController');
    const { POSITION_POINTS, GRADE_POINTS } = require('./config/bylawRules');

    // 1. Find an approved result
    let existingResult = await Result.findOne({ status: 'approved' }).populate('candidate programme');
    if (!existingResult) {
        existingResult = await Result.findOne().populate('candidate programme');
        existingResult.status = 'approved';
        await existingResult.save();
    }
    if (!existingResult) {
        console.log("No approved results found.");
        process.exit(1);
    }
    
    const candidate = await Candidate.findById(existingResult.candidate._id);
    const team = await Team.findById(candidate.team);
    const programme = existingResult.programme;

    // 2. Setup mock Batch and User
    let user = await User.findOne({ role: 'admin' });
    const batch = await Batch.create({ 
        name: 'Simulated Publish Edit Batch', 
        programmes: [programme._id], 
        status: 'published', 
        createdBy: user._id 
    });
    existingResult.batchId = batch._id;
    await existingResult.save();

    console.log(`--- BEFORE EDIT ---`);
    console.log(`Candidate: ${candidate.name} | Initial Points: ${candidate.totalPoints}`);
    console.log(`Team: ${team.name} | Initial Points: ${team.totalPoints}`);
    console.log(`Result: Rank ${existingResult.rank}, Grade ${existingResult.grade}, Total Points ${existingResult.totalPoints}`);

    // 3. Simulate PUT Payload
    // Let's change the rank to 1, and grade to A
    const rData = { candidateId: candidate._id.toString(), rank: 2, grade: 'B', remarks: 'Wow' };
    
    // 4. Run the exact controller logic
    const oldPoints = existingResult.totalPoints || 0;
    
    // Reverse
    candidate.totalPoints = Math.max(0, (candidate.totalPoints || 0) - oldPoints);
    team.totalPoints = Math.max(0, (team.totalPoints || 0) - oldPoints);

    // Calc new
    const tempResult = { rank: rData.rank, grade: rData.grade };
    const calculated = calculatePointsForResult(tempResult, programme, POSITION_POINTS, GRADE_POINTS);

    // Apply new
    candidate.totalPoints += calculated.totalPoints;
    team.totalPoints += calculated.totalPoints;
    
    existingResult.rank = rData.rank;
    existingResult.grade = rData.grade;
    existingResult.totalPoints = calculated.totalPoints;

    await candidate.save();
    await team.save();
    await existingResult.save();

    console.log(`\n--- AFTER EDIT (Changed to Rank 2, Grade B) ---`);
    console.log(`Result: Rank ${existingResult.rank}, Grade ${existingResult.grade}, Total Points ${existingResult.totalPoints}`);
    
    // Fetch fresh from DB to prove
    const freshC = await Candidate.findById(candidate._id);
    const freshT = await Team.findById(team._id);
    
    console.log(`Candidate: ${freshC.name} | New Points: ${freshC.totalPoints} (Should be Initial - ${oldPoints} + ${calculated.totalPoints})`);
    console.log(`Team: ${freshT.name} | New Points: ${freshT.totalPoints}`);

    process.exit(0);
}
run();




