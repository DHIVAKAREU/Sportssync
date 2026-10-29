import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Trophy, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { setCredentials } from '../store/authSlice';
import API from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/login', { email, password });
      dispatch(setCredentials(res.data.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo user quick login helper
  const setDemoUser = (demoRole) => {
    const demoAccounts = {
      admin: { email: 'admin@sportsync.com', pass: 'Test@123' },
      coordinator: { email: 'coordinator@sportsync.com', pass: 'Test@123' },
      coach: { email: 'coach.cricket@sportsync.com', pass: 'Test@123' },
      equipment_incharge: { email: 'equipment@sportsync.com', pass: 'Test@123' },
      student: { email: 'student01@sportsync.com', pass: 'Test@123' },
    };
    const acc = demoAccounts[demoRole];
    if (acc) {
      setEmail(acc.email);
      setPassword(acc.pass);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md glass-card rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 border border-white/10 dark:border-slate-700/50">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-xl shadow-brand-500/40 mb-4 animate-bounce-subtle">
            <Trophy size={32} className="stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">SportSync</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Smart Sports Council Management Hub</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-lg shadow-brand-500/30 flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center justify-center space-x-1">
            <ShieldCheck size={14} />
            <span>Select Demo Role to Pre-fill</span>
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['admin', 'coordinator', 'coach', 'equipment_incharge', 'student'].map((role) => (
              <button
                key={role}
                onClick={() => setDemoUser(role)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 transition-colors capitalize"
              >
                {role.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-500 hover:underline font-bold">
            Student Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
