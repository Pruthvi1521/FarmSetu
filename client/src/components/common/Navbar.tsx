import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sprout, ShoppingBag, BarChart3, UserCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, loginDemo, loading } = useAuth();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                FarmSetu
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 tracking-wider font-medium uppercase">
                Market Linkages & Price Discovery
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/farmer"
              className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${
                location.pathname.startsWith('/farmer')
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>Farmer Portal</span>
            </Link>

            <Link
              to="/buyer"
              className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${
                location.pathname.startsWith('/buyer')
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Buyer Marketplace</span>
            </Link>

            <Link
              to="/intelligence"
              className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-all ${
                location.pathname.startsWith('/intelligence')
                  ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-teal-400" />
              <span>Market Intelligence</span>
            </Link>
          </nav>

          {/* Role Switcher */}
          <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/80">
            <span className="hidden lg:flex items-center space-x-1 text-xs text-slate-400 font-semibold px-2 py-0.5">
              <span>Account Role:</span>
            </span>

            <button
              onClick={() => loginDemo('FARMER')}
              disabled={loading}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1 ${
                user?.role === 'FARMER'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Farmer</span>
            </button>

            <button
              onClick={() => loginDemo('BUYER')}
              disabled={loading}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1 ${
                user?.role === 'BUYER'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Buyer</span>
            </button>

            <button
              onClick={() => loginDemo('ADMIN')}
              disabled={loading}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1 ${
                user?.role === 'ADMIN'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
