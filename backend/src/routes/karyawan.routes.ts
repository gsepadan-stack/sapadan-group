import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as karyawanController from '../controllers/karyawan.controller';

const router = Router();

router.use(authenticate);

router.get('/', karyawanController.getKaryawans);
router.get('/:id', karyawanController.getKaryawanById);
router.post('/', karyawanController.createKaryawan);
router.put('/:id', karyawanController.updateKaryawan);
router.delete('/:id', karyawanController.deleteKaryawan);

router.get('/payroll/list', karyawanController.getPayrolls);
router.post('/payroll/generate', karyawanController.generatePayroll);

router.get('/lembur/list', karyawanController.getLemburs);
router.post('/lembur', karyawanController.createLembur);
router.patch('/lembur/:id/approve', karyawanController.approveLembur);

export default router;
