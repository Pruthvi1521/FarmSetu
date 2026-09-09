import React from 'react';
import { IMarketRankingItem } from '../../../../shared/types';
import { X, Trophy, ArrowRight } from 'lucide-react';

interface MarketComparisonTableProps {
  markets: IMarketRankingItem[];
  onClose: () => void;
  onSelectMarket: (market: IMarketRankingItem) => void;
}

export const MarketComparisonTable: React.FC<MarketComparisonTableProps> = ({
  markets,
  onClose,
  onSelectMarket
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>APMC Markets Side-by-Side Comparison</span>
            </h3>
            <p className="text-sm text-slate-400">
              Evaluate expected prices, net revenues, logistics costs, and demand parameters across all APMC centers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase text-slate-400 tracking-wider">
                <th className="py-3 px-4">Market Name</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Forecast Price</th>
                <th className="py-3 px-4">Transport Cost</th>
                <th className="py-3 px-4">APMC Fee</th>
                <th className="py-3 px-4">Net Revenue</th>
                <th className="py-3 px-4">Demand</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {markets.map((m, idx) => (
                <tr
                  key={m.marketId}
                  className={`hover:bg-slate-800/50 transition-colors ${
                    idx === 0 ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                    {idx === 0 && <span className="text-amber-400 text-xs">👑</span>}
                    <span>{m.marketName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{m.district}</td>
                  <td className="py-3.5 px-4 text-slate-300">{m.distanceKm} km</td>
                  <td className="py-3.5 px-4 font-semibold text-white">₹{m.expectedPricePerKg} / kg</td>
                  <td className="py-3.5 px-4 text-amber-400">₹{m.transportCost.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-cyan-400">₹{m.apmcFee.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-400">
                    ₹{m.expectedNetRevenue.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        m.demandLevel === 'HIGH'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {m.demandLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">{m.recommendationScore}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        onSelectMarket(m);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold text-xs rounded-lg transition-colors inline-flex items-center space-x-1"
                    >
                      <span>Select</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
