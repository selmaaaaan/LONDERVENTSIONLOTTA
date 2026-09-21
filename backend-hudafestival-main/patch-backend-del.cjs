const fs = require('fs');

let code = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');

// Update backend delete logic to allow submitted
const oldDeleteLogic = `        if (batch.status !== 'draft') return res.status(400).json({ message: 'Only draft batches can be deleted' });
        
        // Unlink results
        await Result.updateMany({ batchId: batch._id }, { $set: { batchId: null } });`;

const newDeleteLogic = `        if (batch.status === 'published') return res.status(400).json({ message: 'Published batches cannot be deleted this way' });
        
        // Unlink results and reset them to draft (so they return to Ready state even if they were pending)
        await Result.updateMany({ batchId: batch._id }, { $set: { batchId: null, status: 'draft' } });`;

code = code.replace(oldDeleteLogic, newDeleteLogic);

fs.writeFileSync('routes/resultEntryRoutes.js', code);
console.log("Patched resultEntryRoutes.js");
