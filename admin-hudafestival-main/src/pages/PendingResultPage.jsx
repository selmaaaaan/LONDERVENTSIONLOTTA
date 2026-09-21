import { useAlert } from '../context/AlertContext';
import React, { useState, useEffect } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { Clock, CheckCircle2 } from 'lucide-react';

const PendingResultsPage = () => {
  const alertAction = useAlert();
  const confirmAction = useConfirm();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'published'
  const [pendingBatches, setPendingBatches] = useState([]);
  const [publishedBatches, setPublishedBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingData = async () => {
    try {
      setLoading(true);
      const [progRes, resultsRes] = await Promise.all([api.get('/programmes'), api.get('/results')]);
      const allProgrammes = progRes.data;
      const resultsArray = Array.isArray(resultsRes.data) ? resultsRes.data : (resultsRes.data.data || []);
      
      const pendingResults = resultsArray.filter(r => r.status === 'pending');
      const approvedResults = resultsArray.filter(r => r.status === 'approved');
      
      const groupIntoBatches = (resultsList) => {
        const batchMap = {};
        resultsList.forEach(r => {
          const bid = r.batchId || 'legacy';
          if (!batchMap[bid]) {
            batchMap[bid] = { batchId: bid, resultsCount: 0, programmes: new Set() };
          }
          batchMap[bid].resultsCount++;
          batchMap[bid].programmes.add(r.programme);
        });

        return Object.values(batchMap).map(b => ({
          ...b,
          programmeIds: Array.from(b.programmes),
          programmeNames: Array.from(b.programmes).map(pid => {
            const p = allProgrammes.find(prog => prog._id === pid);
            return p ? p.name : 'Unknown Programme';
          })
        }));
      };

      setPendingBatches(groupIntoBatches(pendingResults));
      setPublishedBatches(groupIntoBatches(approvedResults));
      
    } catch { 
      setError('Failed to fetch results.'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchPendingData(); }, []);

  const handleApproveBatch = async (batch) => {
    const confirmed = await confirmAction('Confirm', 'Approve and publish all results in this batch?');
    if (confirmed) {
      try { 
        await api.post('/results/batch-publish', { batchId: batch.batchId, programmeIds: batch.programmeIds });
        alertAction('Batch published successfully!'); 
        fetchPendingData(); 
      }
      catch (err) { alertAction('Error: ' + (err.response?.data?.message || 'Failed.')); }
    }
  };

  const handleDenyBatch = async (batch) => {
    confirmAction('Delete all pending results in this batch?', async () => {
        try {
            await api.delete(`/results/batch/${batch.batchId}`, { data: { programmeIds: batch.programmeIds } });
            alertAction('Batch deleted.');
            fetchPendingData();
        } catch (err) { alertAction(err.response?.data?.message || 'Error deleting batch.'); }
    });
  };

  const handleRevertBatch = async (batch) => {
    const confirmed = await confirmAction('Revert Batch?', 'This will pull all results in this batch back to pending, un-publishing them from the live site and reversing all awarded points. Are you sure?');
    if (confirmed) {
      try {
        await api.post('/results/batch-revert', { batchId: batch.batchId });
        alertAction('Batch reverted to pending. Scores have been updated.');
        fetchPendingData();
      } catch (err) { alertAction('Error: ' + (err.response?.data?.message || 'Failed to revert batch.')); }
    }
  };

  if (loading) return <p className="p-8 text-[var(--color-text-body)]">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  const currentBatches = activeTab === 'pending' ? pendingBatches : publishedBatches;

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Results Approval</h1>
          <p className="text-sm text-[var(--color-text-body)] mt-1">Review pending batches or revert published ones.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-[var(--color-surface-elevated)] p-1 rounded-lg border border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'pending'
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-body)]'
            }`}
          >
            Pending ({pendingBatches.length})
          </button>
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'published'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-body)]'
            }`}
          >
            Published ({publishedBatches.length})
          </button>
        </div>
      </div>

      {currentBatches.length > 0 ? (
        <div className="space-y-4">
          {currentBatches.map((batch) => (
            <div key={batch.batchId} className="p-5 bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)] flex justify-between items-center transition-colors hover:border-[var(--color-primary)]">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text-heading)]">
                  {batch.batchId === 'legacy' ? 'Legacy Results' : `Batch: ${batch.batchId}`}
                </h2>
                <div className="text-sm text-[var(--color-text-muted)] mt-1">
                  {batch.resultsCount} results across {batch.programmeNames.length} programme(s).
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-2 italic">
                  {batch.programmeNames.join(', ')}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {activeTab === 'pending' ? (
                  <>
                    <Button size="sm" variant="danger" onClick={() => handleDenyBatch(batch)}>Delete Batch</Button>
                    <Button size="sm" variant="primary" onClick={() => handleApproveBatch(batch)}>Publish Batch</Button>
                  </>
                ) : (
                  <Button size="sm" variant="danger" onClick={() => handleRevertBatch(batch)}>Revert to Pending</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={activeTab === 'pending' ? Clock : CheckCircle2} 
          title={activeTab === 'pending' ? 'No pending results' : 'No published results'} 
          description={activeTab === 'pending' ? 'All results have been reviewed.' : 'No results have been published yet.'} 
        />
      )}
    </div>
  );
};

export default PendingResultsPage;