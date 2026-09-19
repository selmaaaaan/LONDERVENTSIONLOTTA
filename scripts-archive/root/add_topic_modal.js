const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', 'utf8');

// 1. Add state for modal
if (!c.includes('isRegisterModalOpen')) {
    c = c.replace(/const \[editTopicText, setEditTopicText\] = useState\(''\);/, 
        `const [editTopicText, setEditTopicText] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [modalRegistrations, setModalRegistrations] = useState([]);
  const [newTopicForm, setNewTopicForm] = useState({ candidateId: '', teamId: '', topic: '', attachment: '' });`);
  
    // 2. Add function to open modal and fetch registrations
    const fetchProgTopicsStr = `const fetchProgrammeTopics = async (progId) => {`;
    c = c.replace(fetchProgTopicsStr, 
        `const openRegisterModal = async () => {
    if (!selectedProgramme) return;
    try {
      const { data } = await api.get(\`/registrations?programme=\${selectedProgramme._id}&limit=1000\`);
      setModalRegistrations(data.registrations || []);
      setNewTopicForm({ candidateId: '', teamId: '', topic: '', attachment: '' });
      setIsRegisterModalOpen(true);
    } catch(e) {
      alertAction('Failed to fetch registrations');
    }
  };

  const handleRegisterTopic = async () => {
    try {
      const payload = {
        programmeId: selectedProgramme._id,
        teamId: newTopicForm.teamId,
        topic: newTopicForm.topic,
        attachment: newTopicForm.attachment
      };
      if (selectedProgramme.format !== 'Group') {
        payload.candidateId = newTopicForm.candidateId;
      }
      await api.post('/topic-registrations', payload);
      alertAction('Topic registered successfully!');
      setIsRegisterModalOpen(false);
      fetchProgrammeTopics(selectedProgramme._id);
    } catch(e) {
      alertAction(e.response?.data?.message || 'Failed to register topic');
    }
  };
  
  const fetchProgrammeTopics = async (progId) => {`);

    // 3. Add button in the UI
    c = c.replace(
        /<h3 className="text-base font-semibold text-\[var\(--color-text-heading\)\]">Submitted Topics<\/h3>\s*<div className="text-xs bg-\[var\(--color-surface-elevated\)\]/,
        `<h3 className="text-base font-semibold text-[var(--color-text-heading)]">Submitted Topics</h3>
                  <div className="flex items-center gap-3">
                    <button onClick={openRegisterModal} className="px-3 py-1 bg-[var(--color-primary)] text-white text-xs font-semibold rounded-md hover:bg-[var(--color-primary-dark)] transition-colors">
                      + Register Topic
                    </button>
                    <div className="text-xs bg-[var(--color-surface-elevated)]`
    );

    // 4. Add the Modal JSX at the end before final </div>
    const modalJSX = `{isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99]">
          <div className="bg-[var(--color-surface)] p-6 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Register Topic for {selectedProgramme?.name}</h3>
              <button onClick={() => setIsRegisterModalOpen(false)}><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              {selectedProgramme?.format === 'Group' ? (
                <div>
                  <label className="block text-xs font-bold mb-1">Select Team</label>
                  <select className="w-full p-2 border rounded" value={newTopicForm.teamId} onChange={e => setNewTopicForm({...newTopicForm, teamId: e.target.value})}>
                    <option value="">-- Select Team --</option>
                    {modalRegistrations.filter(r => r.status !== 'rejected').map(r => (
                      <option key={r._id} value={r.team?._id}>{r.team?.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold mb-1">Select Candidate</label>
                  <select className="w-full p-2 border rounded" value={newTopicForm.candidateId} onChange={e => {
                      const candId = e.target.value;
                      const reg = modalRegistrations.find(r => r.candidates?.some(c => c._id === candId));
                      setNewTopicForm({...newTopicForm, candidateId: candId, teamId: reg ? reg.team?._id : ''});
                  }}>
                    <option value="">-- Select Candidate --</option>
                    {modalRegistrations.filter(r => r.status !== 'rejected').flatMap(r => r.candidates || []).map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1">Topic</label>
                {(topicMode === 'fixed' || topicMode === 'exclusive') ? (
                  <select className="w-full p-2 border rounded" value={newTopicForm.topic} onChange={e => setNewTopicForm({...newTopicForm, topic: e.target.value})}>
                    <option value="">-- Select Topic --</option>
                    {topicListRaw.split('\\n').map(t => t.trim()).filter(Boolean).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" className="w-full p-2 border rounded" placeholder="Enter topic" value={newTopicForm.topic} onChange={e => setNewTopicForm({...newTopicForm, topic: e.target.value})} />
                )}
              </div>

              {topicMode === 'free-text' && (
                <div>
                  <label className="block text-xs font-bold mb-1">Attachment (URL)</label>
                  <input type="text" className="w-full p-2 border rounded" placeholder="https://..." value={newTopicForm.attachment} onChange={e => setNewTopicForm({...newTopicForm, attachment: e.target.value})} />
                </div>
              )}

              <Button onClick={handleRegisterTopic} className="w-full justify-center">Submit Topic</Button>
            </div>
          </div>
        </div>
      )}`;
      
    c = c.replace(/<\/div>\s*<\/div>\s*<\/div>\s*\);/s, `</div>\n      </div>\n      ${modalJSX}\n    </div>\n  );`);
    
    fs.writeFileSync('admin-hudafestival-main/src/pages/TopicManagementPage.jsx', c, 'utf8');
    console.log("Patched TopicManagementPage.jsx");
} else {
    console.log("Already patched");
}