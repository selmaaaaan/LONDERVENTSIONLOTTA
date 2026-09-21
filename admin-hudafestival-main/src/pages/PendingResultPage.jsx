import { useAlert } from '../context/AlertContext';
import React, { useState, useEffect } from 'react';
import { useConfirm } from '../context/ConfirmContext';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { Clock } from 'lucide-react';

const PendingResultsPage = () => {
  const alertAction = useAlert();

  const confirmAction = useConfirm();

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingData = async () => {
    try {
      setLoading(true);
      const [progRes, resultsRes] = await Promise.all([api.get('/programmes'), api.get('/results')]);
      const allProgrammes = progRes.data;
      const resultsArray = Array.isArray(resultsRes.data) ? resultsRes.data : (resultsRes.data.data || []);
      const pendingResults = resultsArray.filter(r => r.status === 'pending');
      
      const batchMap = {};
      pendingResults.forEach(r => {
        const bid = r.batchId || 'legacy';
        if (!batchMap[bid]) {
          batchMap[bid] = { batchId: bid, resultsCount: 0, programmes: new Set() };
        }
        batchMap[bid].resultsCount++;
        batchMap[bid].programmes.add(r.programme);
      });

      const batchList = Object.values(batchMap).map(b => {
        return {
          ...b,
          programmeIds: Array.from(b.programmes),
          programmeNames: Array.from(b.programmes).map(pid => {
            const p = allProgrammes.find(prog => prog._id === pid);
            return p ? p.name : 'Unknown Programme';
          })
        };
      });

      setBatches(batchList);
    } catch { setError('Failed to fetch pending results.'); }
    finally { setLoading(false); }
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

  if (loading) return <p className="p-8 text-[var(--color-text-body)]">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-heading)]">Pending Batches</h1>
        <p className="text-sm text-[var(--color-text-body)] mt-1">Approve or deny batches of results awaiting review.</p>
      </div>

      {batches.length > 0 ? (
        <div className="space-y-4">
          {batches.map((batch) => (
            <div key={batch.batchId} className="p-5 bg-[var(--color-surface-elevated)] rounded-xl border border-[var(--color-border)] flex justify-between items-center transition-colors hover:border-[var(--color-primary)]">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text-heading)]">
                  {batch.batchId === 'legacy' ? 'Legacy Pending Results' : `Batch: ${batch.batchId}`}
                </h2>
                <div className="text-sm text-[var(--color-text-muted)] mt-1">
                  {batch.resultsCount} results across {batch.programmeNames.length} programme(s).
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-2 italic">
                  {batch.programmeNames.join(', ')}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" variant="danger" onClick={() => handleDenyBatch(batch)}>Delete Batch</Button>
                <Button size="sm" variant="primary" onClick={() => handleApproveBatch(batch)}>Publish Batch</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Clock} title="No pending results" description="All results have been reviewed." />
      )}
    </div>
  );
};

export default PendingResultsPage;