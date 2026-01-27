import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaShieldAlt, FaLock, FaEnvelope, FaUser } from 'react-icons/fa';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await register(name, email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-massmutual-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="bg-massmutual-card p-10 rounded-2xl border border-massmutual-border w-96 z-10 shadow-2xl relative">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-4 rounded-2xl mb-4 border border-blue-500/20 shadow-glow">
             <FaShieldAlt className="text-4xl text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-massmutual-text-muted text-sm mt-2">Join MassMutual Renewal System</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wider">Full Name</label>
            <div className="relative group">
              <FaUser className="absolute left-3 top-3.5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                className="w-full bg-black border border-massmutual-border text-white p-3 pl-10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-zinc-700"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mb-5">
            <label className="block text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wider">Email Address</label>
            <div className="relative group">
              <FaEnvelope className="absolute left-3 top-3.5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                className="w-full bg-black border border-massmutual-border text-white p-3 pl-10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-zinc-700"
                placeholder="name@massmutual.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-wider">Password</label>
            <div className="relative group">
              <FaLock className="absolute left-3 top-3.5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="password"
                className="w-full bg-black border border-massmutual-border text-white p-3 pl-10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-zinc-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-glow hover:shadow-glow-strong disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-massmutual-border pt-6">
           <p className="text-zinc-500 text-sm">
             Already have an account?{' '}
             <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
               Sign In
             </Link>
           </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
