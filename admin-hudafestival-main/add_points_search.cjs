const fs = require('fs');
let c = fs.readFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', 'utf8');

const target = `<span className="px-2 py-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md">{c?.category || '?"'}</span>
                                        <span className="px-2 py-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md">{c?.team?.name || 'Unknown Team'}</span>`;

const replacement = `<span className="px-2 py-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md">{c?.category || '?"'}</span>
                                        <span className="px-2 py-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-md">{c?.team?.name || 'Unknown Team'}</span>
                                        <span className="px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 rounded-md">Pts: {c?.totalPoints || 0}</span>`;

c = c.replace(target, replacement);
fs.writeFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', c);
console.log('Added total points to search results');
