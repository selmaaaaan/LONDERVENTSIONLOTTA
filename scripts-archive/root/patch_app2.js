const fs = require('fs');

let content = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf8');

const renderPageStart = content.indexOf('  const renderPage = () => {');
const mainTagStart = content.indexOf('<main className="flex-1 overflow-y-auto bg-[var(--color-bg)]">');

if (renderPageStart > -1 && mainTagStart > -1) {
  // We need to keep everything before renderPageStart and after mainTagStart
  // But wait, there is a } right before if (!isAuthenticated) {
  const isAuthenticatedCheck = content.indexOf('  if (!isAuthenticated) {');
  
  const beforeRenderPage = content.substring(0, renderPageStart);
  const afterRenderPage = content.substring(isAuthenticatedCheck);
  
  content = beforeRenderPage + 
  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!userInfo) return <Navigate to="/" replace />;
    if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
      return <div className="p-8 text-red-500">Unauthorized</div>;
    }
    return children;
  };
 + afterRenderPage;

  fs.writeFileSync('admin-hudafestival-main/src/App.jsx', content, 'utf8');
} else {
  console.log("Could not find blocks");
}
