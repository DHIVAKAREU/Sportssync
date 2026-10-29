import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ roles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.name?.toLowerCase() || '';
  const allowedRoles = roles.map((r) => r.toLowerCase());

  // Admin bypass or role match
  if (roles.length > 0 && !allowedRoles.includes(userRole) && userRole !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="p-4 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-full mb-4 animate-bounce-subtle">
          <ShieldAlert size={48} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">403 — Access Denied</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
          You do not have the required role permissions to access this page. Required role: <span className="font-semibold text-brand-600 dark:text-brand-400">{roles.join(', ')}</span>.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-lg shadow-brand-500/30 transition-all duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
