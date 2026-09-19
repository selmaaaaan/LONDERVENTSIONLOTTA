const fs = require('fs');
const file = 'frontend-hudafestival-main/src/components/ui/index.jsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  'className="text-4xl md:text-5xl lg:text-6xl',
  'className="text-[2.75rem] leading-[0.9] md:text-5xl lg:text-6xl'
);
fs.writeFileSync(file, content);
console.log('Updated SectionHeading');
