const fs = require('fs');
let c = fs.readFileSync('src/pages/result-entry/ResultDashboard.jsx', 'utf8');

const t1 = `<h3 className="font-bold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">Programme Pipeline</h3>`;
const r1 = `<div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">Programme Pipeline</h3>
                            <button 
                                onClick={() => navigate('/result-entry/reports')}
                                className="px-3 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 rounded-md text-xs font-bold transition-colors"
                            >
                                View Analytics & Reports
                            </button>
                        </div>`;

if (c.includes(t1)) {
    c = c.replace(t1, r1);
    fs.writeFileSync('src/pages/result-entry/ResultDashboard.jsx', c);
    console.log("Updated ResultDashboard successfully!");
} else {
    console.log("Could not find targets in ResultDashboard.jsx");
}
