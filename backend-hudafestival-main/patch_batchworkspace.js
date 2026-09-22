const fs = require('fs');
const p = '../admin-hudafestival-main/src/pages/result-entry/BatchWorkspace.jsx';
let content = fs.readFileSync(p, 'utf8');

// Add state for categoryTeamToppers
content = content.replace('const [categoryToppers, setCategoryToppers] = useState({});', 'const [categoryToppers, setCategoryToppers] = useState({});\n    const [categoryTeamToppers, setCategoryTeamToppers] = useState({});');

// Set it in fetchBatchData
content = content.replace('setCategoryToppers(res.data.categoryToppers || {});', 'setCategoryToppers(res.data.categoryToppers || {});\n            setCategoryTeamToppers(res.data.categoryTeamToppers || {});');

// Wait, fetchProjection sets it too!
content = content.replace('setCategoryToppers(res.data.categoryToppers || {});', 'setCategoryToppers(res.data.categoryToppers || {});\n            setCategoryTeamToppers(res.data.categoryTeamToppers || {});');

// The above will replace BOTH occurrences if I loop, but replace only does first. Let me just use regex with global flag.
const stateSetRegex = /setCategoryToppers\(res\.data\.categoryToppers \|\| \{\}\);/g;
content = content.replace(stateSetRegex, 'setCategoryToppers(res.data.categoryToppers || {});\n            setCategoryTeamToppers(res.data.categoryTeamToppers || {});');

// Add the panel in JSX
const panelHtml = `
                                            {Object.entries(categoryToppers).map(([cat, tops]) => (
                                                <div key={cat} className="space-y-2">
                                                    <div className="font-bold text-sm text-[var(--color-text-heading)] border-b border-[var(--color-border)] pb-1">{cat}</div>
                                                    {tops.map((w, i) => (
                                                        <div key={i} className="flex justify-between items-center text-sm">
                                                            <div>
                                                                <span className="font-semibold text-[var(--color-text-heading)]">{w.name}</span>
                                                                <span className="text-xs text-[var(--color-text-muted)] ml-2">({w.teamName})</span>
                                                            </div>
                                                            <div className="font-bold text-[var(--color-primary)]">{w.points} pts</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>`;

// Wait, the new panel is "Category Team Leaders". Let's insert it AFTER the "Cumulative Individual Toppers" panel.
// We can just append a new panel using a regex or split on the closing tag of the Cumulative Individual Toppers div.

// The panel ends with:
// `                        </div>
//                     </div>
// ` (under Cumulative Individual Toppers)

const newPanel = `
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden mb-6">
                        <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-background)]">
                            <h3 className="text-lg font-bold text-[var(--color-text-heading)] flex items-center">
                                <Trophy size={20} className="mr-2 text-green-500" />
                                Category Team Leaders
                            </h3>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">Which team leads each category across all batches.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            {Object.keys(categoryTeamToppers).length === 0 ? (
                                <div className="text-center text-sm text-[var(--color-text-muted)]">No team points in categories yet.</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(categoryTeamToppers).map(([cat, leader]) => (
                                        <div key={cat} className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)]">
                                            <div className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-1">{cat}</div>
                                            <div className="font-bold text-[var(--color-text-heading)] mb-1">{leader.teamName}</div>
                                            <div className="text-sm font-bold text-green-600">{leader.points} pts</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
`;

// Insert it right before "Cumulative Leaderboard Projection" panel, or right after "Cumulative Individual Toppers".
// Let's find "Cumulative Leaderboard Projection" and insert BEFORE it.
const leaderboardPanelTarget = `                    {/* Right Col: Leaderboard & Toppers */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Cumulative Leaderboard Projection */}`;

const leaderboardPanelReplacement = `                    {/* Right Col: Leaderboard & Toppers */}
                    <div className="lg:col-span-1 space-y-6">
` + newPanel + `
                        {/* Cumulative Leaderboard Projection */}`;
content = content.replace(leaderboardPanelTarget, leaderboardPanelReplacement);

fs.writeFileSync(p, content);
console.log('BatchWorkspace patched with Category Team Leaders panel');
