const fs = require('fs');
let c = fs.readFileSync('src/pages/JurySlipsPage.jsx', 'utf8');
let newC = c.replace(/<td className="border-r-\[1\.5px\] border-black"><\/td>\s*<td className="border-r-\[1\.5px\] border-black text-center font-bold text-\[10px\] leading-tight px-1 break-all">\{data\?\.admissionNo \|\| ''\}<\/td>\s*<td className="border-r-\[1\.5px\] border-black px-3 font-bold text-\[10px\] uppercase truncate overflow-hidden max-w-\[200px\] leading-tight whitespace-pre-wrap">\{data\?\.name \|\| ''\}<\/td>\s*<td className="border-r-\[1\.5px\] border-black px-2 font-bold text-\[11px\] text-center uppercase truncate overflow-hidden max-w-\[100px\]">\{data\?\.reg\?\.team\?\.name \|\| ''\}<\/td>/g,
`<td className="border-r-[1.5px] border-black text-center font-black text-[16px]">{data?.reg?.codeLetter || ''}</td>
                                  <td className="border-r-[1.5px] border-black text-center font-bold text-[10px] leading-tight px-1 break-all">{data?.c?.admissionNo || ''}</td>
                                    <td className="border-r-[1.5px] border-black px-3 font-bold text-[10px] uppercase truncate overflow-hidden max-w-[200px] leading-tight whitespace-pre-wrap">{data?.c?.name || ''}</td>
                                  <td className="border-r-[1.5px] border-black px-2 font-bold text-[11px] text-center uppercase truncate overflow-hidden max-w-[100px]">{data?.reg?.team?.name || ''}</td>`);

if (c === newC) {
  console.log("No changes made. Regex didn't match!");
} else {
  fs.writeFileSync('src/pages/JurySlipsPage.jsx', newC);
  console.log("JurySlipsPage patched successfully with regex");
}
