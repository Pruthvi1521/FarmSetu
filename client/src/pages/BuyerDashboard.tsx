import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ISaleLot, IOffer } from '../../../shared/types';
import { lotApi } from '../services/api';
import { SubmitOfferModal } from '../components/buyer/SubmitOfferModal';
import { NotificationBell } from '../components/common/NotificationBell';
import { TransactionTracker } from '../components/farmer/TransactionTracker';
import { TransportBookingView } from '../components/farmer/TransportBookingView';
import { BuyerAnalyticsView } from '../components/buyer/BuyerAnalyticsView';
import { MarketStoryStrip } from '../components/common/MarketStoryStrip';

import {
  ShoppingBag,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  Tag,
  Receipt,
  Truck,
  BarChart3,
  X
} from 'lucide-react';

const MarketplaceView: React.FC = () => {
  const [lots, setLots] = useState<ISaleLot[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeLotForOffer, setActiveLotForOffer] = useState<ISaleLot | null>(null);
  const [activeLotForDetails, setActiveLotForDetails] = useState<ISaleLot | null>(null);
  const [submittedOfferSuccess, setSubmittedOfferSuccess] = useState<IOffer | null>(null);

  const fetchLots = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cropQuery = selectedCrop === 'ALL' ? undefined : selectedCrop;
      const data = await lotApi.getMarketplaceLots(cropQuery);
      setLots(data);
    } catch (err: any) {
      setError(err.message || 'Error fetching marketplace lots.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, [selectedCrop]);

  const handleOfferSuccess = (newOffer: IOffer) => {
    setActiveLotForOffer(null);
    setSubmittedOfferSuccess(newOffer);
    fetchLots();
  };

  const cropsList = ['ALL', 'Tomato', 'Onion', 'Potato', 'Rice (Sona Masoori)', 'Maize', 'Dry Red Chilli', 'Cotton'];

  return (
    <>
      {/* Search & Filter Header */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>Live Farmer Harvest Marketplace</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse verified crop lots directly from APMC regional farmers. Place competitive purchase bids.
          </p>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-semibold">Crop:</span>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {cropsList.map((crop) => (
              <option key={crop} value={crop}>
                {crop === 'ALL' ? 'All Commodities' : crop}
              </option>
            ))}
          </select>
        </div>
      </div>

      {submittedOfferSuccess && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-3 text-emerald-300">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Offer Submitted Successfully!</h4>
              <p className="text-xs text-slate-300">
                Bid of ₹{submittedOfferSuccess.pricePerKg}/kg (Total ₹{submittedOfferSuccess.totalValue.toLocaleString()}) sent to farmer.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubmittedOfferSuccess(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sale Lots Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm">Loading harvest listings...</p>
        </div>
      ) : lots.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No Active Lots Available</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No farmer lots matching your crop filter are currently listed on the marketplace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lots.map((lot) => {
            const farmerObj = typeof lot.farmerId === 'object' ? lot.farmerId : null;
            const isSold = lot.status === 'SOLD' || lot.status === 'CANCELLED';

            return (
              <div
                key={lot._id}
                className={`glass-panel rounded-2xl p-6 border transition-all flex flex-col justify-between space-y-5 ${
                  isSold ? 'opacity-60 border-slate-800' : 'border-slate-800 hover:border-amber-500/40'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Row: Crop & Status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">LOT #{lot._id.slice(-6)}</span>
                      <h3 className="text-xl font-bold text-white leading-tight">{lot.commodityName}</h3>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        lot.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : lot.status === 'OFFERS_RECEIVED'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {lot.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Lot Details Grid */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Quantity</span>
                      <span className="font-bold text-slate-100">{lot.quantityKg.toLocaleString()} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Grade</span>
                      <span className="font-bold text-emerald-400">{lot.qualityGrade}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Harvest Date</span>
                      <span className="font-semibold text-slate-300">
                        {new Date(lot.harvestDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Available Days</span>
                      <span className="font-semibold text-slate-300">{lot.availableDays} days</span>
                    </div>
                  </div>

                  {/* Farmer Info */}
                  {farmerObj && (
                    <div className="text-xs text-slate-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Farmer: <strong className="text-slate-200">{farmerObj.name}</strong></span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded">{farmerObj.location?.district}</span>
                      </div>
                    </div>
                  )}

                  {/* Asking Price Banner */}
                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                    <span className="text-xs text-slate-400">Asking Price:</span>
                    <span className="text-2xl font-black text-amber-400">
                      ₹{lot.askingPricePerKg || '--'} <span className="text-[10px] font-normal text-slate-400">/kg</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => setActiveLotForDetails(lot)}
                    className="w-1/3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>
                  <button
                    onClick={() => setActiveLotForOffer(lot)}
                    disabled={isSold}
                    className="w-2/3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1 cursor-pointer"
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
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-white">{activeLotForDetails.commodityName} Lot Specifications</h3>
              <button onClick={() => setActiveLotForDetails(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
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
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Proceed to Make Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const BuyerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;
  const activeTab: 'marketplace' | 'transactions' | 'analytics' | 'transport' =
    path.includes('/transactions') ? 'transactions' :
    path.includes('/analytics')   ? 'analytics'    :
    path.includes('/transport')   ? 'transport'    :
                                     'marketplace';

  const tabClass = (tab: typeof activeTab) =>
    `flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
      activeTab === tab
        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top nav bar */}
      <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex space-x-1">
              <button
                onClick={() => navigate('/buyer')}
                className={tabClass('marketplace')}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Marketplace</span>
              </button>
              <button
                onClick={() => navigate('/buyer/analytics')}
                className={tabClass('analytics')}
              >
                <BarChart3 className="w-4 h-4" />
                <span>My Analytics</span>
              </button>
              <button
                onClick={() => navigate('/buyer/transactions')}
                className={tabClass('transactions')}
              >
                <Receipt className="w-4 h-4" />
                <span>My Transactions</span>
              </button>
              <button
                onClick={() => navigate('/buyer/transport')}
                className={tabClass('transport')}
              >
                <Truck className="w-4 h-4" />
                <span>Transport</span>
              </button>
            </div>

            <NotificationBell />
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <MarketStoryStrip
          eyebrow="The other side of the harvest"
          title="Meet the people and produce behind every listing."
          description="Browse with context, bid with confidence, and help a farmer's hard work move from field to home."
        />
        <Routes>
          <Route index element={<MarketplaceView />} />
          <Route path="transactions" element={<TransactionTracker />} />
          <Route path="transport" element={<TransportBookingView />} />
          <Route path="analytics" element={<BuyerAnalyticsView />} />
        </Routes>
      </div>
    </div>
  );
};

export default BuyerDashboard;
