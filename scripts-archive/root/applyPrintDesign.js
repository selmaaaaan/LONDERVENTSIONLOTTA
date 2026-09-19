const fs = require('fs');

const file = 'admin-hudafestival-main/src/pages/JurySlipsPage.jsx';
let content = fs.readFileSync(file, 'utf8');

const startMarker = "{/* Printable Area */}";
const endMarker = "{/* Warning Popup */}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
    console.log("Markers not found.");
    process.exit(1);
}

const replacement = `{/* Printable Area */}
      {mode === 'programme' && shuffledList.length > 0 && selectedProgramme && (
        <div className="print:absolute print:inset-0 print:z-[9999] print:block hidden bg-white text-black font-sans mx-auto print:m-0 print:p-0 w-full max-w-[297mm] h-[210mm] print:w-[297mm] print:h-[210mm] overflow-hidden box-border p-[10mm]" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
          
          <div className="w-full h-full border-[2px] border-black p-[2mm] rounded-[4mm] box-border flex flex-col relative bg-white">
            <div className="w-full h-full border-[1.5px] border-black rounded-[2mm] box-border p-2 flex flex-col">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-2 px-2 pt-1">
                {/* Logo */}
                <div className="w-48 h-20 flex items-center justify-start shrink-0">
                  <img src="/logo-badge.png" alt="L'intervention" className="w-full h-full object-contain mix-blend-multiply" style={{ filter: 'grayscale(100%) brightness(0.7) contrast(1.5)' }} />
                </div>
                
                {/* Title */}
                <div className="flex flex-col items-center justify-center mt-3 flex-1 px-4">
                  <h1 className="text-2xl font-black uppercase tracking-tight text-black border-b-[2px] border-black pb-1 mb-1 px-8 text-center leading-none whitespace-nowrap">Shamsul Huda Arts Fest 2026</h1>
                  <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-black whitespace-nowrap">Art Builds A Better Tomorrow</h2>
                </div>
                
                {/* Building Illustration Placeholder */}
                <div className="w-48 h-20 relative flex justify-end shrink-0">
                  <svg viewBox="0 0 200 100" className="w-full h-full">
                    {/* Clouds */}
                    <circle cx="130" cy="20" r="15" fill="#e5e7eb" />
                    <circle cx="150" cy="15" r="20" fill="#f3f4f6" />
                    <circle cx="170" cy="25" r="12" fill="#e5e7eb" />
                    {/* Birds */}
                    <path d="M120 15 Q 123 10 126 15 Q 123 12 120 15" stroke="black" fill="none" strokeWidth="0.5"/>
                    <path d="M160 8 Q 163 3 166 8 Q 163 5 160 8" stroke="black" fill="none" strokeWidth="0.5"/>
                    <path d="M110 30 Q 113 25 116 30 Q 113 27 110 30" stroke="black" fill="none" strokeWidth="0.5"/>
                    {/* Trees bg */}
                    <circle cx="20" cy="80" r="18" fill="#9ca3af" />
                    <circle cx="45" cy="70" r="22" fill="#d1d5db" />
                    <circle cx="70" cy="75" r="15" fill="#9ca3af" />
                    <circle cx="170" cy="75" r="20" fill="#d1d5db" />
                    <circle cx="190" cy="85" r="14" fill="#9ca3af" />
                    {/* Building */}
                    <rect x="50" y="45" width="100" height="55" fill="#f3f4f6" stroke="black" strokeWidth="1" />
                    <polygon points="40,45 160,45 100,15" fill="#e5e7eb" stroke="black" strokeWidth="1" />
                    {/* Columns */}
                    <rect x="65" y="65" width="8" height="35" fill="white" stroke="black" strokeWidth="0.5" />
                    <rect x="96" y="65" width="8" height="35" fill="white" stroke="black" strokeWidth="0.5" />
                    <rect x="127" y="65" width="8" height="35" fill="white" stroke="black" strokeWidth="0.5" />
                    {/* Signboard */}
                    <rect x="110" y="28" width="75" height="15" fill="white" stroke="black" strokeWidth="0.5" />
                    <text x="147.5" y="35" fontSize="4.5" fontWeight="bold" textAnchor="middle" fill="black">SHAMSUL HUDA ISLAMIC ACADEMY</text>
                    <text x="147.5" y="40" fontSize="3.5" fontWeight="bold" textAnchor="middle" fill="black">KUTTIKKATTUR</text>
                  </svg>
                </div>
              </div>
      
              {/* Info Grid */}
              <div className="px-2 mb-2 mt-1">
                <div className="flex gap-2 mb-3">
                  <div className="flex-[2] relative border-[1.5px] border-black h-8 px-2 flex items-center">
                    <div className="absolute -top-[6px] left-2 bg-white px-1 text-[9px] font-black uppercase leading-none tracking-tight">PROGRAMME</div>
                    <div className="text-[11px] font-bold uppercase truncate w-full pt-1">{selectedProgramme.name}</div>
                  </div>
                  <div className="flex-[1] relative border-[1.5px] border-black h-8 px-2 flex items-center">
                    <div className="absolute -top-[6px] left-2 bg-white px-1 text-[9px] font-black uppercase leading-none tracking-tight">PROGRAMME CODE</div>
                    <div className="text-[11px] font-bold uppercase truncate w-full pt-1">{selectedProgramme.code}</div>
                  </div>
                  <div className="flex-[1] relative border-[1.5px] border-black h-8 px-2 flex items-center">
                    <div className="absolute -top-[6px] left-2 bg-white px-1 text-[9px] font-black uppercase leading-none tracking-tight">CATEGORY</div>
                    <div className="text-[11px] font-bold uppercase truncate w-full pt-1">{selectedProgramme.category}</div>
                  </div>
                  <div className="flex-[1.2] relative border-[1.5px] border-black h-8 px-2 flex items-center">
                    <div className="absolute -top-[6px] left-2 bg-white px-1 text-[9px] font-black uppercase leading-none tracking-tight">JUDGE NAME</div>
                    <div className="text-[11px] font-bold uppercase truncate w-full pt-1"></div>
                  </div>
                  <div className="flex-[0.8] relative border-[1.5px] border-black h-8 px-2 flex items-center">
                    <div className="absolute -top-[6px] left-2 bg-white px-1 text-[9px] font-black uppercase leading-none tracking-tight">DATE</div>
                    <div className="text-[11px] font-bold uppercase truncate w-full pt-1"></div>
                  </div>
                </div>
                
                <div className="flex h-8">
                  <div className="bg-[#e5e7eb] border-[1.5px] border-black border-r-0 w-28 flex items-center justify-center font-black text-sm tracking-widest uppercase">TOPIC</div>
                  <div className="flex-1 border-[1.5px] border-black px-2 flex items-center text-xs font-bold bg-white"></div>
                </div>
              </div>
      
              {/* Table */}
              <div className="px-2 mt-2 flex-1 flex flex-col min-h-0">
                <table className="w-full border-collapse border-[1.5px] border-black h-full bg-white table-fixed">
                  <thead>
                    <tr className="bg-[#e5e7eb] border-b-[1.5px] border-black h-10">
                      <th className="border-r-[1.5px] border-black px-1 text-[11px] font-black text-center w-12 leading-tight">SL.<br/>NO.</th>
                      <th className="border-r-[1.5px] border-black px-1 text-[11px] font-black text-center w-20 leading-tight">CODE<br/>LETTER</th>
                      <th className="border-r-[1.5px] border-black px-1 text-[11px] font-black text-center w-24">AD No.</th>
                      <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center">NAME</th>
                      <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center w-32">TEAM</th>
                      <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center w-28">POSITION</th>
                      <th className="border-r-[1.5px] border-black px-2 text-[11px] font-black text-center w-20">GRADE</th>
                      <th className="px-2 text-[11px] font-black text-center w-36">REMARKS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const rows = [];
                      shuffledList.forEach((reg) => {
                        const cands = reg.candidates?.length ? reg.candidates : [{}];
                        cands.forEach((c) => rows.push({ c, reg }));
                      });
                      
                      const totalRows = Math.max(8, rows.length);
                      const finalRows = [];
                      
                      for (let i = 0; i < totalRows; i++) {
                        const data = rows[i];
                        finalRows.push(
                          <tr key={i} className="border-b-[1.5px] border-black last:border-b-0 h-[8%]">
                            <td className="border-r-[1.5px] border-black text-center font-black text-[16px]">{i + 1}</td>
                            <td className="border-r-[1.5px] border-black"></td>
                            <td className="border-r-[1.5px] border-black text-center font-bold text-[12px]">{data?.c?.admissionNo || ''}</td>
                            <td className="border-r-[1.5px] border-black px-3 font-bold text-[12px] uppercase truncate overflow-hidden">{data?.c?.name || ''}</td>
                            <td className="border-r-[1.5px] border-black px-2 font-bold text-[11px] text-center uppercase truncate overflow-hidden">{data?.reg?.team?.name || ''}</td>
                            <td className="border-r-[1.5px] border-black"></td>
                            <td className="border-r-[1.5px] border-black"></td>
                            <td className=""></td>
                          </tr>
                        );
                      }
                      return finalRows;
                    })()}
                  </tbody>
                </table>
              </div>
      
            </div>
          </div>
        </div>
      )}
      
      `;

const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(file, newContent);
console.log("Updated Printable Area.");
