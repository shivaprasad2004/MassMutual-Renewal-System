import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaLinkedin, FaGithub, FaDiscord } from 'react-icons/fa';
import { HiShieldCheck } from 'react-icons/hi2';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10 relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <HiShieldCheck className="text-amber-400 text-3xl group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold text-white tracking-widest font-mono uppercase">
                MassMutual
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm">
              Empowering financial futures with next-generation algorithmic policy management and real-time risk telemetry.
            </p>
            <div className="flex space-x-4">
              {[FaTwitter, FaLinkedin, FaGithub, FaDiscord].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all hover:scale-110"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-6 font-mono text-sm tracking-wider">SOLUTIONS</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link to="/solutions" className="hover:text-amber-400 transition-colors">Policy Engine</Link></li>
              <li><Link to="/solutions" className="hover:text-amber-400 transition-colors">Risk Analytics</Link></li>
              <li><Link to="/solutions" className="hover:text-amber-400 transition-colors">Claims AI</Link></li>
              <li><Link to="/widgets" className="hover:text-amber-400 transition-colors">Dashboard Widgets</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-6 font-mono text-sm tracking-wider">COMPANY</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-6 font-mono text-sm tracking-wider">STAY UPDATED</h4>
            <p className="text-slate-400 text-sm mb-4">
              Subscribe to our developer changelog and quarterly financial reports.
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/5 border border-white/10 rounded-l-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 w-full text-sm"
              />
              <button className="bg-amber-500 text-black font-bold px-6 py-3 rounded-r-lg hover:bg-amber-400 transition-colors text-sm">
                JOIN
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600 font-mono">
          <p>© {new Date().getFullYear()} MASSMUTUAL SYSTEMS. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-400 transition-colors">PRIVACY POLICY</a>
            <a href="#" className="hover:text-slate-400 transition-colors">TERMS OF SERVICE</a>
            <a href="#" className="hover:text-slate-400 transition-colors">SITEMAP</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
