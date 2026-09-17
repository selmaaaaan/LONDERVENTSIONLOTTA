import GridLoader from '@/components/smoothui/grid-loader';
import { useAlert } from '../context/AlertContext';
import Pagination from '../components/Pagination';
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/Button';
import AnimatedInput from '@/components/smoothui/animated-input';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { Edit2, Trash2, Plus } from 'lucide-react';

const UsersPage = () => {
  const alertAction = useAlert();

  const [teams, setTeams] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modals state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmDeleteLeader, setShowConfirmDeleteLeader] = useState(false);
  
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);
  const [deletingLeader, setDeletingLeader] = useState(null);
  const [editLeaderId, setEditLeaderId] = useState(null);

  // Forms state
  const [teamForm, setTeamForm] = useState({ name: '', color: '#000000' });
  const [leaderForm, setLeaderForm] = useState({ userName: '', password: '', team: '' });
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetForm, setResetForm] = useState({ userName: '', newPassword: '' });
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, leadersRes] = await Promise.all([
        api.get('/teams'),
        api.get('/auth/team-leaders')
      ]);
      setTeams(teamsRes.data || []);
      setTeamLeaders(leadersRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Team Actions
  const handleToggleTeamTopic = async (team) => {
    try {
      const newVal = !(team.isTopicRegistrationOpen !== false);
      await api.put(`/teams/${team._id}`, { isTopicRegistrationOpen: newVal });
      setTeams(teams.map(t => t._id === team._id ? { ...t, isTopicRegistrationOpen: newVal } : t));
    } catch (err) {
      alertAction(err.response?.data?.message || 'Error updating team topic registration');
    }
  };

  const handleOpenTeamModal = (team = null) => {
    setError('');
    if (team) {
      setEditingTeam(team);
      setTeamForm({ name: team.name, color: team.color || '#000000' });
    } else {
      setEditingTeam(null);
      setTeamForm({ name: '', color: '#000000' });
    }
    setShowTeamModal(true);
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingTeam) {
        await api.put(`/teams/${editingTeam._id}`, teamForm);
      } else {
        await api.post('/teams', teamForm);
      }
      setShowTeamModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving team');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteTeam = (team) => {
    setDeletingTeam(team);
    setShowConfirmDelete(true);
  };

  const handleDeleteTeam = async () => {
    try {
      await api.delete(`/teams/${deletingTeam._id}`);
      setShowConfirmDelete(false);
      fetchData();
    } catch (err) {
      alertAction(err.response?.data?.message || 'Error deleting team');
    }
  };

  // Leader Actions
  const handleEditLeaderModal = (leader) => {
    setError('');
    setEditLeaderId(leader._id);
    setLeaderForm({ 
      userName: leader.userName, 
      password: '', // Blank password implies no change unless typed
      team: leader.team?._id || leader.team || '' 
    });
    setShowLeaderModal(true);
  };

  const handleOpenLeaderModal = () => {
    setError('');
    setEditLeaderId(null);
    setLeaderForm({ userName: '', password: '', team: '' });
    setShowLeaderModal(true);
  };

  const handleSaveLeader = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editLeaderId) {
        const payload = { userName: leaderForm.userName, team: leaderForm.team };
        if (leaderForm.password) payload.password = leaderForm.password;
        await api.put(`/auth/team-leaders/${editLeaderId}`, payload);
      } else {
        await api.post('/auth/register', { ...leaderForm, role: 'team_leader' });
      }
      setShowLeaderModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving leader');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteLeader = (leader) => {
    setDeletingLeader(leader);
    setShowConfirmDeleteLeader(true);
  };

  const handleDeleteLeader = async () => {
    try {
      await api.delete(`/auth/team-leaders/${deletingLeader._id}`);
      setShowConfirmDeleteLeader(false);
      fetchData();
    } catch (err) {
      alertAction(err.response?.data?.message || 'Error deleting leader');
    }
  };

  return (
    <div className="p-6 w-full space-y-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex justify-between w-full items-center">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Users & Teams</h1>
          <Button onClick={() => setResetModalOpen(true)} variant="secondary">
            Reset User Password
          </Button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <GridLoader size="lg" color="#ea580c" mode="pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Teams Section */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface-elevated)]">
              <h2 className="text-sm font-bold text-[var(--color-text-heading)] uppercase tracking-wider">Teams</h2>
              <Button size="sm" onClick={() => handleOpenTeamModal()} variant="primary">
                <Plus size={16} className="mr-1" /> Add Team
              </Button>
            </div>
            <div className="p-4 space-y-3">
              {teams.length === 0 ? (
                <div className="text-sm text-[var(--color-text-muted)] text-center py-4">No teams found.</div>
              ) : (
                teams.map(team => (
                  <div key={team._id} className="flex items-center justify-between p-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: team.color || '#ccc' }}></div>
                      <span className="font-medium text-[var(--color-text-heading)]">{team.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center mr-4">
                        <span className="text-[10px] text-[var(--color-text-muted)] mb-1">Topics</span>
                        <button 
                          onClick={() => handleToggleTeamTopic(team)}
                          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none \${team.isTopicRegistrationOpen !== false ? 'bg-green-500' : 'bg-red-500'}`}
                        >
                          <span className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform \${team.isTopicRegistrationOpen !== false ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <button onClick={() => handleOpenTeamModal(team)} className="p-1.5 text-[var(--color-text-muted)] hover:text-blue-500 rounded-md hover:bg-blue-500/10">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => confirmDeleteTeam(team)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 rounded-md hover:bg-red-500/10">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Team Leaders Section */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface-elevated)]">
              <h2 className="text-sm font-bold text-[var(--color-text-heading)] uppercase tracking-wider">Team Leaders</h2>
              <Button size="sm" onClick={handleOpenLeaderModal} variant="primary">
                <Plus size={16} className="mr-1" /> Add Leader
              </Button>
            </div>
            <div className="p-4 space-y-3">
              {teamLeaders.length === 0 ? (
                <div className="text-sm text-[var(--color-text-muted)] text-center py-4">No team leaders found.</div>
              ) : (
                teamLeaders.map(leader => {
                  const leaderTeamName = leader.team?.name || teams.find(t => t._id === leader.team)?.name || 'None';
                  return (
                    <div key={leader._id} className="flex items-center justify-between p-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg">
                      <div>
                        <div className="font-medium text-[var(--color-text-heading)]">{leader.userName}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">Team: {leaderTeamName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEditLeaderModal(leader)} className="p-1.5 text-[var(--color-text-muted)] hover:text-blue-500 rounded-md hover:bg-blue-500/10">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => confirmDeleteLeader(leader)} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 rounded-md hover:bg-red-500/10">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      
      {/* Password Reset Modal */}
      <Modal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} title="Reset User Password">
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)] mb-4">Reset password for any Admin, Judge, or Volunteer account by entering their exact username.</p>
          <div>
            <AnimatedInput label="Username" type="text" required value={resetForm.userName} onChange={val => setResetForm({...resetForm, userName: val})} placeholder="e.g. judge_admin" />
          </div>
          <div>
            <AnimatedInput label="New Password" type="password" required value={resetForm.newPassword} onChange={val => setResetForm({...resetForm, newPassword: val})} placeholder="Enter new password" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setResetModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={resetLoading}>
              {resetLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Team Modal */}
      <Modal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)} title={editingTeam ? 'Edit Team' : 'Add Team'}>
        <form onSubmit={handleSaveTeam} className="space-y-4">
          {error && <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Team Name</label>
            <input 
              type="text" 
              required
              value={teamForm.name} 
              onChange={e => setTeamForm({...teamForm, name: e.target.value})}
              className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Team Color</label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={teamForm.color} 
                onChange={e => setTeamForm({...teamForm, color: e.target.value})}
                className="w-12 h-10 p-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded cursor-pointer"
              />
              <span className="text-sm text-[var(--color-text-muted)]">{teamForm.color}</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowTeamModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Save Team</Button>
          </div>
        </form>
      </Modal>

      {/* Leader Modal */}
      <Modal isOpen={showLeaderModal} onClose={() => setShowLeaderModal(false)} title={editLeaderId ? "Edit Team Leader" : "Add Team Leader"}>
        <form onSubmit={handleSaveLeader} className="space-y-4">
          {error && <div className="text-sm text-red-400 bg-red-900/20 p-2 rounded">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Username</label>
            <input 
              type="text" 
              required
              value={leaderForm.userName} 
              onChange={e => setLeaderForm({...leaderForm, userName: e.target.value})}
              className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Password</label>
            <input 
              type="password" 
              required={!editLeaderId}
              value={leaderForm.password} 
              onChange={e => setLeaderForm({...leaderForm, password: e.target.value})}
              className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
              placeholder={editLeaderId ? "Leave blank to keep current" : ""}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Assign Team</label>
            <select
              required
              value={leaderForm.team}
              onChange={e => setLeaderForm({...leaderForm, team: e.target.value})}
              className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">Select a team...</option>
              {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowLeaderModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Save Leader</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={showConfirmDelete}
        title="Delete Team"
        message={`Are you sure you want to delete \${deletingTeam?.name}?`}
        onConfirm={handleDeleteTeam}
        onCancel={() => setShowConfirmDelete(false)}
        confirmText="Delete"
      />

      <ConfirmDialog
        open={showConfirmDeleteLeader}
        title="Delete Team Leader"
        message={`Are you sure you want to delete the leader account for \${deletingLeader?.userName}?`}
        onConfirm={handleDeleteLeader}
        onCancel={() => setShowConfirmDeleteLeader(false)}
        confirmText="Delete"
      />
    </div>
  );
};

export default UsersPage;

