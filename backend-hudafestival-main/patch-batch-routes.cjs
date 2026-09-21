const fs = require('fs');
let content = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');

const endpoints = `
// @desc    Rename a batch
// @route   PUT /api/result-entry/batches/:id
router.put('/batches/:id', async (req, res) => {
    try {
        const batch = await Batch.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        if (batch.status !== 'draft') return res.status(400).json({ message: 'Only draft batches can be modified' });
        
        batch.name = req.body.name || batch.name;
        await batch.save();
        res.json(batch);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating batch' });
    }
});

// @desc    Delete a draft batch (unlinks results, does not delete them)
// @route   DELETE /api/result-entry/batches/:id
router.delete('/batches/:id', async (req, res) => {
    try {
        const batch = await Batch.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        if (batch.status !== 'draft') return res.status(400).json({ message: 'Only draft batches can be deleted' });
        
        // Unlink results
        await Result.updateMany({ batchId: batch._id }, { $set: { batchId: null } });
        
        // Delete batch
        await batch.deleteOne();
        res.json({ message: 'Batch deleted and results returned to Ready state' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting batch' });
    }
});
`;

if (!content.includes("router.put('/batches/:id', async (req, res) => {")) {
    content = content.replace(
        "router.put('/batches/:id/attach', async (req, res) => {",
        endpoints + "\nrouter.put('/batches/:id/attach', async (req, res) => {"
    );
    fs.writeFileSync('routes/resultEntryRoutes.js', content);
    console.log("Backend routes added.");
} else {
    console.log("Backend routes already exist.");
}
