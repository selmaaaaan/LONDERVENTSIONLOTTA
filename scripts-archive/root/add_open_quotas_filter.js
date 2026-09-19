const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', 'utf8');

// 1. Add State
c = c.replace(
    /const \[showOnlyPending, setShowOnlyPending\] = useState\(false\);/,
    `const [showOnlyPending, setShowOnlyPending] = useState(false);\n    const [showOpenQuotasOnly, setShowOpenQuotasOnly] = useState(false);`
);

// 2. Add filteredProgrammes hook
const filteredProgrammesHook = `
    const filteredProgrammes = useMemo(() => {
        return programmes.filter(p => {
            if (showOpenQuotasOnly) {
                return p.quotaInfo?.status === 'OPEN';
            }
            return true;
        });
    }, [programmes, showOpenQuotasOnly]);
`;
c = c.replace(
    /const stats = useMemo\(\(\) => \{/,
    `${filteredProgrammesHook}\n\n    const stats = useMemo(() => {`
);

// 3. Add UI Checkbox
const checkboxUI = `<label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input type="checkbox" checked={showOpenQuotasOnly} onChange={e => setShowOpenQuotasOnly(e.target.checked)} className="accent-[var(--color-primary)]" />
                            Show Open Quotas Only
                        </label>`;
c = c.replace(
    /<label className="flex items-center gap-2 text-sm font-medium cursor-pointer">\s*<input type="checkbox" checked=\{showOnlyPending\}/,
    `${checkboxUI}\n                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">\n                            <input type="checkbox" checked={showOnlyPending}`
);

// 4. Replace programmes.map in rendering
c = c.replace(
    /\{programmes\.map\(prog => \(/g,
    `{filteredProgrammes.map(prog => (`
);
c = c.replace(
    /\{programmes\.map\(prog => \{/g,
    `{filteredProgrammes.map(prog => {`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', c, 'utf8');
console.log("Done");