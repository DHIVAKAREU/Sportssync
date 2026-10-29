import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import Modal from '../components/Modal';
import { Megaphone, Calendar, Plus, RefreshCw } from 'lucide-react';

const AnnouncementsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const roleName = user?.role?.name?.toLowerCase() || (typeof user?.role === 'string' ? user.role.toLowerCase() : 'student');
  const isStaff = ['admin', 'coordinator'].includes(roleName);

  const [announcements, setAnnouncements] = useState([]);
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Post Announcement Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'All',
    sportId: '',
    priority: 'Normal',
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/announcements');
      setAnnouncements(res.data.data || []);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err.response?.data?.message || 'Failed to fetch announcements.');
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
    fetchAnnouncements();
    fetchSports();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMsg('');
      const payload = {
        title: formData.title,
        content: formData.content,
        targetAudience: formData.targetAudience,
        priority: formData.priority,
        sport: formData.sportId || undefined,
      };
      await API.post('/announcements', payload);
      setSuccessMsg('Announcement published successfully!');
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish announcement.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="text-brand-500" size={26} />
            <span>Official Announcements</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Broadcast notices and news published by the Sports Council.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isStaff && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 flex items-center space-x-2 text-sm transition-all"
            >
              <Plus size={18} />
              <span>Post Announcement</span>
            </button>
          )}
          <button
            onClick={fetchAnnouncements}
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
        <div className="p-12 text-center text-slate-400">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-dark-card rounded-3xl border border-dashed border-slate-200 dark:border-dark-border">
          No announcements broadcasted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((notice) => (
            <div
              key={notice._id}
              className="bg-white dark:bg-dark-card rounded-3xl p-6 border border-slate-200 dark:border-dark-border shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                    Audience: {notice.targetAudience || 'All'}
                  </span>
                  {notice.priority === 'High' && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
                      High Priority
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-3">{notice.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{notice.content}</p>
              {notice.postedBy && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                  Posted by: <span className="font-semibold text-slate-700 dark:text-slate-300">{notice.postedBy.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post Official Announcement"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handlePost} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Notice headline..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Target Audience
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              >
                <option value="All">All Users</option>
                <option value="Students">Students Only</option>
                <option value="Coaches">Coaches Only</option>
                <option value="Coordinators">Coordinators Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Content / Notice Body
            </label>
            <textarea
              rows={4}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Detailed announcement content..."
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
              Publish Notice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AnnouncementsPage;
