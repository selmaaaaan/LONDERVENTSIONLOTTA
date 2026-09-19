const fs = require('fs');
let c = fs.readFileSync('admin-hudafestival-main/src/pages/UsersPage.jsx', 'utf8');

// 1. Add state for Reset Password
const stateAdd = `
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetForm, setResetForm] = useState({ userName: '', newPassword: '' });
  const [resetLoading, setResetLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await api.patch('/auth/reset-password', resetForm);
      alertAction('Password reset successfully!');
      setResetModalOpen(false);
      setResetForm({ userName: '', newPassword: '' });
    } catch (err) {
      alertAction(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };
`;
c = c.replace('const [error, setError] = useState(null);', 'const [error, setError] = useState(null);' + stateAdd);

// 2. Add button in the UI
const buttonAdd = `
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Users & Teams</h1>
          <Button size="sm" onClick={() => setResetModalOpen(true)} variant="secondary">
            <Shield size={16} className="mr-1" /> Reset User Password
          </Button>
        </div>
`;
c = c.replace(
  `<div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Users & Teams</h1>
      </div>`, 
  buttonAdd
);

// 3. Add Modal
const modalAdd = `
      {/* Password Reset Modal */}
      <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} title="Reset User Password">
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)] mb-4">Reset password for any Admin, Judge, or Volunteer account by entering their exact username.</p>
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input type="text" required value={resetForm.userName} onChange={e => setResetForm({...resetForm, userName: e.target.value})} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-heading)]" placeholder="e.g. judge_admin" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input type="password" required minLength={6} value={resetForm.newPassword} onChange={e => setResetForm({...resetForm, newPassword: e.target.value})} className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-heading)]" placeholder="Enter new password" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setResetModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={resetLoading}>
              {resetLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        </form>
      </Modal>
`;
c = c.replace('{/* Team Modal */}', modalAdd + '\n      {/* Team Modal */}');

// 4. Ensure Shield icon is imported
if (!c.includes('Shield')) {
  c = c.replace('Plus,', 'Plus, Shield,');
}

fs.writeFileSync('admin-hudafestival-main/src/pages/UsersPage.jsx', c);
console.log("UsersPage updated");
