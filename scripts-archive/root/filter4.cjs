const fs = require('fs');
const content = fs.readFileSync('actual-text-white.txt', 'utf8');
const lines = content.split('\\n');
lines.forEach(line => {
  if (line.includes('text-white')) {
     const hasColoredBg = line.includes('bg-[') || line.includes('bg-red') || line.includes('bg-emerald') || line.includes('bg-green') || line.includes('bg-blue') || line.includes('bg-[#') || line.includes('bg-amber') || line.includes('bg-indigo') || line.includes('bg-orange') || line.includes('bg-black');
     if (!hasColoredBg) {
         console.log(line.trim());
     }
  }
});
