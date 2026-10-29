import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, RefreshCw } from 'lucide-react';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/analytics/dashboard');
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const COLORS = ['#0c8ce9', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

  const playerStatsData = data?.playersBySport?.map((item) => ({
    name: item._id?.name || 'Unassigned',
    count: item.count,
  })) || [
    { name: 'Basketball', count: 12 },
    { name: 'Football', count: 18 },
    { name: 'Badminton', count: 8 },
    { name: 'Cricket', count: 15 },
  ];

  const borrowStatsData = data?.borrowStats?.map((item) => ({
    status: item._id,
    count: item.count,
  })) || [
    { status: 'Issued', count: 14 },
    { status: 'Returned', count: 32 },
    { status: 'Overdue', count: 5 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-brand-500" size={26} />
            <span>Sports Council Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Inventory utilization, player enrollment distribution, and borrowing metrics.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading live analytics...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sports Enrolment Bar Chart */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              Approved Players Enrolled per Sport
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={playerStatsData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="count" fill="#0c8ce9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Borrow Status Pie Chart */}
          <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              Equipment Borrow & Return Status Breakdown
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={borrowStatsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {borrowStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
