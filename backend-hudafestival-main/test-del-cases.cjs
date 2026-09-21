const mongoose = require('mongoose');
require('dotenv').config();

async function testDeletes() {
    await mongoose.connect(process.env.MONGO_URI);
    const Batch = require('./models/Batch');
    const Result = require('./models/Result');
    const Programme = require('./models/Programme');
    const Candidate = require('./models/Candidate');
    const User = require('./models/User');

    // Setup
    const user = await User.findOne({ role: 'admin' });
    const prog1 = await Programme.findOne({ code: 'BS1' });
    const prog2 = await Programme.findOne({ code: 'BS2' });
    const prog3 = await Programme.findOne({ code: 'BS3' });
    const candidate = await Candidate.findOne();

    // Reset just in case
    await Batch.deleteMany({});
    await Result.deleteMany({});
    await Candidate.updateMany({}, { $set: { totalPoints: 0 } });

    // 1. DRAFT BATCH
    const bDraft = await Batch.create({ name: 'Test Draft', status: 'draft', createdBy: user._id });
    const rDraft = await Result.create({ programme: prog1._id, candidate: candidate._id, status: 'draft', batchId: bDraft._id, rank: 1, totalPoints: 10, submittedBy: user._id });

    // 2. SUBMITTED BATCH
    const bSub = await Batch.create({ name: 'Test Sub', status: 'submitted', createdBy: user._id });
    const rSub = await Result.create({ programme: prog2._id, candidate: candidate._id, status: 'pending', batchId: bSub._id, rank: 1, totalPoints: 10, submittedBy: user._id });

    // 3. PUBLISHED BATCH
    const bPub = await Batch.create({ name: 'Test Pub', status: 'published', createdBy: user._id });
    const rPub = await Result.create({ programme: prog3._id, candidate: candidate._id, status: 'approved', batchId: bPub._id, rank: 1, totalPoints: 10, submittedBy: user._id });
    // Simulate candidate points awarded
    await Candidate.updateOne({ _id: candidate._id }, { $inc: { totalPoints: 10 } });

    console.log("=== INITIAL STATE ===");
    console.log("Candidate Points:", (await Candidate.findById(candidate._id)).totalPoints);
    console.log("Batches:", (await Batch.find()).map(b => b.status));

    // DELETE DRAFT
    console.log("\n=== DELETING DRAFT ===");
    // Call the same logic our API uses for draft
    await Result.updateMany({ batchId: bDraft._id }, { $set: { batchId: null, status: 'draft' } });
    await Batch.deleteOne({ _id: bDraft._id });
    console.log("Draft Result Status:", (await Result.findById(rDraft._id)).status, "BatchId:", (await Result.findById(rDraft._id)).batchId);

    // DELETE SUBMITTED
    console.log("\n=== DELETING SUBMITTED ===");
    await Result.updateMany({ batchId: bSub._id }, { $set: { batchId: null, status: 'draft' } });
    await Batch.deleteOne({ _id: bSub._id });
    console.log("Sub Result Status:", (await Result.findById(rSub._id)).status, "BatchId:", (await Result.findById(rSub._id)).batchId);

    // DELETE PUBLISHED
    console.log("\n=== DELETING PUBLISHED ===");
    const results = await Result.find({ batchId: bPub._id });
    for (const res of results) {
        if (res.status === 'approved' && res.totalPoints > 0) {
            await Candidate.updateOne({ _id: res.candidate }, { $inc: { totalPoints: -res.totalPoints } });
        }
        await res.deleteOne();
    }
    await Batch.deleteOne({ _id: bPub._id });

    console.log("Pub Result Exists?:", await Result.findById(rPub._id));
    console.log("Candidate Points After Published Delete:", (await Candidate.findById(candidate._id)).totalPoints);
    
    // Cleanup the stragglers
    await Result.deleteMany({});
    
    process.exit(0);
}
testDeletes();
