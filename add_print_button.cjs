const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/CandidateProgrammeStatusPage.jsx', 'utf8');

const target = `<div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">{candidate.name}</h1>`;

const replacement = `<div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
                        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">{candidate.name}</h1>
                        <button onClick={() => window.print()} className="print:hidden mt-3 md:mt-0 flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                            <Printer size={16} /> Print Status
                        </button>
                    </div>`;

c = c.replace(target, replacement);

fs.writeFileSync('admin-hudafestival-main/src/pages/CandidateProgrammeStatusPage.jsx', c);
console.log('Added print button');
