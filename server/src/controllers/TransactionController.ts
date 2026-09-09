import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { AuthRequest } from '../middleware/authMiddleware';
import { TransactionStatus } from '../../../shared/types';
import { createNotification } from '../models/Notification';

export const getUserTransactions = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const filter =
      req.user.role === 'FARMER'
        ? { farmerId: req.user.id }
        : req.user.role === 'BUYER'
        ? { buyerId: req.user.id }
        : {};

    const transactions = await Transaction.find(filter)
      .populate('farmerId', 'name phone location')
      .populate('buyerId', 'name phone location')
      .sort({ createdAt: -1 })
      .lean();

    return res.json(transactions);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching transactions' });
  }
};

export const getTransactionDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id)
      .populate('farmerId', 'name phone location')
      .populate('buyerId', 'name phone location')
      .populate('lotId')
      .populate('acceptedOfferId')
      .lean();

    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    return res.json(transaction);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching transaction details' });
  }
};

export const updateTransactionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses: TransactionStatus[] = [
      'OFFER_ACCEPTED',
      'PICKUP_SCHEDULED',
      'IN_TRANSIT',
      'DELIVERED',
      'COMPLETED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid transaction status: ${status}` });
    }

    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    transaction.status = status;
    transaction.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Transaction state updated to ${status.replace(/_/g, ' ')}.`
    });

    await transaction.save();

    // --- Notifications for both parties ---
    const statusLabel = status.replace(/_/g, ' ');
    const notifPayload = {
      type: 'TRANSACTION_UPDATED' as const,
      title: `Transaction Status: ${statusLabel}`,
      message: `Your transaction for ${transaction.commodityName} (${transaction.quantityKg} kg) is now: ${statusLabel}.`,
      link: `/transactions`
    };
    await createNotification({ userId: transaction.farmerId.toString(), ...notifPayload });
    await createNotification({ userId: transaction.buyerId.toString(), ...notifPayload });

    return res.json({ message: 'Transaction status updated', transaction });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error updating transaction status' });
  }
};
