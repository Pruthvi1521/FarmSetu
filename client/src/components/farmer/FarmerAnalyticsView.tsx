import React, { useEffect, useState } from 'react';
import { IFarmerAnalytics } from '../../../../shared/types';
import { analyticsApi } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  BarChart3, IndianRupee, Weight, TrendingUp, RefreshCw, AlertCircle, Truck, Star
} from 'lucide-react';

const PIE_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const FarmerAnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<IFarmerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsApi.getFarmerAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Error loading analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const hasData = analytics && analytics.totalSalesCount > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            <span>Farmer Financial Analytics</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Revenue, sales volume, realized prices and logistics — calculated from your actual transaction records.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={isLoading}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
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

      {isLoading ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Computing analytics from transaction data...</p>
        </div>
      ) : !analytics ? null : !hasData ? (
        <div className="glass-panel p-16 text-center rounded-2xl space-y-3">
          <BarChart3 className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Completed Transactions Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Create sale lots and complete transactions to see your financial analytics here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Revenue</span>
              <div className="text-3xl font-black text-emerald-400">₹{analytics.totalRevenue.toLocaleString()}</div>
              <span className="text-xs text-slate-400 mt-1 block">Across {analytics.totalSalesCount} sales</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Volume Sold</span>
              <div className="text-3xl font-black text-white">
                {(analytics.totalQuantitySoldKg / 1000).toFixed(1)}
                <span className="text-lg text-slate-400"> t</span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">{analytics.totalQuantitySoldKg.toLocaleString()} kg total</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Avg Price Realized</span>
              <div className="text-3xl font-black text-amber-400">
                ₹{analytics.averagePricePerKg}
                <span className="text-lg text-slate-400"> /kg</span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">Top crop: {analytics.topCropSold}</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Best Price</span>
              <div className="text-3xl font-black text-cyan-400 flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span>₹{analytics.bestPriceRealizedPerKg ?? analytics.averagePricePerKg}<span className="text-lg text-slate-400"> /kg</span></span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">Best single transaction rate</span>
            </div>
          </div>

          {/* Monthly Revenue Bar Chart */}
          {analytics.monthlyRevenue && analytics.monthlyRevenue.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Monthly Revenue Trend</h3>
                <span className="text-xs text-slate-500">Last 12 months · hover for details</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthlyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => v > 0 ? `₹${(v/1000).toFixed(0)}k` : '0'} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: 12 }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Sales by Crop Pie Chart */}
          {analytics.salesByCrop && analytics.salesByCrop.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white">Revenue by Commodity</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.salesByCrop}
                      dataKey="amount"
                      nameKey="crop"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      labelLine={false}
                      label={renderCustomLabel}
                    >
                      {analytics.salesByCrop.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: 12 }}
                      formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString()}`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
