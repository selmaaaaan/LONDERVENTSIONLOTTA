const fs = require('fs');
let content = fs.readFileSync('src/pages/JurySlipsPage.jsx', 'utf8');

// The suggestions dropdown
content = content.replace(/bg-white border border-slate-200/g, 'bg-[var(--color-surface)] border border-[var(--color-border)]');
content = content.replace(/bg-slate-50 border-b border-slate-100/g, 'bg-[var(--color-surface-elevated)] border-b border-[var(--color-border-subtle)]');
content = content.replace(/text-slate-800/g, 'text-[var(--color-text-heading)]');
content = content.replace(/text-slate-500/g, 'text-[var(--color-text-muted)]');
content = content.replace(/text-slate-700/g, 'text-[var(--color-text-body)]');
content = content.replace(/text-slate-600/g, 'text-[var(--color-text-body)]');
content = content.replace(/text-slate-400/g, 'text-[var(--color-text-muted)]');
content = content.replace(/bg-slate-50/g, 'bg-[var(--color-surface-elevated)]');
content = content.replace(/bg-slate-200/g, 'bg-[var(--color-border)]');
content = content.replace(/border-slate-100/g, 'border-[var(--color-border-subtle)]');
content = content.replace(/border-slate-200/g, 'border-[var(--color-border)]');
content = content.replace(/bg-white/g, 'bg-[var(--color-surface)]');

fs.writeFileSync('src/pages/JurySlipsPage.jsx', content);
console.log('JurySlipsPage fixed');
