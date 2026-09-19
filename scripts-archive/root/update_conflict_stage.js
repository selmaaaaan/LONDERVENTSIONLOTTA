const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', 'utf8');

c = c.replace(
    `const [selectedCategory, setSelectedCategory] = useState('');`,
    `const [selectedCategory, setSelectedCategory] = useState('');\n    const [selectedStageType, setSelectedStageType] = useState('All');`
);

const oldCatSelect = `<div className="mb-6 border-b border-[var(--color-border)] pb-6">
                    <label className="block text-sm font-bold text-[var(--color-text-heading)] mb-2">Select Category</label>
                    <select
                        value={selectedCategory}
                        onChange={e => {
                            setSelectedCategory(e.target.value);
                            setProg1Code('');
                            setProg2Code('');
                        }}
                        className="w-full md:w-1/3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-body)] outline-none focus:border-[var(--color-primary)]"
                    >
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>`;

const newCatSelect = `<div className="mb-6 border-b border-[var(--color-border)] pb-6 flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-bold text-[var(--color-text-heading)] mb-2">Select Category</label>
                        <select
                            value={selectedCategory}
                            onChange={e => {
                                setSelectedCategory(e.target.value);
                                setProg1Code('');
                                setProg2Code('');
                            }}
                            className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-body)] outline-none focus:border-[var(--color-primary)]"
                        >
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-bold text-[var(--color-text-heading)] mb-2">Stage / Non-Stage</label>
                        <select
                            value={selectedStageType}
                            onChange={e => {
                                setSelectedStageType(e.target.value);
                                setProg1Code('');
                                setProg2Code('');
                            }}
                            className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-body)] outline-none focus:border-[var(--color-primary)]"
                        >
                            <option value="All">All Stages</option>
                            <option value="stage">Stage</option>
                            <option value="non-stage">Non-Stage</option>
                        </select>
                    </div>
                </div>`;

c = c.replace(oldCatSelect, newCatSelect);

// Fix datalist filtering
c = c.replace(
    /programmes\.filter\(p => !selectedCategory \|\| p\.category === selectedCategory\)/g,
    `programmes.filter(p => (!selectedCategory || p.category === selectedCategory) && (selectedStageType === 'All' || p.stageType === selectedStageType))`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', c, 'utf8');
console.log('Fixed stage filter');