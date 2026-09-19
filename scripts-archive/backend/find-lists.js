const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

for (const file of files) {
  const content = fs.readFileSync(path.join(controllersDir, file), 'utf8');
  const lines = content.split('\n');
  let currentFunc = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const funcMatch = line.match(/const\s+([a-zA-Z0-9_]+)\s*=\s*async\s*\(/);
    if (funcMatch) {
      currentFunc = funcMatch[1];
    }
    
    // Look for find() without skip/limit, or with .find({}) 
    if (line.includes('.find(') && !line.includes('findById') && !line.includes('findOne')) {
        // check if this function does pagination
        const funcBody = content.substring(content.indexOf(line) - 500, content.indexOf(line) + 500);
        if (!funcBody.includes('limit(') && !funcBody.includes('req.query.limit')) {
            console.log(`- ${file} -> ${currentFunc}`);
        }
    }
  }
}
