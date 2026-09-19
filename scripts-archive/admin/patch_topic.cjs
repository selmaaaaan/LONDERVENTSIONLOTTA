const fs = require('fs');
let content = fs.readFileSync('src/pages/TopicManagementPage.jsx', 'utf8');

// 1. Add allTopics state
content = content.replace(
  'const [programmes, setProgrammes] = useState([]);',
  'const [programmes, setProgrammes] = useState([]);\n  const [allTopics, setAllTopics] = useState([]);'
);

// 2. Add fetchAllTopics
content = content.replace(
  'const fetchProgrammes = async () => {',
  'const fetchAllTopics = async () => { try { const { data } = await api.get("/topic-registrations"); setAllTopics(data); } catch(e) {} };\n\n  const fetchProgrammes = async () => {'
);

// 3. Update load to call both
content = content.replace(
  'await fetchProgrammes();',
  'await fetchProgrammes();\n      await fetchAllTopics();'
);

// 4. Update action methods to call fetchAllTopics()
content = content.replaceAll('if (selectedProgramme) fetchProgrammeTopics(selectedProgramme._id);', 'if (selectedProgramme) fetchProgrammeTopics(selectedProgramme._id); fetchAllTopics();');
content = content.replaceAll('fetchProgrammeTopics(selectedProgramme._id);\n    } catch(e)', 'fetchProgrammeTopics(selectedProgramme._id);\n      fetchAllTopics();\n    } catch(e)');

// 5. Update the UI for filteredProgrammes map
const uiTarget = '                  <div className="text-xs text-[var(--color-text-muted)] mt-1 flex justify-between">\n                    <span>{prog.category}</span>\n                    <span className="font-semibold uppercase">{prog.topicMode || \'none\'}</span>\n                  </div>';

const uiReplacement = `                  <div className="text-xs text-[var(--color-text-muted)] mt-1 flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <span>{prog.category}</span>
                      {(() => {
                        const progTopics = allTopics.filter(t => t.programme?._id === prog._id);
                        const pending = progTopics.filter(t => t.status === 'pending').length;
                        const approved = progTopics.filter(t => t.status === 'approved').length;
                        return (pending > 0 || approved > 0) ? (
                          <div className="flex gap-1 ml-1">
                            {pending > 0 && <span className="text-[10px] bg-orange-100/50 text-orange-600 px-1 py-0.5 rounded font-bold">{pending} PEND</span>}
                            {approved > 0 && <span className="text-[10px] bg-green-100/50 text-green-600 px-1 py-0.5 rounded font-bold">{approved} APPR</span>}
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <span className="font-semibold uppercase opacity-60">{prog.topicMode || 'none'}</span>
                  </div>`;

content = content.replace(uiTarget, uiReplacement);

fs.writeFileSync('src/pages/TopicManagementPage.jsx', content, 'utf8');
