import express, { Request, Response } from 'express';
import Goal from '../models/Goal';

const router = express.Router();

// GET all goals
router.get('/', async (req: Request, res: Response) => {
  try {
    const goals = await Goal.find().sort({ createdAt: -1 });
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET goal by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const goal = await Goal.findOne({ id: req.params.id });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create goal
router.post('/', async (req: Request, res: Response) => {
  try {
    const goal = new Goal(req.body);
    await goal.save();
    res.status(201).json(goal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update goal
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH update goal progress
router.patch('/:id/progress', async (req: Request, res: Response) => {
  try {
    const { current } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { id: req.params.id },
      { current },
      { new: true }
    );
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE goal
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const goal = await Goal.findOneAndDelete({ id: req.params.id });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

