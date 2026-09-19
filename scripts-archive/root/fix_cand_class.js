const fs = require('fs');
const p = 'admin-hudafestival-main/src/pages/CandidatesPage.jsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  /<span className=\{px-2 py-0\.5 text-xs font-semibold rounded-full border \}>/g,
  "<span className={'px-2 py-0.5 text-xs font-semibold rounded-full border ' + (isRegistrationOpen ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200')}>"
);

fs.writeFileSync(p, code);
