import React from 'react';
import {
  IMarketRecommendationResult,
  ActionRecommendation
} from '../../../../shared/types';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Weight,
  ShieldCheck,
  Zap,
  Tag,
  Clock
} from 'lucide-react';

interface RecommendationSummaryProps {
  data: IMarketRecommendationResult;
  onCreateLotClick: () => void;
}

export const RecommendationSummary: React.FC<RecommendationSummaryProps> = ({
  data,
  onCreateLotClick
}) => {
  const { parsedInput, forecast, actionRecommendation, topMarket } = data;

  const getActionBadgeStyle = (action: ActionRecommendation) => {
    switch (action) {
      case 'WAIT':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'SELL_NOW':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'FIND_BUYER_NOW':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'INCREASING') return <TrendingUp className="w-5 h-5 text-emerald-400" />;
    if (trend === 'DECREASING') return <TrendingDown className="w-5 h-5 text-rose-400" />;
    return <Minus className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Action Guidance Banner */}
      <div className={`p-6 rounded-2xl border ${getActionBadgeStyle(actionRecommendation.action)} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl`}>
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-current flex-shrink-0">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-900/80">
                Action Guidance
              </span>
              <span className="text-xs text-slate-400">Target Window: {actionRecommendation.targetDays} Days</span>
            </div>
            <h3 className="text-xl font-bold mt-1 text-white">{actionRecommendation.title}</h3>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">{actionRecommendation.rationale}</p>
          </div>
        </div>

        <button
          onClick={onCreateLotClick}
          className="w-full md:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
        >
          <Tag className="w-5 h-5" />
          <span>Create Sale Lot Now</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Commodity & Quantity */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>PARSED HARVEST</span>
            <Weight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{parsedInput.commodity}</div>
          <div className="flex items-center space-x-3 text-sm text-slate-300 mt-2">
            <span className="font-semibold text-emerald-400">{parsedInput.quantityKg.toLocaleString()} kg</span>
            <span>({(parsedInput.quantityKg / 1000).toFixed(1)} tonnes)</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Ready in {parsedInput.availabilityDays} days</span>
          </div>
        </div>

        {/* Current Mandi Price */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>CURRENT MANDI PRICE</span>
            <Tag className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            ₹{forecast.currentModalPrice} <span className="text-sm font-normal text-slate-400">/ kg</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Latest modal price across APMC mandis
          </div>
        </div>

        {/* Forecasted Price */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>5-DAY FORECAST PRICE</span>
            {getTrendIcon(forecast.trend)}
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            ₹{forecast.forecastedPrice} <span className="text-sm font-normal text-slate-400">/ kg</span>
          </div>
          <div className="text-xs text-slate-300 mt-1">
            Range: <span className="text-white font-medium">₹{forecast.expectedMin} - ₹{forecast.expectedMax}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-emerald-400 mt-2 font-medium">
            <span>Trend: {forecast.trend}</span>
          </div>
        </div>

        {/* Model Confidence */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>MODEL CONFIDENCE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {forecast.confidenceScore}<span className="text-lg text-slate-400">%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${forecast.confidenceScore}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 mt-2">
            WMA + Holt exponential smoothing
          </div>
        </div>
      </div>
    </div>
  );
};
