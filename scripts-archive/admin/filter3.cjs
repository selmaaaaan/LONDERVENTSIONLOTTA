const fs = require('fs');
const content = fs.readFileSync('text-white-lines.txt', 'utf8');
const lines = content.split('\\n');
lines.forEach(line => {
  if (line.includes('text-white')) {
     console.log(line);
  }
});
