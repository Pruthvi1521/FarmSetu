import React, { useEffect, useState } from 'react';
import { analyticsApi, lotApi, marketApi } from '../services/api';
import { IMarketSummary, ISaleLot, ICommodity } from '../../../shared/types';
import { ShieldCheck, BarChart3, Package, TrendingUp, RefreshCw, AlertCircle, ShoppingBag } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [summary, setSummary] = useState<IMarketSummary | null>(null);
  const [lots, setLots] = useState<ISaleLot[]>([]);
  const [commodities, setCommodities] = useState<ICommodity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumData, lotsData, commsData] = await Promise.all([
        analyticsApi.getMarketSummary().catch(() => null),
        lotApi.getMarketplaceLots().catch(() => []),
        marketApi.getCommodities().catch(() => [])
      ]);
      setSummary(sumData);
      setLots(lotsData);
      setCommodities(commsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load platform admin metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <span>Platform Administration & Mandi Governance</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time open APMC mandi price feeds, active sale lots, commodity records, and market linkage metrics.
          </p>
        </div>
        <button
          onClick={loadAdminData}
          disabled={isLoading}
          className="self-start md:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Admin Metrics</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Marketplace Value</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {isLoading ? '...' : `₹${summary?.totalMarketplaceValue ? summary.totalMarketplaceValue.toLocaleString() : 0}`}
          </div>
          <p className="text-xs text-slate-400">Total active lot value</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Active Sale Lots</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {isLoading ? '...' : (summary?.totalActiveLotsCount ?? 0)}
          </div>
          <p className="text-xs text-slate-400">Open for buyer offers</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Commodities Monitored</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-300">
            {isLoading ? '...' : commodities.length}
          </div>
          <p className="text-xs text-slate-400">APMC market commodities</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Total Listings</span>
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300">
            {isLoading ? '...' : lots.length}
          </div>
          <p className="text-xs text-slate-400">All-time farmer lots published</p>
        </div>
      </div>

      {/* Top Commodities and Mandi Feed Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top APMC Commodities */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Top Traded Commodities (7-Day Average)</span>
          </h2>
          {isLoading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Loading market summary...</div>
          ) : summary?.topCommodities && summary.topCommodities.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {summary.topCommodities.map((c, i) => (
                <div key={i} className="py-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-white">{c.name}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-emerald-400 font-bold">₹{c.avgPrice}/kg</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                      {c.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">No commodity summary data available.</div>
          )}
        </div>

        {/* Monitored APMC Commodities */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Package className="w-5 h-5 text-teal-400" />
            <span>APMC Commodities Catalogue</span>
          </h2>
          {isLoading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Loading commodities...</div>
          ) : commodities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {commodities.map((c) => (
                <div key={c._id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">{c.category || 'Agricultural'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">No commodities in database catalog.</div>
          )}
        </div>
      </div>

      {/* Marketplace Lots Audit Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <span>Platform Sale Lot Records</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Total: {lots.length} lots</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading sale lots...</div>
        ) : lots.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No sale lots found in system records.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Lot ID</th>
                  <th className="px-4 py-3">Commodity</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Asking Price</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Target Market</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {lots.map((lot) => (
                  <tr key={lot._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400">#{lot._id.slice(-6)}</td>
                    <td className="px-4 py-3 font-bold text-white">{lot.commodityName}</td>
                    <td className="px-4 py-3">{lot.quantityKg.toLocaleString()} kg</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">₹{lot.askingPricePerKg || '--'}/kg</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-slate-800 rounded">{lot.qualityGrade}</span></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        lot.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : lot.status === 'OFFERS_RECEIVED'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {lot.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{lot.recommendedMarketName || 'APMC Market'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
