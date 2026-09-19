const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', 'utf8');

c = c.replace(
    `const [prog1, setProg1] = useState('');
    const [prog2, setProg2] = useState('');`,
    `const [prog1Code, setProg1Code] = useState('');
    const [prog2Code, setProg2Code] = useState('');`
);

// handleCheck update
const oldHandleCheck = `    const handleCheck = async () => {
        if (!prog1 || !prog2) return alert("Please select two programmes.");
        if (prog1 === prog2) return alert("Please select different programmes.");
        
        setLoading(true);
        try {
            const [res1, res2] = await Promise.all([
                api.get(\`/registrations?programme=\${prog1}&limit=1000\`),
                api.get(\`/registrations?programme=\${prog2}&limit=1000\`)
            ]);`;

const newHandleCheck = `    const handleCheck = async () => {
        const p1 = programmes.find(p => p.code.toLowerCase() === prog1Code.trim().toLowerCase());
        const p2 = programmes.find(p => p.code.toLowerCase() === prog2Code.trim().toLowerCase());
        if (!p1 || !p2) return alert("Please enter valid programme codes.");
        if (p1._id === p2._id) return alert("Please enter different programmes.");
        
        setLoading(true);
        try {
            const [res1, res2] = await Promise.all([
                api.get(\`/registrations?programme=\${p1._id}&limit=1000\`),
                api.get(\`/registrations?programme=\${p2._id}&limit=1000\`)
            ]);`;
            
c = c.replace(oldHandleCheck, newHandleCheck);

c = c.replace(
    `p1Name: programmes.find(p => p._id === prog1)?.name,
                p2Name: programmes.find(p => p._id === prog2)?.name,`,
    `p1Name: p1.name,
                p2Name: p2.name,`
);

c = c.replace(
    `setSelectedCategory(e.target.value);
                            setProg1('');
                            setProg2('');`,
    `setSelectedCategory(e.target.value);
                            setProg1Code('');
                            setProg2Code('');`
);

// UI inputs update
const oldInputs = `                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <Button onClick={handleCheck} loading={loading} disabled={!prog1 || !prog2} variant="primary" className="px-8">`;

const newInputs = `                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-[var(--color-text-heading)] mb-2">Programme 1 Code</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={prog1Code}
                                onChange={e => setProg1Code(e.target.value.toUpperCase())}
                                placeholder="e.g. BS1"
                                list="prog1-list"
                                className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-body)] outline-none focus:border-[var(--color-primary)]"
                            />
                            <datalist id="prog1-list">
                                {programmes.filter(p => !selectedCategory || p.category === selectedCategory).map(p => (
                                    <option key={p._id} value={p.code}>{p.name}</option>
                                ))}
                            </datalist>
                        </div>
                        {prog1Code && programmes.find(p => p.code.toLowerCase() === prog1Code.toLowerCase()) && (
                            <p className="text-xs text-emerald-500 mt-2 font-medium">✓ {programmes.find(p => p.code.toLowerCase() === prog1Code.toLowerCase()).name}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[var(--color-text-heading)] mb-2">Programme 2 Code</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={prog2Code}
                                onChange={e => setProg2Code(e.target.value.toUpperCase())}
                                placeholder="e.g. BS2"
                                list="prog2-list"
                                className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-body)] outline-none focus:border-[var(--color-primary)]"
                            />
                            <datalist id="prog2-list">
                                {programmes.filter(p => !selectedCategory || p.category === selectedCategory).map(p => (
                                    <option key={p._id} value={p.code}>{p.name}</option>
                                ))}
                            </datalist>
                        </div>
                        {prog2Code && programmes.find(p => p.code.toLowerCase() === prog2Code.toLowerCase()) && (
                            <p className="text-xs text-emerald-500 mt-2 font-medium">✓ {programmes.find(p => p.code.toLowerCase() === prog2Code.toLowerCase()).name}</p>
                        )}
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleCheck} loading={loading} disabled={!prog1Code || !prog2Code} variant="primary" className="px-8">`;

c = c.replace(oldInputs, newInputs);

// Red highlighting
c = c.replace(
    `className={item.conflict ? 'bg-rose-500/5' : ''}`,
    `className={item.conflict ? 'bg-rose-500/20 border-l-4 border-rose-600' : ''}`
);
c = c.replace(
    `className="font-bold text-[var(--color-text-heading)]"`,
    `className={\`font-bold \${item.conflict ? 'text-rose-700' : 'text-[var(--color-text-heading)]'}\`}`
);

fs.writeFileSync('admin-hudafestival-main/src/pages/ConflictCheckerPage.jsx', c, 'utf8');
console.log('Fixed inputs and highlighting');