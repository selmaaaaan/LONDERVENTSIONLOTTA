const fs = require('fs');

let code = fs.readFileSync('src/pages/result-entry/ResultDashboard.jsx', 'utf8');

// Rename Batch cards
// Drafts -> Draft Batches
code = code.replace(
    `<div className="text-lg font-bold text-[var(--color-text-heading)]">Drafts</div>`,
    `<div className="text-lg font-bold text-[var(--color-text-heading)]">Draft Batches</div>`
);

// Submitted -> Submitted Batches
code = code.replace(
    `<div className="text-lg font-bold text-[var(--color-text-heading)]">Submitted</div>`,
    `<div className="text-lg font-bold text-[var(--color-text-heading)]">Submitted Batches</div>`
);

// Published -> Published Batches
code = code.replace(
    `<div className="text-lg font-bold text-[var(--color-text-heading)]">Published</div>\n                                            <div className="text-sm text-[var(--color-text-muted)]">Live on public portal</div>`,
    `<div className="text-lg font-bold text-[var(--color-text-heading)]">Published Batches</div>\n                                            <div className="text-sm text-[var(--color-text-muted)]">Live on public portal</div>`
);

fs.writeFileSync('src/pages/result-entry/ResultDashboard.jsx', code);
console.log("Patched ResultDashboard labels");
