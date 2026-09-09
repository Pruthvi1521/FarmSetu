import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShoppingBag, TrendingUp, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { loginDemo } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center relative overflow-hidden py-12 px-4">
      {/* Background glow graphics */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl text-center z-10 space-y-6">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-panel border border-emerald-500/30 text-emerald-400 text-sm font-semibold shadow-lg">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>SIH 2026 Problem Statement PS132</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Tell us what you have.{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            FarmSetu finds what you should do.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Empowering Indian farmers with price intelligence, multi-day forecasting, transport economic calculations, best-market ranking, and verified bulk buyer bidding.
        </p>

        {/* Hero Actions */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/farmer"
            onClick={() => loginDemo('FARMER')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-lg flex items-center justify-center space-x-3 shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Sprout className="w-6 h-6" />
            <span>Launch Farmer Portal</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/buyer"
            onClick={() => loginDemo('BUYER')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel hover:bg-slate-800 text-amber-400 border border-amber-500/30 font-bold text-lg flex items-center justify-center space-x-3 transition-all"
          >
            <ShoppingBag className="w-6 h-6" />
            <span>Buyer Marketplace</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="pt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl glass-panel border border-slate-700/60 space-y-3 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Open Mandi Data Engine</h3>
            <p className="text-sm text-slate-400">
              Seeded from real Open Mandi government datasets with deterministic WMA + Holt forecasting algorithms.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-700/60 space-y-3 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Competitive Bidding</h3>
            <p className="text-sm text-slate-400">
              Bulk buyers submit competitive offers. Compare prices, delivery terms, and buyer reliability ratings.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-slate-700/60 space-y-3 hover:border-teal-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">End-to-End Tracking</h3>
            <p className="text-sm text-slate-400">
              Track transactions live from offer acceptance to pickup, transit, delivery, and payment completion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
