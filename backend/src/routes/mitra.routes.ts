import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMitras, getMitraById, createMitra, updateMitra, deleteMitra, getMitraSummary,
  addPakan, deletePakan,
  addBibit, deleteBibit,
  addPinjaman, lunasPinjaman, deletePinjaman,
  addPanen,
} from '../controllers/mitra.controller';

const router = Router();
router.use(authenticate);

router.get('/', getMitras);
router.post('/', createMitra);
router.get('/:id', getMitraById);
router.put('/:id', updateMitra);
router.delete('/:id', deleteMitra);
router.get('/:id/summary', getMitraSummary);

router.post('/:id/pakan', addPakan);
router.delete('/:id/pakan/:tid', deletePakan);

router.post('/:id/bibit', addBibit);
router.delete('/:id/bibit/:tid', deleteBibit);

router.post('/:id/pinjaman', addPinjaman);
router.patch('/:id/pinjaman/:tid/lunas', lunasPinjaman);
router.delete('/:id/pinjaman/:tid', deletePinjaman);

router.post('/:id/panen', addPanen);

export default router;
