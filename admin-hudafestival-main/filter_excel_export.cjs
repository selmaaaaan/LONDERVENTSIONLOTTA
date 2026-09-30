const fs = require('fs');
let c = fs.readFileSync('src/pages/result-entry/ResultReportsPage.jsx', 'utf8');

c = c.replace(
    "const sorted = candidates.sort((a, b) => {",
    `
            // EXCLUDE TEAM DUMMY CANDIDATES
            const EXCLUDED_NAMES = ['tahrir', 'bastille', 'syntagma', 'tiananmen', 'tahrir-team', 'bastille-team', 'syntagma-team', 'tiananmen-team'];
            const validCandidates = candidates.filter(c => 
                !EXCLUDED_NAMES.includes((c.name || '').toLowerCase().trim()) && 
                (c.classLevel || '').toUpperCase() !== 'TEAM'
            );

            const sorted = validCandidates.sort((a, b) => {`
);

fs.writeFileSync('src/pages/result-entry/ResultReportsPage.jsx', c);
console.log('Added filter to Excel export');
