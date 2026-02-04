import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import all routes
import energyRoutes from '../routes/energy';
import goalRoutes from '../routes/goals';
import recommendationRoutes from '../routes/recommendations';
import achievementRoutes from '../routes/achievements';
import scheduleRoutes from '../routes/schedules';
import notificationRoutes from '../routes/notifications';
import deviceRoutes from '../routes/devices';
import aiRoutes from '../routes/ai';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with Caching for Serverless
let cachedDb: any = null;

const connectToDatabase = async () => {
    if (cachedDb) {
        return cachedDb;
    }

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is missing in environment variables');
    }

    const conn = await mongoose.connect(MONGODB_URI);
    cachedDb = conn;
    return conn;
};

// Apply connection middleware to all routes
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Routes
// Note: Netlify Functions URL will include the function name by default if not redirected
// With netlify.toml redirect from /api/* to /.netlify/functions/api/*
// the relative path here should match what comes after /api
app.use('/devices', deviceRoutes);
app.use('/energy', energyRoutes);
app.use('/goals', goalRoutes);
app.use('/recommendations', recommendationRoutes);
app.use('/achievements', achievementRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/notifications', notificationRoutes);
app.use('/ai', aiRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', environment: 'serverless', timestamp: new Date().toISOString() });
});

export const handler = serverless(app);
