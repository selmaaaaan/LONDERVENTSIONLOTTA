const fs = require('fs');
let c = fs.readFileSync('src/pages/UsersPage.jsx', 'utf8');

// Inject state
if (!c.includes('resetModalOpen')) {
  c = c.replace(/const \[leaderForm, setLeaderForm\] = useState\(\{ userName: '', password: '', team: '' \}\);/,
`const [leaderForm, setLeaderForm] = useState({ userName: '', password: '', team: '' });
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetForm, setResetForm] = useState({ userName: '', newPassword: '' });
  const [resetLoading, setResetLoading] = useState(false);`);
} else {
  // If it's already there (maybe lower down?), let's ensure it's in the component
  if (!c.includes('const [resetModalOpen')) {
    c = c.replace(/const \[leaderForm, setLeaderForm\] = useState\(\{ userName: '', password: '', team: '' \}\);/,
`const [leaderForm, setLeaderForm] = useState({ userName: '', password: '', team: '' });
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetForm, setResetForm] = useState({ userName: '', newPassword: '' });
  const [resetLoading, setResetLoading] = useState(false);`);
  }
}

// Inject handleResetPassword
if (!c.includes('const handleResetPassword')) {
  c = c.replace(/const handleLeaderSubmit = async \(e\) => \{/,
`const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await api.patch('/auth/reset-password', resetForm);
      alertAction('Password reset successfully');
      setResetModalOpen(false);
      setResetForm({ userName: '', newPassword: '' });
    } catch (err) {
      alertAction(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const handleLeaderSubmit = async (e) => {`);
}

// Ensure the button to open it exists. Wait, where is the button?
if (!c.includes('setResetModalOpen(true)')) {
  c = c.replace(/<div className="flex justify-between items-center mb-6">/,
`<div className="flex justify-between items-center mb-6">
          <Button onClick={() => setResetModalOpen(true)} variant="secondary">
            Reset User Password
          </Button>`);
}

fs.writeFileSync('src/pages/UsersPage.jsx', c);
console.log("Patched state and handlers into UsersPage.jsx");
