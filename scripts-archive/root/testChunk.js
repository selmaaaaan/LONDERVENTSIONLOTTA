const fs = require('fs');

const file = 'admin-hudafestival-main/src/pages/JurySlipsPage.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldPrintBlock = `{/* Printable Area */}
      {mode === 'programme' && shuffledList.length > 0 && selectedProgramme && (
        <div className="print:absolute print:inset-0 print:z-[9999] print:block bg-white text-black font-sans mx-auto print:m-0 print:p-0 w-full max-w-[297mm] h-[210mm] print:w-[297mm] print:h-[210mm] overflow-hidden box-border p-[10mm]" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>`;

if (content.includes('max-w-[297mm] h-[210mm]')) {
    console.log("Found layout to chunk!");
} else {
    console.log("Not found.");
}
