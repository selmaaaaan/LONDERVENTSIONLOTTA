const fs = require('fs');
let c = fs.readFileSync('controllers/candidateController.js', 'utf8');

c = c.replace(
    'const programmeIds = registrations.map(r => r.programme._id);',
    'const programmeIds = registrations.filter(r => r.programme).map(r => r.programme._id);'
);

// I also need to ensure `filteredRegistrations.sort` instead of `mappedRegistrations.sort`
// Let's check what it currently says.
c = c.replace('mappedRegistrations.sort((a, b) => {', 'const filteredRegistrations = mappedRegistrations.filter(Boolean);\n        filteredRegistrations.sort((a, b) => {');
c = c.replace('res.status(200).json(mappedRegistrations);', 'res.status(200).json(filteredRegistrations);');

fs.writeFileSync('controllers/candidateController.js', c);
console.log('Fixed exactly using strings');
