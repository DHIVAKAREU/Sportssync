import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Repeat,
  Package,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  X,
  Clock,
  ShieldAlert,
  DollarSign,
} from 'lucide-react';

const BorrowPage = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role?.name?.toLowerCase() || (typeof user?.role === 'string' ? user.role.toLowerCase() : 'student');
  const isStudent = role === 'student';
  const canIssueReturn = ['admin', 'equipment_incharge'].includes(role);

  const [borrows, setBorrows] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState(null);

  // Form states
  const [requestData, setRequestData] = useState({
    equipmentId: '',
    quantity: 1,
    dueDate: '',
    notes: '',
  });
  const [returnCondition, setReturnCondition] = useState('Good');
  const [submitting, setSubmitting] = useState(false);

  const fetchBorrows = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await API.get('/borrow');
      setBorrows(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch borrow records', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load borrow records');
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const res = await API.get('/equipment');
      setEquipmentList(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch equipment list', err);
    }
  };

  useEffect(() => {
    fetchBorrows();
    fetchEquipment();
  }, []);

  const handleRequestBorrow = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!requestData.equipmentId || !requestData.dueDate) {
      setErrorMsg('Please select equipment and due date');
      return;
    }

    try {
      setSubmitting(true);
      await API.post('/borrow/request', requestData);
      setSuccessMsg('Borrow request submitted successfully! Awaiting Equipment Manager approval.');
      setIsRequestModalOpen(false);
      setRequestData({ equipmentId: '', quantity: 1, dueDate: '', notes: '' });
      fetchBorrows();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit borrow request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssue = async (borrowId) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      await API.patch(`/borrow/${borrowId}/issue`);
      setSuccessMsg('Equipment issued successfully! Stock deducted.');
      fetchBorrows();
      fetchEquipment();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to issue equipment');
    }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!selectedBorrow) return;

    try {
      setSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');
      const res = await API.patch(`/borrow/${selectedBorrow._id}/return`, { conditionAtReturn: returnCondition });
      setSuccessMsg('Equipment return processed successfully! Stock reallocated.');
      setIsReturnModalOpen(false);
      setSelectedBorrow(null);
      fetchBorrows();
      fetchEquipment();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to process return');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Repeat className="text-brand-500 stroke-[2.5]" /> Equipment Borrow & Return Portal
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Request equipment items, approve issues, track due dates, and process returns with condition inspection.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isStudent && (
            <button
              onClick={() => {
                setErrorMsg('');
                setIsRequestModalOpen(true);
              }}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-semibold shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all text-sm"
            >
              <Plus size={18} />
              <span>Borrow Equipment</span>
            </button>
          )}

          <button
            onClick={fetchBorrows}
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

      {/* Borrow Records Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 dark:border-dark-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100/70 dark:bg-slate-800/60 uppercase text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Borrower Info</th>
                <th className="px-6 py-4">Equipment Item</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <RefreshCw className="animate-spin inline text-brand-500 mr-2" size={20} />
                    <span>Loading borrow records...</span>
                  </td>
                </tr>
              ) : borrows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    No borrow records logged in the system.
                  </td>
                </tr>
              ) : (
                borrows.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{row.borrower?.name || 'Student'}</p>
                        <p className="text-xs text-slate-400">{row.borrower?.registerNumber || row.borrower?.email}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{row.equipment?.name || 'N/A'}</p>
                        <span className="font-mono text-[11px] text-brand-500">{row.equipment?.equipmentCode}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{row.quantity}</td>

                    <td className="px-6 py-4 text-xs">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {row.dueDate ? new Date(row.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                      {row.returnDate && (
                        <p className="text-[10px] text-emerald-600">
                          Returned: {new Date(row.returnDate).toLocaleDateString()}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={row.status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {canIssueReturn && row.status === 'Pending' && (
                          <button
                            onClick={() => handleIssue(row._id)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center space-x-1"
                          >
                            <CheckCircle2 size={14} />
                            <span>Approve & Issue</span>
                          </button>
                        )}

                        {canIssueReturn && (row.status === 'Issued' || row.status === 'Overdue') && (
                          <button
                            onClick={() => {
                              setSelectedBorrow(row);
                              setErrorMsg('');
                              setIsReturnModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center space-x-1"
                          >
                            <Repeat size={14} />
                            <span>Process Return</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Student Request Borrow */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-dark-border">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Repeat className="text-brand-500" size={22} /> Request Equipment Borrow
              </h3>
              <button onClick={() => setIsRequestModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRequestBorrow} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Equipment Item *</label>
                <select
                  required
                  value={requestData.equipmentId}
                  onChange={(e) => setRequestData({ ...requestData, equipmentId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Choose Available Item</option>
                  {equipmentList.map((item) => (
                    <option key={item._id} value={item._id} disabled={item.availableQuantity === 0}>
                      {item.name} ({item.equipmentCode}) - {item.availableQuantity} in stock
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={requestData.quantity}
                    onChange={(e) => setRequestData({ ...requestData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Return Due Date *</label>
                  <input
                    type="date"
                    required
                    value={requestData.dueDate}
                    onChange={(e) => setRequestData({ ...requestData, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Purpose / Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Practice match for inter-college tournament"
                  value={requestData.notes}
                  onChange={(e) => setRequestData({ ...requestData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-semibold hover:bg-brand-600 shadow-md shadow-brand-500/25 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Process Return */}
      {isReturnModalOpen && selectedBorrow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-dark-border">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="text-brand-500" size={22} /> Process Return Inspection
              </h3>
              <button onClick={() => setIsReturnModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReturn} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">{selectedBorrow.equipment?.name}</p>
                <p className="text-slate-400">Borrower: {selectedBorrow.borrower?.name} (Qty: {selectedBorrow.quantity})</p>
                <p className="text-slate-400">Due Date: {new Date(selectedBorrow.dueDate).toLocaleDateString()}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Condition Upon Return *</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-none text-sm focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Good">Good / Undamaged (Restocks Available)</option>
                  <option value="Damaged">Damaged (Applies 50% replacement fine & logs Damaged stock)</option>
                  <option value="Lost">Lost (Applies full replacement fee & logs Lost stock)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-semibold hover:bg-brand-600 shadow-md shadow-brand-500/25 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Confirm Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowPage;
