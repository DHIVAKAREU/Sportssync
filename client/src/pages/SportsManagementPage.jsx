import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Dribbble,
  Target,
  Activity,
  Layers,
  ShieldAlert,
  X,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import API from '../services/api';
import KpiCard from '../components/KpiCard';

const SportsManagementPage = () => {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState(null);

  // Form input
  const [formData, setFormData] = useState({
    name: '',
    category: 'Team',
    description: '',
    icon: 'trophy',
  });

  const fetchSports = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { all: 'true' };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await API.get('/sports', { params });
      setSports(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sports catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSports();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, statusFilter]);

  const handleCreateSport = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await API.post('/sports', formData);
      setIsAddModalOpen(false);
      resetForm();
      fetchSports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sport');
    }
  };

  const handleUpdateSport = async (e) => {
    e.preventDefault();
    if (!selectedSport) return;
    try {
      setError('');
      await API.put(`/sports/${selectedSport._id}`, formData);
      setIsEditModalOpen(false);
      setSelectedSport(null);
      resetForm();
      fetchSports();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update sport');
    }
  };

  const handleToggleStatus = async (sportId, currentStatus) => {
    try {
      await API.patch(`/sports/${sportId}/status`, { isActive: !currentStatus });
      fetchSports();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change sport status');
    }
  };

  const handleDeleteSport = async (sportId, sportName) => {
    if (!window.confirm(`Are you sure you want to delete sport "${sportName}"?`)) return;
    try {
      await API.delete(`/sports/${sportId}`);
      fetchSports();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete sport');
    }
  };

  const openEditModal = (sport) => {
    setSelectedSport(sport);
    setFormData({
      name: sport.name || '',
      category: sport.category || 'Team',
      description: sport.description || '',
      icon: sport.icon || 'trophy',
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Team',
      description: '',
      icon: 'trophy',
    });
  };

  // Metrics
  const totalSports = sports.length;
  const teamSports = sports.filter((s) => s.category === 'Team').length;
  const individualSports = sports.filter((s) => s.category === 'Individual').length;
  const activeSports = sports.filter((s) => s.isActive).length;

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'dribble':
        return <Dribbble size={24} className="text-amber-500" />;
      case 'target':
        return <Target size={24} className="text-rose-500" />;
      case 'activity':
        return <Activity size={24} className="text-purple-500" />;
      default:
        return <Trophy size={24} className="text-brand-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Trophy className="text-brand-500 stroke-[2.5]" /> Sports Directory & Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Configure sports catalog, manage sports categories, description, and operational statuses.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all text-sm"
        >
          <Plus size={18} />
          <span>Add New Sport</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Total Catalog Sports" value={totalSports.toString()} change="Configured" icon={Trophy} color="brand" />
        <KpiCard title="Active Sports" value={activeSports.toString()} change="Available" icon={CheckCircle2} color="emerald" />
        <KpiCard title="Team Sports" value={teamSports.toString()} change="Group Events" icon={Layers} color="purple" />
        <KpiCard title="Individual Sports" value={individualSports.toString()} change="Solo Events" icon={Activity} color="amber" />
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search sports by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none px-4 py-2 pr-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium border-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Categories</option>
              <option value="Team">Team Sports</option>
              <option value="Individual">Individual Sports</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none px-4 py-2 pr-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium border-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={fetchSports}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Sports Grid View */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="animate-spin inline text-brand-500 mr-2" size={24} />
          <span className="text-slate-500 text-sm font-medium">Loading sports catalog...</span>
        </div>
      ) : sports.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-400">
          No sports found matching the current search parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map((sport) => (
            <div
              key={sport._id}
              className={`glass-card rounded-3xl p-6 relative flex flex-col justify-between border transition-all hover:shadow-lg ${
                sport.isActive
                  ? 'border-slate-200 dark:border-dark-border'
                  : 'border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 shadow-inner">
                    {renderIcon(sport.icon)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider ${
                        sport.category === 'Team'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {sport.category}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(sport._id, sport.isActive)}
                      className={`p-1 rounded-lg transition-colors ${
                        sport.isActive
                          ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          : 'text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                      }`}
                      title={sport.isActive ? 'Deactivate Sport' : 'Activate Sport'}
                    >
                      {sport.isActive ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {sport.name}
                  {!sport.isActive && (
                    <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-bold">
                      Inactive
                    </span>
                  )}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                  {sport.description || 'No description provided for this sport catalog item.'}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Status: <strong className={sport.isActive ? 'text-emerald-600' : 'text-rose-500'}>{sport.isActive ? 'Active' : 'Disabled'}</strong>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(sport)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Edit Sport"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteSport(sport._id, sport.name)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors"
                    title="Delete Sport"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Sport Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-dark-border">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="text-brand-500" size={22} /> Add New Sport
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sport Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lawn Tennis"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Team">Team Sport</option>
                  <option value="Individual">Individual Sport</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of rule format, team size, etc."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Icon Style</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                >
                  <option value="trophy">Trophy</option>
                  <option value="dribble">Dribble / Basketball</option>
                  <option value="target">Target / Cricket</option>
                  <option value="activity">Activity / Running</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 shadow-md shadow-brand-500/25"
                >
                  Save Sport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Sport Modal */}
      {isEditModalOpen && selectedSport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-dark-border">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="text-brand-500" size={20} /> Edit Sport Catalog
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateSport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sport Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Team">Team Sport</option>
                  <option value="Individual">Individual Sport</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Icon Style</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                >
                  <option value="trophy">Trophy</option>
                  <option value="dribble">Dribble / Basketball</option>
                  <option value="target">Target / Cricket</option>
                  <option value="activity">Activity / Running</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 shadow-md shadow-brand-500/25"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SportsManagementPage;
