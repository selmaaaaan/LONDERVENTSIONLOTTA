const fs = require('fs');
let c = fs.readFileSync('src/pages/JurySlipsPage.jsx', 'utf8');

// Fix Excel export
c = c.replace(
    /(\s*'SL\.No': \+\+slNo,)(\s*'Ad No': c\.admissionNo)/g,
    "$1\n          'Code Letter': reg.codeLetter || '',$2"
);

c = c.replace(
    /(\s*'SL\.No': \+\+slNoAll,)(\s*'Ad No': c\.admissionNo)/g,
    "$1\n              'Code Letter': reg.codeLetter || '',$2"
);

// Fix Print table header
c = c.replace(
    /(<th className="border-r-\[1\.5px\] border-black px-1 text-\[11px\] font-black text-center \s*w-14 leading-tight">SL\.<br\/>NO\.<\/th>)/g,
    "$1\n                                <th className=\"border-r-[1.5px] border-black px-1 text-[11px] font-black text-center w-16 leading-tight\">CODE<br/>LETTER</th>"
);

// Fix Print table body
c = c.replace(
    /(<td className="border-r-\[1\.5px\] border-black text-center font-black text-\[16px\]">\{p \s*\* ROWS_PER_PAGE \+ i \+ 1\}<\/td>)/g,
    "$1\n                                  <td className=\"border-r-[1.5px] border-black text-center font-bold text-[14px] leading-tight px-1\">{data?.reg?.codeLetter || ''}</td>"
);


fs.writeFileSync('src/pages/JurySlipsPage.jsx', c);
console.log("JurySlipsPage patched");
