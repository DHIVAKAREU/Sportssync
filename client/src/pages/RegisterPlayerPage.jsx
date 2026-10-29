import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  UserCheck,
  Check,
  AlertCircle,
  RefreshCw,
  Trophy,
  Clock,
  CheckCircle2,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const RegisterPlayerPage = () => {
  const [sports, setSports] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [sportId, setSportId] = useState('');
  const [position, setPosition] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [sportsLoading, setSportsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Active / pending registrations breakdown
  const activeTeamReg = myRegistrations.find(
    (r) => (r.sport?.category || 'Team') === 'Team' && r.status !== 'rejected'
  );
  const activeIndividualReg = myRegistrations.find(
    (r) => r.sport?.category === 'Individual' && r.status !== 'rejected'
  );
  const isFullyRegistered = Boolean(activeTeamReg && activeIndividualReg);

  const fetchSports = async () => {
    try {
      setSportsLoading(true);
      const [sportsRes, myRegsRes] = await Promise.all([
        API.get('/sports'),
        API.get('/players/me'),
      ]);

      const sportsData = sportsRes.data.data || [];
      const regsData = myRegsRes.data.data || [];

      setSports(sportsData);
      setMyRegistrations(regsData);

      const teamReg = regsData.find(
        (r) => (r.sport?.category || 'Team') === 'Team' && r.status !== 'rejected'
      );
      const indReg = regsData.find(
        (r) => r.sport?.category === 'Individual' && r.status !== 'rejected'
      );

      // Select first available eligible sport
      const availableSport = sportsData.find((s) => {
        const cat = s.category || 'Team';
        if (cat === 'Team' && teamReg) return false;
        if (cat === 'Individual' && indReg) return false;
        return true;
      });

      if (availableSport) {
        setSportId(availableSport._id);
      } else {
        setSportId('');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load sports list or registrations.');
    } finally {
      setSportsLoading(false);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sportId) {
      setError('Please select a sport');
      return;
    }

    const selectedSportObj = sports.find((s) => s._id === sportId);
    if (!selectedSportObj) {
      setError('Selected sport is invalid');
      return;
    }

    const targetCategory = selectedSportObj.category || 'Team';

    // Client-side guard for 1 Team + 1 Individual sport quota
    if (targetCategory === 'Team' && activeTeamReg) {
      setError(
        `Limit Reached: You are already registered for a Team sport (${activeTeamReg.sport?.name || 'Team'}). Students can only join 1 Team sport.`
      );
      return;
    }

    if (targetCategory === 'Individual' && activeIndividualReg) {
      setError(
        `Limit Reached: You are already registered for an Individual sport (${activeIndividualReg.sport?.name || 'Individual'}). Students can only join 1 Individual sport.`
      );
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await API.post('/players', {
        sportId,
        position,
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber, 10) : undefined,
      });
      setSuccessMsg(res.data.message || 'Sport registration submitted for staff approval!');
      setPosition('');
      setJerseyNumber('');
      fetchSports();
    } catch (err) {
      console.error('Sport registration error:', err);
      setError(err.response?.data?.message || 'Failed to submit sport registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-3">
          <UserCheck className="text-brand-500 stroke-[2.5]" size={28} />
          <span>Student Sports Registration</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Apply to join official college sports squads. Policy permits participation in at most 1 Team Sport and 1 Individual Sport.
        </p>
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

      {/* Participation Quota Cards */}
      <div className="p-5 rounded-3xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Participation Policy Limit
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-800/50 w-fit">
            Max 1 Team Sport + 1 Individual Sport
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Team Sport Slot */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
              activeTeamReg
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-slate-50 dark:bg-slate-800/50 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <div>
              <p className="font-bold text-sm">Team Sport Slot</p>
              <p className="text-xs mt-0.5 opacity-90">
                {activeTeamReg
                  ? `${activeTeamReg.sport?.name} (${activeTeamReg.status})`
                  : 'Slot Open (Select 1 Team Sport)'}
              </p>
            </div>
            {activeTeamReg ? (
              <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <span className="font-bold text-[11px] uppercase px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                Available
              </span>
            )}
          </div>

          {/* Individual Sport Slot */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
              activeIndividualReg
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-slate-50 dark:bg-slate-800/50 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <div>
              <p className="font-bold text-sm">Individual Sport Slot</p>
              <p className="text-xs mt-0.5 opacity-90">
                {activeIndividualReg
                  ? `${activeIndividualReg.sport?.name} (${activeIndividualReg.status})`
                  : 'Slot Open (Select 1 Individual Sport)'}
              </p>
            </div>
            {activeIndividualReg ? (
              <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <span className="font-bold text-[11px] uppercase px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                Available
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Registration Form */}
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-dark-border shadow-xl">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="text-brand-500" size={20} /> Register for New Sport
          </h2>

          {sportsLoading ? (
            <div className="py-8 text-center text-slate-400 flex items-center justify-center space-x-2">
              <RefreshCw size={18} className="animate-spin" />
              <span>Loading available sports...</span>
            </div>
          ) : isFullyRegistered ? (
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <Lock size={22} />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Registration Limit Reached
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                You have fulfilled your maximum participation allocation: <strong>1 Team Sport</strong> ({activeTeamReg?.sport?.name}) and <strong>1 Individual Sport</strong> ({activeIndividualReg?.sport?.name}).
              </p>
              <p className="text-[11px] text-slate-400">
                Students are not permitted to register for additional sports.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Sport *
                </label>
                <select
                  value={sportId}
                  onChange={(e) => setSportId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                >
                  {sports.map((s) => {
                    const isTeamLocked = s.category === 'Team' && activeTeamReg;
                    const isIndLocked = s.category === 'Individual' && activeIndividualReg;
                    const isLocked = isTeamLocked || isIndLocked;

                    return (
                      <option
                        key={s._id}
                        value={s._id}
                        disabled={isLocked}
                        className={isLocked ? 'text-slate-400' : ''}
                      >
                        {s.name} ({s.category || 'Team'})
                        {isTeamLocked
                          ? ` — [Locked: Team Slot Filled by ${activeTeamReg.sport?.name}]`
                          : isIndLocked
                          ? ` — [Locked: Individual Slot Filled by ${activeIndividualReg.sport?.name}]`
                          : ''}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Locked sports belong to a category where you have already reached the 1-sport limit.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Preferred Position / Role *
                </label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Point Guard, Striker, Singles"
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Jersey Number (Optional)
                </label>
                <input
                  type="number"
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !sportId}
                className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 text-sm"
              >
                <UserCheck size={18} />
                <span>{loading ? 'Submitting Application...' : 'Submit Application'}</span>
              </button>
            </form>
          )}
        </div>

        {/* My Current Registrations */}
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-dark-border shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="text-purple-500" size={20} /> My Registrations ({myRegistrations.length})
            </h2>
            <button
              onClick={fetchSports}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Refresh registrations"
            >
              <RefreshCw size={16} className={sportsLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {myRegistrations.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              You haven't submitted any sports registrations yet.
            </div>
          ) : (
            <div className="space-y-4">
              {myRegistrations.map((reg) => (
                <div
                  key={reg._id}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white">
                          {reg.sport?.name || 'Sport'}
                        </h3>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {reg.sport?.category || 'Team'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Position: {reg.position || 'Player'} {reg.jerseyNumber ? `• #${reg.jerseyNumber}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={reg.status} />
                  </div>

                  {reg.status === 'rejected' && reg.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs">
                      <strong>Rejection Reason:</strong> {reg.rejectionReason}
                    </div>
                  )}

                  {reg.status === 'approved' && (
                    <div className="flex items-center space-x-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 size={14} />
                      <span>Approved by {reg.approvedBy?.name || 'Sports Official'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPlayerPage;
