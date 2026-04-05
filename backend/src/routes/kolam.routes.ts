import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as kolamController from '../controllers/kolam.controller';

const router = Router();

router.use(authenticate);

router.get('/', kolamController.getKolams);
router.get('/:id', kolamController.getKolamById);
router.post('/', kolamController.createKolam);
router.put('/:id', kolamController.updateKolam);
router.delete('/:id', kolamController.deleteKolam);
router.post('/:id/feeding', kolamController.addFeedingLog);
router.post('/:id/health', kolamController.addHealthLog);

export default router;
