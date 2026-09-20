const fs = require('fs');
let content = fs.readFileSync('src/pages/SettingsPage.jsx', 'utf-8');

// Remove ALL Modals and ConfirmDialogs temporarily
content = content.replace(/<Modal isOpen=\{showTeamModal\}[\s\S]*?<\/Modal>/g, '');
content = content.replace(/<ConfirmDialog[^>]*open=\{showConfirmDeleteTeam\}[^>]*\/>/g, '');
content = content.replace(/<ConfirmDialog[^>]*open=\{showConfirmToggleReg\}[^>]*\/>/g, '');
content = content.replace(/<ConfirmDialog[^>]*open=\{showConfirmToggleTopic\}[^>]*\/>/g, '');

// Remove trailing garbage
content = content.replace(/<\/form><\/Modal><ConfirmDialog.*/gs, '');
content = content.replace(/setShowConfirmDeleteTeam\(false\)\}/gs, '');
content = content.replace(/\s*<\/div>\s*\);\s*};\s*export default SettingsPage;/g, '');
content = content.replace(/\s*<\/div>\s*$/g, '');

const modals = `
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
                  <button key={c} type="button" onClick={() => setTeamForm({...teamForm, color: c})} className={\`w-8 h-8 rounded-full border-2 \${teamForm.color === c ? 'border-blue-500' : 'border-transparent'}\`} style={{ backgroundColor: c }} />
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
          message={\`Are you sure you want to delete "\${deletingTeam?.name}"?\`}
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
            : "Are you sure you want to open topic registration? Team leaders will be able to submit topics again."}
          onConfirm={handleToggleTopic}
          onCancel={() => setShowConfirmToggleTopic(false)}
          confirmText={settings.topicRegistrationEnabled ? "Close Topic Registration" : "Open Topic Registration"}
        />
      </div>
  );
};

export default SettingsPage;
`;

fs.writeFileSync('src/pages/SettingsPage.jsx', content + '\n' + modals);
