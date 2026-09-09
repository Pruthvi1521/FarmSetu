import { Response } from 'express';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';

/** GET /api/notifications — fetch 20 most recent for authenticated user */
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.json(notifications);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error fetching notifications' });
  }
};

/** GET /api/notifications/unread-count — lightweight polling endpoint */
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });
    return res.json({ count });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error counting notifications' });
  }
};

/** PATCH /api/notifications/:id/read — mark one notification as read */
export const markOneRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    const { id } = req.params;
    await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { isRead: true }
    );

    return res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error updating notification' });
  }
};

/** PATCH /api/notifications/read-all — mark all as read for authenticated user */
export const markAllRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });

    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    return res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error marking notifications read' });
  }
};
