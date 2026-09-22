const fs = require('fs');
const p = '../admin-hudafestival-main/src/components/ScoreBreakdownModal.jsx';
let content = fs.readFileSync(p, 'utf8');

const target = `                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {results.map((r, i) => (`;

const replacement = `                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {(() => {
                                        let displayResults = results;
                                        if (entity.type === 'team') {
                                            const grouped = {};
                                            displayResults.forEach(r => {
                                                if (r.programme?.format === 'Group' || r.programme?.category === 'KULLIYYAH') {
                                                    const pid = r.programme._id;
                                                    if (!grouped[pid]) {
                                                        grouped[pid] = { ...r, _groupNames: [] };
                                                    }
                                                    if (r.candidate && r.candidate.name) grouped[pid]._groupNames.push(r.candidate.name);
                                                } else {
                                                    grouped[r._id || Math.random()] = r;
                                                }
                                            });
                                            displayResults = Object.values(grouped).map(r => {
                                                if (r._groupNames && r._groupNames.length > 0) {
                                                    r.candidate = { ...r.candidate, name: r._groupNames.join(', ') };
                                                }
                                                return r;
                                            });
                                        }
                                        return displayResults.map((r, i) => (`;
content = content.replace(target, replacement);

const totalPtsTarget = `const totalPoints = results.reduce((sum, r) => sum + (r.totalPoints || 0), 0);`;
const totalPtsReplacement = `
    let displayResults = results;
    if (entity.type === 'team') {
        const grouped = {};
        displayResults.forEach(r => {
            if (r.programme?.format === 'Group' || r.programme?.category === 'KULLIYYAH') {
                const pid = r.programme._id;
                if (!grouped[pid]) grouped[pid] = r;
            } else {
                grouped[r._id || Math.random()] = r;
            }
        });
        displayResults = Object.values(grouped);
    }
    const totalPoints = displayResults.reduce((sum, r) => sum + (r.totalPoints || 0), 0);
`;
content = content.replace(totalPtsTarget, totalPtsReplacement);

// Close the IIFE in JSX map
const tbodyCloseTarget = `                                        </tr>
                                    ))}
                                </tbody>`;
const tbodyCloseReplacement = `                                        </tr>
                                    ));
                                })()}
                                </tbody>`;
content = content.replace(tbodyCloseTarget, tbodyCloseReplacement);

fs.writeFileSync(p, content);
console.log('ScoreBreakdownModal patched');
