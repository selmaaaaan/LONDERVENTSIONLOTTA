const fs = require('fs');

// 1. Revert backend settingsController.js
let cSettings = fs.readFileSync('backend-hudafestival-main/controllers/settingsController.js', 'utf8');
cSettings = cSettings.replace(
    /const expectedR = p\.requiresRegistration === false \? 0 : numTeams; \/\/ exactly 1 per programme per team/,
    `const expectedR = numTeams; // exactly 1 per programme per team`
);
fs.writeFileSync('backend-hudafestival-main/controllers/settingsController.js', cSettings, 'utf8');

// 2. Revert TeamRegistrationListPage.jsx
let cGrid = fs.readFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', 'utf8');
const searchCell = `                                                if (prog.requiresRegistration === false) {
                                                    return (
                                                        <td key={prog._id} className="border-r border-[var(--color-border)] p-0 relative bg-amber-50/30 cursor-not-allowed">
                                                            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center select-none opacity-60">
                                                                <span className="text-[10px] font-bold text-amber-600 tracking-wider">NO REG</span>
                                                                <span className="text-[9px] font-bold text-amber-500/70 uppercase">NEEDED</span>
                                                            </div>
                                                        </td>
                                                    );
                                                }
                                                
                                                const isSaved = isChecked && !hasDraft && !hasError;

                                                let cellClasses = 'w-full h-full flex items-center justify-center min-h-[48px] transition-colors ';
`;

const replaceCell = `                                                const isSaved = isChecked && !hasDraft && !hasError;

                                                let cellClasses = 'w-full h-full flex items-center justify-center min-h-[48px] transition-colors ';
`;
cGrid = cGrid.replace(searchCell, replaceCell);

const searchFooter = `                                        if (prog.requiresRegistration === false) {
                                            return (
                                              <td key={prog._id} className="px-2 py-3 border-r border-t border-[var(--color-border)] text-center bg-amber-50/30">
                                                  <div className="text-[9px] font-bold px-1 py-1 rounded inline-block bg-amber-500/10 text-amber-600/80 tracking-tight leading-none">
                                                      N/A
                                                  </div>
                                              </td>
                                          );
                                        }

                                        return (
                                            <td key={prog._id} className="px-2 py-3 border-r border-t border-[var(--color-border)] text-center">
                                                <div className="text-xs font-bold text-[var(--color-text-heading)] mb-1">`;

const replaceFooter = `                                        return (
                                            <td key={prog._id} className="px-2 py-3 border-r border-t border-[var(--color-border)] text-center">
                                                <div className="text-xs font-bold text-[var(--color-text-heading)] mb-1">`;
cGrid = cGrid.replace(searchFooter, replaceFooter);
fs.writeFileSync('admin-hudafestival-main/src/pages/TeamRegistrationListPage.jsx', cGrid, 'utf8');

console.log("Reverted UI and backend logic.");