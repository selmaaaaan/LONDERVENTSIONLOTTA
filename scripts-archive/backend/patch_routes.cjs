const fs = require('fs');
let code = fs.readFileSync('routes/candidateRoutes.js', 'utf8');

// Update destructuring from candidateController
code = code.replace(
    'getCandidateResults,\n}',
    'getCandidateResults,\n    lookupCandidates,\n    getCandidateRegistrations,\n}'
);

// Add lookup route BEFORE /:id
const lookupRoute = `
router.route('/lookup').get(protect, authorize('admin', 'judge', 'team_leader'), lookupCandidates);
`;
code = code.replace('router.route(\'/search\').get(searchCandidates);', 'router.route(\'/search\').get(searchCandidates);\n' + lookupRoute);

// Add registrations route AFTER /:id/results
const regRoute = `
router.route('/:id/registrations').get(protect, authorize('admin', 'judge', 'team_leader'), getCandidateRegistrations);
`;
code = code.replace('router.route(\'/:id/results\').get(getCandidateResults);', 'router.route(\'/:id/results\').get(getCandidateResults);\n' + regRoute);

fs.writeFileSync('routes/candidateRoutes.js', code);
