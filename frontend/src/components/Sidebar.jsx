import { NavLink, useNavigate } from 'react-router-dom';
import { 
  HiHome as HomeIcon, 
  HiUsers as UsersIcon, 
  HiDocumentText as DocumentTextIcon, 
  HiArrowRightOnRectangle as ArrowRightOnRectangleIcon,
  HiPlusCircle as PlusCircleIcon,
  HiShieldCheck as ShieldCheckIcon
} from 'react-icons/hi2';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = ({ user }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
    { path: '/policies', name: 'Policies', icon: DocumentTextIcon },
    { path: '/add-policy', name: 'New Policy', icon: PlusCircleIcon },
    { path: '/customers', name: 'Customers', icon: UsersIcon },
  ];

  return (
    <div className="h-full flex flex-col text-slate-300">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
           <ShieldCheckIcon className="text-amber-400 text-lg" />
           <h1 className="text-lg font-bold text-white tracking-widest font-mono uppercase">
             MassMutual
           </h1>
        </div>
        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-[0.2em] ml-7">Renewal System</p>
      </div>

      <div className="p-4 flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-sm border-l-2 transition-all duration-300 group font-mono text-sm ${
                isActive
                  ? 'bg-white/10 text-white border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  : 'border-transparent hover:bg-white/5 hover:text-slate-200 hover:border-slate-600'
              }`
            }
          >
            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">{item.name.toUpperCase()}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex items-center space-x-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-sm bg-slate-800 flex items-center justify-center text-white font-mono font-bold shadow-lg border border-slate-600">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="font-mono text-sm text-white truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate uppercase tracking-widest">{user?.role} ACCESS</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-sm bg-red-900/10 text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-all border border-red-500/20 hover:border-red-500/40 font-mono text-xs tracking-wider uppercase"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          <span>Terminate Session</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
