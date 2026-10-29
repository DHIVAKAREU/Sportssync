import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts & Guards
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import SportsManagementPage from './pages/SportsManagementPage';
import PlayersPage from './pages/PlayersPage';
import RegisterPlayerPage from './pages/RegisterPlayerPage';
import TeamsPage from './pages/TeamsPage';
import EquipmentPage from './pages/EquipmentPage';
import BorrowPage from './pages/BorrowPage';
import FinesPage from './pages/FinesPage';
import TournamentsPage from './pages/TournamentsPage';
import CalendarPage from './pages/CalendarPage';
import VenuesPage from './pages/VenuesPage';
import AttendancePage from './pages/AttendancePage';
import AchievementsPage from './pages/AchievementsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import NotificationsPage from './pages/NotificationsPage';
import SportsNewsPage from './pages/SportsNewsPage';

const App = () => {
  const { theme } = useSelector((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/sports" element={<SportsManagementPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/players/register" element={<RegisterPlayerPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/inventory" element={<EquipmentPage />} />
            <Route path="/borrow" element={<BorrowPage />} />
            <Route path="/fines" element={<FinesPage />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/venues" element={<VenuesPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/sports-news" element={<SportsNewsPage />} />

            {/* Admin Only User Management Route */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/users" element={<UserManagementPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
            </Route>

            {/* Role-Specific Admin & Staff Routes */}
            <Route element={<ProtectedRoute roles={['admin', 'coordinator', 'coach', 'equipment_incharge']} />}>
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin', 'coordinator', 'equipment_incharge']} />}>
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
