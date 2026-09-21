const fs = require('fs');
let code = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');

const pipelineEndpoint = `
// @desc    Get pipeline status for all programmes
// @route   GET /api/result-entry/programmes-pipeline
router.get('/programmes-pipeline', async (req, res) => {
    try {
        const programmes = await Programme.find().lean();
        const results = await Result.aggregate([
            {
                $group: {
                    _id: "$programme",
                    status: { $first: "$status" },
                    batchId: { $first: "$batchId" }
                }
            }
        ]);
        
        let batchMap = {};
        if (results.length > 0) {
            const batchIds = results.filter(r => r.batchId).map(r => r.batchId);
            const batches = await Batch.find({ _id: { $in: batchIds } }).lean();
            batchMap = batches.reduce((acc, b) => {
                acc[b._id.toString()] = b.status;
                return acc;
            }, {});
        }

        const resultMap = results.reduce((acc, r) => {
            let pStatus = 'ready';
            if (r.status === 'approved') pStatus = 'published';
            else if (r.batchId) {
                const bStat = batchMap[r.batchId.toString()];
                if (bStat === 'draft') pStatus = 'in_batch';
                else if (bStat === 'submitted') pStatus = 'submitted';
                else if (bStat === 'published') pStatus = 'published';
                else pStatus = 'in_batch'; // fallback
            }
            acc[r._id.toString()] = { pipelineStatus: pStatus, batchId: r.batchId };
            return acc;
        }, {});

        const pipeline = programmes.map(p => {
            const rData = resultMap[p._id.toString()] || { pipelineStatus: 'not_entered', batchId: null };
            return {
                _id: p._id,
                name: p.name,
                code: p.code,
                category: p.category,
                pipelineStatus: rData.pipelineStatus,
                batchId: rData.batchId
            };
        });

        res.json(pipeline);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
`;

const recallEndpoint = `
// @desc    Recall a submitted batch
// @route   PUT /api/result-entry/batches/:id/recall
router.put('/batches/:id/recall', async (req, res) => {
    try {
        const batch = await Batch.findOne({ _id: req.params.id, createdBy: req.user._id, status: 'submitted' });
        if (!batch) return res.status(404).json({ message: 'Batch not found or not recallable' });
        
        await Result.updateMany({ batchId: batch._id, status: 'pending' }, { $set: { status: 'draft' } });
        await Batch.updateOne({ _id: batch._id }, { $set: { status: 'draft' } });
        
        res.json({ message: 'Batch recalled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error recalling batch' });
    }
});
`;

// Insert after dashboard-stats
code = code.replace(
    "// @desc    Search programmes for standalone scoring",
    pipelineEndpoint + "\n\n// @desc    Search programmes for standalone scoring"
);

// Insert after submit batch
code = code.replace(
    "// @desc    Edit published results directly (Post-Publish Edit)",
    recallEndpoint + "\n\n// @desc    Edit published results directly (Post-Publish Edit)"
);

fs.writeFileSync('routes/resultEntryRoutes.js', code);
console.log("Patched resultEntryRoutes.js");
