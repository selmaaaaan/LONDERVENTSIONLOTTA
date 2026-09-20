const fs = require('fs');
let code = fs.readFileSync('src/pages/ProgrammeJurySlipPage.jsx', 'utf8');

// Add imports
code = code.replace(
    "import { Printer } from 'lucide-react';",
    "import { Printer, RefreshCw, Layers } from 'lucide-react';"
);

// Add state
code = code.replace(
    "const [selectedProgramme, setSelectedProgramme] = useState(null);",
    "const [selectedProgramme, setSelectedProgramme] = useState(null);\n  const [bulkData, setBulkData] = useState(null);\n  const [isBulkLoading, setIsBulkLoading] = useState(false);"
);

// Add handleBulkDownload
const bulkFunction = `
  const handleBulkDownload = (stageType) => {
    setIsBulkLoading(true);
    let targetProgrammes = programmes.filter(p => p.format?.toLowerCase() === 'stage' || p.stageType?.toLowerCase() === 'stage');
    
    if (targetProgrammes.length === 0) {
      alertAction("No stage programmes found.");
      setIsBulkLoading(false);
      return;
    }
    
    // Sort by code
    targetProgrammes.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
    
    setBulkData(targetProgrammes);
    
    setTimeout(() => {
      const originalTitle = document.title;
      document.title = "lintervention-2026-stage-jury-slips";
      window.print();
      document.title = originalTitle;
      setBulkData(null);
      setIsBulkLoading(false);
    }, 1000);
  };
`;

code = code.replace(
    "const handlePrint = () => {\n    window.print();\n  };",
    "const handlePrint = () => {\n    window.print();\n  };\n" + bulkFunction
);

// Add the button
const buttons = `
            <Button onClick={handlePrint} variant="primary" disabled={!selectedProgramme}>
              <Printer size={16} className="mr-2" /> Print Jury Slip
            </Button>
            <Button onClick={() => handleBulkDownload('stage')} variant="outline" disabled={isBulkLoading}>
              {isBulkLoading ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Layers size={16} className="mr-2" />}
              Download All Stage Jury Slips
            </Button>
`;

code = code.replace(
    /<Button onClick=\{handlePrint\} variant="primary" disabled=\{\!selectedProgramme\}>\s*<Printer size=\{16\} className="mr-2" \/> Print Jury Slip\s*<\/Button>/,
    buttons
);

// Replace the single printable area with support for bulkData array
const printableAreaRegex = /\{\s*selectedProgramme && \(\s*<div className="print:absolute.*?\s*<div className="w-full h-full box-border p-\[10mm\][\s\S]*?(?=<\/div>\s*<\/div>\s*<\/div>\s*\}\s*<\/div>\s*\);\s*\})/;

