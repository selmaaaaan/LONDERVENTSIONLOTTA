const fs = require('fs');

let p = 'controllers/programmeController.js';
let text = fs.readFileSync(p, 'utf8');

// Find the function definitions and strip them.
text = text.replace(/const getProgrammeByCodeForJudging = async \(req, res\) => \{[\s\S]*?^\};\r?\n/m, '');
text = text.replace(/const getCandidatesForBlindJudging = async \(req, res\) => \{[\s\S]*?^\};\r?\n/m, '');
text = text.replace(/\/\/ @desc GET Candidates for blind judging\r?\n\/\/ @route GET \/api\/programmes\/:id\/candidates-for-judging\r?\n\/\/ @access Private \(judge \| admin\)\r?\nconst CodeLetter = require\('\.\.\/models\/CodeLetter'\);\r?\n/, "const CodeLetter = require('../models/CodeLetter');\n");
text = text.replace(/\s*getProgrammeByCodeForJudging,/, '');
text = text.replace(/\s*getCandidatesForBlindJudging,/, '');

fs.writeFileSync(p, text);
console.log("Fixed programmeController");
