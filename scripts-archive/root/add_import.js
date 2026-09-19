const fs = require('fs');
let content = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf8');

if (!content.includes('import LoadingScreen')) {
  content = content.replace(
    "import TeamPortalDashboard from './pages/TeamPortalDashboard';",
    "import TeamPortalDashboard from './pages/TeamPortalDashboard';\nimport LoadingScreen from './components/LoadingScreen';"
  );
  fs.writeFileSync('admin-hudafestival-main/src/App.jsx', content, 'utf8');
}
