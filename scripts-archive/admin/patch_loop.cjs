const fs = require('fs');
let c = fs.readFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', 'utf8');

c = c.replace(
    /const handleCandidateSearch = async \(\) => {/,
    "const handleCandidateSearch = async () => {\n        if (loadingCand) return;"
);

c = c.replace(
    /onKeyDown=\{\(e\) => e.key === 'Enter' && handleCandidateSearch\(\)\}/,
    "onKeyDown={(e) => e.key === 'Enter' && !loadingCand && handleCandidateSearch()}"
);

fs.writeFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', c);
console.log("Patched");
