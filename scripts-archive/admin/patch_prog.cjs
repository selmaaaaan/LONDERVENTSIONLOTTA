const fs = require('fs');
let c = fs.readFileSync('src/pages/ProgrammesPage.jsx', 'utf8');

if (!c.includes('AnimatedInput')) {
  c = c.replace("import { AnimatedTabs } from '@/components/smoothui/animated-tabs';", "import { AnimatedTabs } from '@/components/smoothui/animated-tabs';\nimport { AnimatedInput } from '@/components/smoothui/animated-input';");
}

c = c.replace(/<input type="text" className="w-full p-2 border rounded" placeholder="Programme Name" value=\{newProgrammeForm\.name\} onChange=\{e => setNewProgrammeForm\(\{\.\.\.newProgrammeForm, name: e\.target\.value\}\)\} \/>/g, 
  '<AnimatedInput label="Programme Name" type="text" placeholder="Programme Name" value={newProgrammeForm.name} onChange={val => setNewProgrammeForm({...newProgrammeForm, name: val})} />');

c = c.replace(/<input type="number" className="w-full p-2 border rounded" placeholder="Sort Order" value=\{newProgrammeForm\.sortOrder\} onChange=\{e => setNewProgrammeForm\(\{\.\.\.newProgrammeForm, sortOrder: Number\(e\.target\.value\)\}\)\} \/>/g, 
  '<AnimatedInput label="Sort Order" type="number" placeholder="Sort Order" value={String(newProgrammeForm.sortOrder)} onChange={val => setNewProgrammeForm({...newProgrammeForm, sortOrder: Number(val)})} />');

fs.writeFileSync('src/pages/ProgrammesPage.jsx', c);
console.log("Programmes patched");
