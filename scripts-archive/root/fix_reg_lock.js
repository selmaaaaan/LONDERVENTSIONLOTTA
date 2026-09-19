const fs = require('fs');
const p = 'backend-hudafestival-main/controllers/registrationController.js';
let code = fs.readFileSync(p, 'utf8');

const injection = "\n        const Settings = require('../models/Settings');\n        const settings = await Settings.findOne();\n        if (settings && settings.isRegistrationOpen === false && req.user.role !== 'admin' && req.user.role !== 'super_admin') {\n            return res.status(403).json({ message: 'Registration is currently closed by Fest Admins.' });\n        }\n";

code = code.replace(
  /const updateRegistration = async \(req, res\) => \{\n    try \{/g,
  "const updateRegistration = async (req, res) => {\n    try {" + injection
);

code = code.replace(
  /const deleteRegistration = async \(req, res\) => \{\n    try \{/g,
  "const deleteRegistration = async (req, res) => {\n    try {" + injection
);

fs.writeFileSync(p, code);
console.log('Fixed registrationController.js locks');
