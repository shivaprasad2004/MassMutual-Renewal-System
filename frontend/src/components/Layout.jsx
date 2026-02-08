import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import ThreeBackground from './ThreeBackground';

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* 3D Background Layer */}
      <ThreeBackground />

      {/* Sidebar - Glassmorphism */}
      <div className="w-64 fixed inset-y-0 z-50 glass-panel border-r border-white/5">
        <Sidebar user={user} />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 relative z-10">
        <main className="p-8 min-h-screen">
            <div className="glass-panel rounded-3xl p-8 min-h-[calc(100vh-4rem)]">
                <Outlet />
            </div>
        </main>
      </div>
      
      <Toaster 
        toastOptions={{
          className: 'glass-card !bg-slate-900/80 !text-white !border !border-white/10',
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
          }
        }}
      />
    </div>
  );
};

export default Layout;
