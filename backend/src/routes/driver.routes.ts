import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as driverController from '../controllers/driver.controller';

const router = Router();

router.use(authenticate);

// Driver routes
router.get('/trip/active', driverController.getActiveTrip);
router.post('/trip/start', driverController.startTrip);
router.post('/trip/:id/end', driverController.endTrip);
router.post('/trip/:id/pod', driverController.submitPOD);
router.post('/location', driverController.sendLocation);
router.get('/trip/history', driverController.getTripHistory);
router.get('/trips', driverController.getTripHistory);

// Admin routes
router.get('/trips/active', driverController.getActiveTrips);
router.get('/trip/:id/locations', driverController.getTripLocations);

export default router;
