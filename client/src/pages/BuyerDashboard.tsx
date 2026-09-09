import React, { useEffect, useState } from 'react';
import { ISaleLot, IOffer } from '../../../shared/types';
import { lotApi, marketApi } from '../services/api';
import { SubmitOfferModal } from '../components/buyer/SubmitOfferModal';
import { BuyerAnalyticsView } from '../components/buyer/BuyerAnalyticsView';
import { NotificationBell } from '../components/common/NotificationBell';
import {
  ShoppingBag,
  Filter,
  RefreshCw,
  MapPin,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  BarChart3
} from 'lucide-react';

type Tab = 'marketplace' | 'analytics';

export const BuyerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('marketplace');
  const [lots, setLots] = useState<ISaleLot[]>([]);
  const [commodities, setCommodities] = useState<Array<{ name: string }>>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeLotForOffer, setActiveLotForOffer] = useState<ISaleLot | null>(null);
  const [activeLotForDetails, setActiveLotForDetails] = useState<ISaleLot | null>(null);
  const [submittedOfferSuccess, setSubmittedOfferSuccess] = useState<IOffer | null>(null);

  const fetchCommodities = async () => {
    try {
      const data = await marketApi.getCommodities();
      setCommodities(data);
    } catch (err) {
      console.warn('Failed to load commodities filter:', err);
    }
  };

  const fetchLots = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lotApi.getMarketplaceLots(selectedCrop, selectedStatus);
      setLots(data);
    } catch (err: any) {
      setError(err.message || 'Error loading marketplace lots.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCommodities(); }, []);
  useEffect(() => { fetchLots(); }, [selectedCrop, selectedStatus]);

  const handleOfferSuccess = (newOffer: IOffer) => {
    setActiveLotForOffer(null);
    setSubmittedOfferSuccess(newOffer);
    fetchLots();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'OFFERS_RECEIVED': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'SOLD': return 'bg-slate-700 text-slate-400 border-slate-600';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar with title + notification bell */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Tab navigation */}
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'marketplace'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Marketplace</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>My Analytics</span>
              </button>
            </div>

            {/* Notification bell */}
            <NotificationBell />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ─── Analytics Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'analytics' && <BuyerAnalyticsView />}

        {/* ─── Marketplace Tab ────────────────────────────────────────────────── */}
        {activeTab === 'marketplace' && (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white flex items-center space-x-3">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <span>Direct Bulk Buyer Marketplace</span>
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Browse verified farmer harvest lots, inspect quality grades, and submit direct purchase bids.
                </p>
              </div>
              <button
                onClick={fetchLots}
                disabled={isLoading}
                className="self-start md:self-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Listings</span>
              </button>
            </div>

            {/* Offer success banner */}
            {submittedOfferSuccess && (
              <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3 text-emerald-300">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold">Offer Submitted Successfully!</h4>
                    <p className="text-xs text-slate-300">
                      Bid of ₹{submittedOfferSuccess.pricePerKg}/kg (Total ₹{submittedOfferSuccess.totalValue.toLocaleString()}) sent to farmer.
                    </p>
                  </div>
                </div>
                <button onClick={() => setSubmittedOfferSuccess(null)} className="text-xs text-slate-400 hover:text-white">Dismiss</button>
              </div>
            )}

            {/* Filters Bar */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold uppercase">
                  <Filter className="w-4 h-4 text-amber-400" />
                  <span>Filter Lots:</span>
                </div>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Commodities</option>
                  {commodities.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active (Open for Bids)</option>
                  <option value="OFFERS_RECEIVED">Offers Received</option>
                  <option value="SOLD">Sold</option>
                </select>
                {(selectedCrop || selectedStatus) && (
                  <button
                    onClick={() => { setSelectedCrop(''); setSelectedStatus(''); }}
                    className="text-xs text-amber-400 hover:underline font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Showing <strong>{lots.length}</strong> farmer sale lots
              </span>
            </div>

            {/* Lot Grid */}
            {isLoading ? (
              <div className="glass-panel p-16 text-center rounded-2xl">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-400">Loading marketplace sale lots...</p>
              </div>
            ) : error ? (
              <div className="flex items-center space-x-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : lots.length === 0 ? (
              <div className="glass-panel p-16 text-center rounded-2xl space-y-3">
                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-bold text-white">No Marketplace Lots Found</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Try adjusting your commodity filter or check back as farmers publish new harvest lots.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lots.map((lot) => {
                  const farmerObj = typeof lot.farmerId === 'object' ? lot.farmerId : null;
                  const isSold = lot.status === 'SOLD';
                  return (
                    <div
                      key={lot._id}
                      className={`glass-panel p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                        isSold
                          ? 'border-slate-800/60 opacity-60'
                          : 'border-slate-800 hover:border-amber-500/40 hover:shadow-xl'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2.5 py-0.5 rounded font-bold border ${getStatusBadge(lot.status)}`}>
                            {lot.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                            {lot.qualityGrade}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-white">{lot.commodityName}</h3>
                          <div className="flex items-center space-x-2 text-sm text-slate-300 mt-1">
                            <span className="font-bold text-amber-400">{lot.quantityKg.toLocaleString()} kg</span>
                            <span>({(lot.quantityKg / 1000).toFixed(1)} tonnes)</span>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Farmer:</span>
                            <span className="font-semibold text-white">{farmerObj?.name || 'Verified Farmer'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Location:</span>
                            <span className="flex items-center space-x-1 text-rose-400 font-medium">
                              <MapPin className="w-3 h-3" />
                              <span>{farmerObj?.location?.district || 'Madanapalle'}, AP</span>
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Available:</span>
                            <span className="flex items-center space-x-1 text-amber-400 font-medium">
                              <Clock className="w-3 h-3" />
                              <span>{lot.availableDays} Days Window</span>
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block">Asking Price</span>
                            <span className="text-lg font-bold text-white">
                              ₹{lot.askingPricePerKg || '--'} <span className="text-[10px] font-normal text-slate-400">/kg</span>
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-900/40 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block">Bids Received</span>
                            <span className="text-lg font-bold text-amber-400">{lot.offersCount || 0} Bids</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2">
                        <button
                          onClick={() => setActiveLotForDetails(lot)}
                          className="w-1/3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={() => setActiveLotForOffer(lot)}
                          disabled={isSold}
                          className="w-2/3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1"
                        >
                          <Tag className="w-3.5 h-3.5" />
                          <span>{isSold ? 'Lot Sold' : 'Make an Offer'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Submit Offer Modal */}
      {activeLotForOffer && (
        <SubmitOfferModal
          lot={activeLotForOffer}
          onClose={() => setActiveLotForOffer(null)}
          onSuccess={handleOfferSuccess}
        />
      )}

      {/* Lot Details Modal */}
      {activeLotForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-white">{activeLotForDetails.commodityName} Lot Specifications</h3>
              <button onClick={() => setActiveLotForDetails(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl">
                <div><span className="text-xs text-slate-400 block">Quantity</span><strong>{activeLotForDetails.quantityKg.toLocaleString()} kg</strong></div>
                <div><span className="text-xs text-slate-400 block">Grade</span><strong>{activeLotForDetails.qualityGrade}</strong></div>
                <div><span className="text-xs text-slate-400 block">Asking Price</span><strong>₹{activeLotForDetails.askingPricePerKg || '--'}/kg</strong></div>
                <div><span className="text-xs text-slate-400 block">Expected Revenue</span><strong>₹{activeLotForDetails.expectedNetRevenue ? activeLotForDetails.expectedNetRevenue.toLocaleString() : '--'}</strong></div>
              </div>
              {activeLotForDetails.recommendedMarketName && (
                <div className="text-xs p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
                  Farmer Target Market: <strong>{activeLotForDetails.recommendedMarketName}</strong>
                </div>
              )}
            </div>
            <div className="pt-3">
              <button
                onClick={() => {
                  const target = activeLotForDetails;
                  setActiveLotForDetails(null);
                  setActiveLotForOffer(target);
                }}
                disabled={activeLotForDetails.status === 'SOLD'}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-sm transition-colors"
              >
                Proceed to Make Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
