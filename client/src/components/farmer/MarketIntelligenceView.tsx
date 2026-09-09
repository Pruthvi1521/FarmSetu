import React, { useEffect, useState } from 'react';
import { ICommodity } from '../../../../shared/types';
import { marketApi, analyticsApi } from '../../services/api';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, Legend
} from 'recharts';
import { TrendingUp, RefreshCw, AlertCircle, BarChart3, Package } from 'lucide-react';

type PriceTrendPoint = {
  date: string;
  avgModalPrice: number;
  avgMinPrice: number;
  avgMaxPrice: number;
  marketCount: number;
};

const DAYS_OPTIONS = [
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
  { label: '60 Days', value: 60 }
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${d.toLocaleString('en-IN', { month: 'short' })}`;
}

export const MarketIntelligenceView: React.FC = () => {
  const [commodities, setCommodities] = useState<ICommodity[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<number>(30);
  const [priceData, setPriceData] = useState<PriceTrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommoditiesLoading, setIsCommoditiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load commodity list on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await marketApi.getCommodities();
        setCommodities(data);
        if (data.length > 0) setSelectedId(data[0]._id);
      } catch (err: any) {
        setError('Failed to load commodities.');
      } finally {
        setIsCommoditiesLoading(false);
      }
    };
    load();
  }, []);

  // Fetch price history whenever commodity or days selection changes
  useEffect(() => {
    if (!selectedId) return;
    const fetch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await analyticsApi.getCommodityPriceTrend(selectedId, selectedDays);
        setPriceData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load price trend data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [selectedId, selectedDays]);

  const selectedCommodity = commodities.find((c) => c._id === selectedId);
  const avgModal = priceData.length
    ? Math.round(priceData.reduce((s, d) => s + d.avgModalPrice, 0) / priceData.length * 10) / 10
    : 0;
  const latestPrice = priceData.length ? priceData[priceData.length - 1]?.avgModalPrice : 0;
  const firstPrice = priceData.length ? priceData[0]?.avgModalPrice : 0;
  const pctChange = firstPrice > 0 ? Math.round(((latestPrice - firstPrice) / firstPrice) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <span>Market Intelligence — Commodity Price Trends</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Historical mandi modal prices sourced from official APMC market data (data.gov.in). Select a commodity to explore its price trend.
        </p>
      </div>

      {/* Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-3">
          <Package className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">
            Commodity:
          </label>
          {isCommoditiesLoading ? (
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 min-w-[160px]"
            >
              {commodities.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">
            Period:
          </label>
          <div className="flex rounded-lg border border-slate-700 overflow-hidden">
            {DAYS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedDays(opt.value)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedDays === opt.value
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setSelectedId((id) => { const dummy = id; return dummy; })}
          disabled={isLoading}
          className="ml-auto p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPIs */}
      {!isLoading && priceData.length > 0 && selectedCommodity && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Current Modal Price</span>
            <div className="text-2xl font-black text-emerald-400">₹{latestPrice.toFixed(1)}<span className="text-sm text-slate-400"> /kg</span></div>
            <span className="text-xs text-slate-400">{selectedCommodity.name} · Latest</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">{selectedDays}-Day Avg</span>
            <div className="text-2xl font-black text-amber-400">₹{avgModal}<span className="text-sm text-slate-400"> /kg</span></div>
            <span className="text-xs text-slate-400">Cross-market average</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Period Change</span>
            <div className={`text-2xl font-black ${pctChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {pctChange >= 0 ? '+' : ''}{pctChange}%
            </div>
            <span className="text-xs text-slate-400">vs start of period</span>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Data Points</span>
            <div className="text-2xl font-black text-cyan-400">{priceData.length}</div>
            <span className="text-xs text-slate-400">days of mandi records</span>
          </div>
        </div>
      )}

      {/* Price Trend Chart */}
      {isLoading ? (
        <div className="glass-panel p-16 text-center rounded-2xl">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading price data from mandi database...</p>
        </div>
      ) : priceData.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-2xl space-y-3">
          <TrendingUp className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Price Data Available</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No mandi records found for {selectedCommodity?.name} in the last {selectedDays} days.
            Try selecting a different commodity or period.
          </p>
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">
              {selectedCommodity?.name} — Modal Price Trend
              <span className="text-sm font-normal text-slate-400 ml-2">(₹/kg across APMC markets)</span>
            </h3>
            <span className="text-xs text-slate-500">Source: Open Mandi Data</span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={priceData.map((d) => ({ ...d, label: formatDate(d.date) }))}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: 12 }}
                  formatter={(val: any, key: string) => [
                    `₹${Number(val).toFixed(1)}/kg`,
                    key === 'avgModalPrice' ? 'Modal Price' : key === 'avgMinPrice' ? 'Min Price' : 'Max Price'
                  ]}
                />
                <Legend
                  formatter={(v) => {
                    const map: Record<string, string> = {
                      avgModalPrice: 'Modal Price',
                      avgMinPrice: 'Min Price',
                      avgMaxPrice: 'Max Price'
                    };
                    return <span style={{ color: '#94a3b8', fontSize: 12 }}>{map[v] || v}</span>;
                  }}
                />
                <ReferenceLine y={avgModal} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Avg ₹${avgModal}`, fill: '#f59e0b', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="avgMaxPrice"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 2"
                />
                <Line
                  type="monotone"
                  dataKey="avgModalPrice"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#10b981' }}
                />
                <Line
                  type="monotone"
                  dataKey="avgMinPrice"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-600">
            Modal price (green) is the most traded price on a given day. Min/Max (dashed) show the price range reported across all APMC markets for this commodity.
          </p>
        </div>
      )}
    </div>
  );
};
