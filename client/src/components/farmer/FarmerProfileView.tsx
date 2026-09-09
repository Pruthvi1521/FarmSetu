import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, MapPin, ShieldCheck, Phone, Landmark, Sprout } from 'lucide-react';

export const FarmerProfileView: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <UserCheck className="w-6 h-6 text-emerald-400" />
          <span>Farmer Profile & Verification</span>
        </h2>
        <p className="text-sm text-slate-400">
          Your verified credentials on the FarmSetu market linkage network.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center space-x-4 border-b border-slate-800 pb-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-2xl border border-emerald-500/30">
            {user?.name ? user.name.charAt(0) : 'R'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-white">{user?.name || 'Ramesh Kumar'}</h3>
              <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center space-x-1 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>VERIFIED FARMER</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Role: Farmer • Linkage ID: FS-AP-8829</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Contact Phone</span>
            </span>
            <span className="font-semibold text-white block">{user?.phone || '+91 98765 43210'}</span>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Location / Village</span>
            </span>
            <span className="font-semibold text-white block">
              {user?.location?.village || 'Madanapalle Village'}, {user?.location?.district || 'Annamayya / Chittoor'}, {user?.location?.state || 'Andhra Pradesh'}
            </span>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <Sprout className="w-3.5 h-3.5 text-amber-400" />
              <span>Farm Size</span>
            </span>
            <span className="font-semibold text-white block">4.5 Acres (Irrigated Horticulture)</span>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <Landmark className="w-3.5 h-3.5 text-cyan-400" />
              <span>Direct Bank Settlement</span>
            </span>
            <span className="font-semibold text-emerald-400 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Aadhaar & Bank Linked (Verified)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
