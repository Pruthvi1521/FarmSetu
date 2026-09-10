import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import marketIntelligenceRoutes from './routes/marketIntelligenceRoutes';
import lotRoutes from './routes/lotRoutes';
import transactionRoutes from './routes/transactionRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import notificationRoutes from './routes/notificationRoutes';

const app = express();

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim())
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://localhost:5000'
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy error: Origin ${origin} is not allowed.`));
    },
    credentials: true
  })
);
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

// Global Express Error Handler (Guarantees structured JSON error responses instead of HTML)
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(`❌ Global Server Error on ${req.method} ${req.url}:`, err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error occurred.'
  });
});

export default app;
