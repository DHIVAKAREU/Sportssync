import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { ClipboardCheck, Plus, RefreshCw, AlertCircle, Check } from 'lucide-react';

const AttendancePage = () => {
  const { user } = useSelector((state) => state.auth);
  const roleName = user?.role?.name?.toLowerCase() || (typeof user?.role === 'string' ? user.role.toLowerCase() : 'student');
  const isStaff = ['admin', 'coordinator', 'coach'].includes(roleName);

  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Mark Attendance Modal State
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState('');
  const [sessionName, setSessionName] = useState('Morning Conditioning');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [registeredPlayers, setRegisteredPlayers] = useState([]);
  const [playerStatusMap, setPlayerStatusMap] = useState({});
  const [playersLoading, setPlayersLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAttendanceLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const [response, statsRes] = await Promise.all([
        API.get('/attendance'),
        API.get('/attendance/stats'),
      ]);
      setAttendanceLogs(response.data.data || []);
      setAttendanceStats(statsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching attendance logs:', err);
      setError(err.response?.data?.message || 'Failed to fetch attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSports = async () => {
    try {
      const res = await API.get('/sports');
      setSports(res.data.data || []);
    } catch (err) {
      console.error('Error fetching sports:', err);
    }
  };

  useEffect(() => {
    fetchAttendanceLogs();
    if (isStaff) {
      fetchSports();
    }
  }, [isStaff]);

  useEffect(() => {
    if (!selectedSport) {
      setRegisteredPlayers([]);
      setPlayerStatusMap({});
      return;
    }

    const fetchPlayersForSport = async () => {
      setPlayersLoading(true);
      try {
        const res = await API.get('/players', {
          params: { sportId: selectedSport, status: 'approved' },
        });
        const players = res.data.data || [];
        setRegisteredPlayers(players);

        const initialMap = {};
        players.forEach((p) => {
          initialMap[p._id] = 'Present';
        });
        setPlayerStatusMap(initialMap);
      } catch (err) {
        console.error('Error fetching sport players:', err);
      } finally {
        setPlayersLoading(false);
      }
    };

    fetchPlayersForSport();
  }, [selectedSport]);

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSport) {
      setError('Please select a sport');
      return;
    }
    if (registeredPlayers.length === 0) {
      setError('No approved players found for this sport.');
      return;
    }

    try {
      setSubmitLoading(true);
      setError('');
      setSuccessMsg('');

      const records = registeredPlayers.map((p) => ({
        playerId: p._id,
        status: playerStatusMap[p._id] || 'Present',
      }));

      const res = await API.post('/attendance/bulk', {
        sportId: selectedSport,
        date: attendanceDate,
        session: sessionName,
        records,
      });

      setSuccessMsg(res.data.message || 'Attendance recorded successfully!');
      setIsMarkModalOpen(false);
      fetchAttendanceLogs();
    } catch (err) {
      console.error('Bulk attendance error:', err);
      setError(err.response?.data?.message || 'Failed to submit attendance.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Student-specific metrics
  const myTotalSessions = attendanceLogs.length;
  const myPresentCount = attendanceLogs.filter(
    (l) => l.status && l.status.toLowerCase() === 'present'
  ).length;
  const myAbsentCount = attendanceLogs.filter(
    (l) => l.status && l.status.toLowerCase() === 'absent'
  ).length;
  const myAttendanceRate =
    myTotalSessions > 0
      ? ((myPresentCount / myTotalSessions) * 100).toFixed(1)
      : '0.0';

  const staffColumns = [
    {
      key: 'player',
      label: 'Player Name',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-white block">
            {row.player?.user?.name || 'Student Player'}
          </span>
          <span className="text-xs text-slate-400">
            {row.player?.user?.registerNumber || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'sport',
      label: 'Sport',
      render: (row) => row.sport?.name || 'N/A',
    },
    { key: 'session', label: 'Session' },
    {
      key: 'date',
      label: 'Date',
      render: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const studentColumns = [
    {
      key: 'sport',
      label: 'Sport',
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {row.sport?.name || 'N/A'}
        </span>
      ),
    },
    { key: 'session', label: 'Session' },
    {
      key: 'date',
      label: 'Date',
      render: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const columns = isStaff ? staffColumns : studentColumns;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="text-brand-500" size={26} />
            <span>{isStaff ? 'Player Attendance Tracking' : 'My Attendance Record'}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isStaff
              ? 'Record and view player attendance for sports sessions.'
              : 'View your personal sports session attendance history and eligibility.'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isStaff && (
            <button
              onClick={() => setIsMarkModalOpen(true)}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 flex items-center space-x-2 text-sm transition-all"
            >
              <Plus size={18} />
              <span>Mark Attendance</span>
            </button>
          )}
          <button
            onClick={fetchAttendanceLogs}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Refresh list"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center space-x-3 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center space-x-3 text-sm">
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Attendance Stats Cards */}
      {isStaff ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Total Sessions Tracked</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {attendanceStats.reduce((acc, s) => acc + (s.totalSessions || 0), 0) || attendanceLogs.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Council-wide recorded sessions</p>
          </div>
          <div className="p-5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Average Attendance Rate</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {attendanceStats.length > 0
                ? `${(
                    attendanceStats.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0) /
                    attendanceStats.length
                  ).toFixed(1)}%`
                : '0.0%'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Across all registered squads</p>
          </div>
          <div className="p-5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Active Players Monitored</p>
            <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">
              {attendanceStats.length || '0'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Athletes with attendance records</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">My Total Sessions</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {myTotalSessions}
            </p>
            <p className="text-xs text-slate-500 mt-1">Scheduled training & match sessions</p>
          </div>
          <div className="p-5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">My Attendance Rate</p>
            <p
              className={`text-2xl font-black mt-1 ${
                Number(myAttendanceRate) >= 75
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-500'
              }`}
            >
              {myAttendanceRate}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {Number(myAttendanceRate) >= 75
                ? 'Eligible for Tournaments (Min. 75%)'
                : 'Below Minimum Requirement (75%)'}
            </p>
          </div>
          <div className="p-5 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">Sessions Attended</p>
            <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">
              {myPresentCount} <span className="text-sm font-semibold text-slate-400">/ {myTotalSessions}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {myPresentCount} Present &bull; {myAbsentCount} Absent
            </p>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={attendanceLogs}
        isLoading={loading}
        searchPlaceholder={isStaff ? 'Search player name, sport, or session...' : 'Search sport, session, or date...'}
      />

      {/* Mark Attendance Modal */}
      {isStaff && (
        <Modal
          isOpen={isMarkModalOpen}
          onClose={() => setIsMarkModalOpen(false)}
          title="Mark Session Attendance"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Select Sport
                </label>
                <select
                  required
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                >
                  <option value="">Select Sport</option>
                  {sports.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Session Name
                </label>
                <input
                  type="text"
                  required
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g. Morning Practice"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                Approved Players Checklist
              </h4>

              {!selectedSport ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  Please select a sport above to load registered players.
                </div>
              ) : playersLoading ? (
                <div className="p-6 text-center text-xs text-slate-400">Loading players...</div>
              ) : registeredPlayers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  No approved players found for this sport. Please approve player requests first in Player Queue.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {registeredPlayers.map((p) => (
                    <div
                      key={p._id}
                      className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {p.user?.name || 'Player'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {p.position || 'Player'} • #{p.jerseyNumber || '-'}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPlayerStatusMap({ ...playerStatusMap, [p._id]: 'Present' })
                          }
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                            playerStatusMap[p._id] === 'Present'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPlayerStatusMap({ ...playerStatusMap, [p._id]: 'Absent' })
                          }
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                            playerStatusMap[p._id] === 'Absent'
                              ? 'bg-rose-600 text-white shadow'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsMarkModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading || registeredPlayers.length === 0}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/30 disabled:opacity-50"
              >
                {submitLoading ? 'Saving...' : 'Submit Attendance'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AttendancePage;
