const fs = require('fs');
let c = fs.readFileSync('routes/candidateRoutes.js', 'utf8');

c = c.replace(
    "router.route('/lookup').get(protect, authorize('admin', 'team_leader'), lookupCandidates);",
    "router.route('/lookup').get(protect, authorize('admin', 'team_leader', 'result_entry', 'judge'), lookupCandidates);"
);

c = c.replace(
    "router.route('/:id/registrations').get(protect, authorize('admin', 'team_leader'), getCandidateRegistrations);",
    "router.route('/:id/registrations').get(protect, authorize('admin', 'team_leader', 'result_entry', 'judge'), getCandidateRegistrations);"
);

fs.writeFileSync('routes/candidateRoutes.js', c);
console.log('Fixed auth for candidates routes');
