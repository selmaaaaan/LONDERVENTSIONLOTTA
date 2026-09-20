import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, UserPlus, Calendar, Trophy, Clock, LogOut, Sliders, Activity, ChevronLeft, ChevronRight, Settings, Sun, Moon, Image as ImageIcon, Bell, ClipboardList, FileText, CalendarClock, Radio, FileSpreadsheet, BookOpen, Table2, Search } from 'lucide-react';
import Logo from './Logo';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'candidates', label: 'Candidates', icon: Users },
  { key: 'programmes', label: 'Programmes', icon: Calendar },
  { key: 'search', label: 'Search', icon: Search },
  { key: 'registration_review', label: 'Registrations', icon: Clock },
  { key: 'team_registration_list', label: 'Registration List', icon: Table2 },
  { key: 'results', label: 'Results', icon: Trophy },
  { key: 'pending results', label: 'Pending Results', icon: Clock },
  { key: 'judgment_feedback', label: 'Judgment Feedback', icon: FileSpreadsheet },
  { key: 'adjustments', label: 'Point Adjustments', icon: Sliders },
  { key: 'logs', label: 'Activity Logs', icon: Activity },
  { key: 'gallery', label: 'Gallery', icon: ImageIcon },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'topic_management', label: 'Topic Management', icon: ClipboardList },
  { key: 'schedule', label: 'Schedule', icon: CalendarClock },
  { key: 'jury_slips', label: 'Participant List', icon: FileText },
  { key: 'programme_jury_slip', label: 'Programme Jury Slip', icon: FileText },
  { key: 'conflict_checker', label: 'Conflict Checker', icon: FileText },
  { key: 'users', label: 'Users & Teams', icon: UserPlus },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ onLogout, userInfo }) => {
  const location = useLocation();
  
  const [teamColor, setTeamColor] = useState('var(--color-primary)');

  useEffect(() => {
    // If team_leader, fetch team to get color
    if (userInfo?.role === 'team_leader' && userInfo?.team) {
      api.get('/teams')
        .then(res => {
          const myTeam = res.data.find(t => t._id === userInfo.team);
          if (myTeam && myTeam.color) {
            setTeamColor(myTeam.color);
          }
        })
        .catch(console.error);
    } else {
       setTeamColor('var(--color-primary)');
    }
  }, [userInfo]);

  const isTeamLeader = userInfo?.role === 'team_leader';
  const isJudge = userInfo?.role === 'judge';
  const isVolunteer = userInfo?.role === 'volunteer';

  const visibleNavItems = isJudge
    ? [{ key: 'judge_panel', label: 'Judge Panel', icon: Trophy }]
    : isTeamLeader
    ? [
        { key: 'team_dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'candidates', label: 'My Team', icon: Users },
        { key: 'search', label: 'Search', icon: Search },
        { key: 'team_programme_registration', label: 'Programme Registration', icon: Calendar },
        { key: 'team_registration_list', label: 'Registration List', icon: Table2 },
        { key: 'team_topic_registration', label: 'Topic Registration', icon: BookOpen },
        { key: 'notifications', label: 'Notifications', icon: Bell }
      ]
    : isVolunteer
    ? [
        { key: 'volunteer_portal', label: 'Volunteer Portal', icon: Radio },
      ]
    : navItems;

  return (
    <aside className="w-64 flex flex-col bg-[var(--color-surface)] border-r border-[var(--color-border)]">
      {/* Logo */}
      <div className="px-4 h-24 flex items-center justify-center overflow-hidden">
        <Logo size="default" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto no-scrollbar">
        {visibleNavItems.map(({ key, label, icon: Icon }) => {
          const path = {
            dashboard: '/dashboard',
            candidates: '/candidates',
            programmes: '/programmes',
            search: '/search',
            registration_review: '/registrations',
            team_registration_list: '/registration-list',
            results: '/results',
            'pending results': '/pending-results',
            judgment_feedback: '/judgment-feedback',
            adjustments: '/point-adjustments',
            logs: '/activity-logs',
            gallery: '/gallery',
            notifications: '/notifications',
            topic_management: '/topic-management',
            schedule: '/schedule',
            jury_slips: '/jury-slips',
            programme_jury_slip: '/programme-jury-slip',
            conflict_checker: '/conflict-checker',
            users: '/users',
            settings: '/settings',
            judge_panel: '/judge-panel',
            team_dashboard: '/team-dashboard',
            team_programme_registration: '/team-programme-registration',
            team_topic_registration: '/team-topic-registration',
            volunteer_portal: '/volunteer-portal',
          }[key] || '/';
          const isActive = location.pathname === path;
          return (
            <Link
              key={key}
              to={path}
              
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-[var(--color-text-body)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text-heading)]'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Controls */}
      <div className="p-3 border-t border-[var(--color-border)] space-y-2">
        {/* Profile link — only admin/judge go to /settings; team leaders are NOT allowed */}
        {isTeamLeader ? (
          <div className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm cursor-default">
            <div className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold shrink-0" style={{ backgroundColor: teamColor }}>
              {userInfo?.userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <div className="font-semibold text-[var(--color-text-heading)] truncate leading-tight">{userInfo?.userName || 'User'}</div>
              <div className="text-[10px] text-[var(--color-text-muted)] capitalize truncate mt-0.5">{userInfo?.role?.replace('_', ' ') || 'Team Leader'}</div>
            </div>
          </div>
        ) : (
          <Link to="/settings" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-[var(--color-surface-elevated)] cursor-pointer" title="Settings">
            <div className="w-9 h-9 rounded-full text-white flex items-center justify-center font-bold shrink-0" style={{ backgroundColor: teamColor }}>
              {userInfo?.userName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <div className="font-semibold text-[var(--color-text-heading)] truncate leading-tight">{userInfo?.userName || 'User'}</div>
              <div className="text-[10px] text-[var(--color-text-muted)] capitalize truncate mt-0.5">{userInfo?.role?.replace('_', ' ') || 'Admin'}</div>
            </div>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

