import 'dotenv/config';

import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

import authRoutes from './routes/auth.route.js';
import equipmentRoutes from './routes/equipment.route.js';
import bookingRoutes from './routes/booking.route.js';
import reviewRoutes from './routes/review.route.js';

const app = express();
const httpServer = createServer(app);
const API = '/api';

const allowedOrigins = process.env.CLIENT_URL?.split(',').map((s) => s.trim()) || [
  'http://localhost:3000',
  'http://localhost:5173',
];

// connect to database
connectDB();

// cors
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// body parser & cookies
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

// serve static images folder
app.use('/images', express.static(path.resolve(__dirname, 'public/images')));

// health check
app.get('/health', (req, res) => {
  res.json({
    status: 'Healthy',
    env: process.env.NODE_ENV || 'development',
    ts: new Date().toISOString(),
  });
});

// root route
app.get('/', (req, res) => {
  res.json({
    name: 'EquipLocal API',
    status: 'Running',
    env: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    ts: new Date().toISOString(),
  });
});

// api routes
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/equipment`, equipmentRoutes);
app.use(`${API}/bookings`, bookingRoutes);
app.use(`${API}/reviews`, reviewRoutes);

// error handling
app.use(notFound);
app.use(errorHandler);

// start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

export default app;
