const fs = require('fs');

let content = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf8');

// 1. Add router imports
content = content.replace(
  "import { useEffect, useState } from 'react';",
  "import { useEffect, useState } from 'react';\nimport { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';"
);

// 2. Remove activePage state and add hooks
content = content.replace(
  "  const [activePage, setActivePage] = useState(getInitialPage(initialInfo));",
  "  const navigate = useNavigate();\n  const location = useLocation();"
);

// 3. Update useEffect for notifications (remove activePage dependency)
content = content.replace(
  "  }, [isAuthenticated, activePage]);",
  "  }, [isAuthenticated, location.pathname]);"
);

// 4. Update handleNotificationClick
content = content.replace(
  "    setActivePage('notifications');",
  "    navigate('/notifications');"
);

// 5. Update handleLoginSuccess
content = content.replace(
  "      setActivePage(getInitialPage(parsed));",
  "      const initPage = getInitialPage(parsed);\n      const path = { dashboard: '/dashboard', judge_panel: '/judge-panel', team_dashboard: '/team-dashboard', volunteer_portal: '/volunteer-portal' }[initPage] || '/dashboard';\n      navigate(path);"
);

// 6. Update Sidebar props
content = content.replace(
  "        <Sidebar\n          activePage={activePage}\n          setActivePage={setActivePage}\n          onLogout={handleLogout}\n          userInfo={userInfo}\n        />",
  "        <Sidebar\n          onLogout={handleLogout}\n          userInfo={userInfo}\n        />"
);

// 7. Update GlobalSearch onNavigate
content = content.replace(
  "onNavigate={(type) => { if (type === 'teams') setActivePage('dashboard'); else setActivePage(type); }}",
  "onNavigate={(type) => {\n                if (type === 'teams') navigate('/dashboard');\n                else {\n                  const pathMap = { candidates: '/candidates', programmes: '/programmes', registration_review: '/registrations', team_registration_list: '/registration-list', results: '/results', 'pending results': '/pending-results', judgment_feedback: '/judgment-feedback', adjustments: '/point-adjustments', logs: '/activity-logs', gallery: '/gallery', notifications: '/notifications', topic_management: '/topic-management', schedule: '/schedule', jury_slips: '/jury-slips', conflict_checker: '/conflict-checker', users: '/users', settings: '/settings' };\n                  navigate(pathMap[type] || '/dashboard');\n                }\n              }}"
);

fs.writeFileSync('admin-hudafestival-main/src/App.jsx', content, 'utf8');
