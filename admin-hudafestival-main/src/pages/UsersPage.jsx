import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/Button';
import { useAlert } from '../context/AlertContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Modal from '../components/Modal';
import AnimatedInput from '@/components/smoothui/animated-input';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { Users as UsersIcon } from 'lucide-react';

export default function UsersPage() {
  const alertAction = useAlert();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({ userName: '', password: '', role: 'admin', team: '' });
  const [editingUserId, setEditingUserId] = useState(null);
  
  const [deletingUser, setDeletingUser] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetForm, setResetForm] = useState({ userName: '', newPassword: '' });
  const [resetLoading, setResetLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, teamsRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/teams')
      ]);
      setUsers(usersRes.data || []);
      setTeams(teamsRes.data || []);
    } catch (err) {
      alertAction('Error loading users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUserId(user._id);
      setUserForm({ userName: user.userName, password: '', role: user.role, team: user.team?._id || user.team || '' });
    } else {
      setEditingUserId(null);
      setUserForm({ userName: '', password: '', role: 'admin', team: '' });
    }
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { userName: userForm.userName, role: userForm.role, team: userForm.team };
      if (userForm.password) payload.password = userForm.password;
      
      if (editingUserId) {
        // Assume update route is /auth/users/:id or similar.
        // Wait, the backend currently only has /auth/team-leaders/:id for updating!
        // We will just use the reset password for edits, or if we must support full edits, we'll create the route.
        // For now, team leaders have an update route. Let's make a generic user update.
        await api.put(`/auth/users/${editingUserId}`, payload);
      } else {
        await api.post('/auth/register', payload);
      }
      setShowUserModal(false);
      fetchData();
      alertAction(editingUserId ? 'User updated successfully!' : 'User created successfully!');
    } catch (err) {
      alertAction(err.response?.data?.message || 'Error saving user.');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/auth/users/${deletingUser._id}`);
      setShowConfirmDelete(false);
      fetchData();
      alertAction('User deleted successfully!');
    } catch (err) {
      alertAction(err.response?.data?.message || 'Error deleting user.');
    }
  };

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

  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Users & Roles</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Manage platform access, roles, and assign teams to Team Leaders.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setResetModalOpen(true)} variant="secondary">Reset User Password</Button>
          <Button onClick={() => handleOpenModal()} variant="primary">
            <Plus size={16} className="mr-1" /> Add User
          </Button>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)]">
            <tr>
              <th className="px-6 py-4 font-bold text-[11px] tracking-wider text-[var(--color-text-muted)] uppercase">Username</th>
              <th className="px-6 py-4 font-bold text-[11px] tracking-wider text-[var(--color-text-muted)] uppercase">Role</th>
              <th className="px-6 py-4 font-bold text-[11px] tracking-wider text-[var(--color-text-muted)] uppercase">Team</th>
              <th className="px-6 py-4 font-bold text-[11px] tracking-wider text-[var(--color-text-muted)] uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {users.map(user => (
              <tr key={user._id} className="hover:bg-[var(--color-surface-elevated)]/30 transition-colors">
                <td className="px-6 py-4 font-medium text-[var(--color-text-heading)]">{user.userName}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 uppercase tracking-wider">
                    {user.role?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-[var(--color-text-muted)]">
                  {user.team?.name || '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenModal(user)} className="p-2 text-[var(--color-text-muted)] hover:text-blue-500 rounded-lg hover:bg-blue-500/10 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => { setDeletingUser(user); setShowConfirmDelete(true); }} className="p-2 text-[var(--color-text-muted)] hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <EmptyState icon={UsersIcon} title="No users found" description="Create a user to get started." />
        )}
      </div>

      {/* User Modal */}
      <Modal isOpen={showUserModal} onClose={() => setShowUserModal(false)} title={editingUserId ? "Edit User" : "Add User"}>
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Username</label>
            <input type="text" required value={userForm.userName} onChange={e => setUserForm({...userForm, userName: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]" />
          </div>
          {!editingUserId && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Password</label>
              <input type="password" required={!editingUserId} value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Role</label>
            <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]">
              <option value="admin">Admin</option>
              <option value="team_leader">Team Leader</option>
            </select>
          </div>
          {userForm.role === 'team_leader' && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Assign Team</label>
              <select required value={userForm.team} onChange={e => setUserForm({...userForm, team: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]">
                <option value="">Select a team...</option>
                {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={() => setShowUserModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save User</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={showConfirmDelete} title="Delete User" message="Are you sure you want to permanently delete this user?" onConfirm={handleDeleteUser} onCancel={() => setShowConfirmDelete(false)} confirmText="Delete" />

      {/* Password Reset Modal */}
      <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} title="Reset User Password">
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)] mb-4">Reset password for any Admin, Judge, or Volunteer account by entering their exact username.</p>
          <div><AnimatedInput label="Username" type="text" required value={resetForm.userName} onChange={val => setResetForm({...resetForm, userName: val})} placeholder="e.g. judge_admin" /></div>
          <div><AnimatedInput label="New Password" type="password" required value={resetForm.newPassword} onChange={val => setResetForm({...resetForm, newPassword: val})} placeholder="Enter new password" /></div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setResetModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={resetLoading}>{resetLoading ? 'Resetting...' : 'Reset Password'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}



