import express, { Request, Response } from 'express';
import Notification from '../models/Notification';

const router = express.Router();

// GET all notifications
router.get('/', async (req: Request, res: Response) => {
  try {
    const { read, limit } = req.query;
    const query: any = {};
    
    if (read !== undefined) {
      query.read = read === 'true';
    }
    
    const limitNum = limit ? parseInt(limit as string) : 50;
    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .limit(limitNum);
    
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET notification by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findOne({ id: req.params.id });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create notification
router.post('/', async (req: Request, res: Response) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST bulk create notifications
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const { notifications } = req.body;
    const result = await Notification.insertMany(notifications);
    res.status(201).json({ count: result.length, notifications: result });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH mark as read
router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const { read } = req.body;
    const notification = await Notification.findOneAndUpdate(
      { id: req.params.id },
      { read },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH mark all as read
router.patch('/read/all', async (req: Request, res: Response) => {
  try {
    const result = await Notification.updateMany(
      { read: false },
      { read: true }
    );
    res.json({ message: `Marked ${result.modifiedCount} notifications as read` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE notification
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const notification = await Notification.findOneAndDelete({ id: req.params.id });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE all notifications
router.delete('/', async (req: Request, res: Response) => {
  try {
    const result = await Notification.deleteMany({});
    res.json({ message: `Deleted ${result.deletedCount} notifications` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

