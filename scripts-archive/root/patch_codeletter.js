const fs = require('fs');
const p = 'admin-hudafestival-main/src/pages/JurySlipsPage.jsx';
let code = fs.readFileSync(p, 'utf8');

// 1. Table display: blank the codeLetter cell (rendered in table body)
code = code.replace(
  `<td className="py-3 px-1 border border-slate-200 text-center font-bold text-blue-700 text-base align-middle">{reg.codeLetter || ''}</td>`,
  `<td className="py-3 px-1 border border-slate-200 align-middle"></td>`
);

// 2 & 3. Both export handlers: blank Code Letter (replaceAll since same string appears twice)
code = code.split("'Code Letter': reg.codeLetter || '',").join("'Code Letter': '',");

fs.writeFileSync(p, code);

const verify = fs.readFileSync(p, 'utf8');
console.log('codeLetter in display:', verify.includes('{reg.codeLetter') ? 'STILL THERE ✗' : 'REMOVED ✓');
console.log('codeLetter in export:', verify.includes("reg.codeLetter || ''") ? 'STILL THERE ✗' : 'REMOVED ✓');
