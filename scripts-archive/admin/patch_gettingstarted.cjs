const fs = require('fs');
let c = fs.readFileSync('src/components/GettingStartedCard.jsx', 'utf8');

c = c.replace(
  "import { ChevronDown, ChevronUp } from 'lucide-react';",
  "import { ChevronDown, ChevronUp } from 'lucide-react';\nimport AnimatedProgressBar from '@/components/smoothui/animated-progress-bar';"
);

c = c.replace(
  /<div className="w-full bg-\[\S+\] border border-\[\S+\] rounded-full h-3 overflow-hidden">\s*<div\s*className="bg-\[\S+\] h-full rounded-full transition-all duration-1000"\s*style={{ width: `\${item.pct}%` }}\s*\/>\s*<\/div>/g,
  '<AnimatedProgressBar value={item.pct} color="var(--color-primary)" className="h-3 rounded-full overflow-hidden" />'
);

c = c.replace(
  /<div className="w-full bg-\[\S+\] border border-\[\S+\] rounded-full h-2\.5 overflow-hidden">\s*<div className="bg-\[\S+\] h-full rounded-full" style={{ width: `\${cat.registration.percentage}%` }} \/>\s*<\/div>/g,
  '<AnimatedProgressBar value={cat.registration.percentage} color="var(--color-primary)" className="h-2.5 rounded-full overflow-hidden" />'
);

c = c.replace(
  /<div className="w-full bg-\[\S+\] border border-\[\S+\] rounded-full h-2\.5 overflow-hidden">\s*<div className="bg-purple-500 h-full rounded-full" style={{ width: `\${cat.topic.percentage}%` }} \/>\s*<\/div>/g,
  '<AnimatedProgressBar value={cat.topic.percentage} color="#a855f7" className="h-2.5 rounded-full overflow-hidden" />'
);

fs.writeFileSync('src/components/GettingStartedCard.jsx', c);
console.log("GettingStartedCard patched");
