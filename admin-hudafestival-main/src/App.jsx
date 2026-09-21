import ErrorBoundary from './components/ErrorBoundary';
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import GlobalSearch from './components/GlobalSearch';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CandidatePage from './pages/CandidatesPage';
import ProgrammesPage from './pages/ProgrammesPage';
// import ResultsPage from './pages/ResultsPage';
import TeamRegistrationListPage from './pages/TeamRegistrationListPage';
import PendingResultsPage from './pages/PendingResultPage';
import PointAdjustmentPage from './pages/PointAdjustmentPage';
import Sidebar from './components/Sidebar';
import Breadcrumbs from './components/Breadcrumbs';
import SettingsPage from './pages/SettingsPage';
import ProgrammeParticipantSearchPage from './pages/ProgrammeParticipantSearchPage';
import CandidateProgrammeStatusPage from './pages/CandidateProgrammeStatusPage';
import ConflictCheckerPage from './pages/ConflictCheckerPage';
import UsersPage from './pages/UsersPage';
import SchedulePage from './pages/SchedulePage';
import JurySlipsPage from './pages/JurySlipsPage';
import ProgrammeJurySlipPage from './pages/ProgrammeJurySlipPage';
import ConfirmDialog from './components/ConfirmDialog';
import { Search, Bell, AlertTriangle, LogOut, Sun, Moon } from 'lucide-react';
import api from './services/api';

import TeamLeaderDashboard from './pages/TeamLeaderDashboard';
import TeamTopicRegistrationPage from './pages/TeamTopicRegistrationPage';
import RegistrationReviewPage from './pages/RegistrationReviewPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import GalleryPage from './pages/GalleryPage';
import NotificationsPage from './pages/NotificationsPage';
import TopicManagementPage from './pages/TopicManagementPage';
import TeamPortalDashboard from './pages/TeamPortalDashboard';
import TeamParticipantDirectoryPage from './pages/TeamParticipantDirectoryPage';
import LoadingScreen from './components/LoadingScreen';

import ResultEntryLayout from './components/ResultEntryLayout';
import ResultDashboard from './pages/result-entry/ResultDashboard';
import EnterResultPage from './pages/result-entry/EnterResultPage';
import ReadyResultsPage from './pages/result-entry/ReadyResultsPage';
import BatchDashboard from './pages/result-entry/BatchDashboard';
import BatchWorkspace from './pages/result-entry/BatchWorkspace';
import BatchPrintView from './pages/result-entry/BatchPrintView';





