const fs = require('fs');
let c = fs.readFileSync('src/pages/JurySlipsPage.jsx', 'utf8');

const oldThead = `                              <tr className="bg-[#e5e7eb] border-b-[1.5px] border-black h-10">
                                <th className="border-r-[1.5px] border-black px-1 text-[11px] font-black text-center w-12 leading-tight">SL.<br/>NO.</th>
                                <th className="border-r-[1.5px] border-black px-1 text-[11px] font-black text-center w-20 leading-tight">CODE<br/>LETTER</th>
                                <th className="border-r-[1.5px] border-black px-1 text-[11px] font-black text-center w-24">AD No.</th>
                                <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center">NAME</th>
                                <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center w-32">TEAM</th>
                                <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center w-28">POSITION</th>
                                <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center w-20">GRADE</th>
                                <th className="px-2 text-[11px] font-black text-center w-36">REMARKS</th>
                              </tr>`;

const newThead = `                              <tr className="bg-[#e5e7eb] border-b-[1.5px] border-black h-10">
                                <th className="border-r-[1.5px] border-black px-1 text-[11px] font-black text-center w-14 leading-tight">SL.<br/>NO.</th>
                                <th className="border-r-[1.5px] border-black px-1 text-[11px] font-black text-center w-28">AD No.</th>
                                <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center">NAME</th>
                                <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center w-36">TEAM</th>
                                <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center w-32">POSITION</th>
                                <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center w-24">GRADE</th>
                                <th className="px-2 text-[11px] font-black text-center w-40">REMARKS</th>
                              </tr>`;

const oldTbody = `                              {paddedRows.map((data, i) => (
                                <tr key={i} className="border-b-[1.5px] border-black last:border-b-0 h-[12.5%]">
                                  <td className="border-r-[1.5px] border-black text-center font-black text-[16px]">{p * ROWS_PER_PAGE + i + 1}</td>
                                  <td className="border-r-[1.5px] border-black text-center font-black text-[16px]">{data?.reg?.codeLetter || ''}</td>
                                    <td className="border-r-[1.5px] border-black text-center font-bold text-[10px] leading-tight px-1 break-all">{data?.c?.admissionNo || ''}</td>
                                      <td className="border-r-[1.5px] border-black px-3 font-bold text-[10px] uppercase truncate overflow-hidden max-w-[200px] leading-tight whitespace-pre-wrap">{data?.c?.name || ''}</td>
                                    <td className="border-r-[1.5px] border-black px-2 font-bold text-[11px] text-center uppercase truncate overflow-hidden max-w-[100px]">{data?.reg?.team?.name || ''}</td>
                                  <td className="border-r-[1.5px] border-black"></td>
                                  <td className="border-r-[1.5px] border-black"></td>
                                  <td className=""></td>
                                </tr>
                              ))}`;

const newTbody = `                              {paddedRows.map((data, i) => (
                                <tr key={i} className="border-b-[1.5px] border-black last:border-b-0 h-[12.5%]">
                                  <td className="border-r-[1.5px] border-black text-center font-black text-[16px]">{p * ROWS_PER_PAGE + i + 1}</td>
                                    <td className="border-r-[1.5px] border-black text-center font-bold text-[10px] leading-tight px-1 break-all">{data?.c?.admissionNo || ''}</td>
                                      <td className="border-r-[1.5px] border-black px-3 font-bold text-[10px] uppercase truncate overflow-hidden max-w-[200px] leading-tight whitespace-pre-wrap">{data?.c?.name || ''}</td>
                                    <td className="border-r-[1.5px] border-black px-2 font-bold text-[11px] text-center uppercase truncate overflow-hidden max-w-[100px]">{data?.reg?.team?.name || ''}</td>
                                  <td className="border-r-[1.5px] border-black"></td>
                                  <td className="border-r-[1.5px] border-black"></td>
                                  <td className=""></td>
                                </tr>
                              ))}`;

c = c.replace(oldThead, newThead);
c = c.replace(oldTbody, newTbody);

fs.writeFileSync('src/pages/JurySlipsPage.jsx', c);
console.log('JurySlipsPage table patched');
