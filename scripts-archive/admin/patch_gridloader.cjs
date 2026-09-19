const fs = require('fs');
const files = [
  'src/pages/CandidateProgrammeStatusPage.jsx',
  'src/pages/DashboardPage.jsx',
  'src/pages/ProgrammeParticipantSearchPage.jsx',
  'src/pages/SettingsPage.jsx',
  'src/pages/UsersPage.jsx'
];

const importStr = "import GridLoader from '@/components/smoothui/grid-loader';\n";

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  if (!c.includes('import GridLoader')) {
    c = importStr + c;
    fs.writeFileSync(f, c);
    console.log('Patched', f);
  }
}
