const fs = require('fs');
let c = fs.readFileSync('src/pages/JurySlipsPage.jsx', 'utf8');

const originalLen = c.length;

// Remove the TH
c = c.replace(/<th className="[^"]*">CODE<br\/>LETTER<\/th>/, "");

// Remove the TD
c = c.replace(/<td className="[^"]*">\{data\?\.reg\?\.codeLetter \|\| ''\}<\/td>/g, "");

// Remove from Excel export current
c = c.replace(/'Code Letter': reg\.codeLetter \|\| '',\n/g, "");

// Remove from Excel export all
c = c.replace(/'Code Letter': reg\.codeLetter \|\| '',\n/g, "");

// Adjust widths of remaining columns
c = c.replace(/w-12 leading-tight">SL\.<br\/>NO\.<\/th>/, 'w-14 leading-tight">SL.<br/>NO.</th>');
c = c.replace(/w-24">AD No\.<\/th>/, 'w-28">AD No.</th>');
c = c.replace(/w-32">TEAM<\/th>/, 'w-36">TEAM</th>');
c = c.replace(/w-28">POSITION<\/th>/, 'w-32">POSITION</th>');
c = c.replace(/w-20">GRADE<\/th>/, 'w-24">GRADE</th>');
c = c.replace(/w-36">REMARKS<\/th>/, 'w-40">REMARKS</th>');


fs.writeFileSync('src/pages/JurySlipsPage.jsx', c);
console.log("Replaced:", originalLen !== c.length);
