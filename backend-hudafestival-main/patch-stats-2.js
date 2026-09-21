const fs = require('fs');
let fileContent = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');

const newEndpoint = `
// @desc    Get dashboard statistics for Result Entry portal
// @route   GET /api/result-entry/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
    try {
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

        const notEntered = totalProgrammes - scoredProgrammes.length;
        const totalScored = scoredProgrammes.length;

        const batchStatsAgg = await Batch.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const batchStats = { draft: 0, submitted: 0, published: 0 };
        batchStatsAgg.forEach(b => {
            if (batchStats[b._id] !== undefined) {
                batchStats[b._id] = b.count;
            }
        });

        res.json({
            programmes: {
                total: totalProgrammes,
                totalScored,
                notEntered,
                ready,
                inBatch,
                published
            },
            batches: batchStats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});
`;

fileContent = fileContent.replace("router.use(authorize('result_entry'));", "router.use(authorize('result_entry'));\n" + newEndpoint);
fs.writeFileSync('routes/resultEntryRoutes.js', fileContent);
console.log('Added dashboard-stats endpoint successfully');
