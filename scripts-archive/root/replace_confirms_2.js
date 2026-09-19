const fs = require('fs');

function replaceFile(path, oldText, newText) {
    let c = fs.readFileSync(path, 'utf8');
    c = c.replace(oldText, newText);
    fs.writeFileSync(path, c, 'utf8');
}

// 1. GalleryPage.jsx
replaceFile('admin-hudafestival-main/src/pages/GalleryPage.jsx',
`  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await api.delete(\`/gallery/\${id}\`);
      fetchImages();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete image');
    }
  };`,
`  const handleDelete = async (id) => {
    confirmAction('Are you sure you want to delete this image?', async () => {
      try {
        await api.delete(\`/gallery/\${id}\`);
        fetchImages();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete image');
      }
    });
  };`);

// 2. NotificationsPage.jsx
replaceFile('admin-hudafestival-main/src/pages/NotificationsPage.jsx',
`  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
        await api.delete(\`/notifications/\${id}\`);
        fetchNotifications();
    } catch(err) { alert(err.response?.data?.message || 'Error deleting'); }
  };`,
`  const handleDelete = async (id) => {
    confirmAction('Delete this notification?', async () => {
      try {
          await api.delete(\`/notifications/\${id}\`);
          fetchNotifications();
      } catch(err) { alert(err.response?.data?.message || 'Error deleting'); }
    });
  };`);

// 3. PendingResultPage.jsx (2 replaces)
replaceFile('admin-hudafestival-main/src/pages/PendingResultPage.jsx',
`  const handleApproveBatch = async (batch) => {
    if (window.confirm('Approve and publish all results in this batch?')) {
      try {
        await api.post('/results/approve-batch', { batchId: batch.batchId });
        alert('Batch published successfully!'); 
        fetchPendingData(); 
      }
      catch (err) { alert(err.response?.data?.message || 'Error publishing batch.'); }
    }
  };`,
`  const handleApproveBatch = async (batch) => {
    confirmAction('Approve and publish all results in this batch?', async () => {
      try {
        await api.post('/results/approve-batch', { batchId: batch.batchId });
        alert('Batch published successfully!'); 
        fetchPendingData(); 
      }
      catch (err) { alert(err.response?.data?.message || 'Error publishing batch.'); }
    });
  };`);

replaceFile('admin-hudafestival-main/src/pages/PendingResultPage.jsx',
`  const handleDenyBatch = async (batch) => {
    if (window.confirm('Delete all pending results in this batch?')) {
        try {
            await api.delete(\`/results/batch/\${batch.batchId}\`);
            alert('Batch deleted.');
            fetchPendingData();
        } catch (err) { alert(err.response?.data?.message || 'Error deleting batch.'); }
    }
  };`,
`  const handleDenyBatch = async (batch) => {
    confirmAction('Delete all pending results in this batch?', async () => {
        try {
            await api.delete(\`/results/batch/\${batch.batchId}\`);
            alert('Batch deleted.');
            fetchPendingData();
        } catch (err) { alert(err.response?.data?.message || 'Error deleting batch.'); }
    });
  };`);

// 4. PointAdjustmentPage.jsx
replaceFile('admin-hudafestival-main/src/pages/PointAdjustmentPage.jsx',
`    const handleDelete = async (id) => {
        if (!window.confirm('Delete this adjustment? This will revert the points.')) return;
        try {
            await api.delete(\`/point-adjustments/\${id}\`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete adjustment');
        }
    };`,
`    const handleDelete = async (id) => {
        confirmAction('Delete this adjustment? This will revert the points.', async () => {
            try {
                await api.delete(\`/point-adjustments/\${id}\`);
                fetchData();
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete adjustment');
            }
        });
    };`);

// 5. ProgrammesPage.jsx
replaceFile('admin-hudafestival-main/src/pages/ProgrammesPage.jsx',
`  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this programme?')) {
      try { await api.delete(\`/programmes/\${id}\`); fetchProgrammes(); } catch (err) { setError(err.response?.data?.message || 'Failed to delete programme.'); }
    }
  };`,
`  const handleDelete = async (id) => {
    confirmAction('Are you sure you want to delete this programme?', async () => {
      try { await api.delete(\`/programmes/\${id}\`); fetchProgrammes(); } catch (err) { setError(err.response?.data?.message || 'Failed to delete programme.'); }
    });
  };`);

console.log('Batch 1 done');