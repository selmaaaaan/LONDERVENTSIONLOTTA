import GridLoader from '@/components/smoothui/grid-loader';
import { useAlert } from '../context/AlertContext';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const THEME_COLORS = [
  { name: 'Red', bg: '#ef4444', hover: '#dc2626' },
  { name: 'Blue', bg: '#3b82f6', hover: '#2563eb' },
  { name: 'Green', bg: '#22c55e', hover: '#16a34a' },
  { name: 'Purple', bg: '#a855f7', hover: '#9333ea' },
  { name: 'Orange', bg: '#f97316', hover: '#ea580c' },
  { name: 'Teal', bg: '#14b8a6', hover: '#0d9488' }
];

const SettingsPage = () => {
  const alertAction = useAlert();

  const [settings, setSettings] = useState({ 
    isRegistrationOpen: true, 
    topicRegistrationEnabled: true,
    maintenanceMode: false, 
    maintenanceMessage: '',
    categoryRegistrationStatus: {
        'BIDĀYAH': true, 'ŪLĀ': true, 'THĀNIYAH': true, 'THĀNAWIYYAH': true, 'ĀLIYAH': true, 'KULLIYYAH': true
      },
      categoryTopicRegistrationStatus: {
        'BIDĀYAH': true, 'ŪLĀ': true, 'THĀNIYAH': true, 'THĀNAWIYYAH': true, 'ĀLIYAH': true, 'KULLIYYAH': true
      },
      categoryItemLimits: {
        'BIDĀYAH': { total: 9, stage: 4, nonStage: 5 },
        'E_ŪLĀ': { total: 9, stage: 4, nonStage: 5 },
        'THĀNIYAH': { total: 9, stage: 4, nonStage: 5 },
        'THĀNAWIYYAH': { total: 11, stage: 5, nonStage: 6 },
        'EĀLIYAH': { total: 9, stage: 4, nonStage: 5 }
      }
    });
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deletingTeam, setDeletingTeam] = useState(null);
  const [showConfirmDeleteTeam, setShowConfirmDeleteTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', color: '#000000' });
  const [submittingTeam, setSubmittingTeam] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTeamTopic = async (team) => {
    try {
      const newVal = !(team.isTopicRegistrationOpen !== false);
      await api.put(`/teams/${team._id}`, { isTopicRegistrationOpen: newVal });
      setTeams(teams.map(t => t._id === team._id ? { ...t, isTopicRegistrationOpen: newVal } : t));
    } catch (err) {
      alertAction(err.response?.data?.message || 'Error updating team topic registration');
    }
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    setSubmittingTeam(true);
    try {
      if (editingTeam) {
        await api.put(`/teams/${editingTeam._id}`, teamForm);
      } else {
        await api.post('/teams', teamForm);
      }
      setShowTeamModal(false);
      setEditingTeam(null);
      setTeamForm({ name: '', color: '#000000' });
      fetchTeams();
    } catch (err) {
      alertAction(err.response?.data?.message || 'Error saving team');
    } finally {
      setSubmittingTeam(false);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await api.delete(`/teams/${deletingTeam._id}`);
      setShowConfirmDeleteTeam(false);
      fetchTeams();
    } catch (err) {
      alertAction(err.response?.data?.message || 'Error deleting team');
    }
  };
  const [error, setError] = useState('');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const isAdmin = userInfo?.role === 'admin';

  const [showConfirmToggleReg, setShowConfirmToggleReg] = useState(false);
  const [showConfirmToggleTopic, setShowConfirmToggleTopic] = useState(false);
  const [savingMaintenance, setSavingMaintenance] = useState(false);
  const [savingLimits, setSavingLimits] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setSettings(prev => ({
            ...prev,
            isRegistrationOpen: res.data.isRegistrationOpen ?? true,
            topicRegistrationEnabled: res.data.topicRegistrationEnabled ?? true,
            maintenanceMode: res.data.maintenanceMode ?? false,
            maintenanceMessage: res.data.maintenanceMessage ?? '',
            categoryRegistrationStatus: res.data.categoryRegistrationStatus || prev.categoryRegistrationStatus,
            categoryTopicRegistrationStatus: res.data.categoryTopicRegistrationStatus || prev.categoryTopicRegistrationStatus,
            categoryItemLimits: res.data.categoryItemLimits || prev.categoryItemLimits,
            venues: res.data.venues || []
          }));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRegistration = async () => {
    try {
      const updatedStatus = !settings.isRegistrationOpen;
      await api.patch('/settings', { isRegistrationOpen: updatedStatus });
      setSettings(s => ({ ...s, isRegistrationOpen: updatedStatus }));
      setShowConfirmToggleReg(false);
    } catch (err) {
      console.error(err);
      setError('Failed to update registration status');
    }
  };

  const handleToggleTopic = async () => {
    try {
      const newVal = !settings.topicRegistrationEnabled;
      await api.patch('/settings', { topicRegistrationEnabled: newVal });
      setSettings(s => ({ ...s, topicRegistrationEnabled: newVal }));
      setShowConfirmToggleTopic(false);
    } catch (err) {
      alertAction(err.response?.data?.message || 'Error updating settings');
    }
  };

  const handleUpdateCategoryLimits = async (cat, field, value) => {
    try {
      const currentLimits = settings.categoryItemLimits || {};
      const newLimits = { 
          ...currentLimits, 
          [cat]: { ...(currentLimits[cat] || { total: cat === 'THĀNAWIYYAH' ? 11 : 9, stage: cat === 'THĀNAWIYYAH' ? 5 : 4, nonStage: cat === 'THĀNAWIYYAH' ? 6 : 5 }), [field]: parseInt(value, 10) || 0 } 
      };
      // Auto update total
      if (field === 'stage' || field === 'nonStage') {
          newLimits[cat].total = newLimits[cat].stage + newLimits[cat].nonStage;
      }
      
      setSettings(s => ({ ...s, categoryItemLimits: newLimits }));
      
      // Save to backend immediately or we can have a save button. Let's just have a save button for all limits.
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAllLimits = async () => {
    try {
      setSavingLimits(true);
      await api.patch('/settings', { categoryItemLimits: settings.categoryItemLimits });
    } catch (err) {
      setError('Failed to save category limits');
    } finally {
      setSavingLimits(false);
    }
  };

  const handleToggleTopicCategory = async (cat) => {
    try {
      const currentStatus = settings.categoryTopicRegistrationStatus || {};
      const newStatus = { ...currentStatus, [cat]: !(currentStatus[cat] !== false) };
      await api.patch('/settings', { categoryTopicRegistrationStatus: newStatus });
      setSettings(s => ({ ...s, categoryTopicRegistrationStatus: newStatus }));
    } catch (err) {
      console.error(err);
      setError('Failed to update category topic registration status');
    }
  };

  const handleToggleCategory = async (cat) => {
    try {
      const currentStatus = settings.categoryRegistrationStatus || {};
      const newStatus = { ...currentStatus, [cat]: !(currentStatus[cat] !== false) };
      await api.patch('/settings', { categoryRegistrationStatus: newStatus });
      setSettings(s => ({ ...s, categoryRegistrationStatus: newStatus }));
    } catch (err) {
      console.error(err);
      setError('Failed to update category registration status');
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      const updatedStatus = !settings.maintenanceMode;
      await api.patch('/settings', { maintenanceMode: updatedStatus });
      setSettings(s => ({ ...s, maintenanceMode: updatedStatus }));
    } catch (err) {
      setError('Failed to update maintenance mode');
    }
  };

  const handleSaveMaintenanceMessage = async () => {
    try {
      setSavingMaintenance(true);
      await api.patch('/settings', { maintenanceMessage: settings.maintenanceMessage });
    } catch (err) {
      setError('Failed to save message');
    } finally {
      setSavingMaintenance(false);
    }
  };

  const applyTheme = (theme) => {
    document.documentElement.style.setProperty('--color-primary', theme.bg);
    document.documentElement.style.setProperty('--color-primary-hover', theme.hover);
    localStorage.setItem('huda-admin-primary-theme', JSON.stringify(theme));
    setSettings({ ...settings }); 
  };

  const currentTheme = JSON.parse(localStorage.getItem('huda-admin-primary-theme')) || THEME_COLORS[0];

  return (
    <div className="p-6 w-full space-y-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Settings</h1>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <GridLoader size="lg" color="#ea580c" mode="pulse" />
        </div>
      ) : (
        <>
          </>
          )}

                    {/* Teams Management */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">Teams</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Manage teams and their registration states.</p>
              </div>
              <Button onClick={() => setShowTeamModal(true)} variant="primary">Add Team</Button>
            </div>
            
            <div className="space-y-3">
              {teams.map(team => (
                <div key={team._id} className="flex items-center justify-between p-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: team.color || '#ccc' }}></div>
                    <span className="font-medium text-[var(--color-text-heading)]">{team.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-[var(--color-text-muted)] mb-1">Topics</span>
                      <button onClick={() => handleToggleTeamTopic(team)} className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none ${team.isTopicRegistrationOpen !== false ? 'bg-green-500' : 'bg-red-500'}`}>
                        <span className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${team.isTopicRegistrationOpen !== false ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingTeam(team); setTeamForm({ name: team.name, color: team.color || '#000000' }); setShowTeamModal(true); }} className="p-1.5 text-[var(--color-text-muted)] hover:text-blue-500 rounded-md hover:bg-blue-500/10">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => { setDeletingTeam(team); setShowConfirmDeleteTeam(true); }} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 rounded-md hover:bg-red-500/10">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {teams.length === 0 && <div className="text-sm text-[var(--color-text-muted)] py-2">No teams found.</div>}
            </div>
          </div>

          {/* Theme Preferences */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Theme Preferences</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">Select your preferred accent color for the application.</p>
            <div className="flex gap-4">
              {THEME_COLORS.map(theme => (
                <button 
                  key={theme.bg}
                  onClick={() => applyTheme(theme)}
                  className={`w-10 h-10 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${currentTheme?.bg === theme.bg ? 'ring-4 ring-offset-2 ring-blue-500' : ''}`}
                  style={{ backgroundColor: theme.bg }}
                />
              ))}
            </div>
          </div>

          {/* Registration Status */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-6">Registration Status</h2>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[var(--color-text-heading)] font-medium">Allow New Registrations</p>
                <p className="text-sm text-[var(--color-text-muted)]">When disabled, team leaders will see a "Closed" message and cannot register new candidates.</p>
              </div>
              <button 
                onClick={() => setShowConfirmToggleReg(true)}
                style={{ backgroundColor: settings.isRegistrationOpen ? '#10b981' : '#ef4444', width: '44px', height: '24px', borderRadius: '9999px', position: 'relative', transition: 'background-color 0.2s', cursor: 'pointer', border: 'none' }}
              >
                <span style={{ display: 'inline-block', width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: settings.isRegistrationOpen ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
              </button>
            </div>

            {/* Category Toggles */}
            {settings.isRegistrationOpen && (
              <div className="mb-6 pt-6 border-t border-[var(--color-border)]">
                <p className="text-[var(--color-text-heading)] font-medium mb-4">Category-Wise Registration Status</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['BIDĀYAH', 'ŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ĀLIYAH', 'KULLIYYAH'].map(cat => {
                    const isOpen = settings.categoryRegistrationStatus ? settings.categoryRegistrationStatus[cat] !== false : true;
                    return (
                      <div key={cat} className="flex items-center justify-between bg-[var(--color-surface-elevated)] p-3 rounded-lg border border-[var(--color-border)]">
                        <span className="text-sm font-medium text-[var(--color-text-heading)]">{cat}</span>
                        <button 
                            onClick={() => handleToggleCategory(cat)}
                            style={{ backgroundColor: isOpen ? '#10b981' : '#ef4444', width: '44px', height: '24px', borderRadius: '9999px', position: 'relative', transition: 'background-color 0.2s', cursor: 'pointer', border: 'none' }}
                          >
                            <span 
                                style={{ 
                                    display: 'inline-block', 
                                    width: '18px', 
                                    height: '18px', 
                                    backgroundColor: 'white', 
                                    borderRadius: '50%', 
                                    position: 'absolute', 
                                    top: '3px', 
                                    left: isOpen ? '23px' : '3px',
                                    transition: 'left 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                }} 
                            />
                          </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-[var(--color-border)] flex items-center justify-between">
              <div>
                <p className="text-[var(--color-text-heading)] font-medium">Allow Topic Registrations</p>
                <p className="text-sm text-[var(--color-text-muted)]">When disabled, team leaders cannot submit new topic registrations.</p>
              </div>
              <button 
                onClick={() => setShowConfirmToggleTopic(true)}
                style={{ backgroundColor: settings.topicRegistrationEnabled ? '#10b981' : '#ef4444', width: '44px', height: '24px', borderRadius: '9999px', position: 'relative', transition: 'background-color 0.2s', cursor: 'pointer', border: 'none' }}
              >
                <span style={{ display: 'inline-block', width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: settings.topicRegistrationEnabled ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
              </button>
            </div>
          
            {/* Topic Category Toggles */}
            {settings.topicRegistrationEnabled && (
              <div className="mb-6 pt-6 border-t border-[var(--color-border)]">
                <p className="text-[var(--color-text-heading)] font-medium mb-4">Category-Wise Topic Registration Status</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['BIDĀYAH', 'ŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ĀLIYAH', 'KULLIYYAH'].map(cat => {
                    const isOpen = settings.categoryTopicRegistrationStatus ? settings.categoryTopicRegistrationStatus[cat] !== false : true;
                    return (
                      <div key={cat} className="flex items-center justify-between bg-[var(--color-surface-elevated)] p-3 rounded-lg border border-[var(--color-border)]">
                        <span className="text-sm font-medium text-[var(--color-text-heading)]">{cat}</span>
                        <button 
                            onClick={() => handleToggleTopicCategory(cat)}
                            style={{ backgroundColor: isOpen ? '#10b981' : '#ef4444', width: '44px', height: '24px', borderRadius: '9999px', position: 'relative', transition: 'background-color 0.2s', cursor: 'pointer', border: 'none' }}
                          >
                            <span 
                                style={{ display: 'inline-block', width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isOpen ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} 
                            />
                          </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          
          {/* Category Limits */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-6">Category-Wise Item Limits (Individual)</h2>
            <div className="space-y-4">
              {['BIDĀYAH', 'E_ŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'EĀLIYAH'].map(cat => {
                
                  const defaultLimits = {
                    'BIDĀYAH': { total: 9, stage: 4, nonStage: 5 },
                    'E_ŪLĀ': { total: 9, stage: 4, nonStage: 5 },
                    'THĀNIYAH': { total: 9, stage: 4, nonStage: 5 },
                    'THĀNAWIYYAH': { total: 11, stage: 5, nonStage: 6 },
                    'EĀLIYAH': { total: 9, stage: 4, nonStage: 5 }
                  };
                  const limits = settings.categoryItemLimits && settings.categoryItemLimits[cat] ? settings.categoryItemLimits[cat] : defaultLimits[cat];
                return (
                  <div key={cat} className="flex flex-col md:flex-row items-center gap-4 bg-[var(--color-surface-elevated)] p-4 rounded-lg border border-[var(--color-border)]">
                    <span className="w-full md:w-1/4 text-sm font-medium text-[var(--color-text-heading)]">{cat.replace('E_', '')}</span>
                    <div className="w-full md:w-3/4 flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Stage Items</label>
                            <input 
                                type="number" 
                                value={limits?.stage || 0} 
                                onChange={(e) => handleUpdateCategoryLimits(cat, 'stage', e.target.value)}
                                className="w-full px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text-heading)]"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Non-Stage Items</label>
                            <input 
                                type="number" 
                                value={limits?.nonStage || 0} 
                                onChange={(e) => handleUpdateCategoryLimits(cat, 'nonStage', e.target.value)}
                                className="w-full px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-[var(--color-text-heading)]"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-[var(--color-text-muted)] mb-1">Total Limit</label>
                            <input 
                                type="number" 
                                value={limits?.total || 0} 
                                disabled
                                className="w-full px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded text-sm opacity-50 cursor-not-allowed text-[var(--color-text-heading)]"
                            />
                        </div>
                    </div>
                  </div>
                )
              })}
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveAllLimits} loading={savingLimits} variant="primary">
                  Save Limits
                </Button>
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-heading)] mb-6">Maintenance Mode</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--color-text-heading)] font-medium">Enable Maintenance Mode</p>
                <p className="text-sm text-[var(--color-text-muted)]">When enabled, the public site is hidden and displays the maintenance message. Admins can still log in.</p>
              </div>
              <button 
                onClick={handleToggleMaintenance}
                style={{ backgroundColor: settings.maintenanceMode ? '#ef4444' : '#cbd5e1', width: '44px', height: '24px', borderRadius: '9999px', position: 'relative', transition: 'background-color 0.2s', cursor: 'pointer', border: 'none' }}
              >
                <span style={{ display: 'inline-block', width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: settings.maintenanceMode ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
              </button>
            </div>

            {settings.maintenanceMode && (
              <div className="mt-6 pt-6 border-t border-[var(--color-border)] space-y-4">
                <label className="block text-sm font-medium text-[var(--color-text-heading)]">Maintenance Message</label>
                <textarea 
                  value={settings.maintenanceMessage || ''}
                  onChange={(e) => setSettings(s => ({ ...s, maintenanceMessage: e.target.value }))}
                  rows={3}
                  placeholder="e.g., We are currently updating the results. Please check back later."
                  className="w-full px-4 py-3 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-heading)]"
                />
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveMaintenanceMessage} loading={savingMaintenance} variant="primary">
                    Save Message
                  </Button>
                </div>
              </div>
            )}
          </div>

        <Modal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)} title={editingTeam ? "Edit Team" : "Add Team"}>
          <form onSubmit={handleSaveTeam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-1">Team Name</label>
              <input type="text" required value={teamForm.name} onChange={e => setTeamForm({...teamForm, name: e.target.value})} className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-heading)] mb-1">Team Color</label>
              <div className="flex gap-2">
                {['#000000', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'].map(c => (
                  <button key={c} type="button" onClick={() => setTeamForm({...teamForm, color: c})} className={`w-8 h-8 rounded-full border-2 ${teamForm.color === c ? 'border-blue-500' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowTeamModal(false)} className="mr-2">Cancel</Button>
              <Button type="submit" variant="primary">Save</Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          open={showConfirmDeleteTeam}
          title="Delete Team"
          message={`Are you sure you want to delete "${deletingTeam?.name}"?`}
          onConfirm={handleDeleteTeam}
          onCancel={() => setShowConfirmDeleteTeam(false)}
          confirmText="Delete"
        />

        <ConfirmDialog
          open={showConfirmToggleReg}
          title={settings.isRegistrationOpen ? "Close Registration" : "Open Registration"}
          message={settings.isRegistrationOpen 
            ? "Are you sure you want to close registration? Team leaders will no longer be able to assign candidates to programmes." 
            : "Are you sure you want to open registration? Team leaders will be able to start assigning candidates again."}
          onConfirm={handleToggleRegistration}
          onCancel={() => setShowConfirmToggleReg(false)}
          confirmText={settings.isRegistrationOpen ? "Close Registration" : "Open Registration"}
        />

        <ConfirmDialog
          open={showConfirmToggleTopic}
          title={settings.topicRegistrationEnabled ? "Close Topic Registration" : "Open Topic Registration"}
          message={settings.topicRegistrationEnabled 
            ? "Are you sure you want to close topic registration? Team leaders will no longer be able to submit topics." 
            : "Are you sure you want to open topic registration? Team leaders will be able to start assigning candidates again."}
          onConfirm={handleToggleTopic}
          onCancel={() => setShowConfirmToggleTopic(false)}
          confirmText={settings.topicRegistrationEnabled ? "Close Topic Registration" : "Open Topic Registration"}
        />
      </div>
  );
};

export default SettingsPage;
