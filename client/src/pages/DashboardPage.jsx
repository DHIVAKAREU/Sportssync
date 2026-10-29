import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import {
  Trophy,
  Users,
  Package,
  Repeat,
  DollarSign,
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  UserPlus,
  Plus,
  ShieldCheck,
  Activity,
  Layers,
  Settings,
  FileText,
  MapPin,
  ClipboardList,
} from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role?.name?.toLowerCase() || (typeof user?.role === 'string' ? user.role.toLowerCase() : 'student');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/analytics/dashboard/${role}`);
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [role]);

  const kpis = stats?.kpis || {};

  const renderRoleDashboard = () => {
    switch (role) {
      case 'admin':
        return (
          <>
            {/* Admin KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <KpiCard title="Total Players" value={kpis.totalPlayers ?? '...'} change="Active registrations" icon={Users} color="brand" />
              <KpiCard title="Active Tournaments" value={kpis.activeTournaments ?? '...'} change="Running tournaments" icon={Layers} color="amber" />
              <KpiCard title="Equipment Issued" value={kpis.totalEquipmentIssued ?? '...'} change="Currently checked out" icon={Package} color="purple" />
              <KpiCard title="Low Stock Items" value={kpis.lowStockCount ?? '...'} change="<= 5 remaining" icon={AlertTriangle} color="rose" />
            </div>

            {/* Quick Operations & Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Settings className="text-brand-500" size={20} /> Admin Control Center
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Link
                    to="/users"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform mb-2">
                      <Users size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">User Management</span>
                  </Link>

                  <Link
                    to="/sports"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform mb-2">
                      <Trophy size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Sports Directory</span>
                  </Link>

                  <Link
                    to="/audit-logs"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform mb-2">
                      <ShieldCheck size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Audit Logs</span>
                  </Link>

                  <Link
                    to="/analytics"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-2">
                      <Activity size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">System Analytics</span>
                  </Link>

                  <Link
                    to="/reports"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform mb-2">
                      <FileText size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Generate Reports</span>
                  </Link>

                  <Link
                    to="/tournaments"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform mb-2">
                      <Plus size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Tournaments</span>
                  </Link>
                </div>
              </div>

              {/* Admin System Activity Stream */}
              <div className="glass-card rounded-3xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Admin Audit Log</h3>
                  <Link to="/audit-logs" className="text-xs font-bold text-brand-500 hover:underline flex items-center">
                    <span>View All</span> <ArrowUpRight size={14} />
                  </Link>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">User Role Updated</p>
                      <p className="text-slate-400">Assigned Coach role to coach@sportsync.com</p>
                      <span className="text-[10px] text-slate-400">5 mins ago</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">New Sport Added</p>
                      <p className="text-slate-400">Added Lawn Tennis to catalog</p>
                      <span className="text-[10px] text-slate-400">45 mins ago</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5" />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Staff Account Activated</p>
                      <p className="text-slate-400">Activated account for equipment_incharge</p>
                      <span className="text-[10px] text-slate-400">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'coordinator':
        return (
          <>
            {/* Coordinator KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <KpiCard title="Active Tournaments" value="6" change="+2 upcoming" icon={Trophy} color="amber" />
              <KpiCard title="Pending Player Approvals" value="18" change="Action required" icon={UserPlus} color="purple" />
              <KpiCard title="Configured Sports" value="12" change="Active Catalog" icon={Layers} color="brand" />
              <KpiCard title="Booked Venues" value="5" change="Today" icon={MapPin} color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Coordinator Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Link
                    to="/tournaments"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform mb-2">
                      <Plus size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Create Tournament</span>
                  </Link>

                  <Link
                    to="/sports"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform mb-2">
                      <Trophy size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Manage Sports</span>
                  </Link>

                  <Link
                    to="/players"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-2">
                      <CheckCircle2 size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Approve Players</span>
                  </Link>

                  <Link
                    to="/venues"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform mb-2">
                      <MapPin size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Manage Venues</span>
                  </Link>

                  <Link
                    to="/calendar"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform mb-2">
                      <Calendar size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Match Schedules</span>
                  </Link>

                  <Link
                    to="/reports"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform mb-2">
                      <FileText size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Council Reports</span>
                  </Link>
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Pending Approvals</h3>
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Football Registration</p>
                      <p className="text-[11px] text-slate-400">12 Player requests</p>
                    </div>
                    <Link to="/players" className="text-xs font-extrabold text-brand-500 hover:underline">
                      Review
                    </Link>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Badminton Tournament</p>
                      <p className="text-[11px] text-slate-400">Fixtures pending publish</p>
                    </div>
                    <Link to="/tournaments" className="text-xs font-extrabold text-brand-500 hover:underline">
                      Publish
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'coach':
        return (
          <>
            {/* Coach KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <KpiCard title="My Team Members" value="28" change="Basketball Team" icon={Users} color="emerald" />
              <KpiCard title="Upcoming Matches" value="4" change="This week" icon={Calendar} color="brand" />
              <KpiCard title="Practice Attendance" value="94%" change="+2% average" icon={CheckCircle2} color="purple" />
              <KpiCard title="Verified Achievements" value="12" change="State level" icon={Award} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Coach Workstation</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Link
                    to="/attendance"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform mb-2">
                      <ClipboardList size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Mark Attendance</span>
                  </Link>

                  <Link
                    to="/teams"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform mb-2">
                      <Users size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Manage Team Roster</span>
                  </Link>

                  <Link
                    to="/achievements"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform mb-2">
                      <Award size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Verify Achievements</span>
                  </Link>

                  <Link
                    to="/calendar"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform mb-2">
                      <Calendar size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Training Schedule</span>
                  </Link>
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Match Fixtures</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">Basketball Semifinals</p>
                    <p className="text-slate-400">Tomorrow at 4:00 PM • Main Arena</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">Cricket Inter-Dept Match</p>
                    <p className="text-slate-400">Saturday at 9:00 AM • Turf Pitch</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'equipment_incharge':
        return (
          <>
            {/* Equipment Manager KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <KpiCard title="Total Inventory Stock" value="520" change="Units registered" icon={Package} color="brand" />
              <KpiCard title="Currently Borrowed" value="48" change="Active out" icon={Repeat} color="purple" />
              <KpiCard title="Low Stock Items" value="3" change="Requires restock" icon={AlertTriangle} color="rose" />
              <KpiCard title="Overdue Returns" value="5" change="Fines calculated" icon={DollarSign} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Equipment Desk Operations</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Link
                    to="/borrow"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform mb-2">
                      <Repeat size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Process Returns</span>
                  </Link>

                  <Link
                    to="/inventory"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform mb-2">
                      <Package size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Update Inventory</span>
                  </Link>

                  <Link
                    to="/fines"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform mb-2">
                      <DollarSign size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Manage Fines</span>
                  </Link>
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Stock Alerts</h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                    <p className="font-bold">Badminton Shuttlecocks</p>
                    <p>Only 4 cans remaining in stock.</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                    <p className="font-bold">Overdue Return Alert</p>
                    <p>5 items past due return window.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      default:
        // Student Dashboard
        return (
          <>
            {/* Student KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <KpiCard title="My Enrolled Sports" value="2" change="Approved" icon={Users} color="emerald" />
              <KpiCard title="Borrowed Items" value="1" change="Due in 2 days" icon={Repeat} color="brand" />
              <KpiCard title="My Fines" value="₹0" change="Clear balance" icon={DollarSign} color="purple" />
              <KpiCard title="Verified Achievements" value="3" change="Recorded" icon={Award} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 glass-card rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Student Hub Shortcuts</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Link
                    to="/players/register"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform mb-2">
                      <UserPlus size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Register for Sport</span>
                  </Link>

                  <Link
                    to="/borrow"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform mb-2">
                      <Repeat size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Borrow Equipment</span>
                  </Link>

                  <Link
                    to="/calendar"
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:shadow-md transition-all flex flex-col items-center text-center group"
                  >
                    <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform mb-2">
                      <Calendar size={22} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Match Schedule</span>
                  </Link>
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">My Activity</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Badminton Racket #04</p>
                      <p className="text-slate-400">Due: Sep 13, 2026</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 font-bold">Issued</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 p-6 md:p-8 text-white shadow-xl shadow-brand-500/20">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
            {role.replace('_', ' ')} Dashboard
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Sports Member'}!
          </h1>
          <p className="text-brand-100 text-sm md:text-base mt-2">
            Sports Council Hub Operational Portal. Dedicated dashboard for your {role.replace('_', ' ')} role responsibilities.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
          <Trophy size={200} />
        </div>
      </div>

      {/* Role-Specific Dashboard Views */}
      {renderRoleDashboard()}
    </div>
  );
};

export default DashboardPage;
