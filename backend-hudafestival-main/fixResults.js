const fs = require('fs');
const file = './controllers/resultController.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('if (programme.isResultPublished) return res.status(400)')) {
    content = content.replace(
        'if (!Array.isArray(results)) {',
        `const Programme = require('../models/Programme');
    const programme = await Programme.findById(programmeId);
    if (!programme) return res.status(404).json({ message: 'Programme not found' });
    if (programme.isResultPublished) return res.status(400).json({ message: 'Programme is published. Unpublish first.' });
    if (!Array.isArray(results)) {`
    );
}

if (!content.includes('if (prog && prog.isResultPublished)')) {
    content = content.replace(
        'const { id: programmeId } = req.params;',
        `const { id: programmeId } = req.params;
    const Programme = require('../models/Programme');
    const prog = await Programme.findById(programmeId);
    if (prog && prog.isResultPublished) return res.status(400).json({ message: 'Programme is published. Unpublish first.' });`
    );
}

content = content.replace(
    'await Result.findByIdAndDelete(result._id);',
    `
        // Cascade point reversal in case points were orphaned or result was somehow approved
        const pointsToRevert = result.totalPoints || 0;
        if (pointsToRevert > 0) {
            const Candidate = require('../models/Candidate');
            const Team = require('../models/Team');
            await Candidate.updateOne({ _id: result.candidate }, { $inc: { totalPoints: -pointsToRevert } });
            const candidate = await Candidate.findById(result.candidate);
            if (candidate && candidate.team) {
                await Team.updateOne({ _id: candidate.team }, { $inc: { totalPoints: -pointsToRevert } });
            }
        }
        await Result.findByIdAndDelete(result._id);`
);

fs.writeFileSync(file, content);
console.log('resultController.js patched');
