const fs = require('fs');
let c = fs.readFileSync('src/components/smoothui/animated-input/index.tsx', 'utf8');

c = c.replace('value?: string;', 'value?: string;\n  type?: string;\n  required?: boolean;\n  name?: string;');
c = c.replace('export function AnimatedInput({', 'export function AnimatedInput({\n  type = "text",\n  required,\n  name,');
c = c.replace('type="text"', 'type={type} required={required} name={name}');

fs.writeFileSync('src/components/smoothui/animated-input/index.tsx', c);
console.log("AnimatedInput patched to support type, name, required");
