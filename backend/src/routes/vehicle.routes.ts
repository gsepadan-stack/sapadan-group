import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as vehicleController from '../controllers/vehicle.controller';

const router = Router();

router.use(authenticate);

router.get('/', vehicleController.getVehicles);
router.get('/stats', vehicleController.getVehicleStats);
router.get('/:id', vehicleController.getVehicleById);
router.post('/', vehicleController.createVehicle);
router.put('/:id', vehicleController.updateVehicle);
router.delete('/:id', vehicleController.deleteVehicle);

router.post('/:id/maintenance', vehicleController.addMaintenance);
router.post('/:id/fuel', vehicleController.addFuelLog);
router.post('/:id/trip', vehicleController.addTripLog);

export default router;
