const fs = require('fs');
let c = fs.readFileSync('controllers/candidateController.js', 'utf8');

c = c.replace(
    ".select('name admissionNo classLevel category team')",
    ".select('name admissionNo classLevel category team totalPoints')"
);

fs.writeFileSync('controllers/candidateController.js', c);
console.log('Added totalPoints to lookup select');
