const fs = require('fs');
let content = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');

const getProgRoute = `
// @desc    Get programme details
// @route   GET /api/result-entry/programmes/:id
router.get('/programmes/:id', async (req, res) => {
    try {
        const prog = await Programme.findById(req.params.id);
        if (!prog) return res.status(404).json({ message: 'Programme not found' });
        res.json(prog);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
`;

if (!content.includes("router.get('/programmes/:id', async (req, res)")) {
    content = content.replace(
        "router.get('/programmes/:id/candidates', async (req, res) => {",
        getProgRoute + "\nrouter.get('/programmes/:id/candidates', async (req, res) => {"
    );
    fs.writeFileSync('routes/resultEntryRoutes.js', content);
    console.log("Added GET programme details endpoint.");
} else {
    console.log("Endpoint already exists.");
}
