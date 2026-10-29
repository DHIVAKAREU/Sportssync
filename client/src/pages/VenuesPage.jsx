import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Edit2,
  Trash2,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldAlert,
} from 'lucide-react';

const VenuesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const roleName = user?.role?.name?.toLowerCase() || (typeof user?.role === 'string' ? user.role.toLowerCase() : 'student');
  const canManageVenues = ['admin', 'coordinator'].includes(roleName);

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Court',
    capacity: 300,
    location: '',
    maintenanceStatus: 'Available',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await API.get('/venues', { params });
      setVenues(res.data.data || []);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to fetch venues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVenues();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');
      await API.post('/venues', formData);
      setSuccessMsg('Venue added successfully!');
      setIsAddModalOpen(false);
      resetForm();
      fetchVenues();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add venue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVenue) return;
    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');
      await API.put(`/venues/${selectedVenue._id}`, formData);
      setSuccessMsg('Venue updated successfully!');
      setIsEditModalOpen(false);
      setSelectedVenue(null);
      resetForm();
      fetchVenues();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update venue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (venueId, newStatus) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      await API.patch(`/venues/${venueId}`, { maintenanceStatus: newStatus });
      setSuccessMsg(`Venue maintenance status updated to ${newStatus}`);
      fetchVenues();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update venue status.');
    }
  };

  const handleDeleteVenue = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete venue "${name}"?`)) return;
    try {
      await API.delete(`/venues/${id}`);
      fetchVenues();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete venue');
    }
  };

  const openEditModal = (v) => {
    setSelectedVenue(v);
    setFormData({
      name: v.name || '',
      type: v.type || 'Court',
      capacity: v.capacity || 100,
      location: v.location || '',
      maintenanceStatus: v.maintenanceStatus || 'Available',
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Court',
      capacity: 300,
      location: '',
      maintenanceStatus: 'Available',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building2 className="text-brand-500 stroke-[2.5]" /> Sports Venues & Facility Allocations
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage sports grounds, courts, indoor halls, spectator capacities, and maintenance statuses.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {canManageVenues && (
            <button
              onClick={() => {
                setErrorMsg('');
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all text-sm"
            >
              <Plus size={18} />
              <span>Add Sports Venue</span>
            </button>
          )}

          <button
            onClick={fetchVenues}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
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

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search venue by name..."
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
            <option value="">All Maintenance Statuses</option>
            <option value="Available">Available</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Venues Grid */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="animate-spin inline text-brand-500 mr-2" size={24} />
          <span className="text-slate-500 text-sm font-medium">Loading sports venues...</span>
        </div>
      ) : venues.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-400">
          No sports venues found matching search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((v) => (
            <div key={v._id} className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-dark-border flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    {v.type}
                  </span>
                  <StatusBadge status={v.maintenanceStatus} />
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{v.name}</h3>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 font-medium flex items-center gap-1"><MapPin size={13} /> Location:</span>
                    <strong className="text-slate-900 dark:text-white">{v.location || 'Main Campus'}</strong>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 font-medium flex items-center gap-1"><Users size={13} /> Capacity:</span>
                    <strong className="text-slate-900 dark:text-white">{v.capacity || 100} Spectators</strong>
                  </div>
                </div>
              </div>

              {canManageVenues && (
                <div className="pt-6 mt-4 border-t border-slate-100 dark:border-dark-border/60 flex items-center justify-between">
                  <select
                    value={v.maintenanceStatus}
                    onChange={(e) => handleStatusChange(v._id, e.target.value)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200"
                  >
                    <option value="Available">Available</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openEditModal(v)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                      title="Edit Venue"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteVenue(v._id, v.name)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors"
                      title="Delete Venue"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Venue Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-dark-border">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="text-brand-500" size={22} /> Add New Sports Venue
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Venue Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Indoor Basketball Court B"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Court">Court</option>
                    <option value="Ground">Ground</option>
                    <option value="Indoor Hall">Indoor Hall</option>
                    <option value="Outdoor Field">Outdoor Field</option>
                    <option value="Swimming Pool">Swimming Pool</option>
                    <option value="Track">Track</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Spectator Capacity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Sports Complex Floor 2"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Status</label>
                <select
                  value={formData.maintenanceStatus}
                  onChange={(e) => setFormData({ ...formData, maintenanceStatus: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Available">Available</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-semibold hover:bg-brand-600 shadow-md shadow-brand-500/25 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Venue Modal */}
      {isEditModalOpen && selectedVenue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-dark-border">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="text-brand-500" size={20} /> Edit Sports Venue Details
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Venue Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Court">Court</option>
                    <option value="Ground">Ground</option>
                    <option value="Indoor Hall">Indoor Hall</option>
                    <option value="Outdoor Field">Outdoor Field</option>
                    <option value="Swimming Pool">Swimming Pool</option>
                    <option value="Track">Track</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Maintenance Status</label>
                <select
                  value={formData.maintenanceStatus}
                  onChange={(e) => setFormData({ ...formData, maintenanceStatus: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Available">Available</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-semibold hover:bg-brand-600 shadow-md shadow-brand-500/25 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VenuesPage;
