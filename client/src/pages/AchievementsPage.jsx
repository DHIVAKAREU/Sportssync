import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Award, Medal, Plus, RefreshCw, CheckCircle, Trash2 } from 'lucide-react';

const AchievementsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const roleName = user?.role?.name?.toLowerCase() || (typeof user?.role === 'string' ? user.role.toLowerCase() : 'student');
  const isStaff = ['admin', 'coordinator', 'coach'].includes(roleName);

  const [achievements, setAchievements] = useState([]);
  const [sports, setSports] = useState([]);
  const [sportPlayers, setSportPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Submit / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    sportId: '',
    playerId: '',
    title: '',
    competition: '',
    level: 'State',
    year: new Date().getFullYear(),
    position: '1st Place',
    medal: 'Gold',
    description: '',
    certificate: '',
  });

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/achievements');
      setAchievements(res.data.data || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError(err.response?.data?.message || 'Failed to fetch achievements.');
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
    fetchAchievements();
    fetchSports();
  }, []);

  useEffect(() => {
    if (!formData.sportId) {
      setSportPlayers([]);
      return;
    }
    const fetchPlayers = async () => {
      try {
        const res = await API.get('/players', { params: { sportId: formData.sportId } });
        setSportPlayers(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch sport players', err);
      }
    };
    fetchPlayers();
  }, [formData.sportId]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      sportId: sports[0]?._id || '',
      title: '',
      competition: '',
      level: 'State',
      year: new Date().getFullYear(),
      position: '1st Place',
      medal: 'Gold',
      description: '',
      certificate: '',
    });
    setIsModalOpen(true);
  };

  const handleVerify = async (id) => {
    try {
      await API.patch(`/achievements/${id}/verify`);
      setSuccessMsg('Achievement verified successfully!');
      fetchAchievements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify achievement.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) return;
    try {
      await API.delete(`/achievements/${id}`);
      setSuccessMsg('Achievement deleted successfully!');
      fetchAchievements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete achievement.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMsg('');
      if (editingId) {
        await API.put(`/achievements/${editingId}`, formData);
        setSuccessMsg('Achievement updated successfully!');
      } else {
        await API.post('/achievements', formData);
        setSuccessMsg('Achievement submitted successfully!');
      }
      setIsModalOpen(false);
      fetchAchievements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit achievement.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="text-amber-500" size={26} />
            <span>Sports Achievements Showcase</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verified student awards, trophies, and tournament achievements.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 flex items-center space-x-2 text-sm transition-all"
          >
            <Plus size={18} />
            <span>Submit Achievement</span>
          </button>
          <button
            onClick={fetchAchievements}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-sm">
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading achievements...</div>
      ) : achievements.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-dark-card rounded-3xl border border-dashed border-slate-200 dark:border-dark-border">
          No achievements recorded yet. Click 'Submit Achievement' to share an award!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-dark-card rounded-3xl p-6 border border-slate-200 dark:border-dark-border shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {item.level} Level
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-3">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {item.competition} • {item.year}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium">
                    Awarded to:{' '}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.player?.user?.name || 'Student Player'}
                    </span>{' '}
                    ({item.sport?.name || 'Sport'})
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 flex flex-col items-center">
                  <Medal size={28} />
                  <span className="text-[10px] font-black uppercase mt-1">{item.medal}</span>
                </div>
              </div>

              {item.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">
                  {item.description}
                </p>
              )}

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <StatusBadge status={item.status} />

                <div className="flex items-center space-x-2">
                  {isStaff && item.status !== 'verified' && (
                    <button
                      onClick={() => handleVerify(item._id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                    >
                      <CheckCircle size={14} />
                      <span>Verify</span>
                    </button>
                  )}
                  {isStaff && (
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete achievement"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Achievement' : 'Submit Sports Achievement'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Sport
              </label>
              <select
                required
                value={formData.sportId}
                onChange={(e) => setFormData({ ...formData, sportId: e.target.value })}
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

            {isStaff && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Recipient Player (Optional)
                </label>
                <select
                  value={formData.playerId}
                  onChange={(e) => setFormData({ ...formData, playerId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                >
                  <option value="">Team / Sport-wide Achievement</option>
                  {sportPlayers.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.user?.name || 'Player'} {p.user?.registerNumber ? `(${p.user.registerNumber})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              >
                <option value="District">District</option>
                <option value="State">State</option>
                <option value="National">National</option>
                <option value="International">International</option>
                <option value="Inter-College">Inter-College</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Achievement Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 1st Place in 100m Sprint"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Competition Name
              </label>
              <input
                type="text"
                required
                value={formData.competition}
                onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                placeholder="e.g. State Games 2026"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Medal
              </label>
              <select
                value={formData.medal}
                onChange={(e) => setFormData({ ...formData, medal: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              >
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Bronze">Bronze</option>
                <option value="None">None</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Year
              </label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief details about the achievement..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/30"
            >
              Submit Achievement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AchievementsPage;
