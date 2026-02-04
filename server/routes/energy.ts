import express, { Request, Response } from 'express';
import EnergyDataPoint from '../models/EnergyData';

const router = express.Router();

// GET all energy data with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, limit } = req.query;
    const query: any = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const limitNum = limit ? parseInt(limit as string) : 1000;
    const energyData = await EnergyDataPoint.find(query)
      .sort({ timestamp: -1 })
      .limit(limitNum);
    
    res.json(energyData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET energy data by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const dataPoint = await EnergyDataPoint.findById(req.params.id);
    if (!dataPoint) {
      return res.status(404).json({ error: 'Energy data not found' });
    }
    res.json(dataPoint);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create energy data point
router.post('/', async (req: Request, res: Response) => {
  try {
    const dataPoint = new EnergyDataPoint(req.body);
    await dataPoint.save();
    res.status(201).json(dataPoint);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST bulk create energy data points
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const { dataPoints } = req.body;
    const result = await EnergyDataPoint.insertMany(dataPoints);
    res.status(201).json({ count: result.length, dataPoints: result });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE energy data point
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const dataPoint = await EnergyDataPoint.findByIdAndDelete(req.params.id);
    if (!dataPoint) {
      return res.status(404).json({ error: 'Energy data not found' });
    }
    res.json({ message: 'Energy data deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE old energy data (older than X days)
router.delete('/cleanup/:days', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.params.days);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await EnergyDataPoint.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    res.json({
      message: `Deleted ${result.deletedCount} data points older than ${days} days`,
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET statistics
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const query: any = {};

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const stats = await EnergyDataPoint.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalConsumption: { $sum: '$consumption' },
          totalCost: { $sum: '$cost' },
          avgConsumption: { $avg: '$consumption' },
          maxConsumption: { $max: '$consumption' },
          minConsumption: { $min: '$consumption' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(stats[0] || {
      totalConsumption: 0,
      totalCost: 0,
      avgConsumption: 0,
      maxConsumption: 0,
      minConsumption: 0,
      count: 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

