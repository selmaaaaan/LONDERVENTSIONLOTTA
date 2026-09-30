const fs = require('fs');
let c = fs.readFileSync('src/pages/CandidateProgrammeStatusPage.jsx', 'utf8');

const target = `<button onClick={() => navigate(-1)} className="flex items-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] mb-2 transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Search
            </button>`;

const replacement = `<div className="flex items-center justify-between mb-4 print:hidden">
                <button onClick={() => navigate(-1)} className="flex items-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors">
                    <ArrowLeft size={16} className="mr-1" /> Back to Search
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-heading)] rounded-lg transition-colors">
                    <Printer size={16} /> Print Status
                </button>
            </div>`;

c = c.replace(target, replacement);
fs.writeFileSync('src/pages/CandidateProgrammeStatusPage.jsx', c);
console.log('Added print button accurately');
