import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShieldAlt } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center backdrop-blur-sm bg-black/0">
      <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
        <div className="relative">
          <FaShieldAlt className="text-blue-500 text-xl group-hover:text-blue-400 transition-colors" />
          <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
        </div>
        <span className="text-white/90 font-medium tracking-widest text-sm font-mono uppercase group-hover:text-white transition-colors">MassMutual</span>
      </Link>

      <div className="flex items-center space-x-8">
        {[
          { name: 'About', path: '/about' },
          { name: 'Widgets', path: '/widgets' },
          { name: 'Solutions', path: '/solutions' },
          { name: 'Pricing', path: '/pricing' },
          { name: 'Contact', path: '/contact' }
        ].map((item) => (
          <Link 
            key={item.name} 
            to={item.path} 
            className={`text-sm font-medium transition-colors tracking-wide ${
              isActive(item.path) ? 'text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            {item.name}
          </Link>
        ))}
        
        <Link 
          to="/login" 
          className="px-6 py-2 text-white border border-white/20 hover:border-white/50 hover:bg-white/5 rounded-full font-medium text-sm transition-all transform hover:scale-105"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
