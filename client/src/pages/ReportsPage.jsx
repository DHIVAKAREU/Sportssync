import React, { useState } from 'react';
import API from '../services/api';
import { Download, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const ReportsPage = () => {
  const [downloading, setDownloading] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const reportOptions = [
    { type: 'equipment', title: 'Equipment Inventory Audit Summary', format: 'CSV', desc: 'Current stock counts, low stock alerts, and condition metrics.' },
    { type: 'borrow', title: 'Borrow & Return History Log', format: 'CSV', desc: 'Full historical log of equipment borrows, return dates, and overdue items.' },
    { type: 'fines', title: 'Fine Revenue & Waiver Report', format: 'CSV', desc: 'Paid fines summary, unpaid balances, and waived fine justifications.' },
    { type: 'tournaments', title: 'Tournament Participation & Results', format: 'CSV', desc: 'Tournament team brackets, winners, and top performer stats.' },
  ];

  const handleDownloadReport = async (reportType) => {
    try {
      setDownloading(reportType);
      setError('');
      setSuccessMsg('');

      const res = await API.get(`/reports/export?type=${reportType}`, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SportSync_${reportType}_Report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccessMsg(`${reportType.toUpperCase()} report exported successfully!`);
    } catch (err) {
      console.error('Report export error:', err);
      setError(err.response?.data?.message || 'Failed to export report.');
    } finally {
      setDownloading('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="text-brand-500" size={26} />
          <span>Reports & Export Center</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Generate formatted summary reports and raw CSV data exports.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-sm flex items-center space-x-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-sm flex items-center space-x-2">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportOptions.map((item) => (
          <div
            key={item.type}
            className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-500 w-fit mb-3">
                <FileText size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{item.desc}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Export: {item.format}</span>
              <button
                onClick={() => handleDownloadReport(item.type)}
                disabled={downloading === item.type}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
              >
                {downloading === item.type ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                <span>{downloading === item.type ? 'Exporting...' : 'Export CSV'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
