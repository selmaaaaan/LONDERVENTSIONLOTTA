const fs = require('fs');
let c = fs.readFileSync('src/pages/JurySlipsPage.jsx', 'utf8');

const oldTr = `<td className="border-r-[1.5px] border-black"></td>
                                  <td className="border-r-[1.5px] border-black text-center font-bold text-[10px] leading-tight px-1 break-all">{data?.admissionNo || ''}</td>
                                    <td className="border-r-[1.5px] border-black px-3 font-bold text-[10px] uppercase truncate overflow-hidden max-w-[200px] leading-tight whitespace-pre-wrap">{data?.name || ''}</td>
                                  <td className="border-r-[1.5px] border-black px-2 font-bold text-[11px] text-center uppercase truncate overflow-hidden max-w-[100px]">{data?.reg?.team?.name || ''}</td>`;

const newTr = `<td className="border-r-[1.5px] border-black text-center font-black text-[16px]">{data?.reg?.codeLetter || ''}</td>
                                  <td className="border-r-[1.5px] border-black text-center font-bold text-[10px] leading-tight px-1 break-all">{data?.c?.admissionNo || ''}</td>
                                    <td className="border-r-[1.5px] border-black px-3 font-bold text-[10px] uppercase truncate overflow-hidden max-w-[200px] leading-tight whitespace-pre-wrap">{data?.c?.name || ''}</td>
                                  <td className="border-r-[1.5px] border-black px-2 font-bold text-[11px] text-center uppercase truncate overflow-hidden max-w-[100px]">{data?.reg?.team?.name || ''}</td>`;

c = c.replace(oldTr, newTr);
fs.writeFileSync('src/pages/JurySlipsPage.jsx', c);
console.log('JurySlipsPage patched');
