import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaFileAlt, FaUsers, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', icon: FaHome, label: 'Dashboard' },
    { path: '/policies', icon: FaFileAlt, label: 'Policies' },
    { path: '/customers', icon: FaUsers, label: 'Customers' },
  ];

  return (
    <div className="w-64 bg-massmutual-card min-h-screen flex flex-col border-r border-massmutual-border">
      <div className="p-6 flex items-center space-x-3 border-b border-massmutual-border">
        <FaShieldAlt className="text-3xl text-accent-blue drop-shadow-lg" />
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide">MassMutual</h1>
          <p className="text-xs text-massmutual-text-muted">Renewal System</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 mt-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${
                  isActive(item.path) 
                    ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500 shadow-glow' 
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                <item.icon className={`mr-3 text-lg ${isActive(item.path) ? 'text-blue-400' : 'group-hover:text-white'}`} /> 
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-massmutual-border">
        <button
          onClick={logout}
          className="flex items-center w-full p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <FaSignOutAlt className="mr-3" /> 
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
