import React, { useEffect, useState } from 'react';
import { ISaleLot } from '../../../../shared/types';
import { lotApi } from '../../services/api';
import { Package, Tag, Clock, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

interface SaleLotListProps {
  onSelectLotForOffers?: (lotId: string) => void;
}

export const SaleLotList: React.FC<SaleLotListProps> = ({ onSelectLotForOffers }) => {
  const [lots, setLots] = useState<ISaleLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLots = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lotApi.getFarmerLots();
      setLots(data);
    } catch (err: any) {
      setError(err.message || 'Error loading sale lots.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'OFFERS_RECEIVED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'SOLD':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Package className="w-6 h-6 text-emerald-400" />
            <span>My Sale Lots</span>
          </h2>
          <p className="text-sm text-slate-400">
            Active and past produce listings available to verified buyers.
          </p>
        </div>

        <button
          onClick={fetchLots}
          disabled={isLoading}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading your sale lots...</p>
        </div>
      ) : error ? (
        <div className="flex items-center space-x-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : lots.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Sale Lots Published Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Use the "What do you have?" prompt on the dashboard to generate recommendations and publish a sale lot.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lots.map((lot) => (
            <div
              key={lot._id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-0.5 rounded font-bold border ${getStatusBadge(lot.status)}`}>
                    {lot.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    Created: {new Date(lot.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">{lot.commodityName}</h3>
                  <div className="flex items-center space-x-3 text-sm text-slate-300 mt-1">
                    <span className="font-semibold text-emerald-400">{lot.quantityKg.toLocaleString()} kg</span>
                    <span>•</span>
                    <span className="text-slate-400">{lot.qualityGrade}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 block">Asking Price</span>
                    <span className="font-bold text-white">₹{lot.askingPricePerKg || '--'} / kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Expected Revenue</span>
                    <span className="font-bold text-emerald-400">
                      ₹{lot.expectedNetRevenue ? lot.expectedNetRevenue.toLocaleString() : '--'}
                    </span>
                  </div>
                </div>

                {lot.recommendedMarketName && (
                  <div className="text-xs text-slate-400 flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>Target: {lot.recommendedMarketName}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-amber-400 font-semibold">
                  {lot.offersCount || 0} Offers Received
                </span>

                {onSelectLotForOffers && (
                  <button
                    onClick={() => onSelectLotForOffers(lot._id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <span>View Bids</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
