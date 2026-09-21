const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const Result = require('./models/Result');
const Batch = require('./models/Batch');
const Programme = require('./models/Programme');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // 1. Backups
    const allResults = await Result.find({}).lean();
    const allBatches = await Batch.find({}).lean();
    
    fs.writeFileSync('backup_results.json', JSON.stringify(allResults, null, 2));
    fs.writeFileSync('backup_batches.json', JSON.stringify(allBatches, null, 2));
    
    // 2. Summary
    const resultsByStatus = { draft: 0, pending: 0, approved: 0, other: 0 };
    const resultsByBatch = {};
    
    for (const r of allResults) {
        const status = r.status || 'other';
        if (resultsByStatus[status] !== undefined) resultsByStatus[status]++;
        else resultsByStatus.other++;
        
        const batchId = r.batchId ? r.batchId.toString() : 'Standalone/No Batch';
        if (!resultsByBatch[batchId]) resultsByBatch[batchId] = [];
        resultsByBatch[batchId].push(r);
    }
    
    console.log("=== RESULTS SUMMARY ===");
    console.log(`Total Results: ${allResults.length}`);
    console.log(`- Draft: ${resultsByStatus.draft}`);
    console.log(`- Pending: ${resultsByStatus.pending}`);
    console.log(`- Approved (Live): ${resultsByStatus.approved}`);
    console.log(`- Other: ${resultsByStatus.other}`);
    
    console.log("\n=== BY BATCH ===");
    for (const batchId of Object.keys(resultsByBatch)) {
        let batchName = batchId;
        if (batchId !== 'Standalone/No Batch') {
            const b = allBatches.find(b => b._id.toString() === batchId);
            batchName = b ? `${b.name} (Status: ${b.status})` : `Unknown Batch (${batchId})`;
        }
        console.log(`Batch: ${batchName} -> ${resultsByBatch[batchId].length} results`);
        
        // By programme
        const progMap = {};
        for (const r of resultsByBatch[batchId]) {
            const pId = r.programme ? r.programme.toString() : 'Unknown';
            if (!progMap[pId]) progMap[pId] = 0;
            progMap[pId]++;
        }
        
        for (const pId of Object.keys(progMap)) {
            const prog = await Programme.findById(pId).select('name code category').lean();
            const pName = prog ? `${prog.name} (${prog.category})` : pId;
            console.log(`    - ${pName}: ${progMap[pId]} results`);
        }
    }
    
    mongoose.disconnect();
}

run().catch(console.error);
