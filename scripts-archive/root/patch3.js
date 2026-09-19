const fs = require('fs');
let content = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf8');

const renderPageStart = content.indexOf('  const renderPage = () => {');
const isAuthenticatedCheck = content.indexOf('  if (!isAuthenticated) {');

if (renderPageStart > -1 && isAuthenticatedCheck > -1) {
  const beforeRenderPage = content.substring(0, renderPageStart);
  const afterRenderPage = content.substring(isAuthenticatedCheck);
  
  const code = `  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!userInfo) return <Navigate to="/" replace />;
    if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
      return <div className="p-8 text-red-500">Unauthorized</div>;
    }
    return children;
  };

`;
  content = beforeRenderPage + code + afterRenderPage;
  fs.writeFileSync('admin-hudafestival-main/src/App.jsx', content, 'utf8');
}

// Also replace the render block in main
const mainContent = `          <main className="flex-1 overflow-y-auto bg-[var(--color-bg)]">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/judge-panel" element={<ProtectedRoute allowedRoles={['admin', 'judge']}><JudgePanel /></ProtectedRoute>} />
                <Route path="/team-dashboard" element={<ProtectedRoute allowedRoles={['admin', 'team_leader']}><TeamPortalDashboard /></ProtectedRoute>} />
                <Route path="/team-programme-registration" element={<ProtectedRoute allowedRoles={['admin', 'team_leader']}><TeamLeaderDashboard /></ProtectedRoute>} />
                <Route path="/registration-list" element={<ProtectedRoute allowedRoles={['admin', 'team_leader']}><TeamRegistrationListPage /></ProtectedRoute>} />
                <Route path="/team-topic-registration" element={<ProtectedRoute allowedRoles={['admin', 'team_leader']}><TeamTopicRegistrationPage /></ProtectedRoute>} />
                <Route path="/candidates" element={<ProtectedRoute allowedRoles={['admin', 'team_leader']}><CandidatePage /></ProtectedRoute>} />
                <Route path="/volunteer-portal" element={<ProtectedRoute allowedRoles={['admin', 'volunteer']}><VolunteerPortal /></ProtectedRoute>} />
                
                <Route path="/gallery" element={<ProtectedRoute allowedRoles={['admin']}><GalleryPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute allowedRoles={['admin', 'team_leader', 'judge']}><NotificationsPage /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin', 'team_leader', 'judge', 'volunteer']}><SettingsPage /></ProtectedRoute>} />
                <Route path="/programmes" element={<ProtectedRoute allowedRoles={['admin']}><ProgrammesPage /></ProtectedRoute>} />
                <Route path="/registrations" element={<ProtectedRoute allowedRoles={['admin']}><RegistrationReviewPage /></ProtectedRoute>} />
                <Route path="/results" element={<ProtectedRoute allowedRoles={['admin']}><ResultsPage /></ProtectedRoute>} />
                <Route path="/pending-results" element={<ProtectedRoute allowedRoles={['admin']}><PendingResultsPage /></ProtectedRoute>} />
                <Route path="/point-adjustments" element={<ProtectedRoute allowedRoles={['admin']}><PointAdjustmentPage /></ProtectedRoute>} />
                <Route path="/judgment-feedback" element={<ProtectedRoute allowedRoles={['admin']}><JudgmentFeedbackPage /></ProtectedRoute>} />
                <Route path="/activity-logs" element={<ProtectedRoute allowedRoles={['admin']}><ActivityLogsPage /></ProtectedRoute>} />
                <Route path="/topic-management" element={<ProtectedRoute allowedRoles={['admin']}><TopicManagementPage /></ProtectedRoute>} />
                <Route path="/jury-slips" element={<ProtectedRoute allowedRoles={['admin']}><JurySlipsPage /></ProtectedRoute>} />
                <Route path="/conflict-checker" element={<ProtectedRoute allowedRoles={['admin']}><ConflictCheckerPage /></ProtectedRoute>} />
                <Route path="/schedule" element={<ProtectedRoute allowedRoles={['admin']}><SchedulePage /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><DashboardPage /></ProtectedRoute>} />
                
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AnimatePresence>
          </main>`;

let newContent = fs.readFileSync('admin-hudafestival-main/src/App.jsx', 'utf8');
const mainStart = newContent.indexOf('<main className="flex-1 overflow-y-auto bg-[var(--color-bg)]">');
const mainEnd = newContent.indexOf('</main>', mainStart) + 7;

if (mainStart > -1 && mainEnd > -1) {
  newContent = newContent.substring(0, mainStart) + mainContent + newContent.substring(mainEnd);
  fs.writeFileSync('admin-hudafestival-main/src/App.jsx', newContent, 'utf8');
}
