import { useAlert } from '../context/AlertContext';
import Pagination from '../components/Pagination';
import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import Modal from '../components/Modal';
import { Users, Plus, Search, CheckCircle, XCircle, Edit3, Trash2, Shield, AlertTriangle, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import ProgrammeCodePicker from '../components/ProgrammeCodePicker';
import Button from '../components/Button';
import AnimatedProgressBar from '@/components/smoothui/animated-progress-bar';
import AnimatedTabs from '@/components/smoothui/animated-tabs';

const CATEGORIES = ['All', 'BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'];

const StatCard = ({ label, value, accent }) => (
  <div className="flex flex-col gap-0.5 px-5 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</span>
    <span className="text-2xl font-bold" style={{ color: accent || 'var(--color-text-heading)' }}>{value}</span>
  </div>
);

export default function RegistrationReviewPage() {
  const alertAction = useAlert();

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isAdminOrJudge = ['admin', 'judge'].includes(userInfo.role);

  const [registrations, setRegistrations] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  // DB-level totals from backend countDocuments � NOT derived from page slice
  const [dbTotalCount, setDbTotalCount] = useState(0);
  const [dbApprovedCount, setDbApprovedCount] = useState(0);
  const [dbPendingCount, setDbPendingCount] = useState(0);
  const [dbRejectedCount, setDbRejectedCount] = useState(0);
  // Table Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('all');

  // Dialogs & Modals
  const [rejectDialog, setRejectDialog] = useState({ open: false, id: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [bulkDialog, setBulkDialog] = useState({ open: false, action: null, reason: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Assign Modal state
  const [assignModal, setAssignModal] = useState({ isOpen: false, mode: 'create', editId: null });
  const [assignForm, setAssignForm] = useState({ teamId: '', programmeId: '', candidateIds: [] });
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [teamCandidates, setTeamCandidates] = useState([]);

  // Fetch Core Data
    const [selectedIds, setSelectedIds] = useState([]);

  const handleSelectAll = (e, currentFiltered) => {
    if (e.target.checked) {
      setSelectedIds(currentFiltered.map(r => r._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const executeBulkApprove = async () => {
    try {
      await Promise.allSettled(selectedIds.map(id => api.patch(`/registrations/${id}/approve`)));
      setRegistrations(prev => prev.map(r => selectedIds.includes(r._id) ? { ...r, status: 'approved' } : r));
      setSelectedIds([]);
    } catch(e) {
      alertAction('Error in bulk approval');
    } finally {
      setBulkDialog({ open: false, action: null, reason: '' });
    }
  };

  const executeBulkReject = async () => {
    const reason = bulkDialog.reason;
    try {
      await Promise.allSettled(selectedIds.map(id => api.patch(`/registrations/${id}/reject`, { rejectionReason: reason })));
      setRegistrations(prev => prev.map(r => selectedIds.includes(r._id) ? { ...r, status: 'rejected', rejectionReason: reason } : r));
      setSelectedIds([]);
    } catch(e) {
      alertAction('Error in bulk rejection');
    } finally {
      setBulkDialog({ open: false, action: null, reason: '' });
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [progRes, teamRes, regRes] = await Promise.all([
        api.get('/programmes'),
        api.get('/teams'),
        api.get('/registrations?limit=9999&page=1')
      ]);
      setProgrammes(progRes.data);
      setTeams(teamRes.data);
      setRegistrations(regRes.data?.data || regRes.data?.registrations || regRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch candidates for assign modal
  useEffect(() => {
    const prog = programmes.find(p => p._id === assignForm.programmeId);
    if (assignForm.teamId && prog) {
      api.get(`/candidates?team=${assignForm.teamId}&category=${prog.category}`)
         .then(r => setTeamCandidates(r.data))
         .catch(console.error);
    } else {
      setTeamCandidates([]);
    }
  }, [assignForm.teamId, assignForm.programmeId, programmes]);

  // Filtered List for Table (Includes Status Filter)
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || 
        r.programme?.name?.toLowerCase().includes(q) || 
        r.programme?.code?.toLowerCase().includes(q) ||
        r.team?.name?.toLowerCase().includes(q);
      
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchCat = categoryFilter === 'All' || r.programme?.category === categoryFilter;
      const matchTeam = teamFilter === 'all' || r.team?._id === teamFilter || r.team === teamFilter;

      return matchSearch && matchStatus && matchCat && matchTeam;
    });
  }, [registrations, searchQuery, statusFilter, categoryFilter, teamFilter]);

  // Use DB-level counts for accurate stat cards
  const totalCount = dbTotalCount;
  const approvedCount = dbApprovedCount;
  const pendingCount = dbPendingCount;
  const rejectedCount = dbRejectedCount;

    // Handlers
  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/registrations/${id}/approve`);
      setRegistrations(prev => prev.map(r => r._id === id ? {...r, status: 'approved'} : r));
    } catch(e) { alertAction(e.response?.data?.message || 'Failed to approve'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { alertAction('Rejection reason is required'); return; }
    setActionLoading(rejectDialog.id);
    try {
      await api.patch(`/registrations/${rejectDialog.id}/reject`, { rejectionReason: rejectReason });
      setRegistrations(prev => prev.map(r => r._id === rejectDialog.id ? {...r, status: 'rejected', rejectionReason: rejectReason} : r));
      setRejectDialog({ open: false, id: null });
      setRejectReason('');
    } catch(e) { alertAction(e.response?.data?.message || 'Failed to reject'); }
    finally { setActionLoading(null); }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(deleteDialog.id);
    try {
      await api.delete(`/registrations/${deleteDialog.id}`);
      setRegistrations(prev => prev.filter(r => r._id !== deleteDialog.id));
      setDeleteDialog({ open: false, id: null });
    } catch(e) { alertAction(e.response?.data?.message || 'Failed to delete'); }
    finally { setActionLoading(null); }
  };

  const openAssignModal = (mode, reg = null) => {
    setAssignError('');
    if (mode === 'edit' && reg) {
      setAssignForm({
        teamId: reg.team?._id || reg.team,
        programmeId: reg.programme?._id || reg.programme,
        candidateIds: reg.candidates?.map(c => c._id || c) || []
      });
      setAssignModal({ isOpen: true, mode: 'edit', editId: reg._id });
    } else {
      setAssignForm({ teamId: '', programmeId: '', candidateIds: [] });
      setAssignModal({ isOpen: true, mode: 'create', editId: null });
    }
  };

  const handleCandidateToggle = (id) => {
    setAssignForm(f => {
      const ids = f.candidateIds.includes(id)
        ? f.candidateIds.filter(c => c !== id)
        : [...f.candidateIds, id];
      return { ...f, candidateIds: ids };
    });
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (assignSubmitting) return;
    setAssignError('');
    if (!assignForm.teamId) { setAssignError('Select a team'); return; }
    if (!assignForm.programmeId) { setAssignError('Select a programme'); return; }
    
    const prog = programmes.find(p => p._id === assignForm.programmeId);
    const requiredCandidates = prog?.format === 'Group' ? (prog?.groupSize || 1) : 1;
    
    if (assignForm.candidateIds.length !== requiredCandidates) {
      setAssignError(`Select exactly ${requiredCandidates} candidate(s) for this programme`);
      return;
    }
    
    setAssignSubmitting(true);
    try {
      // Create/Update Registration
      let newReg;
      if (assignModal.mode === 'create') {
        const { data } = await api.post('/registrations', {
          programmeId: assignForm.programmeId,
          teamId: assignForm.teamId,
          candidateIds: assignForm.candidateIds,
        });
        newReg = data;
      } else {
        const { data } = await api.patch(`/registrations/${assignModal.editId}`, {
          programmeId: assignForm.programmeId,
          teamId: assignForm.teamId,
          candidateIds: assignForm.candidateIds,
        });
        newReg = data;
      }

      // Manually populate missing fields since backend doesn't populate on create/update
      const t = teams.find(t => t._id === assignForm.teamId);
      if (t) newReg.team = t;
      if (prog) newReg.programme = prog;
      
      const cands = teamCandidates.filter(c => assignForm.candidateIds.includes(c._id));
      if (cands.length > 0) newReg.candidates = cands;

      if (assignModal.mode === 'create') {
        setRegistrations(prev => [newReg, ...prev]);
      } else {
        setRegistrations(prev => prev.map(r => r._id === assignModal.editId ? newReg : r));
      }

      setAssignModal({ isOpen: false, mode: 'create', editId: null });
    } catch(err) {
      setAssignError(err.response?.data?.message || 'Submission failed');
    } finally { setAssignSubmitting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-dvh">
      <div className="text-[var(--color-text-muted)] animate-pulse">Loading registrations...</div>
    </div>
  );

  return (
    <div className="min-h-dvh pb-16 bg-[var(--color-bg)] transition-colors duration-500">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {/* Header */}
        <div className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="w-full px-6 pt-10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} className="text-[var(--color-primary)]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  Admin Control
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none text-[var(--color-text-heading)]">
                Registrations
              </h1>
              <p className="mt-3 text-[var(--color-text-body)] max-w-xl text-sm md:text-base">
                Manage and review all team programme registrations.
              </p>
            </div>
            
            {isAdminOrJudge && (
              <button 
                onClick={() => openAssignModal('create')}
                className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-[var(--color-primary-hover)] transition-all active:scale-95"
              >
                <Plus size={18} /> New Registration
              </button>
            )}
          </div>
        </div>

        <div className="p-6 max-w-[1600px] mx-auto space-y-8">
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Submitted" value={totalCount} />
            <StatCard label="Approved" value={approvedCount} max={totalCount} accent="#10b981" />
            <StatCard label="Pending Review" value={pendingCount} max={totalCount} accent="#f59e0b" />
            <StatCard label="Rejected" value={rejectedCount} max={totalCount} accent="#ef4444" />
          </div>

          {/* Table Header & Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[var(--color-surface-elevated)] p-2 rounded-2xl border border-[var(--color-border)]">
              <div className="relative flex-1 w-full md:max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  placeholder="Search by programme or team..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none pl-11 pr-4 py-2 text-[var(--color-text-heading)] focus:ring-0 placeholder:text-[var(--color-text-muted)]"
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-2 pr-2">
                <select
                  value={teamFilter}
                  onChange={e => setTeamFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-heading)] outline-none"
                >
                  <option value="all">All Teams</option>
                  {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>

                <div className="h-6 w-px bg-[var(--color-border)] mx-1" />

                <AnimatedTabs
                  activeTab={statusFilter}
                  onChange={setStatusFilter}
                  tabs={[
                    { id: 'all', label: 'All' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'approved', label: 'Approved' },
                    { id: 'rejected', label: 'Rejected' }
                  ]}
                  variant="pill"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <AnimatedTabs
                  activeTab={categoryFilter}
                  onChange={setCategoryFilter}
                  tabs={CATEGORIES.map(cat => ({ id: cat, label: cat }))}
                  variant="pill"
                  className="flex-wrap"
                />
            </div>
          </div>

          {/* Table */}
          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="bg-[var(--color-surface-elevated)] p-4 rounded-xl border border-[var(--color-border)] flex items-center gap-4">
              <span className="text-sm font-semibold text-[var(--color-text-heading)]">{selectedIds.length} selected</span>
              <Button onClick={() => setBulkDialog({ open: true, action: 'approve', reason: '' })} variant="primary" className="bg-green-600 hover:bg-green-700 text-white">Approve Selected</Button>
              <Button onClick={() => setBulkDialog({ open: true, action: 'reject', reason: '' })} variant="danger">Reject Selected</Button>
              <button onClick={() => setSelectedIds([])} className="text-sm text-[var(--color-text-muted)] hover:underline ml-auto">Clear Selection</button>
            </div>
          )}

          <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
            {filteredRegistrations.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4">
                  <ClipboardList size={32} className="text-[var(--color-text-muted)] opacity-50" />
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text-heading)]">No registrations found</h3>
                <p className="text-[var(--color-text-muted)] text-sm mt-1 max-w-sm">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)] text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">
                      <th className="px-6 py-4 w-12"><input type="checkbox" onChange={(e) => handleSelectAll(e, filteredRegistrations)} checked={filteredRegistrations.length > 0 && selectedIds.length === filteredRegistrations.length} className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" /></th>
                      <th className="px-6 py-4">Programme</th>
                      <th className="px-6 py-4">Team</th>
                      <th className="px-6 py-4">Candidates</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {filteredRegistrations.map(reg => (
                      <motion.tr key={reg._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="hover:bg-[var(--color-surface)] transition-colors">
                        <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(reg._id)} onChange={() => handleSelectOne(reg._id)} className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" /></td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[var(--color-text-heading)]">{reg.programme?.name || '—'}</div>
                          <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{reg.programme?.code || ''}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: reg.team?.color || '#ccc' }}></span>
                            <span className="text-sm font-medium text-[var(--color-text-heading)]">{reg.team?.name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[var(--color-text-muted)]">
                          <div className="flex items-center gap-1.5 bg-[var(--color-surface)] px-2 py-1 rounded-md border border-[var(--color-border)] w-fit text-xs mb-2">
                            <Users size={12} className="text-[var(--color-primary)]" />
                            {reg.candidates?.length || 0}
                          </div>
                          {reg.candidates?.map(c => (
                            <div key={c._id || c} className="text-xs truncate max-w-[200px]">{c.name || 'Unknown'}</div>
                          ))}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={reg.status} />
                          {reg.status === 'rejected' && reg.rejectionReason && (
                             <div className="text-[10px] text-red-500 mt-1 max-w-[120px] truncate" title={reg.rejectionReason}>
                               {reg.rejectionReason}
                             </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            {reg.status === 'pending' && isAdminOrJudge && (
                              <>
                                <button onClick={() => handleApprove(reg._id)} disabled={actionLoading === reg._id}
                                  className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-md transition" title="Approve">
                                  <CheckCircle size={16} />
                                </button>
                                <button onClick={() => setRejectDialog({ open: true, id: reg._id })} disabled={actionLoading === reg._id}
                                  className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded-md transition" title="Reject">
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                            {isAdminOrJudge && (
                              <>
                                <button onClick={() => openAssignModal('edit', reg)} className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-md transition" title="Edit">
                                  <Edit3 size={16} />
                                </button>
                                <button onClick={() => setDeleteDialog({ open: true, id: reg._id })} className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition" title="Delete">
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={bulkDialog.open}
        title={bulkDialog.action === 'approve' ? "Approve Registrations" : "Reject Registrations"}
        message={bulkDialog.action === 'approve' 
          ? `Are you sure you want to approve ${selectedIds.length} registrations?` 
          : `You are about to reject ${selectedIds.length} registrations. Please provide a reason:`}
        confirmLabel={bulkDialog.action === 'approve' ? "Approve" : "Reject"}
        variant={bulkDialog.action === 'approve' ? "primary" : "danger"}
        onConfirm={() => {
          if (bulkDialog.action === 'approve') {
            executeBulkApprove();
          } else {
            executeBulkReject();
          }
        }}
        onCancel={() => setBulkDialog({ open: false, action: null, reason: '' })}
      >
        {bulkDialog.action === 'reject' && (
          <input 
            type="text" 
            placeholder="Rejection reason..." 
            value={bulkDialog.reason}
            onChange={(e) => setBulkDialog(prev => ({ ...prev, reason: e.target.value }))}
            className="w-full px-3 py-2 mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-heading)] focus:outline-none focus:border-red-500"
          />
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Registration"
        message="Are you sure you want to delete this registration? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ open: false, id: null })}
      />

      {/* Reject Dialog */}
      <Modal isOpen={rejectDialog.open} onClose={() => setRejectDialog({ open: false, id: null })} title="Reject Registration">
        <div className="space-y-4 text-[var(--color-text-heading)]">
          <p className="text-sm">Please provide a reason for rejecting this registration.</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
            rows="3"
            placeholder="E.g. Invalid candidate, exceeds limit, etc."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setRejectDialog({ open: false, id: null })}>Cancel</Button>
            <Button variant="danger" onClick={handleReject} disabled={actionLoading === rejectDialog.id || !rejectReason.trim()}>
              {actionLoading === rejectDialog.id ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal 
        isOpen={assignModal.isOpen} 
        onClose={() => setAssignModal({ isOpen: false, mode: 'create', editId: null })}
        title={assignModal.mode === 'create' ? 'New Registration' : 'Edit Registration'}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Team</label>
            <select
              value={assignForm.teamId}
              onChange={e => setAssignForm({ ...assignForm, teamId: e.target.value, candidateIds: [] })}
              className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-heading)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--color-primary)]"
              required
            >
              <option value="">Select a team</option>
              {teams.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Programme</label>
            <ProgrammeCodePicker
              programmes={programmes}
              value={assignForm.programmeId}
              onSelect={(prog) => setAssignForm({ ...assignForm, programmeId: prog ? prog._id : '', candidateIds: [] })}
            />
          </div>

          {assignForm.teamId && assignForm.programmeId && (
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Select Candidates</label>
              <div className="max-h-64 overflow-y-auto border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)]">
                {teamCandidates.length === 0 ? (
                  <div className="p-4 text-sm text-[var(--color-text-muted)] text-center">No eligible candidates found for this team and category.</div>
                ) : (
                  teamCandidates.map(c => {
                    const isSelected = assignForm.candidateIds.includes(c._id);
                    return (
                      <div 
                        key={c._id} 
                        onClick={() => handleCandidateToggle(c._id)}
                        className={`p-3 border-b border-[var(--color-border)] last:border-0 cursor-pointer flex items-center justify-between transition-colors ${isSelected ? 'bg-[var(--color-primary)]/10' : 'hover:bg-[var(--color-surface-elevated)]'}`}
                      >
                        <div>
                          <div className={`text-sm font-medium ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-heading)]'}`}>{c.name}</div>
                          <div className="text-xs text-[var(--color-text-muted)]">{c.admissionNo}</div>
                        </div>
                        {isSelected && <CheckCircle size={16} className="text-[var(--color-primary)]" />}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {assignError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
              <AlertTriangle size={16} /> {assignError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setAssignModal({ isOpen: false, mode: 'create', editId: null })}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={assignSubmitting}>
              {assignSubmitting ? 'Saving...' : (assignModal.mode === 'create' ? 'Register' : 'Save Changes')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

