import React, { useState } from 'react';
import { ISaleLot, IOffer } from '../../../../shared/types';
import { lotApi } from '../../services/api';
import { X, Tag, Truck, Wallet, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface SubmitOfferModalProps {
  lot: ISaleLot;
  onClose: () => void;
  onSuccess: (newOffer: IOffer) => void;
}

export const SubmitOfferModal: React.FC<SubmitOfferModalProps> = ({
  lot,
  onClose,
  onSuccess
}) => {
  const [pricePerKg, setPricePerKg] = useState<number>(lot.askingPricePerKg || 36);
  const [transportationTerms, setTransportationTerms] = useState<'BUYER_PICKUP' | 'FARMER_DELIVERY'>('BUYER_PICKUP');
  const [paymentTerms, setPaymentTerms] = useState('Immediate Cash / UPI Settlement');
  const [validDays, setValidDays] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalValue = Math.round(pricePerKg * lot.quantityKg);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const offer = await lotApi.submitOffer(lot._id, {
        pricePerKg: Number(pricePerKg),
        transportationTerms,
        paymentTerms,
        validDays: Number(validDays)
      });

      onSuccess(offer);
    } catch (err: any) {
      setError(err.message || 'Failed to submit offer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const farmerObj = typeof lot.farmerId === 'object' ? lot.farmerId : null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Tag className="w-5 h-5 text-amber-400" />
              <span>Submit Direct Buyer Offer</span>
            </h3>
            <p className="text-sm text-slate-400">
              Submit a binding purchase bid to farmer {farmerObj?.name || ''}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lot Specifications Banner */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm text-white">{lot.commodityName} ({lot.quantityKg.toLocaleString()} kg)</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">{lot.qualityGrade}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Farmer: <strong>{farmerObj?.name || 'Verified Farmer'}</strong></span>
            <span>Asking Price: <strong>₹{lot.askingPricePerKg || '--'}/kg</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {error && (
            <div className="flex items-center space-x-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Your Offer Price (₹/kg)
            </label>
            <input
              type="number"
              step="0.01"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(Number(e.target.value))}
              required
              min={1}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-lg font-bold focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Calculated Total Purchase Value:</span>
              <span className="font-bold text-amber-400">₹{totalValue.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Logistics / Pickup</label>
              <select
                value={transportationTerms}
                onChange={(e) => setTransportationTerms(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="BUYER_PICKUP">Buyer Pickup (At Farm Gate)</option>
                <option value="FARMER_DELIVERY">Farmer Delivery to Buyer Hub</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Valid For (Days)</label>
              <input
                type="number"
                value={validDays}
                onChange={(e) => setValidDays(Number(e.target.value))}
                min={1}
                max={7}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Payment Terms</label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Immediate Cash / UPI Settlement">Immediate Cash / UPI Settlement</option>
              <option value="Net 2 Days Direct Bank Deposit">Net 2 Days Direct Bank Deposit</option>
              <option value="50% Advance + 50% on Delivery">50% Advance + 50% on Delivery</option>
            </select>
          </div>

          <div className="pt-3 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Send Offer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
