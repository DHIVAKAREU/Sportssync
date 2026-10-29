import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Calendar as CalendarIcon, Clock, MapPin, RefreshCw, Trophy, AlertCircle, Search, Filter } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const tournamentsRes = await API.get('/tournaments');
      const tournaments = tournamentsRes.data.data || [];

      let allFixtures = [];
      for (const t of tournaments) {
        try {
          const fixRes = await API.get(`/tournaments/${t._id}/fixtures`);
          const fixes = fixRes.data.data || [];
          fixes.forEach((f) => {
            allFixtures.push({
              _id: f._id,
              tournamentName: t.name,
              round: f.round || 'Round 1',
              matchNumber: f.matchNumber,
              teamA: f.teamA?.name || 'TBD',
              teamB: f.teamB?.name || 'TBD',
              sport: t.sport?.name || 'Sports',
              scheduledDate: f.scheduledDate,
              scheduledTime: f.scheduledTime || '10:00 AM',
              venue: f.venue?.name || 'College Ground',
              status: f.status || 'Scheduled',
              match: f.match,
            });
          });
        } catch (e) {
          console.warn(`Could not load fixtures for ${t.name}`);
        }
      }

      setEvents(allFixtures);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError('Failed to load sports calendar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  let filteredEvents = events;
  if (search) {
    const regex = new RegExp(search, 'i');
    filteredEvents = filteredEvents.filter(
      (e) =>
        regex.test(e.teamA) ||
        regex.test(e.teamB) ||
        regex.test(e.tournamentName) ||
        regex.test(e.venue) ||
        regex.test(e.sport)
    );
  }
  if (statusFilter) {
    filteredEvents = filteredEvents.filter((e) => e.status === statusFilter);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-brand-500 stroke-[2.5]" /> Master Sports Match Calendar
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Real-time schedule of tournament fixtures, match timings, venues, and live match scores.
          </p>
        </div>

        <button
          onClick={fetchCalendarEvents}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh Calendar"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center space-x-3 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search teams, venue, tournament..."
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
            <option value="Scheduled">Scheduled</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 font-medium">
          <RefreshCw className="animate-spin inline mr-2 text-brand-500" size={24} />
          <span>Loading sports schedule...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-400">
          No matches found on the calendar matching current search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((evt) => (
            <div
              key={evt._id}
              className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-dark-border shadow-md space-y-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  {evt.sport} • {evt.round}
                </span>
                <StatusBadge status={evt.status} />
              </div>

              <div>
                <p className="text-xs text-slate-400 font-medium">{evt.tournamentName}</p>
                <div className="flex items-center justify-between mt-2 text-lg font-extrabold text-slate-900 dark:text-white">
                  <span>{evt.teamA}</span>
                  <span className="text-sm font-normal text-slate-400 px-2">VS</span>
                  <span>{evt.teamB}</span>
                </div>
                {evt.match && evt.match.status === 'Completed' && (
                  <div className="mt-2 text-center text-sm font-black text-emerald-600 dark:text-emerald-400">
                    Result: {evt.match.teamAScore} - {evt.match.teamBScore} ({evt.match.winner?.name || 'Winner'})
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-dark-border/60">
                <span className="flex items-center space-x-1.5 font-semibold">
                  <Clock size={14} className="text-brand-500" />
                  <span>{evt.scheduledTime} ({new Date(evt.scheduledDate).toLocaleDateString()})</span>
                </span>
                <span className="flex items-center space-x-1.5 font-semibold">
                  <MapPin size={14} className="text-brand-500" />
                  <span>{evt.venue}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
