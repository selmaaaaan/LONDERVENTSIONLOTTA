const fs = require('fs');

let appContent = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Change getInitialPage
appContent = appContent.replace(
`  const getInitialPage = (info) => {
    if (!info) return 'dashboard';
    if (info.role === 'team_leader') return 'team_dashboard';
    return 'dashboard';
  };`,
`  const getInitialPage = (info) => {
    if (!info) return 'dashboard';
    if (info.role === 'team_leader') return 'team_dashboard';
    if (info.role === 'result_entry') return 'result_entry';
    return 'dashboard';
  };`
);

// 2. Change handleLoginSuccess path
appContent = appContent.replace(
`const path = { dashboard: '/dashboard', team_dashboard: '/team-dashboard',  }[initPage] || '/dashboard';`,
`const path = { dashboard: '/dashboard', team_dashboard: '/team-dashboard', result_entry: '/result-entry/batches' }[initPage] || '/dashboard';`
);

// 3. Remove the old location.pathname.startsWith('/result-entry') intercept logic
const oldInterceptStart = `const ResultEntryProtected = ({ children }) => {`;
const oldInterceptEnd = `</ErrorBoundary>
    );
  }`;
const startIndex = appContent.indexOf(oldInterceptStart);
const endIndex = appContent.indexOf(oldInterceptEnd) + oldInterceptEnd.length;
if (startIndex !== -1 && endIndex !== -1) {
    appContent = appContent.substring(0, startIndex) + appContent.substring(endIndex);
}

// 4. Inject isResultEntryRole intercept right BEFORE `const initial = userInfo?.userName`
// But wait, the standard !isAuthenticated check is earlier.
// So if they are result_entry, they are authenticated. We just hijack the render block!
const injectTarget = `const initial = userInfo?.userName?.charAt(0)?.toUpperCase() || 'A';`;
const newBlock = `
  if (userInfo?.role === 'result_entry') {
    return (
      <ErrorBoundary key={location.pathname}>
        <Routes location={location}>
          <Route path="/result-entry/batches" element={<BatchDashboard />} />
          <Route path="/result-entry/batches/:id" element={<BatchWorkspace />} />
          <Route path="*" element={<Navigate to="/result-entry/batches" replace />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  const initial = userInfo?.userName?.charAt(0)?.toUpperCase() || 'A';`;

appContent = appContent.replace(injectTarget, newBlock);

fs.writeFileSync('src/App.jsx', appContent);

// 5. Update BatchDashboard logout redirect
let dashboardContent = fs.readFileSync('src/pages/result-entry/BatchDashboard.jsx', 'utf8');
dashboardContent = dashboardContent.replace(
`    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/result-entry/login');
    };`,
`    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        window.location.href = '/';
    };`
);
fs.writeFileSync('src/pages/result-entry/BatchDashboard.jsx', dashboardContent);
console.log("Patched App.jsx and BatchDashboard.jsx");
