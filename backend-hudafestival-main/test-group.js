const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const Registration = require('./models/Registration');
    const Programme = require('./models/Programme');
    const Result = require('./models/Result');
    const Batch = require('./models/Batch');
    const User = require('./models/User');

    // Find any Group programme with an approved registration of 2+ candidates
    const groupReg = await Registration.findOne({ 
        status: 'approved', 
        'candidates.1': { $exists: true } 
    }).populate('programme');

    if (!groupReg) {
        console.log("Could not find a group registration to test with.");
        process.exit(1);
    }
    const groupProg = groupReg.programme;

    // Find an Individual programme
    const indReg = await Registration.findOne({ 
        status: 'approved', 
        'candidates.1': { $exists: false } 
    }).populate('programme');
    const indProg = indReg.programme;

    let user = await User.findOne({ role: 'admin' }); // any admin

    // Create a batch
    await Batch.deleteMany({ name: 'Test Batch 1' });
    const batch = await Batch.create({ name: 'Test Batch 1', programmes: [groupProg._id, indProg._id], createdBy: user._id, status: 'draft' });

    // Clean old test results
    await Result.deleteMany({ batchId: batch._id });

    // 7. Simulate POST /batches/:id/results (Backend logic)
    const { calculatePointsForResult } = require('./controllers/resultController');
    const { POSITION_POINTS, GRADE_POINTS } = require('./config/bylawRules');

    // GROUP
    const frontendPayloadGroup = [
        { candidateId: groupReg.candidates[0].toString(), rank: 1, grade: 'A+', remarks: 'Great' },
        { candidateId: groupReg.candidates[1].toString(), rank: 2, grade: 'A', remarks: 'Good' }
    ];

    const bulkOpsGroup = frontendPayloadGroup.map(rData => {
        const calculated = calculatePointsForResult({ rank: rData.rank, grade: rData.grade }, groupProg, POSITION_POINTS, GRADE_POINTS);
        return {
            updateOne: {
                filter: { programme: groupProg._id, candidate: rData.candidateId, batchId: batch._id },
                update: { $set: { rank: rData.rank, grade: rData.grade, status: 'draft', pointsFromRank: calculated.pointsFromRank, pointsFromGrade: calculated.pointsFromGrade, totalPoints: calculated.totalPoints } },
                upsert: true
            }
        };
    });
    await Result.bulkWrite(bulkOpsGroup);

    // INDIVIDUAL
    const frontendPayloadInd = [
        { candidateId: indReg.candidates[0].toString(), rank: 3, grade: 'B', remarks: 'Okay' }
    ];

    const bulkOpsInd = frontendPayloadInd.map(rData => {
        const calculated = calculatePointsForResult({ rank: rData.rank, grade: rData.grade }, indProg, POSITION_POINTS, GRADE_POINTS);
        return {
            updateOne: {
                filter: { programme: indProg._id, candidate: rData.candidateId, batchId: batch._id },
                update: { $set: { rank: rData.rank, grade: rData.grade, status: 'draft', pointsFromRank: calculated.pointsFromRank, pointsFromGrade: calculated.pointsFromGrade, totalPoints: calculated.totalPoints } },
                upsert: true
            }
        };
    });
    await Result.bulkWrite(bulkOpsInd);

    // 8. Verify the DB
    console.log("--- TEST RESULTS ---");
    const groupResults = await Result.find({ programme: groupProg._id, batchId: batch._id }).populate('candidate', 'name');
    console.log(`Group Programme (${groupProg.name}) Results Count: ${groupResults.length}`);
    groupResults.forEach(r => {
        console.log(`- Candidate: ${r.candidate.name}, Rank: ${r.rank}, Points: ${r.totalPoints}`);
    });

    const indResults = await Result.find({ programme: indProg._id, batchId: batch._id }).populate('candidate', 'name');
    console.log(`Individual Programme (${indProg.name}) Results Count: ${indResults.length}`);
    indResults.forEach(r => {
        console.log(`- Candidate: ${r.candidate.name}, Rank: ${r.rank}, Points: ${r.totalPoints}`);
    });

    process.exit(0);
}
run();