function App() {
  const savedInfo = localStorage.getItem('userInfo');
  const initialInfo = savedInfo ? JSON.parse(savedInfo) : null;
  
  const getInitialPage = (info) => {
    if (!info) return 'dashboard';
    if (info.role === 'team_leader') return 'team_dashboard';
    if (info.role === 'result_entry') return 'result_entry';
    return 'dashboard';
  };

  const [isAuthenticated, setIsAuthenticated] = useState(!!initialInfo);
  const [userInfo, setUserInfo] = useState(initialInfo);
  const navigate = useNavigate();
  const location = useLocation();
  const [appSettings, setAppSettings] = useState({ maintenanceMode: false, maintenanceMessage: '' });
  const [isDark, setIsDark] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('huda-admin-primary-theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        document.documentElement.style.setProperty('--color-primary', theme.hex);
        document.documentElement.style.setProperty('--color-primary-hover', theme.hover);
      } catch (e) {
        console.error('Failed to parse saved theme');
      }
    }
    const savedMode = localStorage.getItem('huda-admin-theme');
    if (savedMode === 'dark' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.setAttribute('data-theme', 'dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('huda-admin-theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('huda-admin-theme', 'dark');
      setIsDark(true);
    }
  };
  const [bootComplete, setBootComplete] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [activeNotifications, setActiveNotifications] = useState([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings/status');
        if (data) setAppSettings({ maintenanceMode: data.maintenanceMode, maintenanceMessage: data.maintenanceMessage });
      } catch (e) {
      } finally {
        setSettingsLoaded(true);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifications = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const isAdmin = userInfo?.role === 'admin';
        const { data } = await api.get(isAdmin ? '/notifications/all' : '/notifications');
        if (Array.isArray(data)) {
          setActiveNotifications(data);
          const readIds = JSON.parse(localStorage.getItem('huda_read_notifications') || '[]');
          const unread = data.filter(n => !readIds.includes(n._id)).length;
          setUnreadNotifications(unread);
        }
      } catch (e) {}
    };
    fetchNotifications();
  }, [isAuthenticated, location.pathname]);

  const handleNotificationClick = () => {
    if (activeNotifications.length > 0) {
      const readIds = JSON.parse(localStorage.getItem('huda_read_notifications') || '[]');
      const newReadIds = [...new Set([...readIds, ...activeNotifications.map(n => n._id)])];
      localStorage.setItem('huda_read_notifications', JSON.stringify(newReadIds));
      setUnreadNotifications(0);
    }
    navigate('/notifications');
  };

  const handleLoginSuccess = () => {
    setBootComplete(false);
    setSettingsLoaded(false);
    setTimeout(() => setSettingsLoaded(true), 10);
    
    setIsAuthenticated(true);
    const saved = localStorage.getItem('userInfo');
    if (saved) {
      const parsed = JSON.parse(saved);
      setUserInfo(parsed);
      const initPage = getInitialPage(parsed);
      const path = { dashboard: '/dashboard', team_dashboard: '/team-dashboard', result_entry: '/result-entry/dashboard' }[initPage] || '/dashboard';
      navigate(path);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setIsAuthenticated(false);
  };

  


  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!userInfo) return <Navigate to="/" replace />;
    if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
      return <PageTransition><div className="p-8 text-red-500">Unauthorized</div></PageTransition>;
    }
    return <PageTransition className="h-full">{children}</PageTransition>;
  };

  if (!isAuthenticated) {
    return (
      <>
        {!bootComplete && <LoadingScreen isReady={settingsLoaded} onComplete={() => setBootComplete(true)} />}
        <LoginPage onLoginSuccess={handleLoginSuccess} />

        
      </>
    );
  }

  
  if (userInfo?.role === 'result_entry') {
    return (
      <ErrorBoundary key={location.pathname}>
        <Routes location={location}>
          <Route path="/result-entry/batches/:id/print" element={<BatchPrintView />} />
            <Route element={<ResultEntryLayout />}>
            <Route path="/result-entry/dashboard" element={<ResultDashboard />} />
              <Route path="/result-entry/enter" element={<EnterResultPage />} />
            <Route path="/result-entry/ready" element={<ReadyResultsPage />} />
            <Route path="/result-entry/batches" element={<BatchDashboard />} />
            <Route path="/result-entry/batches/:id" element={<BatchWorkspace />} />
            <Route path="*" element={<Navigate to="/result-entry/dashboard" replace />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    );
  }

  const initial = userInfo?.userName?.charAt(0)?.toUpperCase() || 'A';
  const roleName = userInfo?.role?.replace('_', ' ') || 'Admin';

  return (
    <>
      {!bootComplete && <LoadingScreen isReady={settingsLoaded} onComplete={() => setBootComplete(true)} />}
      <div className="flex h-dvh bg-[var(--color-bg)] text-[var(--color-text-heading)]">
        <Sidebar
          onLogout={handleLogout}
          userInfo={userInfo}
        />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {appSettings.maintenanceMode && (
            <div className="bg-red-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 text-center shadow-md z-50">
              MAINTENANCE MODE ACTIVE - Public site is hidden
            </div>
          )}
          
          {/* Utility Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
            
            {/* Left Side: Search */}
            <div className="flex-1 flex items-center gap-4">
              <GlobalSearch onNavigate={(type) => {
                if (type === 'teams') navigate('/dashboard');
                else {
                  const pathMap = { search: '/search', candidates: '/candidates', programmes: '/programmes', registration_review: '/registrations', team_registration_list: '/registration-list', 'pending results': '/pending-results', judgment_feedback: '/judgment-feedback', adjustments: '/point-adjustments', logs: '/activity-logs', gallery: '/gallery', notifications: '/notifications', topic_management: '/topic-management', schedule: '/schedule', jury_slips: '/jury-slips', conflict_checker: '/conflict-checker', users: '/users', settings: '/settings' };
                  navigate(pathMap[type] || '/dashboard');
                }
              }} />
            </div>

            {/* Right Side: Theme, Notifications, Logout */}
            <div className="flex items-center gap-5">
              <button onClick={toggleTheme} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors cursor-pointer" title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button className="relative text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] transition-colors cursor-pointer" title="Notifications" onClick={handleNotificationClick}>
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[var(--color-surface)]">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setShowLogoutConfirm(true)} 
                className="flex items-center gap-2 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white px-5 py-2 rounded-full transition-all font-semibold text-sm border border-red-500/20 hover:border-red-500 cursor-pointer"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          </div>

                    <main className="flex-1 overflow-y-auto bg-[var(--color-bg)]">
            <AnimatePresence mode="wait">
              <ErrorBoundary key={location.pathname}>
                <Routes location={location}>
                <Route path="/team-dashboard" element={<ProtectedRoute allowedRoles={['admin', 'team_leader']}><TeamPortalDashboard /></ProtectedRoute>} />
                <Route path="/team-programme-registration" element={<ProtectedRoute allowedRoles={['admin', 'team_leader']}><TeamLeaderDashboard /></ProtectedRoute>} />
                <Route path="/registration-list" element={<ProtectedRoute allowedRoles={['admin', 'team_leader']}><TeamRegistrationListPage /></ProtectedRoute>} />
                <Route path="/team-topic-registration" element={<ProtectedRoute allowedRoles={['admin', 'team_leader']}><TeamTopicRegistrationPage /></ProtectedRoute>} />
                <Route path="/candidates" element={<ProtectedRoute allowedRoles={['admin', 'team_leader']}><CandidatePage /></ProtectedRoute>} />
                <Route path="/gallery" element={<ProtectedRoute allowedRoles={['admin']}><GalleryPage /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute allowedRoles={['admin', 'team_leader']}><NotificationsPage /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute allowedRoles={['admin', 'team_leader']}><SettingsPage /></ProtectedRoute>} />
                  <Route path="/search" element={<ProtectedRoute allowedRoles={['admin', 'team_leader']}><ProgrammeParticipantSearchPage /></ProtectedRoute>} />
                  <Route path="/candidate-status/:id" element={<ProtectedRoute allowedRoles={['admin', 'team_leader']}><CandidateProgrammeStatusPage /></ProtectedRoute>} />
                <Route path="/programmes" element={<ProtectedRoute allowedRoles={['admin']}><ProgrammesPage /></ProtectedRoute>} />
                <Route path="/registrations" element={<ProtectedRoute allowedRoles={['admin']}><RegistrationReviewPage /></ProtectedRoute>} />
                {/* <Route path="/results" element={<ProtectedRoute allowedRoles={['admin']}><ResultsPage /></ProtectedRoute>} /> */}
                <Route path="/pending-results" element={<ProtectedRoute allowedRoles={['admin']}><PendingResultsPage /></ProtectedRoute>} />
                <Route path="/point-adjustments" element={<ProtectedRoute allowedRoles={['admin']}><PointAdjustmentPage /></ProtectedRoute>} />
                <Route path="/activity-logs" element={<ProtectedRoute allowedRoles={['admin']}><ActivityLogsPage /></ProtectedRoute>} />
                <Route path="/topic-management" element={<ProtectedRoute allowedRoles={['admin']}><TopicManagementPage /></ProtectedRoute>} />
                <Route path="/jury-slips" element={<ProtectedRoute allowedRoles={['admin']}><JurySlipsPage /></ProtectedRoute>} />`n                <Route path="/programme-jury-slip" element={<ProtectedRoute allowedRoles={['admin']}><ProgrammeJurySlipPage /></ProtectedRoute>} />
                <Route path="/conflict-checker" element={<ProtectedRoute allowedRoles={['admin']}><ConflictCheckerPage /></ProtectedRoute>} />
                <Route path="/schedule" element={<ProtectedRoute allowedRoles={['admin']}><SchedulePage /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><DashboardPage /></ProtectedRoute>} />
                
                <Route path="/" element={<Navigate to={userInfo?.role === 'team_leader' ? '/team-dashboard' : '/dashboard'} replace />} />
                <Route path="*" element={<Navigate to={userInfo?.role === 'team_leader' ? '/team-dashboard' : '/dashboard'} replace />} />
              </Routes>
              </ErrorBoundary>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <ConfirmDialog 
        open={showLogoutConfirm} 
        title="Confirm Logout" 
        message="Are you sure you want to log out?" 
        confirmLabel="Log Out" 
        onConfirm={() => {
          setShowLogoutConfirm(false);
          handleLogout();
        }} 
        onCancel={() => setShowLogoutConfirm(false)} 
      />
    </>
  );
}

export default App;




