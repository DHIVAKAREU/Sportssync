import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import StatusBadge from '../components/StatusBadge';
import KpiCard from '../components/KpiCard';
import {
  Package,
  PackagePlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  X,
  ChevronDown,
  Repeat,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';

const EquipmentPage = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role?.name?.toLowerCase() || (typeof user?.role === 'string' ? user.role.toLowerCase() : 'student');
  const canManageEquipment = ['admin', 'equipment_incharge'].includes(role);

  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    equipmentCode: '',
    name: '',
    categoryId: '',
    totalQuantity: 10,
    availableQuantity: 10,
    issuedQuantity: 0,
    damagedQuantity: 0,
    lostQuantity: 0,
    minimumStockLevel: 5,
    condition: 'Good',
    purchaseCost: 0,
    supplier: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await API.get('/equipment', { params });
      setEquipment(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch equipment', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load equipment inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get('/equipment/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch equipment categories', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEquipment();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, statusFilter]);

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setSubmitting(true);
      await API.post('/equipment', formData);
      setIsAddModalOpen(false);
      resetForm();
      fetchEquipment();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add equipment item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEquipment = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setErrorMsg('');
    try {
      setSubmitting(true);
      await API.put(`/equipment/${selectedItem._id}`, formData);
      setIsEditModalOpen(false);
      setSelectedItem(null);
      resetForm();
      fetchEquipment();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update equipment item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEquipment = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete equipment item "${name}"?`)) return;
    try {
      await API.delete(`/equipment/${id}`);
      fetchEquipment();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete equipment');
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      equipmentCode: item.equipmentCode || '',
      name: item.name || '',
      categoryId: item.category?._id || item.category || '',
      totalQuantity: item.totalQuantity || 0,
      availableQuantity: item.availableQuantity || 0,
      issuedQuantity: item.issuedQuantity || 0,
      damagedQuantity: item.damagedQuantity || 0,
      lostQuantity: item.lostQuantity || 0,
      minimumStockLevel: item.minimumStockLevel || 5,
      condition: item.condition || 'Good',
      purchaseCost: item.purchaseCost || 0,
      supplier: item.supplier || '',
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      equipmentCode: '',
      name: '',
      categoryId: '',
      totalQuantity: 10,
      availableQuantity: 10,
      issuedQuantity: 0,
      damagedQuantity: 0,
      lostQuantity: 0,
      minimumStockLevel: 5,
      condition: 'Good',
      purchaseCost: 0,
      supplier: '',
    });
  };

  // Metrics
  const totalStockSum = equipment.reduce((sum, i) => sum + (i.totalQuantity || 0), 0);
  const availableSum = equipment.reduce((sum, i) => sum + (i.availableQuantity || 0), 0);
  const issuedSum = equipment.reduce((sum, i) => sum + (i.issuedQuantity || 0), 0);
  const lowStockCount = equipment.filter((i) => i.availableQuantity > 0 && i.availableQuantity <= (i.minimumStockLevel || 5)).length;

  const getStockStatusBadge = (item) => {
    if (item.availableQuantity === 0) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">Out of Stock</span>;
    }
    if (item.availableQuantity <= (item.minimumStockLevel || 5)) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Low Stock Alert</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Available</span>;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Package className="text-brand-500 stroke-[2.5]" /> Sports Equipment & Inventory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Track equipment stock levels, issue balances, damages, lost items, and maintenance conditions.
          </p>
        </div>

        {canManageEquipment && (
          <button
            onClick={() => {
              setErrorMsg('');
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all text-sm"
          >
            <PackagePlus size={18} />
            <span>Add Equipment Item</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Total Inventory Stock" value={totalStockSum.toString()} change="Units total" icon={Package} color="brand" />
        <KpiCard title="Available Stock" value={availableSum.toString()} change="Ready for issue" icon={CheckCircle2} color="emerald" />
        <KpiCard title="Currently Issued" value={issuedSum.toString()} change="Active borrows" icon={Repeat} color="purple" />
        <KpiCard title="Low Stock Items" value={lowStockCount.toString()} change="Requires restock" icon={AlertTriangle} color="amber" />
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by code or item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium border-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium border-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Stock Statuses</option>
            <option value="available">Available Only</option>
            <option value="low_stock">Low Stock Alert</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          <button
            onClick={fetchEquipment}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Equipment Inventory Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-dark-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100/70 dark:bg-slate-800/60 uppercase text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Item Code & Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stock Breakup (Avail / Total)</th>
                <th className="px-6 py-4">Condition</th>
                <th className="px-6 py-4">Status</th>
                {canManageEquipment && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <RefreshCw className="animate-spin inline text-brand-500 mr-2" size={20} />
                    <span>Loading equipment inventory...</span>
                  </td>
                </tr>
              ) : equipment.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    No equipment inventory matching current filters.
                  </td>
                </tr>
              ) : (
                equipment.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white">{item.name}</p>
                        <span className="font-mono text-xs font-semibold text-brand-500">{item.equipmentCode}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      {item.category?.name || 'General'}
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white">
                        <span className="text-emerald-600">{item.availableQuantity}</span> / {item.totalQuantity} Units
                      </p>
                      <p className="text-slate-400">
                        Issued: {item.issuedQuantity || 0} • Damaged: {item.damagedQuantity || 0} • Lost: {item.lostQuantity || 0}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.condition}
                      </span>
                    </td>

                    <td className="px-6 py-4">{getStockStatusBadge(item)}</td>

                    {canManageEquipment && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Edit Stock"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEquipment(item._id, item.name)}
                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Equipment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 md:p-8 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-dark-border">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PackagePlus className="text-brand-500" size={22} /> Add New Equipment Item
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Equipment Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="EQ-BSK-005"
                    value={formData.equipmentCode}
                    onChange={(e) => setFormData({ ...formData, equipmentCode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">General (Default)</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Molten Basketball Size 7"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Total Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalQuantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setFormData({ ...formData, totalQuantity: val, availableQuantity: val });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Minimum Alert Level</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minimumStockLevel}
                    onChange={(e) => setFormData({ ...formData, minimumStockLevel: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.purchaseCost}
                    onChange={(e) => setFormData({ ...formData, purchaseCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
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
                  {submitting ? 'Adding...' : 'Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 md:p-8 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-dark-border">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="text-brand-500" size={20} /> Edit Equipment Stock Breakup
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateEquipment} className="space-y-4">
              <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs">
                <strong>Invariant Rule:</strong> Total ({formData.totalQuantity}) must equal sum of Available ({formData.availableQuantity}) + Issued ({formData.issuedQuantity}) + Damaged ({formData.damagedQuantity}) + Lost ({formData.lostQuantity}).
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Total Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalQuantity}
                    onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Available</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.availableQuantity}
                    onChange={(e) => setFormData({ ...formData, availableQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Issued</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.issuedQuantity}
                    onChange={(e) => setFormData({ ...formData, issuedQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Damaged</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.damagedQuantity}
                    onChange={(e) => setFormData({ ...formData, damagedQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Lost</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.lostQuantity}
                    onChange={(e) => setFormData({ ...formData, lostQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Min Alert Level</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minimumStockLevel}
                    onChange={(e) => setFormData({ ...formData, minimumStockLevel: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
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

export default EquipmentPage;
