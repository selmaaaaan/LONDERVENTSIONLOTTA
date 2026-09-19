const fs = require('fs');

// 1. Patch ProgrammesPage.jsx
let pp = fs.readFileSync('src/pages/ProgrammesPage.jsx', 'utf8');

if (!pp.includes('AnimatedTabs')) {
  pp = pp.replace("import Button from '../components/Button';", "import Button from '../components/Button';\nimport { AnimatedTabs } from '@/components/smoothui/animated-tabs';");
}

const oldTabsProg = `{['ALL', 'Stage', 'Non-Stage'].map(stage => (
                  <button
                    key={stage}
                    className={\`px-3 py-1 rounded-full text-xs font-medium transition-colors \${stageFilter === stage ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]'}\`}
                    onClick={() => setStageFilter(stage)}
                  >
                    {stage === 'ALL' ? 'All Stages' : stage}
                  </button>
                ))}`;

const newTabsProg = `<AnimatedTabs
                  activeTab={stageFilter}
                  onChange={setStageFilter}
                  tabs={[
                    { id: 'ALL', label: 'All Stages' },
                    { id: 'Stage', label: 'Stage' },
                    { id: 'Non-Stage', label: 'Non-Stage' }
                  ]}
                  variant="segment"
                />`;

pp = pp.replace(oldTabsProg, newTabsProg);
fs.writeFileSync('src/pages/ProgrammesPage.jsx', pp);

// 2. Patch RegistrationReviewPage.jsx
let rrp = fs.readFileSync('src/pages/RegistrationReviewPage.jsx', 'utf8');

if (!rrp.includes('AnimatedTabs')) {
  rrp = rrp.replace("import AnimatedProgressBar from '@/components/smoothui/animated-progress-bar';", "import AnimatedProgressBar from '@/components/smoothui/animated-progress-bar';\nimport { AnimatedTabs } from '@/components/smoothui/animated-tabs';");
}

const oldTabsRRp1 = `{['all', 'pending', 'approved', 'rejected'].map(status => (
                  <button key={status} onClick={() => setStatusFilter(status)}
                    className={\`px-3 py-1.5 text-xs font-semibold rounded-full capitalize transition-colors \${
                      statusFilter === status 
                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-elevated)]'
                    }\`}
                  >
                    {status}
                  </button>
                ))}`;

// Wait, let's just regex replace the entire status mapping block.
const statusTabRegex = /\{\['all', 'pending', 'approved', 'rejected'\]\.map\(status => \([\s\S]*?<\/button>\s*\)\)\}/;
rrp = rrp.replace(statusTabRegex, `<AnimatedTabs
                  activeTab={statusFilter}
                  onChange={setStatusFilter}
                  tabs={[
                    { id: 'all', label: 'All' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'approved', label: 'Approved' },
                    { id: 'rejected', label: 'Rejected' }
                  ]}
                  variant="pill"
                />`);

const catTabRegex = /\{CATEGORIES\.map\(cat => \([\s\S]*?<\/button>\s*\)\)\}/;
rrp = rrp.replace(catTabRegex, `<AnimatedTabs
                  activeTab={categoryFilter}
                  onChange={setCategoryFilter}
                  tabs={CATEGORIES.map(cat => ({ id: cat, label: cat }))}
                  variant="pill"
                  className="flex-wrap"
                />`);

fs.writeFileSync('src/pages/RegistrationReviewPage.jsx', rrp);
console.log('Tabs patched');
