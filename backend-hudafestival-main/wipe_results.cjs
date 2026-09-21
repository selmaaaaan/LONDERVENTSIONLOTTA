const mongoose = require('mongoose');
require('dotenv').config();

async function wipe() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Result = require('./models/Result');
        const Candidate = require('./models/Candidate');
        const Team = require('./models/Team');
        const Programme = require('./models/Programme');
        const Batch = require('./models/Batch');

        console.log("Wiping all Results...");
        const resDelete = await Result.deleteMany({});
        console.log(`Deleted ${resDelete.deletedCount} Result documents.`);

        console.log("Resetting Candidate points to 0...");
        await Candidate.updateMany({}, { $set: { totalPoints: 0 } }); // removed pointsFromRank/Grade from here as they live on Result, Candidate only has totalPoints

        console.log("Resetting Team points to 0...");
        await Team.updateMany({}, { $set: { totalPoints: 0 } });

        console.log("Resetting Programme publish statuses...");
        await Programme.updateMany({}, { $set: { isResultPublished: false } });

        console.log("Emptying Batch programme lists...");
        // the user said do not delete Batch documents unless asked, just keep them empty
        await Batch.updateMany({}, { $set: { programmes: [] } });

        console.log("Wipe complete!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
wipe();
