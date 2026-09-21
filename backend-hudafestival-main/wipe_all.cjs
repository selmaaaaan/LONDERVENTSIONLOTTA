const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Batch = require('./models/Batch');
        const Result = require('./models/Result');
        const Candidate = require('./models/Candidate');
        const Team = require('./models/Team');

        console.log("=== DB STATE BEFORE WIPE ===");
        const batchesBefore = await Batch.find().lean();
        const resultsBefore = await Result.find().lean();
        console.log('Batches:', batchesBefore.map(b => ({name: b.name, status: b.status})));
        console.log('Results:', resultsBefore.map(r => ({programme: r.programme, status: r.status, batchId: r.batchId})));
        
        console.log("\n=== STARTING WIPE ===");
        const bRes = await Batch.deleteMany({});
        console.log(`Deleted ${bRes.deletedCount} Batch documents.`);

        const rRes = await Result.deleteMany({});
        console.log(`Deleted ${rRes.deletedCount} Result documents.`);

        const cRes = await Candidate.updateMany({}, { $set: { totalPoints: 0 } });
        console.log(`Reset totalPoints to 0 for ${cRes.modifiedCount} Candidate documents.`);

        const tRes = await Team.updateMany({}, { $set: { totalPoints: 0 } });
        console.log(`Reset totalPoints to 0 for ${tRes.modifiedCount} Team documents.`);

        console.log("\n=== DB STATE AFTER WIPE ===");
        const batchesAfter = await Batch.countDocuments();
        const resultsAfter = await Result.countDocuments();
        const candidatesWithPoints = await Candidate.countDocuments({ totalPoints: { $gt: 0 } });
        const teamsWithPoints = await Team.countDocuments({ totalPoints: { $gt: 0 } });
        console.log(`Batches remaining: ${batchesAfter}`);
        console.log(`Results remaining: ${resultsAfter}`);
        console.log(`Candidates with points > 0: ${candidatesWithPoints}`);
        console.log(`Teams with points > 0: ${teamsWithPoints}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
