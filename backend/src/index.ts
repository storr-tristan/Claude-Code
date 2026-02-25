import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { initDatabase } from './services/database.js';
import { initWorkflowHandlers } from './services/workflowService.js';

// Initialize database
initDatabase();

// Initialize workflow card submission handlers
initWorkflowHandlers();

const app = express();

// Raw body capture for Zoom webhook signature verification (must be before express.json())
app.use('/api/zoom/webhook', express.json({
  verify: (req: express.Request, _res: express.Response, buf: Buffer) => {
    (req as express.Request & { rawBody?: string }).rawBody = buf.toString();
  },
}));

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HubSpot Metrics API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      accounts: '/api/accounts/:platform',
      metrics: '/api/metrics (POST)',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    details: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🌐 CORS origin: ${config.corsOrigin}`);
});
