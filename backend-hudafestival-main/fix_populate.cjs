const fs = require('fs');
let c = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');
c = c.replace(/select: 'name admissionNo team'/g, "select: 'name admissionNo team classLevel'");
fs.writeFileSync('routes/resultEntryRoutes.js', c);
console.log('Updated resultEntryRoutes.js');
