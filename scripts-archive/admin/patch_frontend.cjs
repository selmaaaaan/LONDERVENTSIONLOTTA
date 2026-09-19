const fs = require('fs');
let code = fs.readFileSync('src/pages/JurySlipsPage.jsx', 'utf8');

const stateVars = `
  const [mode, setMode] = useState('programme');
  const [candidateQuery, setCandidateQuery] = useState('');
  const [candidateSuggestions, setCandidateSuggestions] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateRegistrations, setCandidateRegistrations] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (mode !== 'participant') return;
    const delayDebounceFn = setTimeout(async () => {
      if (candidateQuery.length >= 2) {
        setSearchLoading(true);
        try {
          const res = await api.get(\`/candidates/lookup?search=\${encodeURIComponent(candidateQuery)}\`);
          setCandidateSuggestions(res.data);
        } catch (e) {
          console.error(e);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setCandidateSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [candidateQuery, mode]);

  const selectCandidate = async (candidate) => {
    setSelectedCandidate(candidate);
    setCandidateQuery('');
    setCandidateSuggestions([]);
    setLoading(true);
    try {
      const res = await api.get(\`/candidates/\${candidate._id}/registrations\`);
      setCandidateRegistrations(res.data);
    } catch (e) {
      alertAction('Failed to fetch candidate registrations');
    } finally {
      setLoading(false);
    }
  };
`;

code = code.replace(
  "const [showWarning, setShowWarning] = useState(false);",
  "const [showWarning, setShowWarning] = useState(false);\n" + stateVars
);

const titleAndToggle = `
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Participant Directory</h1>
          </div>

          <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-1 w-fit">
            <button
              onClick={() => setMode('programme')}
              className={\`px-4 py-2 rounded-md text-sm font-medium transition-colors \${mode === 'programme' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}\`}
            >
              Search by Programme
            </button>
            <button
              onClick={() => setMode('participant')}
              className={\`px-4 py-2 rounded-md text-sm font-medium transition-colors \${mode === 'participant' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}\`}
            >
              Search by Participant
            </button>
          </div>
`;

code = code.replace(
  /<div className="flex items-center justify-between">[\s\S]*?<h1.*?Participant List<\/h1>[\s\S]*?<\/div>/,
  titleAndToggle.trim()
);

const progSectionStart = '<div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">';
const progSectionStartNew = `          {mode === 'programme' ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">`;

code = code.replace(progSectionStart, progSectionStartNew);

const btnGroupOrig = `        <div className="print:hidden space-y-6">`;
// Wait, I need to find where the program selection block ends.
// Let's replace the button closing tag.
// Look for this block:
/*
            </div>
          )}
        </div>
*/
// It's just before {/* Printable Area */}
// Let's search for {/* Printable Area */}

const printArea = `{/* Printable Area */}`;

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

// Wrap the printable area block
// Replace `{shuffledList.length > 0 && selectedProgramme && (`
// with `{mode === 'programme' && shuffledList.length > 0 && selectedProgramme && (`
code = code.replace(
  '{shuffledList.length > 0 && selectedProgramme && (',
  '{mode === \'programme\' && shuffledList.length > 0 && selectedProgramme && ('
);

// We need to inject `participantSearchBlock` right before `{/* Printable Area */}`
// AND we need to close the `mode === 'programme'` ternary that we opened. 
// Wait, `{mode === 'programme' ? ( ... ) : ( participantSearchBlock )}`
// The original code has `</div>` that closes `<div className="print:hidden space-y-6">` right before `{/* Printable Area */}`.
// So:
/*
          <div className="flex justify-end gap-3 print:hidden">
            ...
          </div>
        </div>
*/
// The `</div>` before `{/* Printable Area */}` closes the `.print:hidden space-y-6`.
// We need to insert our ternary `: (...)` right before that `</div>`.

// Let's use regex to find `<div className="flex justify-end gap-3 print:hidden">...</div>`
// This block contains the Export and Print buttons.
// Actually, it's safer to just look for `</Button>\n            </div>\n          )}` and append the ternary else branch after it.

// Wait, the block is:
/*
          {registrations.length > 0 && (
            <div className="flex justify-end gap-3 print:hidden">
              <Button
                variant="outline"
                onClick={handleExportExcel}
                className="flex items-center gap-2"
              >
                <FileText size={18} />
                Export Excel
              </Button>
              <Button 
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer size={18} />
                Print List
               </Button>
            </div>
          )}
*/

const btnBlockEndRegex = /<Printer size=\{18\} \/>\s*Print List\s*<\/Button>\s*<\/div>\s*\)\}/;
const match = code.match(btnBlockEndRegex);
if (match) {
  code = code.substring(0, match.index + match[0].length) + '\n' + participantSearchBlock + '\n' + code.substring(match.index + match[0].length);
}

const participantDetailsBlock = `
      {mode === 'participant' && selectedCandidate && (
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden text-slate-800 p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1e3a8a]">{selectedCandidate.name}</h2>
                <div className="text-sm text-slate-500 mt-1">Ad No: {selectedCandidate.admissionNo} &bull; Class: {selectedCandidate.classLevel}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-700 uppercase tracking-wider">{selectedCandidate.category}</div>
                <div className="text-sm font-semibold text-blue-600 mt-1">{selectedCandidate.team?.name}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Layers size={20} className="text-blue-500"/> Registered Programmes</h3>
              {loading ? (
                <div className="py-8 text-center text-slate-500 flex flex-col items-center gap-2">
                  <RefreshCw className="animate-spin" size={24} />
                  Loading programmes...
                </div>
              ) : candidateRegistrations.length === 0 ? (
                <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
                  This participant is not registered for any programmes.
                </div>
              ) : (
                <div className="space-y-4">
                  {candidateRegistrations.map(reg => (
                    <div key={reg._id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">{reg.category}</span>
                           <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{reg.type}</span>
                         </div>
                         <div className="font-bold text-slate-800">{reg.programmeCode} - {reg.programmeName}</div>
                         {reg.topic && (
                           <div className="text-sm text-slate-600 mt-2 bg-white px-3 py-2 border border-slate-100 rounded">
                             <span className="font-semibold text-slate-500 text-xs uppercase tracking-wider mr-2">Topic:</span>
                             {reg.topic}
                             {reg.topicStatus && (
                               <span className={\`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase \${reg.topicStatus === 'approved' ? 'bg-green-100 text-green-700' : reg.topicStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}\`}>{reg.topicStatus}</span>
                             )}
                           </div>
                         )}
                       </div>
                       <div>
                         <span className={\`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider \${reg.status === 'approved' ? 'bg-green-100 text-green-700' : reg.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}\`}>{reg.status}</span>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
         </div>
      )}
`;

// Insert `participantDetailsBlock` right before `{/* Footer Text */}`
code = code.replace('{/* Footer Text */}', participantDetailsBlock + '\n          {/* Footer Text */}');

fs.writeFileSync('src/pages/JurySlipsPage.jsx', code);
