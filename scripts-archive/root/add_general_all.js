const fs = require('fs');
const path = require('path');

const files = [
    'admin-hudafestival-main/src/pages/RegistrationReviewPage.jsx',
    'admin-hudafestival-main/src/pages/ResultsPage.jsx',
    'admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx',
    'admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx',
    'admin-hudafestival-main/src/pages/TopicManagementPage.jsx',
    'admin-hudafestival-main/src/pages/ProgrammesPage.jsx',
    'admin-hudafestival-main/src/pages/CandidatesPage.jsx'
];

for (const file of files) {
    let c = fs.readFileSync(file, 'utf8');
    
    // For arrays starting with 'All'
    c = c.replace(
        /const CATEGORIES = \['All', 'BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'\];/g,
        `const CATEGORIES = ['All', 'BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH', 'GENERAL'];`
    );
    
    // For ProgrammesPage.jsx (no 'All')
    c = c.replace(
        /const categories = \['BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'\];/g,
        `const categories = ['BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH', 'GENERAL'];`
    );

    // For CandidatesPage.jsx (uses 'ALL' instead of 'All' maybe?)
    c = c.replace(
        /const categories = \['ALL', 'BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'\];/g,
        `const categories = ['ALL', 'BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH', 'GENERAL'];`
    );

    fs.writeFileSync(file, c, 'utf8');
}
console.log("Done");