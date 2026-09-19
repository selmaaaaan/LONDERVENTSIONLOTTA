const fs = require('fs');
let c = fs.readFileSync('src/pages/RegistrationReviewPage.jsx', 'utf8');

if (!c.includes('AnimatedProgressBar')) {
  c = c.replace("import Button from '../components/Button';", "import Button from '../components/Button';\nimport AnimatedProgressBar from '@/components/smoothui/animated-progress-bar';");
}

const oldStatCard = `const StatCard = ({ label, value, accent }) => (
  <div className="flex flex-col gap-0.5 px-5 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</span>
    <span className="text-2xl font-bold" style={{ color: accent || 'var(--color-text-heading)' }}>{value}</span>
  </div>
);`;

const newStatCard = `const StatCard = ({ label, value, max, accent }) => (
  <div className="flex flex-col gap-1 px-5 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden relative">
    <div className="flex flex-col gap-0.5 z-10 relative">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</span>
        <span className="text-2xl font-bold" style={{ color: accent || 'var(--color-text-heading)' }}>{value}</span>
    </div>
    {max > 0 && max !== undefined && (
       <AnimatedProgressBar value={(value / max) * 100} color={accent || '#ea580c'} className="h-1.5 mt-2 rounded-full overflow-hidden" />
    )}
  </div>
);`;

c = c.replace(oldStatCard, newStatCard);
c = c.replace('<StatCard label="Total Submitted" value={totalCount} />', '<StatCard label="Total Submitted" value={totalCount} />');
c = c.replace('<StatCard label="Approved" value={approvedCount} accent="#10b981" />', '<StatCard label="Approved" value={approvedCount} max={totalCount} accent="#10b981" />');
c = c.replace('<StatCard label="Pending Review" value={pendingCount} accent="#f59e0b" />', '<StatCard label="Pending Review" value={pendingCount} max={totalCount} accent="#f59e0b" />');
c = c.replace('<StatCard label="Rejected" value={rejectedCount} accent="#ef4444" />', '<StatCard label="Rejected" value={rejectedCount} max={totalCount} accent="#ef4444" />');

fs.writeFileSync('src/pages/RegistrationReviewPage.jsx', c);
console.log('RegistrationReviewPage patched with AnimatedProgressBar');
