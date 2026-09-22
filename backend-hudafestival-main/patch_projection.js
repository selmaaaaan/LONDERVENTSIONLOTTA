const fs = require('fs');
const p = 'routes/resultEntryRoutes.js';
let content = fs.readFileSync(p, 'utf8');

const target = `          const projectionResults = await Result.find({
              $or: [
                  { status: 'approved', batchId: { $ne: batch._id } },
                  { batchId: batch._id }
              ]
          })`;

const replacement = `          const projectionResults = await Result.find({
              $or: [
                  { status: 'approved' },
                  { batchId: { $ne: null } }
              ]
          })`;

content = content.replace(target, replacement);
fs.writeFileSync(p, content);
console.log('Patched projection query to Option B');
