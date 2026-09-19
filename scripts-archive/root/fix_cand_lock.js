const fs = require('fs');
const p = 'backend-hudafestival-main/controllers/candidateController.js';
let code = fs.readFileSync(p, 'utf8');

const injection = "\n    const Settings = require('../models/Settings');\n    const settings = await Settings.findOne();\n    if (settings && settings.isRegistrationOpen === false && req.user.role !== 'admin' && req.user.role !== 'super_admin') {\n        return res.status(403).json({ message: 'Registration is currently closed by Fest Admins.' });\n    }\n";

code = code.replace(
  /const createCandidate = async \(req, res\) => \{/g,
  "const createCandidate = async (req, res) => {" + injection
);

code = code.replace(
  /const updateCandidate = async \(req, res\) => \{/g,
  "const updateCandidate = async (req, res) => {" + injection
);

code = code.replace(
  /const deleteCandidate = async \(req, res\) => \{/g,
  "const deleteCandidate = async (req, res) => {" + injection
);

fs.writeFileSync(p, code);
console.log('Fixed candidateController.js');
