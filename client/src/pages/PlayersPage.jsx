import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  UserCheck,
  Check,
  XCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Eye,
  X,
  Mail,
  Phone,
  Building,
  User,
  Trophy,
  ShieldCheck,
} from 'lucide-react';

const PlayersPage = () => {
  const { user } = useSelector((state) => state.auth);
  const roleName = user?.role?.name?.toLowerCase() || (typeof user?.role === 'string' ? user.role.toLowerCase() : 'student');
  const isStaff = ['admin', 'coordinator', 'coach'].includes(roleName);

  const [players, setPlayers] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sportFilter, setSportFilter] = useState('');

  // Modals state
  const [rejectingPlayer, setRejectingPlayer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewingPlayer, setViewingPlayer] = useState(null);
  const [playerDetails, setPlayerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSports = async () => {
    try {
      const res = await API.get('/sports');
      setSports(res.data.data || []);
    } catch (err) {
      console.error('Failed to load sports list:', err);
    }
  };

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (sportFilter) params.sportId = sportFilter;
      if (search) params.search = search;

      const endpoint = isStaff ? '/players' : '/players/me';
      const response = await API.get(endpoint, { params });
      setPlayers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError(err.response?.data?.message || 'Failed to load player registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlayers();
    }, 300);
    return () => clearTimeout(timer);
  }, [statusFilter, sportFilter, search, isStaff]);

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await API.patch(`/players/${id}/approve`);
      setSuccessMsg(res.data.message || 'Player registration approved successfully!');
      fetchPlayers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve registration.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingPlayer) return;
    try {
      setActionLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await API.patch(`/players/${rejectingPlayer._id}/reject`, {
        reason: rejectionReason,
      });
      setSuccessMsg(res.data.message || 'Player registration rejected.');
      setRejectingPlayer(null);
      setRejectionReason('');
      fetchPlayers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject registration.');
    } finally {
      setActionLoading(false);
    }
  };

  const openProfileModal = async (player) => {
    setViewingPlayer(player);
    try {
      setDetailsLoading(true);
      const res = await API.get(`/players/${player._id}`);
      setPlayerDetails(res.data.data);
    } catch (err) {
      console.error('Failed to load profile details', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <UserCheck className="text-brand-500 stroke-[2.5]" />
            <span>{isStaff ? 'Player Registration & Approval Hub' : 'My Sports Applications'}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isStaff
              ? 'Review student applications, verify eligibility, approve registrations, and assign team roles.'
              : 'Track the real-time status of your college sports council applications.'}
          </p>
        </div>

        <button
          onClick={fetchPlayers}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh List"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check size={18} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by student name, email, reg #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Sport Filter */}
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium border-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Sports</option>
            {sports.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium border-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Players Data Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-dark-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100/70 dark:bg-slate-800/60 uppercase text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Student Info</th>
                <th className="px-6 py-4">Sport</th>
                <th className="px-6 py-4">Position / Jersey</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <RefreshCw className="animate-spin inline text-brand-500 mr-2" size={20} />
                    <span>Loading player registrations...</span>
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400">
                    No registrations found matching the specified filters.
                  </td>
                </tr>
              ) : (
                players.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow">
                          {row.user?.name ? row.user.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{row.user?.name || user?.name || 'Student'}</p>
                          <p className="text-xs text-slate-400">{row.user?.registerNumber || row.user?.email || user?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                      {row.sport?.name || 'N/A'}
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{row.position || 'Player'}</p>
                      <p className="text-slate-400">{row.jerseyNumber ? `Jersey #${row.jerseyNumber}` : 'Unassigned'}</p>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={row.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openProfileModal(row)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                          title="View Player Profile"
                        >
                          <Eye size={16} />
                        </button>

                        {isStaff && row.status === 'pending' && (
                          <>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleApprove(row._id)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center space-x-1 disabled:opacity-50"
                            >
                              <Check size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => {
                                setRejectingPlayer(row);
                                setRejectionReason('');
                              }}
                              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center space-x-1 disabled:opacity-50"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
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

      {/* Reject Modal */}
      {rejectingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-dark-border">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <XCircle className="text-rose-500" size={22} /> Reject Registration
              </h3>
              <button onClick={() => setRejectingPlayer(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Rejecting registration for <strong className="text-slate-900 dark:text-white">{rejectingPlayer.user?.name}</strong> ({rejectingPlayer.sport?.name}).
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Rejection Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide reason for student notification..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setRejectingPlayer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 shadow-md shadow-rose-500/25 disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Player Profile Details Modal */}
      {viewingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 md:p-8 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-dark-border">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="text-brand-500" size={22} /> Student Player Profile
              </h3>
              <button onClick={() => { setViewingPlayer(null); setPlayerDetails(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-8 text-center text-slate-400">
                <RefreshCw className="animate-spin inline mr-2" size={18} /> Loading profile...
              </div>
            ) : (
              <div className="space-y-5 text-sm">
                <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xl shadow-lg">
                    {viewingPlayer.user?.name ? viewingPlayer.user.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">{viewingPlayer.user?.name || 'Student'}</h4>
                    <p className="text-xs text-slate-400">{viewingPlayer.user?.email}</p>
                    <span className="inline-block mt-1">
                      <StatusBadge status={viewingPlayer.status} />
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Register Number</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{viewingPlayer.user?.registerNumber || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Department / Year</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {viewingPlayer.user?.department || 'General'} {viewingPlayer.user?.year ? `(Year ${viewingPlayer.user.year})` : ''}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/10 space-y-2">
                  <p className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase">Registered Sport Details</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Discipline:</span>
                    <strong className="text-slate-900 dark:text-white">{viewingPlayer.sport?.name}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Position / Role:</span>
                    <strong className="text-slate-900 dark:text-white">{viewingPlayer.position || 'Player'}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Jersey #:</span>
                    <strong className="text-slate-900 dark:text-white">{viewingPlayer.jerseyNumber || 'None'}</strong>
                  </div>
                </div>

                {playerDetails?.teamMemberships && playerDetails.teamMemberships.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Team Roster Memberships</p>
                    <div className="space-y-2">
                      {playerDetails.teamMemberships.map((tm) => (
                        <div key={tm._id} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">{tm.team?.name} ({tm.team?.season})</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold uppercase">{tm.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayersPage;
