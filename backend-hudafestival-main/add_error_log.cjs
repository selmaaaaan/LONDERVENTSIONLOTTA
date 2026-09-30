const fs = require('fs');
let c = fs.readFileSync('controllers/candidateController.js', 'utf8');

c = c.replace(
    "res.status(500).json({ message: 'Error fetching candidate registrations', error: error.message });",
    "console.error('500 ERROR:', error);\n        res.status(500).json({ message: 'Error fetching candidate registrations', error: error.message, stack: error.stack });"
);

fs.writeFileSync('controllers/candidateController.js', c);
console.log('Added console.error');
