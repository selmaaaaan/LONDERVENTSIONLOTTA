const fs = require('fs');
let code = fs.readFileSync('src/pages/JurySlipsPage.jsx', 'utf8');

// Undo the broken opening ternary if it's there
code = code.replace(
  "{mode === 'programme' ? (\n            <div className=\"bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4\">",
  "<div className=\"bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4\">"
);

const startMarker = '<div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">';
const endMarker = '          {shuffledList.length > 0 && (\n            <div className="flex justify-end gap-3 mt-4">\n               <Button onClick={handleGenerate} variant="outline">\n                 <RefreshCw size={16} className="mr-2" /> Refresh\n               </Button>\n               <Button onClick={handlePrint} variant="primary">\n                 <Printer size={16} className="mr-2" /> Print Participant List\n               </Button>\n            </div>\n          )}\n        </div>';

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
    // Exclude the `        </div>` from programmeControls since we will add it after the ternary
    const programmeControls = code.substring(startIdx, endIdx + endMarker.length - '\n        </div>'.length);
    
    const participantSearchBlock = `
          ) : (
             <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4 relative">
               <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Search Participant</h2>
               <div className="relative">
                 <Search className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" size={20} />
                 <input
                   type="text"
                   placeholder="Type name or admission number..."
                   className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                   value={candidateQuery}
                   onChange={e => setCandidateQuery(e.target.value)}
                 />
                 {searchLoading && <RefreshCw size={16} className="absolute right-3 top-2.5 animate-spin text-[var(--color-text-muted)]" />}
                 
                 {candidateSuggestions.length > 0 && candidateQuery.length >= 2 && (
                   <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                     {candidateSuggestions.map(cand => (
                       <button
                         key={cand._id}
                         onClick={() => selectCandidate(cand)}
                         className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center"
                       >
                         <div>
                           <div className="font-bold text-slate-800">{cand.name}</div>
                           <div className="text-xs text-slate-500">Ad No: {cand.admissionNo} &bull; {cand.category} &bull; Class: {cand.classLevel}</div>
                         </div>
                         <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                           {cand.team?.name}
                         </div>
                       </button>
                     ))}
                   </div>
                 )}
               </div>
             </div>
          )}
`;

    const newControls = "{mode === 'programme' ? (\n" + programmeControls + "\n" + participantSearchBlock + '\n        </div>';
    
    code = code.substring(0, startIdx) + newControls + code.substring(endIdx + endMarker.length);
    fs.writeFileSync('src/pages/JurySlipsPage.jsx', code);
    console.log("Patched successfully!");
} else {
    console.log("Failed to find markers.");
    console.log("Start:", startIdx, "End:", endIdx);
    
    // Fallback: If they were already replaced by the previous bad script, just fix the missing bracket
    if (code.includes("{mode === 'programme' ? (")) {
        console.log("Already has open bracket. Checking if missing closing bracket.");
        if (!code.includes(") : (")) {
             // Let's replace up to `</Button>\n            </div>\n          )}\n        </div>`
             // Wait, maybe we just use `sed` or regex
        }
    }
}
