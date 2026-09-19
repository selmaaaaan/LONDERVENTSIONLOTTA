const fs = require('fs');
let c = fs.readFileSync('backend-hudafestival-main/controllers/teamController.js', 'utf8');

c = c.replace(
    /\/\/ Hide programmes that don't require registration \(e\.g\. Whole Team ones\)\n        progQuery\.requiresRegistration = \{ \$ne: false \};/,
    ``
);

fs.writeFileSync('backend-hudafestival-main/controllers/teamController.js', c, 'utf8');
console.log("Reverted grid filter");