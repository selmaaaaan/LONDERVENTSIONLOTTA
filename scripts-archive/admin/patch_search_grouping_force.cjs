const fs = require('fs');
let c = fs.readFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', 'utf8');

c = c.replace(/let groups = \[\];[\s\S]*?setProgrammeCandidates\(groups\);/, `let flatCandidates = [];
              list.forEach(reg => {
                  if (reg.candidates && Array.isArray(reg.candidates)) {
                      reg.candidates.forEach(c => {
                          flatCandidates.push({
                              _id: reg._id + '_' + c._id, // unique key for rendering
                              admissionNo: c.admissionNo,
                              name: c.name,
                              team: reg.team
                          });
                      });
                  }
              });
              setProgrammeCandidates(flatCandidates);`);

fs.writeFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', c);
console.log("Patched ProgrammeParticipantSearchPage grouping forcefully");
