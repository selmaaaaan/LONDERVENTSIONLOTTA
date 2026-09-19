const fs = require('fs');
const p = 'admin-hudafestival-main/src/pages/JurySlipsPage.jsx';
let code = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

// ── Replace the entire tbody block using indexOf ──────────────────────────
const tbodyStart = code.indexOf('<tbody>');
const tbodyEnd = code.indexOf('</tbody>') + '</tbody>'.length;

const newTbody = `<tbody>
                      {(() => {
                        // Flatten: one row per candidate
                        const rows = [];
                        shuffledList.forEach((reg) => {
                          const cands = reg.candidates?.length ? reg.candidates : [{}];
                          cands.forEach((c) => rows.push({ c, reg }));
                        });
                        return rows.map(({ c, reg }, idx) => (
                          <tr key={(c._id || reg._id) + '-' + idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="py-3 px-2 border border-slate-200 text-center font-semibold text-slate-700 align-middle">{idx + 1}</td>
                            <td className="py-3 px-1 border border-slate-200 text-center font-bold text-blue-700 text-base align-middle">{reg.codeLetter || ''}</td>
                            <td className="py-3 px-3 border border-slate-200 text-slate-800 text-[12px] font-bold align-middle text-left">{c.admissionNo || '-'}</td>
                            <td className="py-3 px-3 border border-slate-200 font-bold text-slate-800 text-[12px] align-middle leading-tight">{c.name || '-'}</td>
                            <td className="py-3 px-2 border border-slate-200 text-slate-700 font-bold text-[12px] align-middle">{reg.team?.name || '-'}</td>
                            <td className="py-3 px-1 border border-slate-200 align-middle"></td>
                            <td className="py-3 px-1 border border-slate-200 align-middle"></td>
                            <td className="py-3 px-2 border border-slate-200 align-middle"></td>
                          </tr>
                        ));
                      })()}

                      {/* Filler rows based on total candidate count */}
                      {(() => {
                        const totalCands = shuffledList.reduce((s, r) => s + (r.candidates?.length || 0), 0);
                        return Array.from({ length: Math.max(0, 8 - totalCands) }).map((_, i) => (
                          <tr key={\`empty-\${i}\`} className={(totalCands + i) % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="py-4 px-2 border border-slate-200 text-center font-semibold text-slate-400">{totalCands + i + 1}</td>
                            <td className="border border-slate-200"></td>
                            <td className="border border-slate-200"></td>
                            <td className="border border-slate-200"></td>
                            <td className="border border-slate-200"></td>
                            <td className="border border-slate-200"></td>
                            <td className="border border-slate-200"></td>
                            <td className="border border-slate-200"></td>
                          </tr>
                        ));
                      })()}
                    </tbody>`;

code = code.substring(0, tbodyStart) + newTbody + code.substring(tbodyEnd);

// Restore CRLF
code = code.replace(/\n/g, '\r\n');
fs.writeFileSync(p, code);

// Verify
const verCode = fs.readFileSync(p, 'utf8');
const checks = [
  ['export flatMap', 'listToExport.flatMap'],
  ['exportAll flatMap', 'progRegs.flatMap'],
  ['total badge reduce', "reduce((s, r) => s + (r.candidates?.length || 0), 0)"],
  ['table rows flatten', 'rows.push({ c, reg })'],
];
checks.forEach(([name, needle]) => {
  console.log(name + ': ' + (verCode.includes(needle) ? 'OK ✓' : 'MISSING ✗'));
});
