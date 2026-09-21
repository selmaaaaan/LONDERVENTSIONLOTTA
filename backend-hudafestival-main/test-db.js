require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Programme = mongoose.connection.collection('programmes');
        const Result = mongoose.connection.collection('results');
        const Batch = mongoose.connection.collection('batches');

        const totalProgrammes = await Programme.countDocuments();
        const scoredGroups = await Result.aggregate([
            { $group: { _id: "$programme", status: { $first: "$status" }, batchId: { $first: "$batchId" } } }
        ]).toArray();

        let dbReady = 0, dbInBatch = 0, dbPublished = 0;
        scoredGroups.forEach(prog => {
            if (prog.status === 'approved') dbPublished++;
            else if (prog.batchId) dbInBatch++;
            else dbReady++;
        });
        const dbNotEntered = totalProgrammes - scoredGroups.length;

        const dbDraftBatches = await Batch.countDocuments({ status: 'draft' });
        const dbSubmittedBatches = await Batch.countDocuments({ status: 'submitted' });
        const dbPublishedBatches = await Batch.countDocuments({ status: 'published' });

        console.log("=== MANUAL DB CROSS-CHECK ===");
        console.log(`Programmes Total: ${totalProgrammes}`);
        console.log(`Programmes Not Entered: ${dbNotEntered}`);
        console.log(`Programmes Ready: ${dbReady}`);
        console.log(`Programmes In Batch: ${dbInBatch}`);
        console.log(`Programmes Published: ${dbPublished}`);
        console.log(`Batches Draft: ${dbDraftBatches}`);
        console.log(`Batches Submitted: ${dbSubmittedBatches}`);
        console.log(`Batches Published: ${dbPublishedBatches}`);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
