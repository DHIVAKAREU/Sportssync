import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Trophy,
  Plus,
  Search,
  Filter,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  X,
  Play,
  Award,
  MapPin,
  Clock,
  ShieldAlert,
  Users,
  Edit2,
  Save,
} from 'lucide-react';

const TournamentsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role?.name?.toLowerCase() || (typeof user?.role === 'string' ? user.role.toLowerCase() : 'student');
  const canManageTournaments = ['admin', 'coordinator'].includes(role);
  const canRegisterTeam = ['admin', 'coordinator', 'coach'].includes(role);

  const [tournaments, setTournaments] = useState([]);
  const [sports, setSports] = useState([]);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [tournamentDetails, setTournamentDetails] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Action Modals
  const [isRegisterTeamModalOpen, setIsRegisterTeamModalOpen] = useState(false);
  const [selectedTeamToRegister, setSelectedTeamToRegister] = useState('');
  const [selectedFixtureToScore, setSelectedFixtureToScore] = useState(null);
  const [scoreData, setScoreData] = useState({ teamAScore: 0, teamBScore: 0, winnerId: '', matchDetails: '' });
  const [selectedFixtureToReschedule, setSelectedFixtureToReschedule] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ scheduledDate: '', scheduledTime: '', venueId: '' });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sportId: '',
    format: 'Knockout',
    startDate: '',
    endDate: '',
    maxTeams: 16,
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const params = {};
      if (search) params.search = search;
      if (formatFilter) params.format = formatFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await API.get('/tournaments', { params });
      setTournaments(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch tournaments', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load tournaments list');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [sportsRes, teamsRes, venuesRes] = await Promise.all([
        API.get('/sports'),
        API.get('/teams'),
        API.get('/venues'),
      ]);
      setSports(sportsRes.data.data || []);
      setTeams(teamsRes.data.data || []);
      setVenues(venuesRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch options', err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTournaments();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, formatFilter, statusFilter]);

  const openDetailsModal = async (tournament) => {
    setSelectedTournament(tournament);
    setIsDetailsModalOpen(true);
    setActiveTab('overview');
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const [detailsRes, fixturesRes] = await Promise.all([
        API.get(`/tournaments/${tournament._id}`),
        API.get(`/tournaments/${tournament._id}/fixtures`),
      ]);

      setTournamentDetails(detailsRes.data.data);
      setFixtures(fixturesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load tournament details', err);
    }
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setSubmitting(true);
      await API.post('/tournaments', formData);
      setIsCreateModalOpen(false);
      resetForm();
      fetchTournaments();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create tournament');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterTeamSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTournament || !selectedTeamToRegister) return;
    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');
      await API.post(`/tournaments/${selectedTournament._id}/register-team`, { teamId: selectedTeamToRegister });
      setSuccessMsg('Team registered for tournament successfully!');
      setIsRegisterTeamModalOpen(false);
      setSelectedTeamToRegister('');
      openDetailsModal(selectedTournament);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to register team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateFixtures = async () => {
    if (!selectedTournament) return;
    if (!window.confirm(`Generate automatic fixtures for "${selectedTournament.name}"? This will lock in scheduled matches.`)) return;

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await API.post(`/tournaments/${selectedTournament._id}/generate-fixtures`);
      setSuccessMsg(res.data.message || 'Fixtures generated successfully!');
      openDetailsModal(selectedTournament);
      fetchTournaments();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to generate fixtures');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFixtureToScore) return;

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');
      await API.patch(`/tournaments/fixtures/${selectedFixtureToScore._id}/result`, scoreData);
      setSuccessMsg('Match result and scores recorded successfully!');
      setSelectedFixtureToScore(null);
      openDetailsModal(selectedTournament);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update match result');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFixtureToReschedule) return;

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');
      await API.put(`/tournaments/fixtures/${selectedFixtureToReschedule._id}`, rescheduleData);
      setSuccessMsg('Fixture rescheduled successfully!');
      setSelectedFixtureToReschedule(null);
      openDetailsModal(selectedTournament);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to reschedule fixture');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sportId: '',
      format: 'Knockout',
      startDate: '',
      endDate: '',
      maxTeams: 16,
      description: '',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Trophy className="text-brand-500 stroke-[2.5]" /> Tournaments & Championship Fixtures
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Organize knockout, round-robin, and group tournaments, register teams, and publish match results.
          </p>
        </div>

        {canManageTournaments && (
          <button
            onClick={() => {
              setErrorMsg('');
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all text-sm"
          >
            <Plus size={18} />
            <span>Create Tournament</span>
          </button>
        )}
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

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search tournament by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Format Filter */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium border-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Formats</option>
            <option value="Knockout">Knockout</option>
            <option value="League">League / Round Robin</option>
            <option value="Group+Knockout">Group + Knockout</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium border-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="Registration Open">Registration Open</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            onClick={fetchTournaments}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="animate-spin inline text-brand-500 mr-2" size={24} />
          <span className="text-slate-500 text-sm font-medium">Loading tournaments...</span>
        </div>
      ) : tournaments.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-400">
          No tournaments matching current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t) => (
            <div key={t._id} className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-dark-border flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    {t.sport?.name || 'Sport'}
                  </span>
                  <StatusBadge status={t.status} />
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug">{t.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{t.description || 'College championship tournament.'}</p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 font-medium">Format:</span>
                    <strong className="text-slate-900 dark:text-white">{t.format}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 font-medium">Dates:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between">
                <span className="text-xs text-slate-400">Max Teams: {t.maxTeams}</span>
                <button
                  onClick={() => openDetailsModal(t)}
                  className="px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-md hover:bg-brand-600 transition-colors flex items-center space-x-1.5"
                >
                  <Eye size={14} />
                  <span>View Details & Fixtures</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Tournament */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 md:p-8 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-dark-border">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="text-brand-500" size={22} /> Create New Tournament
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tournament Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Football Trophy 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sport *</label>
                  <select
                    required
                    value={formData.sportId}
                    onChange={(e) => setFormData({ ...formData, sportId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
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
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Format *</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Knockout">Knockout</option>
                    <option value="League">League / Round Robin</option>
                    <option value="Group+Knockout">Group + Knockout</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500 resize-none"
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
                  {submitting ? 'Creating...' : 'Create Tournament'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detailed Tournament Overview & Fixtures */}
      {isDetailsModalOpen && selectedTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-4xl rounded-3xl p-6 md:p-8 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-dark-border">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="text-brand-500" size={24} /> {selectedTournament.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sport: {selectedTournament.sport?.name} • Format: {selectedTournament.format} • Status: {selectedTournament.status}
                </p>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            {errorMsg && <div className="p-3 text-xs bg-rose-500/10 text-rose-500 rounded-xl font-medium mb-4">{errorMsg}</div>}
            {successMsg && <div className="p-3 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-medium mb-4">{successMsg}</div>}

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-dark-border mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-brand-500 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Overview & Registered Teams
              </button>
              <button
                onClick={() => setActiveTab('fixtures')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-colors ${
                  activeTab === 'fixtures'
                    ? 'bg-brand-500 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Match Fixtures ({fixtures.length})
              </button>
            </div>

            {/* Tab: Overview & Registered Teams */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                  <div>
                    <span className="text-xs text-slate-400">Registered Teams Count</span>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {tournamentDetails?.registrations?.length || 0} / {selectedTournament.maxTeams} Teams
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {canRegisterTeam && (
                      <button
                        onClick={() => setIsRegisterTeamModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-purple-500 text-white text-xs font-bold shadow-md hover:bg-purple-600 flex items-center space-x-1.5"
                      >
                        <Users size={14} />
                        <span>Register Team</span>
                      </button>
                    )}

                    {canManageTournaments && (
                      <button
                        onClick={handleGenerateFixtures}
                        disabled={submitting}
                        className="px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold shadow-md hover:bg-brand-600 flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <Play size={14} />
                        <span>Generate Fixtures</span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Approved Registered Teams</h4>
                  {tournamentDetails?.registrations?.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">No teams registered yet.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tournamentDetails?.registrations?.map((reg) => (
                        <div key={reg._id} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{reg.team?.name}</p>
                            <p className="text-[11px] text-slate-400">Coach: {reg.team?.coach?.name || 'N/A'}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                            Approved
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Match Fixtures */}
            {activeTab === 'fixtures' && (
              <div className="space-y-4">
                {fixtures.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    No match fixtures generated yet. Click "Generate Fixtures" under Overview once teams register.
                  </div>
                ) : (
                  fixtures.map((f) => (
                    <div key={f._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2 text-xs text-brand-500 font-bold mb-1">
                          <span>Match #{f.matchNumber}</span>
                          <span>•</span>
                          <span>{f.round}</span>
                        </div>

                        <div className="flex items-center space-x-3 text-sm font-extrabold text-slate-900 dark:text-white">
                          <span>{f.teamA?.name || 'TBD'}</span>
                          <span className="text-slate-400 font-normal">vs</span>
                          <span>{f.teamB?.name || 'TBD'}</span>
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-slate-400 mt-2">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {f.venue?.name || 'Venue'}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {f.scheduledTime || 'TBD'} ({new Date(f.scheduledDate).toLocaleDateString()})</span>
                        </div>
                      </div>

                      {/* Scores & Actions */}
                      <div className="flex items-center space-x-3 self-end sm:self-center">
                        {f.match && f.match.status === 'Completed' ? (
                          <div className="text-right">
                            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                              {f.match.teamAScore} - {f.match.teamBScore}
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">Winner: {f.match.winner?.name || 'Team'}</span>
                          </div>
                        ) : (
                          <StatusBadge status={f.status} />
                        )}

                        {canRegisterTeam && (
                          <button
                            onClick={() => {
                              setSelectedFixtureToScore(f);
                              setScoreData({
                                teamAScore: f.match?.teamAScore || 0,
                                teamBScore: f.match?.teamBScore || 0,
                                winnerId: f.match?.winner?._id || f.teamA?._id || '',
                                matchDetails: f.match?.matchDetails || '',
                              });
                            }}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow"
                          >
                            Score Result
                          </button>
                        )}

                        {canManageTournaments && (
                          <button
                            onClick={() => {
                              setSelectedFixtureToReschedule(f);
                              setRescheduleData({
                                scheduledDate: f.scheduledDate ? new Date(f.scheduledDate).toISOString().split('T')[0] : '',
                                scheduledTime: f.scheduledTime || '',
                                venueId: f.venue?._id || f.venue || '',
                              });
                            }}
                            className="p-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
                            title="Reschedule"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Register Team to Tournament */}
      {isRegisterTeamModalOpen && selectedTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-dark-border">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Register Team to Tournament</h3>
              <button onClick={() => setIsRegisterTeamModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterTeamSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Team *</label>
                <select
                  required
                  value={selectedTeamToRegister}
                  onChange={(e) => setSelectedTeamToRegister(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Choose Team</option>
                  {teams
                    .filter((t) => (t.sport?._id || t.sport) === (selectedTournament.sport?._id || selectedTournament.sport))
                    .map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.season})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterTeamModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-semibold hover:bg-brand-600 shadow"
                >
                  {submitting ? 'Registering...' : 'Register Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Score Match Result */}
      {selectedFixtureToScore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-dark-border">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Match Result</h3>
              <button onClick={() => setSelectedFixtureToScore(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleScoreSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {selectedFixtureToScore.teamA?.name || 'Team A'} Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={scoreData.teamAScore}
                    onChange={(e) => setScoreData({ ...scoreData, teamAScore: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {selectedFixtureToScore.teamB?.name || 'Team B'} Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={scoreData.teamBScore}
                    onChange={(e) => setScoreData({ ...scoreData, teamBScore: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Declare Winner</label>
                <select
                  value={scoreData.winnerId}
                  onChange={(e) => setScoreData({ ...scoreData, winnerId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                >
                  {selectedFixtureToScore.teamA && (
                    <option value={selectedFixtureToScore.teamA._id}>{selectedFixtureToScore.teamA.name}</option>
                  )}
                  {selectedFixtureToScore.teamB && (
                    <option value={selectedFixtureToScore.teamB._id}>{selectedFixtureToScore.teamB.name}</option>
                  )}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedFixtureToScore(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 shadow"
                >
                  {submitting ? 'Saving...' : 'Save Result'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reschedule Fixture */}
      {selectedFixtureToReschedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-dark-border">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reschedule Fixture</h3>
              <button onClick={() => setSelectedFixtureToReschedule(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleData.scheduledDate}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, scheduledDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">New Time</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 02:00 PM"
                  value={rescheduleData.scheduledTime}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, scheduledTime: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Venue</label>
                <select
                  value={rescheduleData.venueId}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, venueId: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm"
                >
                  {venues.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedFixtureToReschedule(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-semibold hover:bg-brand-600 shadow"
                >
                  {submitting ? 'Rescheduling...' : 'Save Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentsPage;
