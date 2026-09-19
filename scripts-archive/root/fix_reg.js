const fs = require('fs');
const p = 'backend-hudafestival-main/controllers/registrationController.js';
let code = fs.readFileSync(p, 'utf8');

const injection = "if (req.user.role === 'team_leader' && req.user.team.toString() !== registration.team.toString()) { return res.status(403).json({ message: 'Access denied: You can only modify your own team registrations.' }); }";

code = code.replace(
  /const updateRegistration = async \(req, res\) => \{\s+try \{\s+const \{ candidateIds \} = req\.body;\s+const registration = await Registration\.findById\(req\.params\.id\)\.populate\('programme'\);\s+if \(!registration\) return res\.status\(404\)\.json\(\{ message: 'Registration not found' \}\);/g,
  "const updateRegistration = async (req, res) => {\n    try {\n        const { candidateIds } = req.body;\n        const registration = await Registration.findById(req.params.id).populate('programme');\n        if (!registration) return res.status(404).json({ message: 'Registration not found' });\n\n        " + injection
);

code = code.replace(
  /const deleteRegistration = async \(req, res\) => \{\s+try \{\s+const registration = await Registration\.findByIdAndDelete\(req\.params\.id\);\s+if \(!registration\) return res\.status\(404\)\.json\(\{ message: 'Registration not found' \}\);/g,
  "const deleteRegistration = async (req, res) => {\n    try {\n        const registration = await Registration.findById(req.params.id);\n        if (!registration) return res.status(404).json({ message: 'Registration not found' });\n\n        " + injection + "\n\n        await Registration.findByIdAndDelete(req.params.id);"
);

fs.writeFileSync(p, code);
console.log('Fixed registrationController.js');
