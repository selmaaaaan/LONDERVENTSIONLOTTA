const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Update getInitialPage
content = content.replace(
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

// 2. Update handleLoginSuccess path
content = content.replace(
`      const path = { dashboard: '/dashboard', team_dashboard: '/team-dashboard',  }[initPage] || '/dashboard';`,
`      const path = { dashboard: '/dashboard', team_dashboard: '/team-dashboard', result_entry: '/result-entry/batches' }[initPage] || '/dashboard';`
);

// 3. Remove the isolated ResultEntryLogin route completely
// In patch-app.cjs we added:
// if (location.pathname.startsWith('/result-entry')) { ... }
// We want to keep the routing for /result-entry/batches but remove the isolated outer branch so it falls through to isAuthenticated logic.
// Wait, if result_entry is true, it goes through !isAuthenticated and hits the main layout (sidebar, topbar).
// The user prompt: "Keep the backend route protection exactly as it is ... A result_entry user should still be blocked from reaching any admin/team page after logging in, same as before."
// If they go to /result-entry/batches, they should see the Result Entry UI. But they shouldn't see the Admin Sidebar!
// Wait! If they go through `isAuthenticated`, they will hit this:
/*
  return (
    <>
      {!bootComplete && <LoadingScreen />}
      <div className="flex h-dvh bg-[var(--color-bg)] ...">
        <Sidebar ... />
        <div className="flex flex-col flex-1 overflow-hidden">
          ... Topbar ...
          <div className="flex-1 overflow-y-auto p-6 relative">
            <Routes> ... </Routes>
          </div>
        </div>
      </div>
    </>
  )
*/
// Does the user want the Result Entry portal to have the Admin Sidebar?
// Prompt says: "Remove the separate /result-entry/login route and ResultEntryLogin.jsx page. Instead, make scorer1 log in through the SAME login page and endpoint... keep existing behavior for admin/team_leader roles... A result_entry user should still be blocked from reaching any admin/team page after logging in, same as before."
// If I just let `result_entry` hit the main layout, they will see the sidebar. But `Sidebar.jsx` might crash if `userInfo` has `result_entry`, or they might see links they can't click.
// Let's check `Sidebar.jsx`.
