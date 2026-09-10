import React, { useState, useEffect } from 'react';
import { ITransaction, ITransportEstimate, VEHICLE_LABELS } from '../../../../shared/types';
import { transportApi } from '../../services/api';

interface ArrangeTransportModalProps {
  transaction: ITransaction;
  onClose: () => void;
  onSuccess: () => void;
}

export const ArrangeTransportModal: React.FC<ArrangeTransportModalProps> = ({
  transaction,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<{
    vehicleType: string;
    vehicleLabel: string;
    reason: string;
  } | null>(null);
  const [estimate, setEstimate] = useState<ITransportEstimate | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const recRes = await transportApi.getVehicleRecommendation(transaction.quantityKg);
        if (recRes.success) {
          setRecommendation(recRes.data);
        }

        const estRes = await transportApi.getEstimate(50, transaction.quantityKg);
        if (estRes.success) {
          setEstimate(estRes.data);
        }

        const farmerUser = transaction.farmerId as any;
        const buyerUser = transaction.buyerId as any;
        setPickupLocation(farmerUser?.location?.district || farmerUser?.location?.city || 'Farm Location');
        setDestinationLocation(buyerUser?.location?.district || buyerUser?.location?.city || 'Market / Warehouse');
      } catch (err: any) {
        console.error('Failed to load transport estimates:', err);
        setError('Failed to fetch transport estimate. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [transaction]);

  const handleConfirmBooking = async () => {
    try {
      setBookingLoading(true);
      setError(null);

      const res = await transportApi.createBooking(
        transaction._id,
        pickupLocation,
        destinationLocation
      );

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError('Failed to create booking.');
      }
    } catch (err: any) {
      console.error('Error booking transport:', err);
      setError(err.message || 'Failed to book transport');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-100">Arrange Transport</h3>
            <p className="text-sm text-slate-400">
              {transaction.commodityName} • {transaction.quantityKg.toLocaleString()} kg
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recommendation card */}
            {recommendation && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                    Recommended Vehicle
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30">
                    {recommendation.vehicleLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{recommendation.reason}</p>
              </div>
            )}

            {/* Transport details */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Pickup Location</label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Destination Location</label>
                <input
                  type="text"
                  value={destinationLocation}
                  onChange={(e) => setDestinationLocation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Cost estimate */}
            {estimate && (
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
                  Cost Estimate Breakdown
                </h4>
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Distance:</span>
                  <span className="font-semibold text-slate-100">{estimate.distanceKm} km</span>
                </div>
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Rate per km:</span>
                  <span className="font-semibold text-slate-100">₹{estimate.ratePerKm}/km</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-base font-bold">
                  <span className="text-slate-200">Estimated Total Cost:</span>
                  <span className="text-emerald-400">₹{estimate.estimatedCost.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmBooking}
            disabled={loading || bookingLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {bookingLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Booking...
              </>
            ) : (
              'Confirm & Book Transport'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
