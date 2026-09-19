const fs = require('fs');

const files = [
    'admin-hudafestival-main/src/pages/RegistrationReviewPage.jsx',
    'admin-hudafestival-main/src/pages/ResultsPage.jsx',
    'admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx',
    'admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx',
    'admin-hudafestival-main/src/pages/TopicManagementPage.jsx',
    'admin-hudafestival-main/src/pages/ProgrammesPage.jsx',
    'admin-hudafestival-main/src/pages/CandidatesPage.jsx',
    'admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx',
    'admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx'
];

for (const file of files) {
    let c = fs.readFileSync(file, 'utf8');
    c = c.replace(/, 'GENERAL'\]/g, ']');
    fs.writeFileSync(file, c, 'utf8');
}

// Revert backend controller too
let c2 = fs.readFileSync('backend-hudafestival-main/controllers/teamController.js', 'utf8');
c2 = c2.replace(/&& category !== 'GENERAL'/g, '');
fs.writeFileSync('backend-hudafestival-main/controllers/teamController.js', c2, 'utf8');

console.log("Reverted GENERAL array additions");