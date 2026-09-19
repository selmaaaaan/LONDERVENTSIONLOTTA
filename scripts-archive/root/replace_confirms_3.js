const fs = require('fs');

function replaceFile(path, oldText, newText) {
    let c = fs.readFileSync(path, 'utf8');
    c = c.replace(oldText, newText);
    fs.writeFileSync(path, c, 'utf8');
}

// 6. SchedulePage.jsx
replaceFile('admin-hudafestival-main/src/pages/SchedulePage.jsx',
`  const handleDeleteVenue = async (venueToDelete) => {
    if(!window.confirm(\`Delete venue "\${venueToDelete}"?\`)) return;
    try {
        const newVenues = (venuesList || []).filter(v => v !== venueToDelete);
        await api.patch('/settings', { venues: newVenues });
        setVenuesList(newVenues);
    } catch(err) {
        alert("Failed to delete venue");
    }
  };`,
`  const handleDeleteVenue = async (venueToDelete) => {
    confirmAction(\`Delete venue "\${venueToDelete}"?\`, async () => {
        try {
            const newVenues = (venuesList || []).filter(v => v !== venueToDelete);
            await api.patch('/settings', { venues: newVenues });
            setVenuesList(newVenues);
        } catch(err) {
            alert("Failed to delete venue");
        }
    });
  };`);

replaceFile('admin-hudafestival-main/src/pages/SchedulePage.jsx',
`  const handleRemoveSchedule = async (progId) => {
    if (!window.confirm('Clear schedule for this programme?')) return;
    try {
      await api.patch(\`/programmes/\${progId}/schedule\`, {
        date: null,
        startTime: null,
        venue: null
      });
      fetchProgrammes();
    } catch (err) { alert('Failed to clear schedule'); }
  };`,
`  const handleRemoveSchedule = async (progId) => {
    confirmAction('Clear schedule for this programme?', async () => {
      try {
        await api.patch(\`/programmes/\${progId}/schedule\`, {
          date: null,
          startTime: null,
          venue: null
        });
        fetchProgrammes();
      } catch (err) { alert('Failed to clear schedule'); }
    });
  };`);

// 7. TeamLeaderDashboard.jsx
replaceFile('admin-hudafestival-main/src/pages/TeamLeaderDashboard.jsx',
`  const handleDeleteRegistration = async (regId) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;
    setSubmitting(true);
    try {
      await api.delete(\`/registrations/\${regId}\`);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete registration');
    }
    setSubmitting(false);
  };`,
`  const handleDeleteRegistration = async (regId) => {
    confirmAction('Are you sure you want to delete this registration?', async () => {
      setSubmitting(true);
      try {
        await api.delete(\`/registrations/\${regId}\`);
        await loadData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete registration');
      }
      setSubmitting(false);
    });
  };`);

// 8. TeamTopicRegistrationPage.jsx
replaceFile('admin-hudafestival-main/src/pages/TeamTopicRegistrationPage.jsx',
`  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic registration?')) return;
    setSubmitting(true);
    try {
      await api.delete(\`/topic-registrations/\${topicId}\`);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete topic');
    }
    setSubmitting(false);
  };`,
`  const handleDeleteTopic = async (topicId) => {
    confirmAction('Are you sure you want to delete this topic registration?', async () => {
      setSubmitting(true);
      try {
        await api.delete(\`/topic-registrations/\${topicId}\`);
        await loadData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete topic');
      }
      setSubmitting(false);
    });
  };`);

// 9. TopicManagementPage.jsx
replaceFile('admin-hudafestival-main/src/pages/TopicManagementPage.jsx',
`  const handleDeleteTopic = async (id) => {
    if (!window.confirm('Are you sure you want to delete this topic registration?')) return;
    try {
      await api.delete(\`/topic-registrations/\${id}\`);
      if (selectedProgramme) fetchProgrammeTopics(selectedProgramme._id);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete topic');
    }
  };`,
`  const handleDeleteTopic = async (id) => {
    confirmAction('Are you sure you want to delete this topic registration?', async () => {
      try {
        await api.delete(\`/topic-registrations/\${id}\`);
        if (selectedProgramme) fetchProgrammeTopics(selectedProgramme._id);
      } catch (e) {
        alert(e.response?.data?.message || 'Failed to delete topic');
      }
    });
  };`);

replaceFile('admin-hudafestival-main/src/pages/TopicManagementPage.jsx',
`                            if (window.confirm('Remove this programme from topic management?')) {
                                api.patch(\`/programmes/\${prog._id}/topic-settings\`, { topicMode: 'none', topicList: [] })
                                   .then(() => {
                                       fetchProgrammes();
                                       if (selectedProgramme?._id === prog._id) setSelectedProgramme(null);
                                   })
                                   .catch(err => alert('Failed'));
                            }`,
`                            confirmAction('Remove this programme from topic management?', () => {
                                api.patch(\`/programmes/\${prog._id}/topic-settings\`, { topicMode: 'none', topicList: [] })
                                   .then(() => {
                                       fetchProgrammes();
                                       if (selectedProgramme?._id === prog._id) setSelectedProgramme(null);
                                   })
                                   .catch(err => alert('Failed'));
                            });`);

console.log('Batch 2 done');