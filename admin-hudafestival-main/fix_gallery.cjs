const fs = require('fs');
const file = 'C:/Users/SSU/Downloads/Huda Festival/admin-hudafestival-main/src/pages/GalleryPage.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetLF = `<input
                type="text"
                value={day}
                onChange={e => setDay(e.target.value)}
                placeholder="e.g., Day 1, Grand Finale"
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
              />`;

const targetCRLF = targetLF.replace(/\n/g, '\r\n');

const replacement = `<select value={day} onChange={e => setDay(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)]">
                <option value="">Select day…</option>
                <option value="Day 1">Day 1</option>
                <option value="Day 2">Day 2</option>
                <option value="Day 3">Day 3</option>
              </select>`;

content = content.replace(targetLF, replacement);
content = content.replace(targetCRLF, replacement);
fs.writeFileSync(file, content);
console.log("Replaced!");
