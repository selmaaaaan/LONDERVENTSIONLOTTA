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

fs.writeFileSync('src/pages/TopicManagementPage.jsx', content, 'utf8');
