const fs = require('fs');
let c = fs.readFileSync('src/pages/TeamParticipantDirectoryPage.jsx', 'utf8');

c = c.replace(/<td className="border-r-\[1\.5px\] border-black text-center font-black text-\[16px\]">\{p \* ROWS_PER_PAGE \+ i \+ 1\}<\/td>\r?\n\s*<td className="border-r-\[1\.5px\] border-black"><\/td>/g, 
`<td className="border-r-[1.5px] border-black text-center font-black text-[16px]">{p * ROWS_PER_PAGE + i + 1}</td>`);

fs.writeFileSync('src/pages/TeamParticipantDirectoryPage.jsx', c);
console.log('TD removed');
