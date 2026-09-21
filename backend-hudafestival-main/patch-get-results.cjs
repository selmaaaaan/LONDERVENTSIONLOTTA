const fs = require('fs');
let content = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');

const getRoute = `
// @desc    Get results for a specific programme
// @route   GET /api/result-entry/standalone-results/:programmeId
router.get('/standalone-results/:programmeId', async (req, res) => {
    try {
        const results = await Result.find({ programme: req.params.programmeId });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching results' });
    }
});
`;

if (!content.includes("router.get('/standalone-results/:programmeId'")) {
    content = content.replace(
        "router.post('/standalone-results', async (req, res) => {",
        getRoute + "\nrouter.post('/standalone-results', async (req, res) => {"
    );
    fs.writeFileSync('routes/resultEntryRoutes.js', content);
    console.log("Added GET standalone results endpoint.");
} else {
    console.log("Endpoint already exists.");
}
