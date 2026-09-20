const fs = require('fs');
let content = fs.readFileSync('src/pages/ProgrammeJurySlipPage.jsx', 'utf-8');

content = content.replace(/className=\{\\\`flex w-full flex-1 \\\$\{idx !== 7 \? 'border-b-\[1.5px\] border-black' : ''\}\\\`\}/, "className={`flex w-full flex-1 ${idx !== 7 ? 'border-b-[1.5px] border-black' : ''}`}");

fs.writeFileSync('src/pages/ProgrammeJurySlipPage.jsx', content);
