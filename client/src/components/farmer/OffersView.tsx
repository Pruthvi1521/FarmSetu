import React, { useEffect, useState } from 'react';
import { IOffer, ISaleLot } from '../../../../shared/types';
import { lotApi } from '../../services/api';
import { BadgePercent, ShieldCheck, CheckCircle2, RefreshCw, AlertCircle, Truck, Wallet } from 'lucide-react';

interface OffersViewProps {
  selectedLotId?: string;
  onOfferAccepted?: () => void;
}

export const OffersView: React.FC<OffersViewProps> = ({ selectedLotId, onOfferAccepted }) => {
  const [lots, setLots] = useState<ISaleLot[]>([]);
  const [activeLotId, setActiveLotId] = useState<string | undefined>(selectedLotId);
  const [offers, setOffers] = useState<IOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchLotsAndOffers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allLots = await lotApi.getFarmerLots();
      setLots(allLots);

      const targetId = activeLotId || (allLots.length > 0 ? allLots[0]._id : undefined);
      if (targetId) {
        setActiveLotId(targetId);
        const lotOffers = await lotApi.getOffersForLot(targetId);
        setOffers(lotOffers);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching offers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLotsAndOffers();
  }, [activeLotId]);

  const handleAcceptOffer = async (offerId: string) => {
    setIsAccepting(offerId);
    setError(null);
    setSuccessMsg(null);
    try {
      await lotApi.acceptOffer(offerId);
      setSuccessMsg('Offer accepted successfully! Transaction timeline created.');
      if (onOfferAccepted) onOfferAccepted();
      await fetchLotsAndOffers();
    } catch (err: any) {
      setError(err.message || 'Failed to accept offer.');
    } finally {
      setIsAccepting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <BadgePercent className="w-6 h-6 text-amber-400" />
            <span>Buyer Bids & Offers</span>
          </h2>
          <p className="text-sm text-slate-400">
            Review incoming direct bids from verified bulk buyers.
          </p>
        </div>

        <button
          onClick={fetchLotsAndOffers}
          disabled={isLoading}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center space-x-2 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Lot Selector Tabs */}
      {lots.length > 0 && (
        <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-slate-800">
          {lots.map((lot) => (
            <button
              key={lot._id}
              onClick={() => setActiveLotId(lot._id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeLotId === lot._id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {lot.commodityName} ({lot.quantityKg} kg)
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Fetching buyer bids...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
          <BadgePercent className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Offers Pending for this Lot</h3>
          <p className="text-sm text-slate-400">
            Offers submitted by bulk wholesalers and direct buyers will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => {
            const buyer = offer.buyerId as any;
            const buyerName = offer.buyerName || buyer?.name || 'Bulk Buyer';
            const businessName = offer.buyerBusinessName || 'Verified Wholesaler';
            const isAccepted = offer.status === 'ACCEPTED';

            return (
              <div
                key={offer._id}
                className={`p-6 rounded-2xl glass-panel border ${
                  isAccepted ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-800'
                } flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>VERIFIED BUYER</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      Reliability Score: {offer.buyerReliabilityScore || 96}%
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{businessName}</h3>
                  <p className="text-xs text-slate-400">Owner: {buyerName}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                    <div className="flex items-center space-x-1">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Terms: {offer.transportationTerms.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Payment: {offer.paymentTerms}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Offer Price</span>
                    <span className="text-2xl font-black text-emerald-400">₹{offer.pricePerKg} / kg</span>
                    <span className="text-xs text-slate-300 block font-semibold">
                      Total: ₹{offer.totalValue.toLocaleString()}
                    </span>
                  </div>

                  {isAccepted ? (
                    <div className="px-4 py-2 bg-emerald-500/20 text-emerald-300 font-bold text-xs rounded-lg border border-emerald-500/40">
                      ✓ Offer Accepted
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAcceptOffer(offer._id)}
                      disabled={isAccepting === offer._id}
                      className="w-full md:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                    >
                      {isAccepting === offer._id ? (
                        <span>Accepting...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept & Start Sale</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
