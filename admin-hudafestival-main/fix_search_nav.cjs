const fs = require('fs');
let c = fs.readFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', 'utf8');

c = c.replace(
    "onClick={() => c?._id && navigate(`/candidate-status/${c._id}`)}",
    "onClick={() => c?._id && navigate(window.location.pathname.includes('/result-entry') ? `/result-entry/candidate-status/${c._id}` : `/candidate-status/${c._id}`)}"
);

fs.writeFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', c);
console.log('Fixed navigation path for candidate status');
