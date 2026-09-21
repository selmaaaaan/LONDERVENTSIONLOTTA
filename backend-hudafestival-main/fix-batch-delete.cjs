const fs = require('fs');
let p = 'routes/allResultsRoutes.js';
let text = fs.readFileSync(p, 'utf8');

text = text.replace(/await Result\.deleteMany\(\{ batchId: req\.params\.batchId, status: 'pending' \}\);/, `await Result.updateMany({ batchId: req.params.batchId, status: 'pending' }, { $set: { status: 'draft' } });
        try {
            const mongoose = require('mongoose');
            if (mongoose.models.Batch) {
                await mongoose.models.Batch.updateOne({ _id: req.params.batchId }, { $set: { status: 'draft' } });
            }
        } catch (err) {}`);

text = text.replace(/res\.json\(\{ message: 'Batch deleted' \}\);/, `res.json({ message: 'Batch rejected and returned to draft status' });`);

fs.writeFileSync(p, text);
