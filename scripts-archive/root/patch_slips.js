const fs = require('fs');
const p = 'admin-hudafestival-main/src/pages/JurySlipsPage.jsx';
let code = fs.readFileSync(p, 'utf8');

// Replace table header widths and alignments
code = code.replace(
  /<th className="py-3 px-2 border border-blue-400\/30 w-24">CODE<br\/>LETTER<\/th>/,
  '<th className="py-3 px-2 border border-blue-400/30 w-16 text-center">CODE<br/>LETTER</th>'
);
code = code.replace(
  /<th className="py-3 px-3 border border-blue-400\/30 w-32">AD NO<\/th>/,
  '<th className="py-3 px-3 border border-blue-400/30 w-16 text-left">AD NO</th>'
);
code = code.replace(
  /<th className="py-3 px-2 border border-blue-400\/30 w-24">TEAM<\/th>/,
  '<th className="py-3 px-2 border border-blue-400/30 w-24 text-left">TEAM</th>'
);
code = code.replace(
  /<th className="py-3 px-1 border border-blue-400\/30 w-16">POSITION<\/th>/,
  '<th className="py-3 px-1 border border-blue-400/30 w-16">POSITION</th>'
);
code = code.replace(
  /<th className="py-3 px-1 border border-blue-400\/30 w-12">GRADE<\/th>/,
  '<th className="py-3 px-1 border border-blue-400/30 w-12">GRADE</th>'
);
code = code.replace(
  /<th className="py-3 px-2 border border-blue-400\/30 w-24">REMARKS<\/th>/,
  '<th className="py-3 px-2 border border-blue-400/30 w-48">REMARKS</th>'
);

// Replace table data alignments
code = code.replace(
  /<td className="py-2 px-2 border border-slate-200 text-slate-800 text-\[11px\] font-bold align-top">/g,
  '<td className="py-2 px-3 border border-slate-200 text-slate-800 text-[11px] font-bold align-top text-left">'
);

fs.writeFileSync(p, code);
