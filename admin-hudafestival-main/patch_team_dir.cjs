const fs = require('fs');
let c = fs.readFileSync('src/pages/TeamParticipantDirectoryPage.jsx', 'utf8');

const originalLen = c.length;

// Remove the TH
c = c.replace(/<th className="[^"]*">CODE<br\/>LETTER<\/th>/, "");

// Remove the TD (could be empty or not, so let's match the exact text or just similar)
c = c.replace(/<td className="[^"]*">\{data\?\.reg\?\.codeLetter \|\| ''\}<\/td>/g, "");

// Remove from Excel export
c = c.split('\n').filter(line => !line.includes("'Code Letter'")).join('\n');

// Adjust widths of remaining columns
c = c.replace(/w-12 leading-tight">SL\.<br\/>NO\.<\/th>/, 'w-14 leading-tight">SL.<br/>NO.</th>');
c = c.replace(/w-24">AD No\.<\/th>/, 'w-28">AD No.</th>');
c = c.replace(/w-32">TEAM<\/th>/, 'w-36">TEAM</th>');
c = c.replace(/w-28">POSITION<\/th>/, 'w-32">POSITION</th>');
c = c.replace(/w-20">GRADE<\/th>/, 'w-24">GRADE</th>');
c = c.replace(/w-36">REMARKS<\/th>/, 'w-40">REMARKS</th>');

fs.writeFileSync('src/pages/TeamParticipantDirectoryPage.jsx', c);
console.log("TeamParticipantDirectoryPage Replaced:", originalLen !== c.length);
