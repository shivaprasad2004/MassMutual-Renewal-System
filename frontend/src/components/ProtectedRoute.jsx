import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HiShieldExclamation } from 'react-icons/hi2';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4" />
        <p className="text-white/40 font-mono text-xs uppercase tracking-[0.2em] animate-pulse">
          Verifying Credentials...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-8">
        <div className="glass-panel p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <HiShieldExclamation className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
            Access Denied
          </h2>
          <p className="text-slate-400 text-sm font-mono">
            Your role ({user.role}) does not have permission to access this resource.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
