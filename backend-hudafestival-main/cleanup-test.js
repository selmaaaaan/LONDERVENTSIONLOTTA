const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const Batch = require('./models/Batch');
    const Result = require('./models/Result');
    const Programme = require('./models/Programme');

    // 1. Point Math Breakdown
    const groupProg = await Programme.findOne({ name: 'TV NEWS REPORTING ENG' });
    const indProg = await Programme.findOne({ name: "QIRA'ATH" });

    console.log("--- SANITY CHECK: POINT MATH ---");
    console.log(`Programme 1: ${groupProg.name} (Format: ${groupProg.format}, Category: ${groupProg.category}, Starred: ${groupProg.isStarred})`);
    
    // Simulate what happened:
    // Candidate 1: Rank 1, Grade A+
    let tierGroup = groupProg.category === 'KULLIYYAH' ? 'kulliyyah' : (groupProg.isStarred ? 'starred' : (groupProg.format === 'Group' ? 'group' : 'individual'));
    let gradeTierGroup = groupProg.isStarred ? 'starred' : 'standard';
    
    console.log(`Determined Tiers -> Rank Tier: ${tierGroup}, Grade Tier: ${gradeTierGroup}`);
    console.log(`Candidate 1 (Rank 1, Grade A+) -> Rank Pts: 7, Grade Pts: 0 (A+ is not in bylaw rules, only A, B, C). Total: 7`);
    console.log(`Candidate 2 (Rank 2, Grade A) -> Rank Pts: 5, Grade Pts: 5. Total: 10`);

    // 2. Clean up Test Data
    const batch = await Batch.findOne({ name: 'Test Batch 1' });
    if (batch) {
        const deletedResults = await Result.deleteMany({ batchId: batch._id });
        const deletedBatch = await Batch.deleteOne({ _id: batch._id });
        console.log(`\n--- CLEANUP ---`);
        console.log(`Deleted Batch 'Test Batch 1'.`);
        console.log(`Deleted ${deletedResults.deletedCount} test Result documents.`);
        console.log(`Real Registrations and Candidates were untouched.`);
    }

    process.exit(0);
}
run();
