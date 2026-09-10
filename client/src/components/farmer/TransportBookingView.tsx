import React, { useEffect, useState } from 'react';
import { ITransportBooking, BookingStatus } from '../../../../shared/types';
import { transportApi } from '../../services/api';

export const TransportBookingView: React.FC = () => {
  const [bookings, setBookings] = useState<ITransportBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await transportApi.getFarmerBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load transport bookings:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: BookingStatus) => {
    try {
      setUpdatingId(id);
      const res = await transportApi.updateBookingStatus(id, newStatus);
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert('Failed to update booking status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'REQUESTED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'ASSIGNED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'IN_TRANSIT':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'DELIVERED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Transport & Logistics</h2>
          <p className="text-sm text-slate-400">
            View and manage transport bookings for your crop deliveries
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 text-xl">
            🚛
          </div>
          <h3 className="text-lg font-semibold text-slate-200">No Transport Bookings Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            When you accept an offer on your sale lot, you can arrange transport directly from the Transaction Tracker.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚛</span>
                  <div>
                    <h4 className="font-bold text-slate-100">{booking.vehicleLabel}</h4>
                    <p className="text-xs text-slate-400">
                      {booking.quantityKg.toLocaleString()} kg • {booking.distanceKm} km
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusBadge(
                    booking.status
                  )}`}
                >
                  {booking.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 block mb-0.5">Pickup</span>
                  <span className="text-slate-200 font-medium">{booking.pickupLocation}</span>
                </div>
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/60">
                  <span className="text-slate-400 block mb-0.5">Destination</span>
                  <span className="text-slate-200 font-medium">{booking.destinationLocation}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-400">Rate: </span>
                  <span className="text-slate-200 font-medium">₹{booking.ratePerKm}/km</span>
                </div>
                <div>
                  <span className="text-slate-400">Total: </span>
                  <span className="text-emerald-400 font-bold text-sm">
                    ₹{booking.estimatedCost.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status transition action buttons */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/60">
                {booking.status === 'REQUESTED' && (
                  <button
                    onClick={() => handleUpdateStatus(booking._id, 'ASSIGNED')}
                    disabled={updatingId === booking._id}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition-colors"
                  >
                    Assign Vehicle
                  </button>
                )}

                {(booking.status === 'REQUESTED' || booking.status === 'ASSIGNED') && (
                  <button
                    onClick={() => handleUpdateStatus(booking._id, 'IN_TRANSIT')}
                    disabled={updatingId === booking._id}
                    className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-medium transition-colors"
                  >
                    Mark In-Transit
                  </button>
                )}

                {booking.status === 'IN_TRANSIT' && (
                  <button
                    onClick={() => handleUpdateStatus(booking._id, 'DELIVERED')}
                    disabled={updatingId === booking._id}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
