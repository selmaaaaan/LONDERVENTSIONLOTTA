const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Result = require('./models/Result');
        const Batch = require('./models/Batch');
        const Programme = require('./models/Programme');

        const totalProgrammes = await Programme.countDocuments();
        
        const scoredProgrammes = await Result.aggregate([
            {
                $group: {
                    _id: "$programme",
                    status: { $first: "$status" },
                    batchId: { $first: "$batchId" }
                }
            }
        ]);

        let ready = 0;
        let inBatch = 0;
        let published = 0;

        scoredProgrammes.forEach(prog => {
            if (prog.status === 'approved') {
                published++;
            } else if (prog.batchId) {
                inBatch++;
            } else {
                ready++;
            }
        });

        const batchStats = {
            draft: await Batch.countDocuments({ status: 'draft' }),
            submitted: await Batch.countDocuments({ status: 'submitted' }),
            published: await Batch.countDocuments({ status: 'published' })
        };

        const programmesStats = {
            total: totalProgrammes,
            notEntered: totalProgrammes - (ready + inBatch + published),
            ready,
            inBatch,
            published
        };

        console.log({ programmes: programmesStats, batches: batchStats });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
