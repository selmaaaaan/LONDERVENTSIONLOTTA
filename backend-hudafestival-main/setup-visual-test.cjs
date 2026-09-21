const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const Batch = require('./models/Batch');
    const Result = require('./models/Result');
    const Candidate = require('./models/Candidate');
    const Team = require('./models/Team');
    const Programme = require('./models/Programme');
    const User = require('./models/User');

    // Full wipe
    await Batch.deleteMany({});
    await Result.deleteMany({});
    await Candidate.updateMany({}, { $set: { totalPoints: 0 } });
    await Team.updateMany({}, { $set: { totalPoints: 0 } });
    console.log('Wiped all test data.');

    // Create a fresh submitted batch for visual testing
    const user = await User.findOne({ role: 'result_entry' });
    const progs = await Programme.find().limit(3).lean();
    const cands = await Candidate.find().limit(6).lean();

    const batch = await Batch.create({
        name: 'Visual Test Batch',
        programmes: progs.map(p => p._id),
        createdBy: user._id,
        status: 'submitted'
    });

    for (let i = 0; i < 3; i++) {
        const p = progs[i];
        await Result.create({
            programme: p._id,
            candidate: cands[i * 2]._id,
            rank: 1, grade: 'A',
            totalPoints: 15, pointsFromRank: 10, pointsFromGrade: 5,
            batchId: batch._id.toString(),
            status: 'pending',
            submittedBy: user._id
        });
        await Result.create({
            programme: p._id,
            candidate: cands[i * 2 + 1]._id,
            rank: 2, grade: 'B',
            totalPoints: 8, pointsFromRank: 5, pointsFromGrade: 3,
            batchId: batch._id.toString(),
            status: 'pending',
            submittedBy: user._id
        });
    }

    console.log('Created submitted batch:', batch.name);
    console.log('  3 programmes, 6 results, status: submitted');
    console.log('  Batch ID:', batch._id.toString());
    console.log('\nReady for visual testing:');
    console.log('  1. Login as admin/admin123 at http://localhost:5173');
    console.log('  2. Go to Pending Results');
    console.log('  3. Click "Publish Batch" on the Visual Test Batch');
    console.log('  4. Then login as resultmanager/shiafest@result');
    console.log('  5. Go to Batches > click the batch > Print/PDF to see programme tables');

    process.exit(0);
}
run();
