const fs = require('fs');

const files = [
  'src/pages/DashboardPage.jsx',
  'src/pages/CandidateProgrammeStatusPage.jsx',
  'src/pages/JurySlipsPage.jsx',
  'src/pages/ProgrammeParticipantSearchPage.jsx',
  'src/pages/SettingsPage.jsx',
  'src/pages/TeamParticipantDirectoryPage.jsx',
  'src/pages/UsersPage.jsx',
  'src/pages/VolunteerPortal.jsx',
  'src/pages/RegistrationsPage.jsx',
  'src/pages/ProgrammesPage.jsx',
  'src/pages/RegistrationReviewPage.jsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    let changed = false;

    // Replace Dashboard text
    if (c.includes('<p className="text-[var(--color-text-body)]">Loading metrics...</p>')) {
      c = c.replace('<p className="text-[var(--color-text-body)]">Loading metrics...</p>', 
      '<div className="flex justify-center p-12"><GridLoader size="lg" color="#ea580c" mode="pulse" pattern="solo-center" /></div>');
      changed = true;
    }

    // Replace typical div spinner
    const spinnerDiv = '<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>';
    if (c.includes(spinnerDiv)) {
      c = c.split(spinnerDiv).join('<GridLoader size="lg" color="#ea580c" mode="pulse" />');
      changed = true;
    }
    
    // Replace VolunteerPortal specific loader
    const vpLoader = '<Loader2 size={16} className="animate-spin" /> Loading candidates.';
    if (c.includes(vpLoader)) {
        c = c.replace(vpLoader, '<GridLoader size="md" color="#ea580c" mode="sequence" /> Loading candidates.');
        changed = true;
    }

    if (changed) {
      // Find the last import
      if (!c.includes('GridLoader')) {
          const lastImportIndex = c.lastIndexOf('import ');
          const endOfLastImport = c.indexOf('\n', lastImportIndex);
          c = c.substring(0, endOfLastImport) + '\nimport GridLoader from "@/components/smoothui/grid-loader";\n' + c.substring(endOfLastImport);
      }
      fs.writeFileSync(f, c);
      console.log('Updated loaders in', f);
    }
  }
});
