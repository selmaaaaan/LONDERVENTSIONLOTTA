const fs = require('fs');
let c = fs.readFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', 'utf8');

const oldGrouping = `
              let groups = [];
              list.forEach(reg => {
                  if (reg.candidates && Array.isArray(reg.candidates) && reg.candidates.length > 0) {
                      groups.push({
                          _id: reg._id,
                          admissionNo: reg.candidates.map(c => c.admissionNo).join(', '),
                          name: reg.candidates.map(c => c.name).join(', '),
                          team: reg.team,
                          count: reg.candidates.length
                      });
                  }
              });
              setProgrammeCandidates(groups);
`;

const newGrouping = `
              let flatCandidates = [];
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
              setProgrammeCandidates(flatCandidates);
`;

c = c.replace(oldGrouping.trim(), newGrouping.trim());
fs.writeFileSync('src/pages/ProgrammeParticipantSearchPage.jsx', c);
console.log("Patched ProgrammeParticipantSearchPage grouping");
