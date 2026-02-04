import express, { Request, Response } from 'express';
import Achievement from '../models/Achievement';

const router = express.Router();

// GET all achievements
router.get('/', async (req: Request, res: Response) => {
  try {
    const achievements = await Achievement.find().sort({ createdAt: 1 });
    res.json(achievements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET achievement by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const achievement = await Achievement.findOne({ id: req.params.id });
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }
    res.json(achievement);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create achievement
router.post('/', async (req: Request, res: Response) => {
  try {
    const achievement = new Achievement(req.body);
    await achievement.save();
    res.status(201).json(achievement);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST bulk create achievements
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const { achievements } = req.body;
    const operations = achievements.map((ach: any) => ({
      updateOne: {
        filter: { id: ach.id },
        update: { $set: ach },
        upsert: true,
      },
    }));
    await Achievement.bulkWrite(operations);
    const updatedAchievements = await Achievement.find();
    res.json(updatedAchievements);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update achievement
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const achievement = await Achievement.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }
    res.json(achievement);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH unlock achievement
router.patch('/:id/unlock', async (req: Request, res: Response) => {
  try {
    const achievement = await Achievement.findOneAndUpdate(
      { id: req.params.id },
      {
        unlocked: true,
        unlockedDate: new Date(),
      },
      { new: true }
    );
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }
    res.json(achievement);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE achievement
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const achievement = await Achievement.findOneAndDelete({ id: req.params.id });
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }
    res.json({ message: 'Achievement deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

