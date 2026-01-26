import express from 'express';
import { 
  updateBinFillLevel, 
  getEscalationDashboard, 
  acknowledgeEscalation 
} from '../controllers/Escalation_controller.js';

const router = express.Router();

// 🔥 IoT Sensor Webhook - Real-time fill level updates
router.post('/bin/update', updateBinFillLevel);

// 🔥 Dashboard - Get all critical/escalated bins
router.get('/dashboard', getEscalationDashboard);

// 🔥 Acknowledge - Mark as handled
router.post('/acknowledge', acknowledgeEscalation);

// 🔥 Get single bin escalation status
router.get('/bin/:id/status', async (req, res) => {
  const status = await EscalationService.getEscalationStatus(req.params.id);
  res.json({ success: true, status });
});

export default router;
