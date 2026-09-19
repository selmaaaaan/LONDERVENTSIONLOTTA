const fs = require('fs');
let c = fs.readFileSync('src/pages/JurySlipsPage.jsx', 'utf8');

// Fix handleExportAllExcel code letters
c = c.replace(
  /progRegs = progRegs\.map\(\(reg, index\) => \{\s*let letter = '';\s*let temp = index;\s*while \(temp >= 0\) \{\s*letter = String\.fromCharCode\(65 \+ \(temp % 26\)\) \+ letter;\s*temp = Math\.floor\(temp \/ 26\) - 1;\s*\}\s*return \{ \.\.\.reg, codeLetter: letter \};\s*\}\);/g,
  `progRegs = progRegs.map((reg) => {
           return { ...reg, codeLetter: reg.codeLetter || '' };
        });`
);

// Fix handleGenerate code letters
c = c.replace(
  /const assigned = shuffled\.map\(\(reg, index\) => \(\{\s*\.\.\.reg,\s*codeLetter: reg\.codeLetter \|\| generateCodeLetter\(index\)\s*\}\)\);\s*\/\/\s*Sort alphabetically by code letter so the printed list is in order A, B, C\.\.\.\s*assigned\.sort\(\(a, b\) => a\.codeLetter\.localeCompare\(b\.codeLetter\)\);/g,
  `const assigned = shuffled.map((reg) => ({
      ...reg,
      codeLetter: reg.codeLetter || ''
    }));

    // Sort alphabetically by code letter ONLY IF they exist
    assigned.sort((a, b) => {
      if (a.codeLetter && b.codeLetter) return a.codeLetter.localeCompare(b.codeLetter);
      if (a.codeLetter) return -1;
      if (b.codeLetter) return 1;
      return 0; // maintain previous team sort order
    });`
);

// Fix handleBulkDownload code letters
c = c.replace(
  /progRegs = progRegs\.map\(\(reg, index\) => \(\{\s*\.\.\.reg,\s*codeLetter: reg\.codeLetter \|\| generateCodeLetter\(index\)\s*\}\)\);\s*progRegs\.sort\(\(a, b\) => a\.codeLetter\.localeCompare\(b\.codeLetter\)\);/g,
  `progRegs = progRegs.map((reg) => ({
             ...reg,
             codeLetter: reg.codeLetter || ''
          }));
          progRegs.sort((a, b) => {
            if (a.codeLetter && b.codeLetter) return a.codeLetter.localeCompare(b.codeLetter);
            if (a.codeLetter) return -1;
            if (b.codeLetter) return 1;
            return 0;
          });`
);

fs.writeFileSync('src/pages/JurySlipsPage.jsx', c);
console.log("Code letters unassigned fallback logic updated to blank!");
