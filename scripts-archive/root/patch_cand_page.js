const fs = require('fs');
const p = 'admin-hudafestival-main/src/pages/CandidatesPage.jsx';
let code = fs.readFileSync(p, 'utf8');

// Add state
code = code.replace(
  /const \[editingCandidate, setEditingCandidate\] = useState\(null\);/,
  "const [editingCandidate, setEditingCandidate] = useState(null);\n  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);"
);

// Update fetch
code = code.replace(
  /const \[teamsRes, candidatesRes\] = await Promise\.all\(\[api\.get\('\/teams'\), api\.get\('\/candidates'\)\]\);\n\s*setTeams\(teamsRes\.data\);\n\s*setCandidates\(candidatesRes\.data\);/,
  "const [teamsRes, candidatesRes, settingsRes] = await Promise.all([api.get('/teams'), api.get('/candidates'), api.get('/settings')]);\n        setTeams(teamsRes.data);\n        setCandidates(candidatesRes.data);\n        if (settingsRes.data && settingsRes.data.isRegistrationOpen !== undefined) {\n          setIsRegistrationOpen(settingsRes.data.isRegistrationOpen);\n        }"
);

// Update header
code = code.replace(
  /<h1 className="text-2xl font-bold text-\[var\(--color-text-heading\)\]">\{isTeamLeader \? 'My Team Candidates' : 'Candidates'\}<\/h1>/,
  "<div className=\"flex items-center gap-3\">\n          <h1 className=\"text-2xl font-bold text-[var(--color-text-heading)]\">{isTeamLeader ? 'My Team Candidates' : 'Candidates'}</h1>\n          {!isTeamLeader && (\n            <span className={px-2 py-0.5 text-xs font-semibold rounded-full border \}>\n              Registration: {isRegistrationOpen ? 'Open' : 'Closed'}\n            </span>\n          )}\n        </div>"
);

fs.writeFileSync(p, code);
console.log('Patched CandidatesPage.jsx');
