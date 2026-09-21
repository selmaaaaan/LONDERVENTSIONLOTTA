const mongoose = require('mongoose');
require('dotenv').config();

async function setup() {
    await mongoose.connect(process.env.MONGO_URI);
    const Result = require('./models/Result');
    const Batch = require('./models/Batch');
    const Programme = require('./models/Programme');
    const Candidate = require('./models/Candidate');
    const User = require('./models/User');

    // Clean slate
    await Batch.deleteMany({});
    await Result.deleteMany({});
    await Candidate.updateMany({}, { $set: { totalPoints: 0 } });

    const user = await User.findOne({ role: 'result_entry' });
    if (!user) { console.log("No result_entry user found!"); process.exit(1); }

    const progs = await Programme.find().limit(3).lean();
    const candidates = await Candidate.find().limit(6).lean();

    console.log("Using programmes:", progs.map(p => `${p.code} - ${p.name}`));
    console.log("Using candidates:", candidates.map(c => c.name));

    // Create Batch
    const batch = await Batch.create({
        name: 'Test Publish Batch',
        programmes: progs.map(p => p._id),
        createdBy: user._id,
        status: 'submitted'
    });
    console.log("Created batch:", batch.name, "status:", batch.status);

    // Create Results for each programme (2 candidates each)
    for (let i = 0; i < progs.length; i++) {
        const prog = progs[i];
        const c1 = candidates[i * 2];
        const c2 = candidates[i * 2 + 1];

        await Result.create({
            programme: prog._id,
            candidate: c1._id,
            rank: 1,
            grade: 'A',
            totalPoints: 15, // 10 (rank 1) + 5 (grade A)
            pointsFromRank: 10,
            pointsFromGrade: 5,
            batchId: batch._id.toString(),
            status: 'pending',
            submittedBy: user._id
        });
        await Result.create({
            programme: prog._id,
            candidate: c2._id,
            rank: 2,
            grade: 'B',
            totalPoints: 8, // 5 (rank 2) + 3 (grade B)
            pointsFromRank: 5,
            pointsFromGrade: 3,
            batchId: batch._id.toString(),
            status: 'pending',
            submittedBy: user._id
        });
        console.log(`  ${prog.code}: ${c1.name} (1st/A), ${c2.name} (2nd/B)`);
    }

    // Also create a second batch for delete testing
    const batch2 = await Batch.create({
        name: 'Throwaway Delete Test',
        programmes: [progs[0]._id],
        createdBy: user._id,
        status: 'submitted'
    });
    console.log("\nCreated throwaway batch:", batch2.name, "ID:", batch2._id);

    console.log("\n=== FINAL STATE ===");
    console.log("Batches:", (await Batch.find().lean()).map(b => ({name: b.name, status: b.status, id: b._id})));
    console.log("Results:", (await Result.find().lean()).length, "total");
    console.log("\nBatch ID for publish test:", batch._id.toString());
    console.log("Batch ID for delete test:", batch2._id.toString());

    process.exit(0);
}
setup();
