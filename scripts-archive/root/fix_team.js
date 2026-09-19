const fs = require('fs');
const p = 'backend-hudafestival-main/controllers/teamController.js';
let code = fs.readFileSync(p, 'utf8');

const injection = "if (req.user.role === 'team_leader' && req.user.team.toString() !== req.params.id) { return res.status(403).json({ message: 'Access denied: You can only view your own team.' }); }";

code = code.replace(
  /const getRegistrationGrid = async \(req, res\) => \{\s+try \{\s+const teamId = req\.params\.id;/g,
  'const getRegistrationGrid = async (req, res) => {\n    try {\n        ' + injection + '\n        const teamId = req.params.id;'
);

code = code.replace(
  /const getUnregisteredProgrammes = async \(req, res\) => \{\s+try \{\s+const teamId = req\.params\.id;/g,
  'const getUnregisteredProgrammes = async (req, res) => {\n    try {\n        ' + injection + '\n        const teamId = req.params.id;'
);

fs.writeFileSync(p, code);
console.log('Fixed teamController.js');
