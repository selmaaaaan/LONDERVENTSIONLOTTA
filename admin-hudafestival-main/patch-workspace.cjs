const fs = require('fs');
let content = fs.readFileSync('src/pages/result-entry/BatchWorkspace.jsx', 'utf8');

// 1. Change the button onClick
content = content.replace(
    '<button onClick={() => window.print()} className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-semibold hover:bg-[var(--color-surface)] flex items-center">',
    '<button onClick={() => window.open(`/result-entry/batches/${id}/print`, "_blank")} className="px-4 py-2 border border-[var(--color-border)] rounded-lg text-sm font-semibold hover:bg-[var(--color-surface)] flex items-center">'
);

// 2. Remove the entire print block. We will just use regex to remove from {/* --- PDF PRINT LAYOUT down to {/* Modals */}
const printBlockStart = content.indexOf('{/* --- PDF PRINT LAYOUT');
const modalsStart = content.indexOf('{/* Modals */}');

if (printBlockStart !== -1 && modalsStart !== -1) {
    const before = content.substring(0, printBlockStart);
    const after = content.substring(modalsStart);
    content = before + after;
}

fs.writeFileSync('src/pages/result-entry/BatchWorkspace.jsx', content);
console.log('BatchWorkspace.jsx updated');
