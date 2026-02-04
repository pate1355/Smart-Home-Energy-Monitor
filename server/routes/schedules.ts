import express, { Request, Response } from 'express';
import Schedule from '../models/Schedule';

const router = express.Router();

// GET all schedules
router.get('/', async (req: Request, res: Response) => {
  try {
    const { deviceId, active } = req.query;
    const query: any = {};
    
    if (deviceId) {
      query.deviceId = deviceId;
    }
    
    if (active !== undefined) {
      query.active = active === 'true';
    }
    
    const schedules = await Schedule.find(query).sort({ createdAt: -1 });
    res.json(schedules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET schedule by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const schedule = await Schedule.findOne({ id: req.params.id });
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create schedule
router.post('/', async (req: Request, res: Response) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update schedule
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const schedule = await Schedule.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE schedule
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const schedule = await Schedule.findOneAndDelete({ id: req.params.id });
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