// We will construct the printable rendering block
// It should map over `bulkData || [selectedProgramme]`
const renderingBlock = `
      {/* Printable Area */}
      {(bulkData !== null || selectedProgramme) && (
        <div className="print:absolute print:inset-0 print:z-[9999] print:block hidden-on-screen print:bg-white text-black font-sans mx-auto print:m-0 print:p-0 w-full max-w-[297mm] print:w-auto overflow-visible space-y-8 print:space-y-0" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
          
          {(bulkData || [selectedProgramme]).map((prog, pageIdx) => (
            <div key={prog._id || pageIdx} className="w-full h-[210mm] print:w-[297mm] print:h-[210mm] print:break-after-page box-border p-[10mm] bg-white relative shadow-lg print:shadow-none mb-8 print:mb-0">
              <div className="w-full h-full border-[2px] border-black p-[2mm] rounded-[4mm] box-border flex flex-col relative bg-white">
                <div className="w-full h-full border-[1.5px] border-black rounded-[2mm] box-border p-3 flex flex-col">
                  
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4 px-2">
                    <div className="w-32 h-16 relative">
                      <img src="https://i.ibb.co/HTNc8VJN/lintervention-logo-badge-1.png" alt="L'intervention" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center text-center">
                      <h1 className="text-3xl font-black italic tracking-widest leading-none mb-1">L'INTERVENTION 2K26</h1>
                      <div className="flex items-center w-64">
                        <div className="flex-1 h-[1.5px] bg-black"></div>
                        <span className="mx-3 text-[10px] tracking-[0.2em] font-semibold text-gray-700">ECRIS LE MONDE</span>
                        <div className="flex-1 h-[1.5px] bg-black"></div>
                      </div>
                    </div>
                    
                    <div className="w-48 h-16 relative">
                      <img src="/academy-building.jpg" alt="Academy Building" className="w-full h-full object-contain mix-blend-multiply" style={{ filter: 'grayscale(100%)' }} />
                    </div>
                  </div>

                  {/* Field Row */}
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {[
                      { label: 'PROGRAMMECODE', value: prog.code || '' },
                      { label: 'PROGRAMME', value: prog.name || '' },
                      { label: 'CATEGORY', value: prog.category || '' },
                      { label: 'JUDGENAME', value: '' },
                      { label: 'DATE', value: '' }
                    ].map((field, idx) => (
                      <div key={idx} className="border-[1.5px] border-black rounded relative h-12 flex items-center px-2 pt-2">
                        <span className="absolute -top-[7px] left-2 bg-white px-1 text-[9px] font-black">{field.label}</span>
                        <span className="font-bold text-[12px] truncate w-full text-center">{field.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Table */}
                  <div className="flex-1 w-full border-[1.5px] border-black rounded flex flex-col overflow-hidden">
                    <div className="flex w-full bg-[#d9e2db] border-b-[1.5px] border-black font-black text-[12px] text-center">
                      <div className="w-[8%] border-r-[1.5px] border-black p-2 flex items-center justify-center">SL.<br/>NO.</div>
                      <div className="w-[10%] border-r-[1.5px] border-black p-2 flex items-center justify-center">CODE<br/>LETTER</div>
                      <div className="w-[8%] border-r-[1.5px] border-black p-2 flex items-center justify-center">/4</div>
                      <div className="w-[8%] border-r-[1.5px] border-black p-2 flex items-center justify-center">/4</div>
                      <div className="w-[8%] border-r-[1.5px] border-black p-2 flex items-center justify-center">/2</div>
                      <div className="w-[10%] border-r-[1.5px] border-black p-2 flex items-center justify-center">TOT.</div>
                      <div className="w-[8%] border-r-[1.5px] border-black p-2 flex items-center justify-center">POS</div>
                      <div className="w-[8%] border-r-[1.5px] border-black p-2 flex items-center justify-center">Gr</div>
                      <div className="flex-1 p-2 flex items-center justify-center">Remarks</div>
                    </div>
                    
                    <div className="flex flex-col flex-1 bg-white">
                      {['A','B','C','D','E','F','G','H'].map((letter, idx) => (
                        <div key={letter} className={\`flex w-full flex-1 \${idx !== 7 ? 'border-b-[1.5px] border-black' : ''}\`}>
                          <div className="w-[8%] border-r-[1.5px] border-black flex items-center justify-center font-bold text-lg">{idx + 1}</div>
                          <div className="w-[10%] border-r-[1.5px] border-black flex items-center justify-center font-black text-2xl">{letter}</div>
                          <div className="w-[8%] border-r-[1.5px] border-black"></div>
                          <div className="w-[8%] border-r-[1.5px] border-black"></div>
                          <div className="w-[8%] border-r-[1.5px] border-black"></div>
                          <div className="w-[10%] border-r-[1.5px] border-black"></div>
                          <div className="w-[8%] border-r-[1.5px] border-black"></div>
                          <div className="w-[8%] border-r-[1.5px] border-black"></div>
                          <div className="flex-1"></div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgrammeJurySlipPage;
`;

// we need to slice out the old printable area and replace it.
const splitToken = '{/* Printable Area */}';
const parts = code.split(splitToken);
if (parts.length === 2) {
    fs.writeFileSync('src/pages/ProgrammeJurySlipPage.jsx', parts[0] + renderingBlock);
    console.log("Success");
} else {
    console.error("Could not find Printable Area block");
}
