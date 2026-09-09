import React, { useState } from 'react';
import { IMarketRankingItem, IInputParseResult, ISaleLot } from '../../../../shared/types';
import { lotApi } from '../../services/api';
import { X, Tag, CheckCircle2, AlertCircle } from 'lucide-react';

interface CreateLotModalProps {
  parsedInput?: IInputParseResult;
  selectedMarket?: IMarketRankingItem;
  forecastPrice?: number;
  onClose: () => void;
  onSuccess: (newLot: ISaleLot) => void;
}

export const CreateLotModal: React.FC<CreateLotModalProps> = ({
  parsedInput,
  selectedMarket,
  forecastPrice,
  onClose,
  onSuccess
}) => {
  const [commodityName, setCommodityName] = useState(parsedInput?.commodity || 'Tomato');
  const [quantityKg, setQuantityKg] = useState(parsedInput?.quantityKg || 2000);
  const [availableDays, setAvailableDays] = useState(parsedInput?.availabilityDays || 5);
  const [qualityGrade, setQualityGrade] = useState('Grade A');
  const [askingPricePerKg, setAskingPricePerKg] = useState(
    selectedMarket?.expectedPricePerKg || forecastPrice || 36
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const harvestDate = new Date(Date.now() + availableDays * 86400000).toISOString().split('T')[0];

      const newLot = await lotApi.createLot({
        commodityName,
        commodityId: parsedInput?.commodityId,
        quantityKg: Number(quantityKg),
        harvestDate,
        availableDays: Number(availableDays),
        qualityGrade,
        askingPricePerKg: Number(askingPricePerKg),
        expectedNetRevenue: selectedMarket?.expectedNetRevenue,
        recommendedMarketId: selectedMarket?.marketId,
        recommendedMarketName: selectedMarket?.marketName
      });

      onSuccess(newLot);
    } catch (err: any) {
      setError(err.message || 'Failed to create sale lot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Tag className="w-5 h-5 text-emerald-400" />
              <span>Create New Sale Lot</span>
            </h3>
            <p className="text-sm text-slate-400">
              List your harvest to receive direct buyer bids and APMC market clearance.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {error && (
            <div className="flex items-center space-x-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Commodity</label>
              <input
                type="text"
                value={commodityName}
                onChange={(e) => setCommodityName(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Quantity (kg)</label>
              <input
                type="number"
                value={quantityKg}
                onChange={(e) => setQuantityKg(Number(e.target.value))}
                required
                min={10}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Quality Grade</label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Grade A">Grade A (Premium / Firm)</option>
                <option value="Grade B">Grade B (Standard)</option>
                <option value="Grade C">Grade C (Processing)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Available in (Days)</label>
              <input
                type="number"
                value={availableDays}
                onChange={(e) => setAvailableDays(Number(e.target.value))}
                required
                min={0}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Asking Price (₹/kg) <span className="text-emerald-400">(Recommended: ₹{askingPricePerKg})</span>
            </label>
            <input
              type="number"
              step="0.5"
              value={askingPricePerKg}
              onChange={(e) => setAskingPricePerKg(Number(e.target.value))}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {selectedMarket && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
              Target Market: <strong>{selectedMarket.marketName}</strong> (Expected Net Rev: ₹{selectedMarket.expectedNetRevenue.toLocaleString()})
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Notes / Pickup Instructions (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Packed in 25kg crates, ready at Madanapalle farm road gate"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
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
              className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span>Creating...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Publish</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
