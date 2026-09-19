const fs = require('fs');
const content = fs.readFileSync('text-white-lines.txt', 'utf8');
const lines = content.split('\\n');
lines.forEach(line => {
  if (line.includes('text-white') && !line.includes('bg-[var(--color-primary)]') && !line.includes('bg-red') && !line.includes('bg-green') && !line.includes('bg-blue') && !line.includes('bg-amber')) {
     console.log(line);
  }
});
