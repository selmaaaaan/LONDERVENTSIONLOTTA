const fs = require('fs');
const p = 'routes/resultEntryRoutes.js';
let content = fs.readFileSync(p, 'utf8');

const target1 = `          const projectionResults = await Result.find({
              $or: [
                  { status: 'approved' },
                  { batchId: { $ne: null } }
              ]
          }).populate({
              path: 'candidate',
              populate: { path: 'team' }
          });`;

const replacement1 = `          const projectionResults = await Result.find({
              $or: [
                  { status: 'approved' },
                  { batchId: { $ne: null } }
              ]
          })
          .populate('programme')
          .populate({
              path: 'candidate',
              populate: { path: 'team' }
          });`;
          
content = content.replace(target1, replacement1);

const target2 = `          projectionResults.forEach(r => {
              if (!r.candidate) return;
              const c = r.candidate;
              if (r.totalPoints > 0) {
                  if (c.team) {
                      const tId = c.team._id.toString();
                      teamPoints[tId] = (teamPoints[tId] || 0) + r.totalPoints;
                  }
                  const cId = c._id.toString();`;

const replacement2 = `          const processedTeamProgrammes = new Set();
          projectionResults.forEach(r => {
              if (!r.candidate) return;
              const c = r.candidate;
              if (r.totalPoints > 0) {
                  if (c.team) {
                      const tId = c.team._id.toString();
                      const pId = r.programme?._id?.toString();
                      const format = r.programme?.format;
                      const category = r.programme?.category;
                      
                      let shouldAddTeamPoints = true;
                      if (format === 'Group' || category === 'KULLIYYAH') {
                          const teamProgKey = \`\${tId}-\${pId}\`;
                          if (processedTeamProgrammes.has(teamProgKey)) {
                              shouldAddTeamPoints = false;
                          } else {
                              processedTeamProgrammes.add(teamProgKey);
                          }
                      }
                      
                      if (shouldAddTeamPoints) {
                          teamPoints[tId] = (teamPoints[tId] || 0) + r.totalPoints;
                      }
                  }
                  const cId = c._id.toString();`;

content = content.replace(target2, replacement2);
fs.writeFileSync(p, content);
console.log('Patched projection logic for legacy group points');
