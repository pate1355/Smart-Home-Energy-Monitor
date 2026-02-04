import express, { Request, Response } from 'express';
import Recommendation from '../models/Recommendation';

const router = express.Router();

// GET all recommendations
router.get('/', async (req: Request, res: Response) => {
  try {
    const { implemented } = req.query;
    const query: any = {};
    
    if (implemented !== undefined) {
      query.implemented = implemented === 'true';
    }
    
    const recommendations = await Recommendation.find(query).sort({ 
      priority: 1,
      createdAt: -1 
    });
    res.json(recommendations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET recommendation by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const recommendation = await Recommendation.findOne({ id: req.params.id });
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    res.json(recommendation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create recommendation
router.post('/', async (req: Request, res: Response) => {
  try {
    const recommendation = new Recommendation(req.body);
    await recommendation.save();
    res.status(201).json(recommendation);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST bulk create recommendations
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const { recommendations } = req.body;
    // Delete existing recommendations
    await Recommendation.deleteMany({});
    // Insert new ones
    const result = await Recommendation.insertMany(recommendations);
    res.status(201).json({ count: result.length, recommendations: result });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update recommendation
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const recommendation = await Recommendation.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    res.json(recommendation);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH mark as implemented
router.patch('/:id/implement', async (req: Request, res: Response) => {
  try {
    const { implemented } = req.body;
    const recommendation = await Recommendation.findOneAndUpdate(
      { id: req.params.id },
      { implemented },
      { new: true }
    );
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    res.json(recommendation);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE recommendation
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const recommendation = await Recommendation.findOneAndDelete({ id: req.params.id });
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }
    res.json({ message: 'Recommendation deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

