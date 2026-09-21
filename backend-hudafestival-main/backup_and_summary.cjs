const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Result = require('./models/Result');
        const Batch = require('./models/Batch');

        const results = await Result.find({}).lean();
        const batches = await Batch.find({}).lean();

        // Write backups
        fs.writeFileSync('../results_backup.json', JSON.stringify(results, null, 2));
        fs.writeFileSync('../batches_backup.json', JSON.stringify(batches, null, 2));

        // Calculate summary
        const stats = {
            total: results.length,
            statusCounts: {
                draft: 0,
                pending: 0,
                approved: 0
            }
        };

        results.forEach(r => {
            if (stats.statusCounts[r.status] !== undefined) {
                stats.statusCounts[r.status]++;
            } else {
                stats.statusCounts[r.status] = 1;
            }
        });

        const batchNames = batches.map(b => b.name);

        console.log("---SUMMARY_START---");
        console.log(JSON.stringify({ stats, batchNames }, null, 2));
        console.log("---SUMMARY_END---");
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
