const fs = require('fs');

// 1. ProgrammeCard
let progFile = 'frontend-hudafestival-main/src/pages/ProgrammeListPage.jsx';
let progContent = fs.readFileSync(progFile, 'utf8');

progContent = progContent.replace(
  /whileHover={prefersReducedMotion \? \{\} : \{ y: -8, rotate: index % 2 === 0 \? 1\.5 : -1\.5, scale: 1\.02, boxShadow: '16px 16px 0px 0px rgba\(23,23,23,1\)' \}}/,
  "whileHover={prefersReducedMotion ? {} : { y: -8, rotate: index % 2 === 0 ? 1.5 : -1.5, scale: 1.02, boxShadow: '16px 16px 0px 0px rgba(23,23,23,1)' }}\n        whileTap={prefersReducedMotion ? {} : { scale: 0.98, boxShadow: '4px 4px 0px 0px rgba(23,23,23,1)' }}"
);
progContent = progContent.replace(
  'group-hover:text-[var(--festival-red)] transition-colors',
  'group-hover:text-[var(--festival-red)] group-active:text-[var(--festival-red)] transition-colors'
);
fs.writeFileSync(progFile, progContent);

// 2. SchedulePage
let schedFile = 'frontend-hudafestival-main/src/pages/SchedulePage.jsx';
let schedContent = fs.readFileSync(schedFile, 'utf8');

schedContent = schedContent.replace(
  /whileHover={prefersReducedMotion \? \{\} : \{ y: -6, rotate: i % 2 === 0 \? 1 : -1, scale: 1\.02 \}}/g,
  "whileHover={prefersReducedMotion ? {} : { y: -6, rotate: i % 2 === 0 ? 1 : -1, scale: 1.02 }} whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}"
);

fs.writeFileSync(schedFile, schedContent);
console.log('Cards updated with whileTap and active states.');
