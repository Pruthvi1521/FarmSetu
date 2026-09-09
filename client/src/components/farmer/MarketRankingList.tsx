import React from 'react';
import { IMarketRankingItem } from '../../../../shared/types';
import {
  Trophy,
  MapPin,
  Truck,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  ArrowRight,
  BarChart2
} from 'lucide-react';

interface MarketRankingListProps {
  markets: IMarketRankingItem[];
  onSelectMarket: (market: IMarketRankingItem) => void;
  onCompareClick: () => void;
}

export const MarketRankingList: React.FC<MarketRankingListProps> = ({
  markets,
  onSelectMarket,
  onCompareClick
}) => {
  const getTrendIcon = (trend: string) => {
    if (trend === 'INCREASING') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (trend === 'DECREASING') return <TrendingDown className="w-4 h-4 text-rose-400" />;
    return <Minus className="w-4 h-4 text-amber-400" />;
  };

  const getDemandBadge = (demand: string) => {
    switch (demand) {
      case 'HIGH':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'LOW':
        return 'bg-slate-700 text-slate-300 border-slate-600';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Recommended APMC Markets</span>
          </h3>
          <p className="text-sm text-slate-400">
            Ranked by expected net revenue after transport deductions and APMC fees.
          </p>
        </div>

        <button
          onClick={onCompareClick}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium text-sm rounded-lg border border-slate-700 transition-colors"
        >
          <BarChart2 className="w-4 h-4" />
          <span>Compare All Markets</span>
        </button>
      </div>

      <div className="space-y-4">
        {markets.map((m, idx) => {
          const isTopRanked = idx === 0;

          return (
            <div
              key={m.marketId}
              className={`p-6 rounded-2xl transition-all ${
                isTopRanked
                  ? 'glass-panel-gold border-amber-500/40 relative'
                  : 'glass-panel border-slate-800 hover:border-slate-700'
              }`}
            >
              {isTopRanked && (
                <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-xs font-black uppercase px-3 py-1 rounded-full flex items-center space-x-1 shadow-md">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Top Recommendation (#1)</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Market Info & Reasons */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Rank #{idx + 1}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${getDemandBadge(m.demandLevel)}`}>
                      Demand: {m.demandLevel}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white flex items-center space-x-2">
                      <span>{m.marketName}</span>
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center space-x-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{m.district}</span>
                      <span>•</span>
                      <span>{m.distanceKm} km away</span>
                    </p>
                  </div>

                  {/* Recommendation Reasons */}
                  <div className="space-y-1.5 pt-2">
                    {m.explanations.map((exp, eIdx) => (
                      <div key={eIdx} className="text-xs text-slate-300 flex items-start space-x-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{exp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Financial Metrics & Score */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 block">Forecast Price</span>
                      <span className="text-lg font-bold text-white">₹{m.expectedPricePerKg} / kg</span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block">Expected Net Revenue</span>
                      <span className="text-lg font-extrabold text-emerald-400">
                        ₹{m.expectedNetRevenue.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block">Transport Cost</span>
                      <span className="text-sm font-semibold text-slate-300 flex items-center space-x-1">
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        <span>₹{m.transportCost.toLocaleString()}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 block">APMC Fee</span>
                      <span className="text-sm font-semibold text-slate-300 flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>₹{m.apmcFee.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Recommendation Score */}
                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-400">Recommendation Match Score</span>
                      <span className="font-bold text-amber-400">{m.recommendationScore} / 100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all"
                        style={{ width: `${m.recommendationScore}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectMarket(m)}
                    className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold rounded-lg border border-emerald-500/40 transition-all flex items-center justify-center space-x-2 text-sm"
                  >
                    <span>Select for Sale Lot</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
