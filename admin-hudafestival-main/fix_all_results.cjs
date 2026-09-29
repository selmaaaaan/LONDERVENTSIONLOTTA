const fs = require('fs');
let c = fs.readFileSync('src/pages/result-entry/AllResultsPage.jsx', 'utf8');

const target = `<div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-heading)]">All Results</h1>
                    <p className="text-[var(--color-text-muted)] mt-1">Full pipeline view of all programmes.</p>
                </div>
            </div>`;

const replace = `<div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-text-heading)]">All Results</h1>
                    <p className="text-[var(--color-text-muted)] mt-1">Full pipeline view of all programmes.</p>
                </div>
                <button 
                    onClick={() => window.open('/result-entry/all/print', '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Export All as PDF
                </button>
            </div>`;

c = c.replace(target, replace);
fs.writeFileSync('src/pages/result-entry/AllResultsPage.jsx', c);
console.log('Button added to AllResultsPage');
