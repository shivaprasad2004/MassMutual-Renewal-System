import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import GlobalSearch from './GlobalSearch';
import ErrorBoundary from './ErrorBoundary';
import Watermark from './Watermark';
import { useAuth } from '../hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import ThreeBackground from './ThreeBackground';

const Layout = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-56';
  const contentMargin = sidebarCollapsed ? 'ml-16' : 'ml-56';

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      <ThreeBackground />
      <Watermark />

      {/* Sidebar */}
      <div className={`${sidebarWidth} fixed inset-y-0 z-50 glass-panel border-r border-white/5 transition-all duration-300`}>
        <Sidebar
          user={user}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${contentMargin} relative z-10 transition-all duration-300`}>
        <Header onOpenSearch={() => setSearchOpen(true)} />
        <main className="p-6 min-h-[calc(100vh-52px)]">
          <div className="glass-panel rounded-2xl p-6 min-h-[calc(100vh-6rem)]">
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Global Search */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

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
