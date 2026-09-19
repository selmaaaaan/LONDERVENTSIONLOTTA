import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { ClipboardList, Users, Plus, Edit2, Trash2 } from 'lucide-react';

export default function RegistrationReviewPage() {
  const [programmes, setProgrammes] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedProg, setSelectedProg] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState({ open: false, id: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const [assignModal, setAssignModal] = useState({ isOpen: false, mode: 'create', editId: null });
  const [assignForm, setAssignForm] = useState({ teamId: '', programmeId: '', candidateIds: [] });
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [teamCandidates, setTeamCandidates] = useState([]);
  const [assignCategoryFilter, setAssignCategoryFilter] = useState('ALL');

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [visibleProgrammes, setVisibleProgrammes] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);


  const CATEGORIES = ['BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'];

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const isAdminOrJudge = ['admin', 'judge'].includes(userInfo.role);

  
  useEffect(() => {
    const computeVisibleProgrammes = async () => {
      setIsFiltering(true);
      let baseProgrammes = [...programmes];

      if (filterTeam) {
        if (filterStatus === 'UNREGISTERED') {
          try {
            const { data } = await api.get(`/teams/${filterTeam}/unregistered-programmes`);
            baseProgrammes = data;
          } catch(e) { console.error(e); }
        } else if (filterStatus === 'REGISTERED') {
          try {
            const { data } = await api.get(`/registrations?team=${filterTeam}&limit=1000`);
            const regs = data.registrations || data || [];
            const registeredProgIds = regs.map(r => r.programme._id || r.programme);
            baseProgrammes = baseProgrammes.filter(p => registeredProgIds.includes(p._id));
          } catch(e) { console.error(e); }
        }
      }

      if (filterCategory !== 'ALL') {
        baseProgrammes = baseProgrammes.filter(p => p.category === filterCategory);
      }
      
      setVisibleProgrammes(baseProgrammes);
      setIsFiltering(false);
    };

    if (programmes.length > 0) {
       computeVisibleProgrammes();
    } else {
       setVisibleProgrammes([]);
    }
  }, [filterStatus, filterTeam, filterCategory, programmes]);

  // Fetch programmes and teams
  useEffect(() => {
    Promise.all([
      api.get('/programmes'),
      api.get('/teams')
    ]).then(([progRes, teamRes]) => {
      setProgrammes(progRes.data);
      setTeams(teamRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Fetch candidates for selected team in the form
  useEffect(() => {
    setAssignCategoryFilter('ALL');
    if (assignForm.teamId) {
      api.get(`/candidates?team=${assignForm.teamId}`)
         .then(r => setTeamCandidates(r.data))
         .catch(console.error);
    } else {
      setTeamCandidates([]);
    }
  }, [assignForm.teamId]);

  // Fetch registrations for selected programme
  useEffect(() => {
    if (!selectedProg) return;
    api.get(`/registrations?programme=${selectedProg._id}`).then(r => {
      const regs = r.data?.registrations || r.data || [];
      setRegistrations(regs);
    }).catch(console.error);
  }, [selectedProg]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.patch(`/registrations/${id}/approve`);
      setRegistrations(prev => prev.map(r => r._id === id ? {...r, status: 'approved'} : r));
    } catch(e) { alert(e.response?.data?.message || 'Failed to approve'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { alert('Rejection reason is required'); return; }
    setActionLoading(rejectDialog.id);
    try {
      await api.patch(`/registrations/${rejectDialog.id}/reject`, { rejectionReason: rejectReason });
      setRegistrations(prev => prev.map(r => r._id === rejectDialog.id ? {...r, status: 'rejected', rejectionReason: rejectReason} : r));
      setRejectDialog({ open: false, id: null });
      setRejectReason('');
    } catch(e) { alert(e.response?.data?.message || 'Failed to reject'); }
    finally { setActionLoading(null); }
  };

  const handleCandidateToggle = (id) => {
    setAssignForm(f => {
      const ids = f.candidateIds.includes(id)
        ? f.candidateIds.filter(c => c !== id)
        : [...f.candidateIds, id];
      return { ...f, candidateIds: ids };
    });
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
      setAssignForm({ teamId: '', programmeId: selectedProg ? selectedProg._id : '', candidateIds: [] });
      setAssignModal({ isOpen: true, mode: 'create', editId: null });
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
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
      if (assignModal.mode === 'create') {
        const { data } = await api.post('/registrations', {
          programmeId: assignForm.programmeId,
          teamId: assignForm.teamId,
          candidateIds: assignForm.candidateIds,
        });
        if (selectedProg && assignForm.programmeId === selectedProg._id) {
          // Add newly created to current view
          setRegistrations(prev => [data, ...prev]);
        }
      } else {
        const { data } = await api.patch(`/registrations/${assignModal.editId}`, {
          programmeId: assignForm.programmeId,
          teamId: assignForm.teamId,
          candidateIds: assignForm.candidateIds,
        });
        if (selectedProg && assignForm.programmeId === selectedProg._id) {
          setRegistrations(prev => prev.map(r => r._id === assignModal.editId ? data : r));
        } else if (selectedProg) {
          // If we edited the programme to a different one, remove it from the current view
          setRegistrations(prev => prev.filter(r => r._id !== assignModal.editId));
        }
      }
      setAssignModal({ isOpen: false, mode: 'create', editId: null });
    } catch(err) {
      setAssignError(err.response?.data?.message || 'Submission failed');
    } finally { setAssignSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(deleteDialog.id);
    try {
      await api.delete(`/registrations/${deleteDialog.id}`);
      setRegistrations(prev => prev.filter(r => r._id !== deleteDialog.id));
      setDeleteDialog({ open: false, id: null });
    } catch(e) { alert(e.response?.data?.message || 'Failed to delete'); }
    finally { setActionLoading(null); }
  };

  const pendingCount = (prog) => registrations.filter(r => r.programme === prog._id || r.programme?._id === prog._id).filter(r => r.status === 'pending').length;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Programme list */}
      <div className="w-72 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col">
        <div className="p-4 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-[var(--color-text-heading)] flex items-center gap-2">
            <ClipboardList size={16} /> Programmes
          </h2>
        </div>
        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)] space-y-3">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full text-xs px-2 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="ALL">All Status</option>
              <option value="REGISTERED" disabled={!filterTeam}>Registered (Requires Team)</option>
              <option value="UNREGISTERED" disabled={!filterTeam}>Unregistered (Requires Team)</option>
            </select>
            
            <select
              value={filterTeam}
              onChange={e => {
                setFilterTeam(e.target.value);
                if (!e.target.value && filterStatus !== 'ALL') setFilterStatus('ALL');
              }}
              className="w-full text-xs px-2 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="">All Teams</option>
              {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>

            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="w-full text-xs px-2 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1 overflow-y-auto">
          {loading || isFiltering ? (
            <div className="p-4 text-sm text-[var(--color-text-muted)]">Loading...</div>
          ) : visibleProgrammes.map(prog => (
            <button key={prog._id} onClick={() => setSelectedProg(prog)}
              className={`w-full text-left px-4 py-3 border-b border-[var(--color-border)] transition-colors flex items-center justify-between ${
                selectedProg?._id === prog._id ? 'bg-[var(--color-primary)]/10 border-l-2 border-l-[var(--color-primary)]' : 'hover:bg-[var(--color-surface-elevated)]'
              }`}>
              <div>
                <div className="text-sm font-medium text-[var(--color-text-heading)]">{prog.name}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{prog.category}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Registration queue */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selectedProg ? (
          <EmptyState title="Select a Programme" description="Choose a programme from the left to review its registrations" />
        ) : (
          <>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text-heading)]">{selectedProg.name}</h2>
                <p className="text-sm text-[var(--color-text-muted)]">{selectedProg.category} · {selectedProg.format} · Max {selectedProg.maxParticipants} entries</p>
              </div>
              {isAdminOrJudge && (
                <Button onClick={() => openAssignModal('create')} variant="primary">
                  <Plus size={14} /> Assign Candidate
                </Button>
              )}
            </div>
            {registrations.length === 0 ? (
              <EmptyState title="No Registrations" description="No registrations submitted for this programme yet" />
            ) : (
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--color-surface-elevated)]">
                    <tr>
                      {['Team','Candidates','Submitted By','Date','Status','Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider border-b border-[var(--color-border)]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(reg => (
                      <tr key={reg._id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] transition-colors">
                        <td className="px-4 py-3 font-medium">{reg.team?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-[var(--color-text-muted)]">
                          <div className="flex items-center gap-1">
                            <Users size={12} />
                            {reg.candidates?.length || 0} candidate(s)
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--color-text-muted)]">{reg.submittedBy?.userName || 'N/A'}</td>
                        <td className="px-4 py-3 text-[var(--color-text-muted)] whitespace-nowrap">{new Date(reg.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3"><StatusBadge status={reg.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {reg.status === 'pending' && (
                              <>
                                <Button size="sm" variant="primary" loading={actionLoading === reg._id} onClick={() => handleApprove(reg._id)}>Approve</Button>
                                <Button size="sm" variant="danger" onClick={() => setRejectDialog({ open: true, id: reg._id })}>Reject</Button>
                              </>
                            )}
                            {reg.status === 'rejected' && (
                              <span className="text-xs text-[var(--color-text-muted)] mr-2">{reg.rejectionReason}</span>
                            )}
                            {isAdminOrJudge && (
                              <div className="flex gap-2 items-center">
                                <Button 
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => reg.status !== 'approved' && openAssignModal('edit', reg)}
                                  disabled={reg.status === 'approved'}
                                  title={reg.status === 'approved' ? "Cannot edit approved registration" : "Edit"}
                                >
                                  <Edit2 size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => setDeleteDialog({ open: true, id: reg._id })}
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Dialog */}
      <ConfirmDialog
        open={rejectDialog.open}
        title="Reject Registration"
        confirmLabel="Reject"
        variant="danger"
        onConfirm={handleReject}
        onCancel={() => { setRejectDialog({ open: false, id: null }); setRejectReason(''); }}
      >
        <textarea
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          placeholder="Enter rejection reason (required)"
          rows={3}
          className="w-full px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
        />
      </ConfirmDialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Registration"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ open: false, id: null })}
      >
        <p className="text-sm text-[var(--color-text-body)]">Are you sure you want to delete this registration? This action cannot be undone.</p>
      </ConfirmDialog>

      {/* Assign Candidate Modal */}
      <Modal isOpen={assignModal.isOpen} onClose={() => setAssignModal({ isOpen: false, mode: 'create', editId: null })} title={assignModal.mode === 'edit' ? "Edit Registration" : "Assign Candidate"}>
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          {assignError && <div className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">{assignError}</div>}

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Team</label>
            <select 
              value={assignForm.teamId} 
              onChange={e => setAssignForm(f => ({ ...f, teamId: e.target.value, candidateIds: [] }))}
              className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]">
              <option value="">Select a team...</option>
              {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Programme</label>
            <select 
              value={assignForm.programmeId} 
              onChange={e => setAssignForm(f => ({ ...f, programmeId: e.target.value, candidateIds: [] }))}
              className="w-full px-3 py-2 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]">
              <option value="">Select a programme...</option>
              {programmes.map(p => <option key={p._id} value={p._id}>{p.name} ({p.category})</option>)}
            </select>
          </div>

          {(() => {
            const prog = programmes.find(p => p._id === assignForm.programmeId);
            const reqCands = prog?.format === 'Group' ? (prog?.groupSize || 1) : 1;
            return prog && (
              <div className="p-3 bg-[var(--color-surface-elevated)] rounded-lg text-xs text-[var(--color-text-muted)] space-y-1">
                <div>Format: <span className="text-[var(--color-text-heading)]">{prog.format}</span></div>
                <div>Required candidates: <span className="text-[var(--color-text-heading)]">{reqCands}</span></div>
                <div>Max entries per team: <span className="text-[var(--color-text-heading)]">{prog.maxParticipants}</span></div>
              </div>
            );
          })()}

          {assignForm.teamId && assignForm.programmeId && (
            <div>
              <div className="flex items-center justify-between mb-2">
                {(() => {
                  const prog = programmes.find(p => p._id === assignForm.programmeId);
                  const reqCands = prog?.format === 'Group' ? (prog?.groupSize || 1) : 1;
                  return (
                    <label className="block text-xs font-medium text-[var(--color-text-muted)]">
                      Select {reqCands} Candidate(s) <span className="text-[var(--color-primary)]">{assignForm.candidateIds.length}/{reqCands}</span>
                    </label>
                  );
                })()}
                <select
                  value={assignCategoryFilter}
                  onChange={e => setAssignCategoryFilter(e.target.value)}
                  className="text-xs px-2 py-1 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-heading)] focus:outline-none focus:border-[var(--color-primary)]"
                >
                  {['ALL', ...CATEGORIES].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="max-h-48 overflow-y-auto border border-[var(--color-border)] rounded-lg">
                {teamCandidates.filter(c => assignCategoryFilter === 'ALL' || c.category === assignCategoryFilter).length === 0 ? (
                  <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">No candidates found for this team in the selected category.</div>
                ) : teamCandidates.filter(c => assignCategoryFilter === 'ALL' || c.category === assignCategoryFilter).map(c => (
                  <label key={c._id} className="flex items-center gap-3 px-3 py-2 hover:bg-[var(--color-surface-elevated)] cursor-pointer border-b border-[var(--color-border)] last:border-0">
                    <input type="checkbox" checked={assignForm.candidateIds.includes(c._id)} onChange={() => handleCandidateToggle(c._id)} className="rounded" />
                    <div>
                      <div className="text-sm text-[var(--color-text-heading)]">{c.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{c.admissionNo} · {c.category}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setAssignModal({ isOpen: false, mode: 'create', editId: null })}>Cancel</Button>
            <Button variant="primary" type="submit" loading={assignSubmitting}>{assignModal.mode === 'edit' ? 'Save Changes' : 'Assign'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

