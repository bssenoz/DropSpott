import { Router } from 'express';
import * as dropsController from '../controllers/dropsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticate, dropsController.getActiveDrops);
router.get('/:id/waitlist-status', authenticate, dropsController.getWaitlistStatus);
router.post('/:id/join', authenticate, dropsController.joinWaitlist);
router.post('/:id/leave', authenticate, dropsController.leaveWaitlist);
router.post('/:id/claim', authenticate, dropsController.claimDrop);

export default router;

