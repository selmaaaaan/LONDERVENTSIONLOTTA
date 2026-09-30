const fs = require('fs');
let c = fs.readFileSync('controllers/candidateController.js', 'utf8');

c = c.replace(/candidate\.team\.toString\(\)/g, 'candidate.team?.toString()');
c = c.replace(/req\.user\.team\.toString\(\)/g, 'req.user.team?.toString()');

fs.writeFileSync('controllers/candidateController.js', c);
console.log('Fixed candidate.team.toString()');
