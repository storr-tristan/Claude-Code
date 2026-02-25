import { Router } from 'express';
import { getAccounts, getMetrics } from '../controllers/metricsController.js';
import workflowRoutes from './workflowRoutes.js';

const router = Router();

/**
 * GET /api/accounts/:platform
 * Fetch all accounts for a specific platform
 */
router.get('/accounts/:platform', getAccounts);

/**
 * POST /api/metrics
 * Fetch metrics for a specific account and date range
 */
router.post('/metrics', getMetrics);

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'HubSpot Metrics API is running',
  });
});

// Workflow routes (Zoom webhook, Teams bot)
router.use(workflowRoutes);

export default router;
