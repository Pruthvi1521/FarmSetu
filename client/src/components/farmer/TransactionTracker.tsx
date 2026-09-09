import React, { useEffect, useState } from 'react';
import { ITransaction, TransactionStatus } from '../../../../shared/types';
import { transactionApi } from '../../services/api';
import { Receipt, CheckCircle2, Truck, Package, Clock, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react';

export const TransactionTracker: React.FC = () => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionApi.getTransactions();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Error loading transactions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const nextStatusMap: Record<TransactionStatus, TransactionStatus | null> = {
    OFFER_ACCEPTED: 'PICKUP_SCHEDULED',
    PICKUP_SCHEDULED: 'IN_TRANSIT',
    IN_TRANSIT: 'DELIVERED',
    DELIVERED: 'COMPLETED',
    COMPLETED: null
  };

  const handleAdvanceStatus = async (tx: ITransaction) => {
    const nextStatus = nextStatusMap[tx.status];
    if (!nextStatus) return;

    setIsUpdating(tx._id);
    try {
      await transactionApi.updateStatus(tx._id, nextStatus, `Advanced status to ${nextStatus}`);
      await fetchTransactions();
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction status.');
    } finally {
      setIsUpdating(null);
    }
  };

  const statusSteps: TransactionStatus[] = [
    'OFFER_ACCEPTED',
    'PICKUP_SCHEDULED',
    'IN_TRANSIT',
    'DELIVERED',
    'COMPLETED'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Receipt className="w-6 h-6 text-emerald-400" />
            <span>Sales & Logistics Tracking</span>
          </h2>
          <p className="text-sm text-slate-400">
            Real-time state machine tracking from offer acceptance to direct payment payout.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
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
          <p className="text-sm text-slate-400">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
          <Receipt className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Active Sales Transactions</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Once you accept a buyer's bid, your transaction workflow and payment status will be tracked here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {transactions.map((tx) => {
            const currentStepIdx = statusSteps.indexOf(tx.status);

            return (
              <div key={tx._id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Transaction #{tx._id.slice(-6).toUpperCase()}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">{tx.commodityName} Sale</h3>
                    <p className="text-xs text-slate-400">
                      Quantity: <strong>{tx.quantityKg.toLocaleString()} kg</strong> • Agreed Price: <strong>₹{tx.agreedPricePerKg}/kg</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Payout Amount</span>
                    <span className="text-2xl font-black text-emerald-400">
                      ₹{tx.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* State Machine Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                    <span>Workflow Progress</span>
                    <span className="text-emerald-400">{tx.status.replace('_', ' ')}</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {statusSteps.map((step, sIdx) => {
                      const isCompleted = sIdx <= currentStepIdx;
                      const isCurrent = sIdx === currentStepIdx;

                      return (
                        <div key={step} className="space-y-1.5 text-center">
                          <div
                            className={`h-2.5 rounded-full transition-all ${
                              isCompleted ? 'bg-emerald-500' : 'bg-slate-800'
                            } ${isCurrent ? 'ring-2 ring-emerald-400 shadow-md' : ''}`}
                          />
                          <span
                            className={`text-[10px] font-bold block truncate ${
                              isCurrent
                                ? 'text-emerald-400'
                                : isCompleted
                                ? 'text-slate-200'
                                : 'text-slate-600'
                            }`}
                          >
                            {step.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Advancement CTA */}
                {nextStatusMap[tx.status] && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleAdvanceStatus(tx)}
                      disabled={isUpdating === tx._id}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center space-x-2"
                    >
                      {isUpdating === tx._id ? (
                        <span>Updating...</span>
                      ) : (
                        <>
                          <span>Advance to: {nextStatusMap[tx.status]?.replace('_', ' ')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
