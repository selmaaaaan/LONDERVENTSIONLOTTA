const fs = require('fs');
let txt = fs.readFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', 'utf8');

// 1. Remove states
txt = txt.replace(/const \[teams, setTeams\] = useState\(\[\]\);\n\s*const \[teamLeaders, setTeamLeaders\] = useState\(\[\]\);\n/, '');
txt = txt.replace(/const \[showTeamModal, setShowTeamModal\].*?const \[showConfirmDeleteLeader, setShowConfirmDeleteLeader\] = useState\(false\);/s, '');
txt = txt.replace(/const \[editingTeam, setEditingTeam\].*?const \[deletingLeader, setDeletingLeader\] = useState\(null\);/s, '');
txt = txt.replace(/const \[teamForm, setTeamForm\].*?const \[leaderForm, setLeaderForm\] = useState\(\{.*\}\);/s, '');

// 2. Remove team and leader API fetch
txt = txt.replace(/api\.get\('\/teams'\),/, '');
txt = txt.replace(/api\.get\('\/auth\/team-leaders'\),/, '');
txt = txt.replace(/setTeams\(teamsRes\.data \|\| \[\]\);\n\s*setTeamLeaders\(leadersRes\.data \|\| \[\]\);\n/, '');

// 3. Remove team and leader actions
txt = txt.replace(/\/\/ Team Actions.*?const currentTheme/s, 'const currentTheme');

// 4. Remove the Teams and Team Leaders grid section
txt = txt.replace(/<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">.*?\{\/\* Team Modal \*\//s, '{/* Team Modal */');

// 5. Remove the Team and Leader modals and delete dialogs
txt = txt.replace(/\{\/\* Team Modal \*\/.*?<ConfirmDialog\s*open=\{showConfirmToggleReg\}/s, '<ConfirmDialog\n        open={showConfirmToggleReg}');

fs.writeFileSync('admin-hudafestival-main/src/pages/SettingsPage.jsx', txt);
