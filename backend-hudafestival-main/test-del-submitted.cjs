const mongoose = require('mongoose');
require('dotenv').config();

async function runTest() {
    await mongoose.connect(process.env.MONGO_URI);
    const Result = require('./models/Result');
    const Batch = require('./models/Batch');
    const Programme = require('./models/Programme');
    const Candidate = require('./models/Candidate');
    const User = require('./models/User');

    const user = await User.findOne({ role: 'admin' });
    const prog = await Programme.findOne();
    const candidate = await Candidate.findOne();

    console.log("=== STEP 1: CREATE SUBMITTED BATCH ===");
    const resDoc = await Result.create({
        programme: prog._id,
        candidate: candidate._id,
        status: 'pending',
        batchId: null,
        rank: 1, grade: 'A', totalPoints: 10,
        submittedBy: user._id
    });
    
    const batch = await Batch.create({
        name: 'Test Delete Submitted Batch',
        programmes: [prog._id],
        createdBy: user._id,
        status: 'submitted'
    });
    await Result.updateOne({ _id: resDoc._id }, { $set: { batchId: batch._id } });

    console.log("Batch Status:", batch.status);
    console.log("Result Status:", (await Result.findById(resDoc._id)).status);

    console.log("\n=== STEP 2: DELETE THE SUBMITTED BATCH ===");
    // Calling the exact logic from the updated DELETE route
    if (batch.status === 'published') throw new Error('Cannot delete published');
    
    await Result.updateMany({ batchId: batch._id }, { $set: { batchId: null, status: 'draft' } });
    await Batch.deleteOne({ _id: batch._id });

    const finalResult = await Result.findById(resDoc._id);
    console.log("Final Result Status:", finalResult.status);
    console.log("Final Result BatchId:", finalResult.batchId);

    // cleanup
    await Result.deleteOne({ _id: resDoc._id });
    
    process.exit(0);
}
runTest();
