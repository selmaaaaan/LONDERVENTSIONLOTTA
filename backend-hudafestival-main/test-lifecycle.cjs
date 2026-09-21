const mongoose = require('mongoose');
require('dotenv').config();

async function getStats() {
    const Result = require('./models/Result');
    const Batch = require('./models/Batch');
    const Programme = require('./models/Programme');

    const totalProgrammes = await Programme.countDocuments();
    const scoredProgrammes = await Result.aggregate([
        { $group: { _id: "$programme", status: { $first: "$status" }, batchId: { $first: "$batchId" } } }
    ]);

    let ready = 0, inBatch = 0, published = 0;
    scoredProgrammes.forEach(prog => {
        if (prog.status === 'approved') { published++; }
        else if (prog.batchId) { inBatch++; }
        else { ready++; }
    });

    return {
        NotEntered: totalProgrammes - (ready + inBatch + published),
        Ready: ready,
        InBatch: inBatch,
        Published: published,
        Total: totalProgrammes,
        BatchesDraft: await Batch.countDocuments({ status: 'draft' }),
        BatchesSubmitted: await Batch.countDocuments({ status: 'submitted' }),
        BatchesPublished: await Batch.countDocuments({ status: 'published' })
    };
}

async function runTest() {
    await mongoose.connect(process.env.MONGO_URI);
    const Result = require('./models/Result');
    const Batch = require('./models/Batch');
    const Programme = require('./models/Programme');
    const Candidate = require('./models/Candidate');
    const User = require('./models/User');

    // Make sure we have a user
    const user = await User.findOne({ role: 'admin' });
    const prog = await Programme.findOne();
    const candidate = await Candidate.findOne();

    console.log("=== STEP 0: INITIAL STATE ===");
    console.log(await getStats());

    console.log("\n=== STEP 1: SCORE NEW PROGRAMME ===");
    // Simulate Enter Results save
    const resDoc = await Result.create({
        programme: prog._id,
        candidate: candidate._id,
        status: 'pending',
        batchId: null,
        rank: 1, grade: 'A', totalPoints: 10,
        submittedBy: user._id
    });
    console.log(await getStats());

    console.log("\n=== STEP 2: ADD TO BATCH ===");
    const batch = await Batch.create({
        name: 'Test Batch',
        programmes: [prog._id],
        createdBy: user._id,
        status: 'draft'
    });
    await Result.updateOne({ _id: resDoc._id }, { $set: { batchId: batch._id } });
    console.log(await getStats());

    console.log("\n=== STEP 3: SUBMIT BATCH TO ADMIN ===");
    await Batch.updateOne({ _id: batch._id }, { $set: { status: 'submitted' } });
    // In actual submit logic, we update the results to status: 'pending' (they already are, but we just verify stats)
    console.log(await getStats());

    console.log("\n=== STEP 4: DELETE/CLEAR RESULT ===");
    // My wipe logic deletes the result and unlinks the batch
    await Result.deleteOne({ _id: resDoc._id });
    await Batch.updateOne({ _id: batch._id }, { $pull: { programmes: prog._id } });
    console.log(await getStats());
    
    // cleanup
    await Batch.deleteOne({ _id: batch._id });

    process.exit(0);
}
runTest();
