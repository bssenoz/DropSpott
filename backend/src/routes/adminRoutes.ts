import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// admin kontrolü gerekli
router.use(authenticate);
router.use(requireAdmin);

router.get('/drops', adminController.getAllDrops);
router.post('/drops', adminController.createDrop);
router.put('/drops/:id', adminController.updateDrop);
router.delete('/drops/:id', adminController.deleteDrop);

export default router;