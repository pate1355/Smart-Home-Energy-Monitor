import express, { Request, Response } from 'express';
import Device from '../models/Device';

const router = express.Router();

// GET all devices
router.get('/', async (req: Request, res: Response) => {
  try {
    const devices = await Device.find().sort({ createdAt: -1 });
    res.json(devices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET device by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const device = await Device.findOne({ id: req.params.id });
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create device
router.post('/', async (req: Request, res: Response) => {
  try {
    const device = new Device(req.body);
    await device.save();
    res.status(201).json(device);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update device
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const device = await Device.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH update device status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const device = await Device.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json(device);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE device
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const device = await Device.findOneAndDelete({ id: req.params.id });
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    res.json({ message: 'Device deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST bulk update devices
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const { devices } = req.body;
    const operations = devices.map((device: any) => ({
      updateOne: {
        filter: { id: device.id },
        update: { $set: device },
        upsert: true,
      },
    }));
    await Device.bulkWrite(operations);
    const updatedDevices = await Device.find();
    res.json(updatedDevices);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

