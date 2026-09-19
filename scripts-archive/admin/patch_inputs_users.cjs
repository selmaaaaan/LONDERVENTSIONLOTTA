const fs = require('fs');
let c = fs.readFileSync('src/pages/UsersPage.jsx', 'utf8');

if (!c.includes('AnimatedInput')) {
  c = c.replace("import Button from '../components/Button';", "import Button from '../components/Button';\nimport { AnimatedInput } from '@/components/smoothui/animated-input';");
}

// Fix Add Team Form Inputs
c = c.replace(/<input\s+type="text"\s+value=\{teamForm\.name\}\s+onChange=\{e => setTeamForm\(\{ \.\.\.teamForm, name: e\.target\.value \}\)\}\s+className="w-full [^"]+"\s+placeholder="Enter team name"\s+required\s+\/>/g,
  '<AnimatedInput label="Team Name" type="text" value={teamForm.name} onChange={val => setTeamForm({ ...teamForm, name: val })} placeholder="Enter team name" required />'
);
c = c.replace(/<input\s+type="color"\s+value=\{teamForm\.color\}\s+onChange=\{e => setTeamForm\(\{ \.\.\.teamForm, color: e\.target\.value \}\)\}\s+className="h-10 w-20 [^"]+"\s+\/>/g,
  '<AnimatedInput label="Team Color" type="color" value={teamForm.color} onChange={val => setTeamForm({ ...teamForm, color: val })} className="h-10 w-20" />'
);

// Fix Add Leader Form Inputs
c = c.replace(/<input\s+type="text"\s+value=\{leaderForm\.userName\}\s+onChange=\{e => setLeaderForm\(\{ \.\.\.leaderForm, userName: e\.target\.value \}\)\}\s+className="w-full [^"]+"\s+placeholder="Username \(e.g., team_b_leader\)"\s+required\s+\/>/g,
  '<AnimatedInput label="Leader Username" type="text" value={leaderForm.userName} onChange={val => setLeaderForm({ ...leaderForm, userName: val })} placeholder="Username (e.g., team_b_leader)" required />'
);
c = c.replace(/<input\s+type="password"\s+value=\{leaderForm\.password\}\s+onChange=\{e => setLeaderForm\(\{ \.\.\.leaderForm, password: e\.target\.value \}\)\}\s+className="w-full [^"]+"\s+placeholder="Password"\s+required\s+\/>/g,
  '<AnimatedInput label="Leader Password" type="password" value={leaderForm.password} onChange={val => setLeaderForm({ ...leaderForm, password: val })} placeholder="Password" required />'
);

// Fix Reset Password Inputs
c = c.replace(/<input type="text" required value=\{resetForm\.userName\} onChange=\{e => setResetForm\(\{\.\.\.resetForm, userName: e\.target\.value\}\)\} className="w-full [^"]+" placeholder="e\.g\. judge_admin" \/>/g,
  '<AnimatedInput label="Username" type="text" required value={resetForm.userName} onChange={val => setResetForm({...resetForm, userName: val})} placeholder="e.g. judge_admin" />'
);
c = c.replace(/<input type="password" required minLength=\{6\} value=\{resetForm\.newPassword\} onChange=\{e => setResetForm\(\{\.\.\.resetForm, newPassword: e\.target\.value\}\)\} className="w-full [^"]+" placeholder="Enter new password" \/>/g,
  '<AnimatedInput label="New Password" type="password" required value={resetForm.newPassword} onChange={val => setResetForm({...resetForm, newPassword: val})} placeholder="Enter new password" />'
);

// Remove duplicate labels for Reset form since AnimatedInput has built-in labels
c = c.replace(/<label className="block text-sm font-medium mb-1">Username<\/label>\s*<AnimatedInput/g, '<AnimatedInput');
c = c.replace(/<label className="block text-sm font-medium mb-1">New Password<\/label>\s*<AnimatedInput/g, '<AnimatedInput');

fs.writeFileSync('src/pages/UsersPage.jsx', c);
console.log("UsersPage inputs patched");
