const fs = require('fs');
let code = fs.readFileSync('src/pages/JurySlipsPage.jsx', 'utf8');

// 1. Add state variables
const stateVars = \
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
          const res = await api.get(\/candidates/lookup?search=\\$\\{encodeURIComponent(candidateQuery)\\}\);
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
      const res = await api.get(\/candidates/\\$\\{candidate._id\\}/registrations\);
      setCandidateRegistrations(res.data);
    } catch (e) {
      alertAction('Failed to fetch candidate registrations');
    } finally {
      setLoading(false);
    }
  };
\;

code = code.replace(
  "const [showWarning, setShowWarning] = useState(false);",
  "const [showWarning, setShowWarning] = useState(false);\\n" + stateVars
);

// 2. Change Participant List to Participant Directory and add Mode Toggle
const titleAndToggle = \
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Participant Directory</h1>
          </div>

          <div className="flex bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-1 w-fit">
            <button
              onClick={() => setMode('programme')}
              className={\px-4 py-2 rounded-md text-sm font-medium transition-colors \\$\\{mode === 'programme' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'\\}\}
            >
              Search by Programme
            </button>
            <button
              onClick={() => setMode('participant')}
              className={\px-4 py-2 rounded-md text-sm font-medium transition-colors \\$\\{mode === 'participant' ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'\\}\}
            >
              Search by Participant
            </button>
          </div>
\;
code = code.replace(
  /<div className="flex items-center justify-between">[\\s\\S]*?<h1.*?Participant List<\\/h1>[\\s\\S]*?<\/div>/,
  titleAndToggle.trim()
);

// 3. Wrap Search by Programme in mode check and add Search by Participant
const selectProgOriginal = '<div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">';
const selectProgNew = \
          {mode === 'programme' ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
\;

code = code.replace(selectProgOriginal, selectProgNew);

const afterSelectProgOriginal = \
          <div className="flex justify-end gap-3 print:hidden">
            <Button
              variant="outline"
\;

// We need to close the mode === 'programme' block, and add the 'participant' block
// We will replace up to the end of the button group.
// Actually, it's easier to find the exact end of the Search By Programme section.

// Let's replace 'export default JurySlipsPage;' to write out the new code to file
fs.writeFileSync('src/pages/JurySlipsPage.jsx', code);
