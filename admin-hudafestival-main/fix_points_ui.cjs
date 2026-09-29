const fs = require('fs');
let c = fs.readFileSync('src/pages/CandidateProgrammeStatusPage.jsx', 'utf8');
const target = `<span className="text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 rounded-full border border-[var(--color-primary)]/20">{candidate.team?.name || 'Unknown Team'}</span>`;
const replacement = target + `\n<span className="text-sm font-medium text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">Total Points: {candidate.totalPoints || 0}</span>`;

if (c.includes(target)) {
    c = c.replace(target, replacement);
    fs.writeFileSync('src/pages/CandidateProgrammeStatusPage.jsx', c);
    console.log('Fixed Frontend');
} else {
    console.log('Target not found in frontend');
}
