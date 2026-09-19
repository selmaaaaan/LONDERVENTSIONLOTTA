const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', 'utf8');

c = c.replace(
    `    const [programmes, setProgrammes] = useState([]);`,
    `    const [programmes, setProgrammes] = useState([]);\n    const [categories, setCategories] = useState([]);\n    const [selectedCategory, setSelectedCategory] = useState('');`
);

c = c.replace(
    `api.get('/programmes')
            .then(res => setProgrammes(res.data))`,
    `api.get('/programmes')
            .then(res => {
                setProgrammes(res.data);
                const cats = [...new Set(res.data.map(p => p.category))].filter(Boolean).sort();
                setCategories(cats);
                if (cats.length > 0) setSelectedCategory(cats[0]);
            })`
);

const newUI = `            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
                <div className="mb-6 border-b border-[var(--color-border)] pb-6">
                    <label className="block text-sm font-bold text-[var(--color-text-heading)] mb-2">Select Category</label>
                    <select
                        value={selectedCategory}
                        onChange={e => {
                            setSelectedCategory(e.target.value);
                            setProg1('');
                            setProg2('');
                        }}
                        className="w-full md:w-1/3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-body)] outline-none focus:border-[var(--color-primary)]"
                    >
                        {categories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-[var(--color-text-heading)] mb-2">Programme 1</label>
                        <select
                            value={prog1}
                            onChange={e => setProg1(e.target.value)}
                            className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-body)] outline-none focus:border-[var(--color-primary)]"
                        >
                            <option value="">-- Select First Programme --</option>
                            {programmes.filter(p => p.category === selectedCategory).map(p => (
                                <option key={p._id} value={p._id}>[{p.code}] {p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[var(--color-text-heading)] mb-2">Programme 2</label>
                        <select
                            value={prog2}
                            onChange={e => setProg2(e.target.value)}
                            className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-body)] outline-none focus:border-[var(--color-primary)]"
                        >
                            <option value="">-- Select Second Programme --</option>
                            {programmes.filter(p => p.category === selectedCategory).map(p => (
                                <option key={p._id} value={p._id}>[{p.code}] {p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleCheck} loading={loading} disabled={!prog1 || !prog2} variant="primary" className="px-8">
                        Check Conflicts
                    </Button>
                </div>
            </div>`;

c = c.replace(/<div className="bg-\[var\(--color-surface\)\].*?Check Conflicts\n                    <\/Button>\n                <\/div>\n            <\/div>/s, newUI);

fs.writeFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', c, 'utf8');
console.log('Fixed ConflictCheckerPage UI');