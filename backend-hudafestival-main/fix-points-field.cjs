const fs = require('fs');

let rw = fs.readFileSync('routes/resultEntryRoutes.js', 'utf8');

rw = rw.replace(/candidate\.points =/g, "candidate.totalPoints =");
rw = rw.replace(/\(candidate\.points/g, "(candidate.totalPoints");
rw = rw.replace(/team\.points =/g, "team.totalPoints =");
rw = rw.replace(/\(team\.points/g, "(team.totalPoints");
rw = rw.replace(/candidate\.points \+=/g, "candidate.totalPoints +=");
rw = rw.replace(/team\.points \+=/g, "team.totalPoints +=");

fs.writeFileSync('routes/resultEntryRoutes.js', rw);
