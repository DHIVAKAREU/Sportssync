import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import StatusBadge from '../components/StatusBadge';
import KpiCard from '../components/KpiCard';
import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Check,
  X,
  ShieldAlert,
} from 'lucide-react';

const FinesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role?.name?.toLowerCase() || (typeof user?.role === 'string' ? user.role.toLowerCase() : 'student');
  const canManageFines = ['admin', 'coordinator', 'equipment_incharge'].includes(role);
  const canWaiveFines = ['admin', 'coordinator'].includes(role);

  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchFines = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await API.get('/fines', { params });
      let data = res.data.data || [];

      if (search) {
        const regex = new RegExp(search, 'i');
        data = data.filter(
          (f) =>
            (f.student && (regex.test(f.student.name) || regex.test(f.student.email) || regex.test(f.student.registerNumber))) ||
            (f.reason && regex.test(f.reason))
        );
      }

      setFines(data);
    } catch (err) {
      console.error('Failed to fetch fines', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load fines records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, [statusFilter, search]);

  const handlePayFine = async (fineId) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      await API.patch(`/fines/${fineId}/pay`);
      setSuccessMsg('Fine marked as Paid successfully!');
      fetchFines();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to mark fine as paid');
    }
  };

  const handleWaiveFine = async (fineId) => {
    const reason = prompt('Specify reason for waiving this fine:', 'Approved by Sports Council Coordinator');
    if (reason === null) return;

    try {
      setErrorMsg('');
      setSuccessMsg('');
      await API.patch(`/fines/${fineId}/waive`, { waivedReason: reason });
      setSuccessMsg('Fine waived successfully!');
      fetchFines();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to waive fine');
    }
  };

  // Metrics
  const unpaidTotal = fines.filter((f) => f.status === 'Unpaid').reduce((sum, f) => sum + (f.amount || 0), 0);
  const paidTotal = fines.filter((f) => f.status === 'Paid').reduce((sum, f) => sum + (f.amount || 0), 0);
  const waivedCount = fines.filter((f) => f.status === 'Waived').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <DollarSign className="text-brand-500 stroke-[2.5]" /> Fines & Penalty Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Overdue equipment return penalties, damaged goods assessments, and fine settlement records.
          </p>
        </div>

        <button
          onClick={fetchFines}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh List"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <KpiCard title="Pending Unpaid Fines" value={`₹${unpaidTotal}`} change="Outstanding" icon={DollarSign} color="rose" />
        <KpiCard title="Collected Paid Fines" value={`₹${paidTotal}`} change="Cleared" icon={CheckCircle2} color="emerald" />
        <KpiCard title="Waived Fines" value={waivedCount.toString()} change="Council Approvals" icon={AlertCircle} color="amber" />
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by student or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium border-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="Unpaid">Unpaid Only</option>
            <option value="Paid">Paid Only</option>
            <option value="Waived">Waived Only</option>
          </select>
        </div>
      </div>

      {/* Fines Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-dark-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100/70 dark:bg-slate-800/60 uppercase text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Fine Reason</th>
                <th className="px-6 py-4">Overdue Days</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <RefreshCw className="animate-spin inline text-brand-500 mr-2" size={20} />
                    <span>Loading fines records...</span>
                  </td>
                </tr>
              ) : fines.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    No fines recorded matching current filters.
                  </td>
                </tr>
              ) : (
                fines.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{row.student?.name || 'Student'}</p>
                        <p className="text-xs text-slate-400">{row.student?.registerNumber || row.student?.email}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {row.reason}
                    </td>

                    <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {row.overdueDays ? `${row.overdueDays} days late` : '-'}
                    </td>

                    <td className="px-6 py-4 font-extrabold text-rose-600 dark:text-rose-400 text-base">
                      ₹{row.amount}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={row.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {row.status === 'Unpaid' && (
                          <>
                            {canManageFines && (
                              <button
                                onClick={() => handlePayFine(row._id)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center space-x-1"
                              >
                                <Check size={14} />
                                <span>Mark Paid</span>
                              </button>
                            )}

                            {canWaiveFines && (
                              <button
                                onClick={() => handleWaiveFine(row._id)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center space-x-1"
                              >
                                <X size={14} />
                                <span>Waive</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinesPage;
