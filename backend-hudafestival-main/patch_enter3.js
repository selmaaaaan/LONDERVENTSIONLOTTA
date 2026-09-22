const fs = require('fs');
const p = '../admin-hudafestival-main/src/pages/result-entry/EnterResultPage.jsx';
let content = fs.readFileSync(p, 'utf8');

// 1. Add state for expandedGroups
content = content.replace('const [candidates, setCandidates] = useState([]);', 'const [candidates, setCandidates] = useState([]);\n    const [expandedGroups, setExpandedGroups] = useState({});');

// 2. Change the mapping logic
const mapTarget = `                        // Flatten or Group candidates
            let allCands = [];
            if (prog.format === 'Group' || prog.category === 'KULLIYYAH') {
                regs.forEach(r => {
                    if (r.candidates && r.candidates.length > 0) {
                        const rep = r.candidates[0];
                        allCands.push({
                            ...rep,
                            name: \`\${rep.name} and team (\${r.team?.name || 'Unknown'})\`,
                            _originalCandidates: r.candidates,
                            isGroupRow: true
                        });
                    }
                });
            } else {
                regs.forEach(r => {
                    if(r.candidates) allCands = allCands.concat(r.candidates);
                });
            }`;

const mapReplacement = `                        // Flatten or Group candidates
            let allCands = [];
            if (prog.format === 'Group' || prog.category === 'KULLIYYAH') {
                regs.forEach(r => {
                    if (r.candidates && r.candidates.length > 0) {
                        const rep = r.candidates[0];
                        allCands.push({
                            ...rep,
                            name: r.team?.name || 'Unknown Team',
                            _originalCandidates: r.candidates,
                            isGroupRow: true
                        });
                    }
                });
            } else {
                regs.forEach(r => {
                    if(r.candidates) allCands = allCands.concat(r.candidates);
                });
            }`;

content = content.replace(mapTarget, mapReplacement);

// 3. Change JSX to add expand/collapse
const jsxTarget = `                                                <td className="px-6 py-4">
    <div className="flex justify-between items-start">
        <div>
            <div className="font-semibold text-[var(--color-text-heading)]">{candidate.name}</div>
            <div className="text-sm text-[var(--color-text-muted)]">{candidate.chestNo}</div>
        </div>
        {hasApproved && rData.status === 'approved' && (
            <button 
                onClick={() => handleDeleteSingleResult(candidate._id, candidate.name)}
                className="text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors ml-4" 
                title="Delete Live Result"
            >
                <Trash2 size={16} />
            </button>
        )}
    </div>
</td>`;

const jsxReplacement = `                                                <td className="px-6 py-4">
    <div className="flex justify-between items-start">
        <div className="w-full">
            <div className="font-semibold text-[var(--color-text-heading)] uppercase tracking-wide">{candidate.name}</div>
            {!candidate.isGroupRow && (
                <div className="text-sm text-[var(--color-text-muted)]">{candidate.chestNo}</div>
            )}
            
            {candidate.isGroupRow && candidate._originalCandidates && (
                <div className="mt-2">
                    <button 
                        onClick={() => setExpandedGroups(prev => ({...prev, [candidate._id]: !prev[candidate._id]}))}
                        className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center"
                    >
                        {expandedGroups[candidate._id] ? 'Hide Members' : 'Show Members (' + candidate._originalCandidates.length + ')'}
                    </button>
                    {expandedGroups[candidate._id] && (
                        <div className="mt-2 pl-2 border-l-2 border-[var(--color-primary)]/30 space-y-1">
                            {candidate._originalCandidates.map(c => (
                                <div key={c._id} className="text-xs text-[var(--color-text-muted)]">
                                    <span className="font-medium text-gray-700">{c.name}</span> <span className="opacity-70">({c.chestNo})</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
        {hasApproved && rData.status === 'approved' && (
            <button 
                onClick={() => handleDeleteSingleResult(candidate._id, candidate.name)}
                className="text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors ml-4 flex-shrink-0" 
                title="Delete Live Result"
            >
                <Trash2 size={16} />
            </button>
        )}
    </div>
</td>`;

content = content.replace(jsxTarget, jsxReplacement);
fs.writeFileSync(p, content);
console.log('EnterResultPage patched for UX refinement');
