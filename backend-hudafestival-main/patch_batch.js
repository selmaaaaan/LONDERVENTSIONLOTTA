const fs = require('fs');
const p = '../admin-hudafestival-main/src/pages/result-entry/BatchWorkspace.jsx';
let content = fs.readFileSync(p, 'utf8');

content = content.replace('const [editingProgramme, setEditingProgramme] = useState(null);', 'const [editingProgramme, setEditingProgramme] = useState(null);\n    const [selectedProgrammeDrilldown, setSelectedProgrammeDrilldown] = useState(null);');

const cardHtml = '<div key={p._id} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex justify-between items-center group">';
const cardNew = '<div key={p._id} onClick={() => setSelectedProgrammeDrilldown(p)} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl flex justify-between items-center group cursor-pointer hover:border-[var(--color-primary)]">';
content = content.replace(cardHtml, cardNew);

content = content.replace('onClick={() => setEditingProgramme(p)}', 'onClick={(e) => { e.stopPropagation(); setEditingProgramme(p); }}');
content = content.replace('onClick={() => detachProgramme(p._id)}', 'onClick={(e) => { e.stopPropagation(); detachProgramme(p._id); }}');

const drilldownStr = `
const ProgrammeDrilldownModal = ({ programme, results, onClose }) => {
    let displayResults = results;
    if (programme.format === 'Group' || programme.category === 'KULLIYYAH') {
        const teamMap = {};
        displayResults.forEach(r => {
            const tId = r.candidate?.team?._id || r.candidate?.team || r.team?._id || r.team || 'unknown';
            if (!teamMap[tId]) teamMap[tId] = { ...r, _groupNames: [] };
            if (r.candidate && r.candidate.name) teamMap[tId]._groupNames.push(r.candidate.name);
        });
        displayResults = Object.values(teamMap).map(r => {
            if (r._groupNames && r._groupNames.length > 0) {
                r.candidate = { ...r.candidate, name: r._groupNames.join(', ') };
            }
            return r;
        });
    }

    displayResults = displayResults.filter(r => r.rank || r.grade || r.totalPoints > 0).sort((a, b) => {
        if (a.rank && b.rank) return a.rank - b.rank;
        if (a.rank && !b.rank) return -1;
        if (!a.rank && b.rank) return 1;
        return (b.totalPoints || 0) - (a.totalPoints || 0);
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{programme.name}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Programme Results Drill-down</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">X</button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {displayResults.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">No scored results found.</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-900 border-b">
                                <tr>
                                    <th className="px-4 py-3">Candidate</th>
                                    <th className="px-4 py-3">Team</th>
                                    <th className="px-4 py-3 text-center">Pos</th>
                                    <th className="px-4 py-3 text-center">Grade</th>
                                    <th className="px-4 py-3 text-right">Pts</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {displayResults.map((r, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-3 font-medium">{r.candidate?.name || 'Unknown'}</td>
                                        <td className="px-4 py-3 text-gray-600">{r.candidate?.team?.name || r.team?.name || 'Unknown'}</td>
                                        <td className="px-4 py-3 text-center font-bold">{r.rank || '-'}</td>
                                        <td className="px-4 py-3 text-center font-bold">{r.grade || '-'}</td>
                                        <td className="px-4 py-3 text-right font-bold">{r.totalPoints || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};
`;

content = content.replace('export default function BatchWorkspace', drilldownStr + '\nexport default function BatchWorkspace');

const renderTarget = '{editingProgramme && (';
const renderModal = `{selectedProgrammeDrilldown && (
                  <ProgrammeDrilldownModal programme={selectedProgrammeDrilldown} results={batchResults.filter(r => r.programme && r.programme._id === selectedProgrammeDrilldown._id)} onClose={() => setSelectedProgrammeDrilldown(null)} />
              )}
              ` + renderTarget;
content = content.replace(renderTarget, renderModal);

fs.writeFileSync(p, content);
console.log('Patched');
