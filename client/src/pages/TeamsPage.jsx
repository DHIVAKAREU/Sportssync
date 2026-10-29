import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import {
  Users,
  Crown,
  Plus,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  X,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  UserCheck,
  Trophy,
  Award,
} from 'lucide-react';

const TeamsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role?.name?.toLowerCase() || (typeof user?.role === 'string' ? user.role.toLowerCase() : 'student');
  const canManageTeams = ['admin', 'coordinator', 'coach'].includes(role);

  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamRoster, setTeamRoster] = useState([]);
  const [approvedPlayersForSport, setApprovedPlayersForSport] = useState([]);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);

  // Form states
  const [newTeam, setNewTeam] = useState({ name: '', sportId: '', coachId: '', season: '2025-2026' });
  const [newMember, setNewMember] = useState({ playerId: '', role: 'member' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const params = {};
      if (search) params.search = search;
      if (sportFilter) params.sportId = sportFilter;

      const res = await API.get('/teams', { params });
      setTeams(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch teams', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load teams.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [sportsRes, usersRes] = await Promise.all([
        API.get('/sports'),
        API.get('/users?role=coach').catch(() => ({ data: { data: [] } })),
      ]);
      setSports(sportsRes.data.data || []);
      setStaffUsers(usersRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch dependencies', err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeams();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, sportFilter]);

  const openRosterModal = async (team) => {
    setSelectedTeam(team);
    setErrorMsg('');
    setSuccessMsg('');
    setIsRosterModalOpen(true);

    try {
      // Fetch full team & roster members
      const teamRes = await API.get(`/teams/${team._id}`);
      setTeamRoster(teamRes.data.data?.members || []);

      // Fetch approved players specifically registered for THIS team's sport
      const playersRes = await API.get(`/players?sportId=${team.sport?._id || team.sport}&status=approved`);
      setApprovedPlayersForSport(playersRes.data.data || []);
    } catch (err) {
      console.error('Failed to load team roster details', err);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newTeam.name || !newTeam.sportId) {
      setErrorMsg('Team name and sport selection are required');
      return;
    }

    try {
      setSubmitting(true);
      await API.post('/teams', newTeam);
      setIsCreateModalOpen(false);
      setNewTeam({ name: '', sportId: '', coachId: '', season: '2025-2026' });
      fetchTeams();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!newMember.playerId) {
      setErrorMsg('Please select an approved player to add');
      return;
    }

    try {
      setSubmitting(true);
      await API.post(`/teams/${selectedTeam._id}/members`, newMember);
      setSuccessMsg('Player added to team roster successfully!');
      setNewMember({ playerId: '', role: 'member' });
      openRosterModal(selectedTeam);
      fetchTeams();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add member to team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (playerId) => {
    if (!window.confirm('Are you sure you want to remove this player from the team roster?')) return;
    try {
      setErrorMsg('');
      await API.delete(`/teams/${selectedTeam._id}/members/${playerId}`);
      openRosterModal(selectedTeam);
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleSetCaptain = async (playerId) => {
    try {
      setErrorMsg('');
      await API.patch(`/teams/${selectedTeam._id}/captain`, { playerId });
      setSuccessMsg('Team captain reassigned successfully!');
      openRosterModal(selectedTeam);
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reassign captain');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="text-brand-500 stroke-[2.5]" /> Team Roster & Squad Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Configure college sports squads, assign approved players, designate team captains and coaches.
          </p>
        </div>

        {canManageTeams && (
          <button
            onClick={() => {
              setErrorMsg('');
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all text-sm"
          >
            <Plus size={18} />
            <span>Create New Team</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search teams by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium border-none focus:ring-2 focus:ring-brand-500 w-full md:w-auto"
          >
            <option value="">All Sports</option>
            {sports.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={fetchTeams}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="animate-spin inline text-brand-500 mr-2" size={24} />
          <span className="text-slate-500 text-sm font-medium">Loading sports teams...</span>
        </div>
      ) : teams.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-400">
          No teams found matching the search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team._id} className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-dark-border flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    {team.sport?.name || 'Sport'}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{team.season}</span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{team.name}</h3>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <Crown size={14} className="text-amber-500" /> Captain:
                    </span>
                    <strong className="text-slate-900 dark:text-white">
                      {team.captain?.user?.name || team.captain?.name || 'Unassigned'}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 font-medium">Coach:</span>
                    <strong className="text-slate-900 dark:text-white">{team.coach?.name || 'Unassigned'}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">Roster Management</span>
                <button
                  onClick={() => openRosterModal(team)}
                  className="px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-md hover:bg-brand-600 transition-colors flex items-center space-x-1.5"
                >
                  <UserPlus size={14} />
                  <span>View Roster</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Team */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-dark-border">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="text-brand-500" size={22} /> Create New Team
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              {errorMsg && <div className="p-3 text-xs bg-rose-500/10 text-rose-500 rounded-xl font-medium">{errorMsg}</div>}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spartans XI"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sport *</label>
                <select
                  required
                  value={newTeam.sportId}
                  onChange={(e) => setNewTeam({ ...newTeam, sportId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select Sport</option>
                  {sports.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Season</label>
                <input
                  type="text"
                  value={newTeam.season}
                  onChange={(e) => setNewTeam({ ...newTeam, season: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-semibold hover:bg-brand-600 shadow-md shadow-brand-500/25 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Save Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Team Roster & Member Assignment */}
      {isRosterModalOpen && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-2xl rounded-3xl p-6 md:p-8 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-dark-border">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="text-brand-500" size={22} /> {selectedTeam.name} Squad Roster
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sport: {selectedTeam.sport?.name} • Season: {selectedTeam.season}
                </p>
              </div>
              <button onClick={() => setIsRosterModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            {errorMsg && <div className="p-3 text-xs bg-rose-500/10 text-rose-500 rounded-xl font-medium mb-4">{errorMsg}</div>}
            {successMsg && <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-medium mb-4">{successMsg}</div>}

            {/* Add Approved Player Form */}
            {canManageTeams && (
              <form onSubmit={handleAddMember} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 mb-6 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Add Approved Player to Roster</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <select
                      required
                      value={newMember.playerId}
                      onChange={(e) => setNewMember({ ...newMember, playerId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">Select Approved Player for {selectedTeam.sport?.name}</option>
                      {approvedPlayersForSport.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.user?.name || 'Student'} ({p.user?.registerNumber || 'Reg#'}) - Position: {p.position}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="member">Member</option>
                      <option value="captain">Captain</option>
                      <option value="vice-captain">Vice Captain</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 shadow-md shadow-brand-500/25 disabled:opacity-50"
                  >
                    {submitting ? 'Adding...' : 'Add Player to Squad'}
                  </button>
                </div>
              </form>
            )}

            {/* Roster Members Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Current Squad Members ({teamRoster.length})</h4>
              {teamRoster.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No players added to this team roster yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {teamRoster.map((m) => (
                    <div key={m._id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center">
                          {m.player?.user?.name ? m.player.user.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {m.player?.user?.name || 'Player'}
                            {m.role === 'captain' && <Crown size={14} className="text-amber-500" />}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {m.player?.user?.registerNumber || m.player?.user?.email} • Position: {m.player?.position || 'Player'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold uppercase text-[10px]">
                          {m.role}
                        </span>

                        {canManageTeams && m.role !== 'captain' && (
                          <button
                            onClick={() => handleSetCaptain(m.player?._id || m.player)}
                            className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-semibold text-[11px]"
                            title="Make Captain"
                          >
                            Set Captain
                          </button>
                        )}

                        {canManageTeams && (
                          <button
                            onClick={() => handleRemoveMember(m.player?._id || m.player)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                            title="Remove from squad"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
