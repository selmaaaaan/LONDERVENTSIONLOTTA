const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

if (!c.includes('/result-entry/candidate-status/:id')) {
    c = c.replace(
        '<Route path="/result-entry/search" element={<ProgrammeParticipantSearchPage />} />',
        '<Route path="/result-entry/search" element={<ProgrammeParticipantSearchPage />} />\n            <Route path="/result-entry/candidate-status/:id" element={<CandidateProgrammeStatusPage />} />'
    );
    fs.writeFileSync('src/App.jsx', c);
    console.log('Added route to App.jsx');
} else {
    console.log('Route already exists');
}
