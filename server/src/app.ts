import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import marketIntelligenceRoutes from './routes/marketIntelligenceRoutes';
import lotRoutes from './routes/lotRoutes';
import transactionRoutes from './routes/transactionRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import notificationRoutes from './routes/notificationRoutes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Base health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FarmSetu API Server is running', timestamp: new Date().toISOString() });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Market Intelligence Routes
app.use('/api/market-intelligence', marketIntelligenceRoutes);

// Sale Lots & Bidding Routes
app.use('/api/lots', lotRoutes);

// Transaction State Machine Routes
app.use('/api/transactions', transactionRoutes);

// Analytics Routes
app.use('/api/analytics', analyticsRoutes);

// Notification Routes
app.use('/api/notifications', notificationRoutes);

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

export default app;
