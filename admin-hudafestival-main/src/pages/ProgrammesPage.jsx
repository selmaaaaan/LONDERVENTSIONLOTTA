import Pagination from '../components/Pagination';
import React, { useEffect, useState } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import AddProgrammeForm from '../components/AddProgrammeForm';
import Button from '../components/Button';
import AnimatedTabs from '@/components/smoothui/animated-tabs';
import AnimatedInput from '@/components/smoothui/animated-input';
import StatusBadge from '../components/StatusBadge';
import { ChevronLeft, BarChart2 } from 'lucide-react';

const ProgrammesPage = () => {
  const confirmAction = useConfirm();

  const [programmes, setProgrammes] = useState([]);
  const [totalProgrammesCount, setTotalProgrammesCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [stageFilter, setStageFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState(null);
  const categories = ['BIDĀYAH', 'ʾŪLĀ', 'THĀNIYAH', 'THĀNAWIYYAH', 'ʿĀLIYAH', 'KULLIYYAH'];

  // Fetch ALL programmes without pagination so category cards show correct totals
  const fetchProgrammes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/programmes');
      // Backend returns flat array when no page param is provided
      const list = Array.isArray(data) ? data : (data.data || []);
      setProgrammes(list);
      setTotalProgrammesCount(list.length);
    } catch {
      setError('Failed to fetch programmes.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchProgrammes(); }, []);
  const handleFormSubmit = () => { setIsModalOpen(false); setEditingProgramme(null); fetchProgrammes(); };
  
  const handleEdit = (prog) => {
    setEditingProgramme(prog);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    confirmAction('Are you sure you want to delete this programme?', async () => {
      try { await api.delete(`/programmes/${id}`); fetchProgrammes(); } catch (err) { setError(err.response?.data?.message || 'Failed to delete programme.'); }
    });
  };

  const filteredProgrammes = selectedCategory ? programmes.filter(p => p.category === selectedCategory && (stageFilter === 'ALL' || p.stageType === stageFilter.toLowerCase())) : [];
  const headers = ['Name', 'Type', 'Date', 'Published', 'Actions'];
  const renderRow = (prog) => (
    <tr key={prog._id} className="hover:bg-[var(--color-surface-elevated)] transition">
      <td className="px-6 py-4">
        <div className="font-medium text-[var(--color-text-heading)]">{prog.name}</div>
        <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{prog.code}</div>
      </td>
      <td className="px-6 py-4 text-sm text-[var(--color-text-body)]">{prog.type}</td>
      <td className="px-6 py-4 text-sm text-[var(--color-text-body)]">{prog.date ? new Date(prog.date).toLocaleDateString() : 'Unscheduled'}</td>
      <td className="px-6 py-4"><StatusBadge status={prog.isResultPublished ? 'approved' : 'pending'} label={prog.isResultPublished ? 'Yes' : 'No'} /></td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleEdit(prog)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(prog._id)}>Delete</Button>
        </div>
      </td>
    </tr>
  );

  if (loading) return <p className="p-8 text-[var(--color-text-body)]">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Programmes</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ Add Programme</Button>
      </div>

      {!selectedCategory ? (
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-heading)] mb-4">Select a Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories.map(cat => {
              const catProgs = programmes.filter(p => p.category === cat);
              const stageCount = catProgs.filter(p => p.stageType === 'stage').length;
              const nonStageCount = catProgs.filter(p => p.stageType === 'non-stage').length;
              const totalCount = catProgs.length;
              return (
              <div key={cat} onClick={() => setSelectedCategory(cat)}
                className="relative overflow-hidden p-6 bg-[var(--color-surface)] dark:bg-[var(--color-surface-elevated)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--color-primary)]/10 group flex flex-col gap-4">
                
                {/* Subtle gradient background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-lg group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
                  </div>
                  <h2 className="text-xl font-bold text-[var(--color-text-heading)] group-hover:text-[var(--color-primary)] transition">{cat}</h2>
                </div>

                <div className="grid grid-cols-3 gap-3 relative z-10">
                  <div className="flex flex-col items-center justify-center py-4 px-2 bg-blue-50/80 dark:bg-blue-500/10 rounded-xl border border-blue-100/50 dark:border-blue-500/20 group-hover:bg-blue-100/50 transition-colors">
                    <span className="text-[13px] font-semibold text-blue-700 dark:text-blue-400 mb-1">Total</span>
                    <span className="text-3xl font-black text-blue-800 dark:text-blue-500 tracking-tight">{totalCount}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-4 px-2 bg-emerald-50/80 dark:bg-emerald-500/10 rounded-xl border border-emerald-100/50 dark:border-emerald-500/20 group-hover:bg-emerald-100/50 transition-colors">
                    <span className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Stage</span>
                    <span className="text-3xl font-black text-emerald-800 dark:text-emerald-500 tracking-tight">{stageCount}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-4 px-2 bg-purple-50/80 dark:bg-purple-500/10 rounded-xl border border-purple-100/50 dark:border-purple-500/20 group-hover:bg-purple-100/50 transition-colors">
                    <span className="text-[13px] font-semibold text-purple-700 dark:text-purple-400 mb-1">Non-Stage</span>
                    <span className="text-3xl font-black text-purple-800 dark:text-purple-500 tracking-tight">{nonStageCount}</span>
                  </div>
                </div>
              </div>
            )})}
          </div>

          {/* Festival Overview Footer */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-transparent border border-gray-200 dark:border-white/5 rounded-3xl p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between shadow-sm gap-8">
            <div className="flex items-center gap-5 w-full lg:w-auto justify-center lg:justify-start">
               <div className="w-14 h-14 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <BarChart2 size={28} />
               </div>
               <div>
                 <h3 className="text-[#0a192f] dark:text-white font-bold text-lg">Programmes Overview</h3>
                 <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-0.5">Total count across all categories</p>
               </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 sm:gap-12 w-full lg:w-auto border-y lg:border-y-0 lg:border-x border-gray-200 dark:border-white/10 py-6 lg:py-0 lg:px-12">
              <div className="text-center">
                <p className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{programmes.length}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">Total Programmes</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-emerald-500 dark:text-emerald-400 tracking-tight">{programmes.filter(p => p.stageType === 'stage').length}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">Stage Programmes</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-purple-600 dark:text-purple-400 tracking-tight">{programmes.filter(p => p.stageType === 'non-stage').length}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">Non-Stage Programmes</p>
              </div>
            </div>

            <div className="text-gray-400 dark:text-gray-500 italic text-xl whitespace-nowrap text-center lg:text-right" style={{ fontFamily: 'Georgia, serif' }}>
              Learn • Compete • Grow • Together
            </div>
          </div>
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] mb-4 transition">
            <ChevronLeft size={16} /> Back to Categories
          </button>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[var(--color-text-heading)]">Programmes - {selectedCategory}</h2>
            <div className="flex gap-2">
              {['ALL', 'Stage', 'Non-Stage'].map(stage => (
                <button
                  key={stage}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${stageFilter === stage ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]'}`}
                  onClick={() => setStageFilter(stage)}
                >
                  {stage === 'ALL' ? 'All Stages' : stage}
                </button>
              ))}
            </div>
          </div>
          <DataTable headers={headers} data={filteredProgrammes} renderRow={renderRow} />
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingProgramme(null); }} title={editingProgramme ? 'Edit Programme' : (selectedCategory ? `Add Programme to ${selectedCategory}` : 'Add Programme')}>
        <div className="text-[var(--color-text-body)]">
           <AddProgrammeForm onFormSubmit={handleFormSubmit} onFormCancel={() => { setIsModalOpen(false); setEditingProgramme(null); }} categoryName={selectedCategory} categories={categories} initialData={editingProgramme} />
        </div>
      </Modal>
    </div>
  );
};

export default ProgrammesPage;

