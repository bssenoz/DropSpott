import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import * as aiController from '../controllers/aiController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// admin kontrolü gerekli
router.use(authenticate);
router.use(requireAdmin);

router.post('/drops', adminController.createDrop);
router.put('/drops/:id', adminController.updateDrop);
router.delete('/drops/:id', adminController.deleteDrop);

// AI
router.post('/ai/suggest-description', aiController.suggestDescription);

export default router;