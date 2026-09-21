const fs = require('fs');

let code = fs.readFileSync('src/pages/result-entry/BatchPrintView.jsx', 'utf8');

// The line currently reads:
// const scoredResults = progResults.filter(r => r.position && r.position !== '-' && r.points > 0);
// It should be:
// const scoredResults = progResults.filter(r => r.rank && r.rank !== '-' && r.totalPoints > 0);

code = code.replace(
    "const scoredResults = progResults.filter(r => r.position && r.position !== '-' && r.points > 0);",
    "const scoredResults = progResults.filter(r => r.rank && r.rank !== '-' && r.totalPoints > 0);"
);

// We also need to replace the rendering logic
const oldTdPosition = `<td className="!text-black py-2 font-bold">{r.position}</td>`;
const newTdPosition = `<td className="!text-black py-2 font-bold">{r.rank}</td>`;

const oldTdPoints = `<td className="!text-black py-2 font-bold text-right">{r.points} pts</td>`;
const newTdPoints = `<td className="!text-black py-2 font-bold text-right">{r.totalPoints} pts</td>`;

const oldTdCandidateTeam = `<td className="!text-black py-2 text-gray-700">{r.team?.name || 'Unknown'}</td>`;
const newTdCandidateTeam = `<td className="!text-black py-2 text-gray-700">{r.candidate?.team?.name || r.team?.name || 'Unknown'}</td>`;
// Wait, Candidate.team populate might return the object, so `r.candidate.team.name` is the right path.

code = code.replace(oldTdPosition, newTdPosition);
code = code.replace(oldTdPoints, newTdPoints);
code = code.replace(oldTdCandidateTeam, newTdCandidateTeam);

fs.writeFileSync('src/pages/result-entry/BatchPrintView.jsx', code);
console.log("Patched BatchPrintView");
