import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Trophy,
  LayoutDashboard,
  Users,
  UserCheck,
  Package,
  Repeat,
  Calendar,
  MapPin,
  CheckSquare,
  Award,
  Bell,
  Megaphone,
  Newspaper,
  BarChart3,
  FileText,
  ShieldCheck,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import { logout } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);
  const { unreadCount } = useSelector((state) => state.notifications);

  const roleName = user?.role?.name?.toLowerCase() || 'student';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'coordinator', 'coach', 'equipment_incharge', 'student'] },
    { label: 'User Management', path: '/users', icon: Users, roles: ['admin'] },
    { label: 'Sports Directory', path: '/sports', icon: Trophy, roles: ['admin', 'coordinator', 'coach', 'equipment_incharge', 'student'] },
    { label: 'Player Approvals', path: '/players', icon: UserCheck, roles: ['admin', 'coordinator', 'coach'] },
    { label: 'Register Sport', path: '/players/register', icon: UserCheck, roles: ['student'] },
    { label: 'Teams & Rosters', path: '/teams', icon: Users, roles: ['admin', 'coordinator', 'coach', 'student'] },
    { label: 'Equipment Inventory', path: '/inventory', icon: Package, roles: ['admin', 'coordinator', 'equipment_incharge', 'coach', 'student'] },
    { label: 'Borrow Requests', path: '/borrow', icon: Repeat, roles: ['admin', 'coordinator', 'equipment_incharge', 'student'] },
    { label: 'Fines Management', path: '/fines', icon: DollarSign, roles: ['admin', 'coordinator', 'equipment_incharge', 'student'] },
    { label: 'Tournaments', path: '/tournaments', icon: Trophy, roles: ['admin', 'coordinator', 'coach', 'student'] },
    { label: 'Match Calendar', path: '/calendar', icon: Calendar, roles: ['admin', 'coordinator', 'coach', 'student'] },
    { label: 'Venues', path: '/venues', icon: MapPin, roles: ['admin', 'coordinator', 'coach', 'student'] },
    { label: 'Attendance', path: '/attendance', icon: CheckSquare, roles: ['admin', 'coordinator', 'coach', 'student'] },
    { label: 'Achievements', path: '/achievements', icon: Award, roles: ['admin', 'coordinator', 'coach', 'student'] },
    { label: 'Announcements', path: '/announcements', icon: Megaphone, roles: ['admin', 'coordinator', 'coach', 'equipment_incharge', 'student'] },
    { label: 'Sports News', path: '/sports-news', icon: Newspaper, roles: ['admin', 'coordinator', 'coach', 'equipment_incharge', 'student'] },
    { label: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['admin', 'coordinator', 'coach', 'equipment_incharge'] },
    { label: 'Reports', path: '/reports', icon: FileText, roles: ['admin', 'coordinator', 'equipment_incharge'] },
    { label: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck, roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(roleName));

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'coordinator': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'coach': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'equipment_incharge': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      default: return 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg flex flex-col md:flex-row transition-colors duration-200">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-dark-border z-50 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col justify-between shadow-xl md:shadow-none`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-dark-border">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                <Trophy size={22} className="stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent tracking-tight">
                SportSync
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Role Tag */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-dark-border/50">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-medium border capitalize ${getRoleBadgeColor(roleName)}`}>
                  {roleName.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-210px)]">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon size={19} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-100 dark:border-dark-border flex items-center justify-between">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 sticky top-0 z-30 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-border px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight hidden sm:block">
              {navItems.find((i) => i.path === location.pathname)?.label || 'Sports Council Hub'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <Link
              to="/notifications"
              className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-accent-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2.5 p-1.5 pl-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline-block">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={16} className="text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-slate-200 dark:border-dark-border py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2 font-medium"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
