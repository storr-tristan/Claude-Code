import { Router } from 'express';
import { handleZoomWebhook, handleTeamsMessages } from '../controllers/workflowController.js';

const router = Router();

router.post('/zoom/webhook', handleZoomWebhook);
router.post('/teams/messages', handleTeamsMessages);

export default router;
