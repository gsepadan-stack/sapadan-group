import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as pakanController from '../controllers/pakan.controller';

const router = Router();

router.use(authenticate);

router.get('/suppliers', pakanController.getSuppliers);
router.post('/suppliers', pakanController.createSupplier);
router.put('/suppliers/:id', pakanController.updateSupplier);
router.delete('/suppliers/:id', pakanController.deleteSupplier);

router.get('/purchases', pakanController.getPurchases);
router.post('/purchases', pakanController.createPurchase);

router.get('/stock', pakanController.getPakanStock);

export default router;
