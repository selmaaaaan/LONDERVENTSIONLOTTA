const fs = require('fs');
const p = 'admin-hudafestival-main/src/pages/JurySlipsPage.jsx';
let code = fs.readFileSync(p, 'utf8');

// Replace py-2 with py-3 in the tds to give more breathing room
code = code.replace(/<td className="py-2/g, '<td className="py-3');
code = code.replace(/<td className="py-3 px-3 border border-slate-200 text-slate-800 text-\[11px\] font-bold align-top text-left">/, '<td className="py-3 px-3 border border-slate-200 text-slate-800 text-[12px] font-bold align-middle text-left">');
code = code.replace(/<td className="py-3 px-3 border border-slate-200 font-medium text-slate-800 text-\[11px\] align-top leading-tight">/, '<td className="py-3 px-3 border border-slate-200 font-bold text-slate-800 text-[12px] align-middle leading-tight">');
code = code.replace(/<td className="py-3 px-2 border border-slate-200 text-slate-600 font-semibold text-\[11px\] align-top">/, '<td className="py-3 px-2 border border-slate-200 text-slate-700 font-bold text-[12px] align-middle">');

code = code.replace(/align-top/g, 'align-middle');

fs.writeFileSync(p, code);
