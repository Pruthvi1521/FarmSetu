import React from 'react';
import { IBuyerMatchItem } from '../../../../shared/types';
import {
  Users,
  ShieldCheck,
  Building,
  CheckCircle2,
  PhoneCall,
  MapPin,
  Award
} from 'lucide-react';

interface BuyerMatchListProps {
  buyers: IBuyerMatchItem[];
  onCreateLotClick: () => void;
}

export const BuyerMatchList: React.FC<BuyerMatchListProps> = ({
  buyers,
  onCreateLotClick
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Matched Verified Bulk Buyers</span>
          </h3>
          <p className="text-sm text-slate-400">
            Direct buyers matching your commodity, volume, quality, and location. Zero APMC fees.
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
          {buyers.length} Verified Buyers Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {buyers.map((b) => (
          <div
            key={b.buyerId}
            className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold uppercase">
                      {b.businessType}
                    </span>
                    {b.verificationStatus === 'VERIFIED' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>VERIFIED</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-white mt-1.5">{b.businessName}</h4>
                  <p className="text-xs text-slate-400">{b.name}</p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-black text-cyan-400">{b.matchScore}%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Match Score</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{b.district} ({b.distanceKm} km)</span>
                </div>
                <div className="flex items-center space-x-1 text-emerald-400 font-medium">
                  <Award className="w-3.5 h-3.5" />
                  <span>{b.reliabilityScore}% Reliability</span>
                </div>
              </div>

              {/* Match reasons */}
              <div className="space-y-1 pt-1">
                {b.matchReasons.map((reason, rIdx) => (
                  <div key={rIdx} className="text-xs text-slate-300 flex items-start space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onCreateLotClick}
              className="w-full py-2.5 bg-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-bold rounded-xl border border-cyan-500/40 transition-all flex items-center justify-center space-x-2 text-sm mt-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Submit Lot for Direct Bidding</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
