import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Get active trip for driver
export const getActiveTrip = async (req: AuthRequest, res: Response) => {
  try {
    const driverId = req.user!.id;

    const activeTrip = await prisma.tripLog.findFirst({
      where: {
        driverId,
        status: 'ONGOING',
      },
      include: {
        vehicle: true,
        locationLogs: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    res.json(activeTrip);
  } catch (error) {
    console.error('Error fetching active trip:', error);
    res.status(500).json({ message: 'Error fetching active trip', error });
  }
};

// Start trip
export const startTrip = async (req: AuthRequest, res: Response) => {
  try {
    const driverId = req.user!.id;
    const { vehicleId, tujuan, kmAwal, muatan } = req.body;

    const trip = await prisma.tripLog.create({
      data: {
        vehicleId,
        driverId,
        tanggal: new Date(),
        tujuan,
        kmAwal,
        kmAkhir: kmAwal,
        totalKm: 0,
        muatan,
        status: 'ONGOING',
        startTime: new Date(),
      },
      include: {
        vehicle: true,
      },
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error('Error starting trip:', error);
    res.status(500).json({ message: 'Error starting trip', error });
  }
};

// End trip
export const endTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { kmAkhir, catatan } = req.body;

    const trip = await prisma.tripLog.findUnique({
      where: { id },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const totalKm = kmAkhir - trip.kmAwal;

    const updatedTrip = await prisma.tripLog.update({
      where: { id },
      data: {
        kmAkhir,
        totalKm,
        catatan,
        status: 'COMPLETED',
        endTime: new Date(),
      },
      include: {
        vehicle: true,
      },
    });

    res.json(updatedTrip);
  } catch (error) {
    console.error('Error ending trip:', error);
    res.status(500).json({ message: 'Error ending trip', error });
  }
};

// Proof of Delivery - driver upload foto bukti
export const submitPOD = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { podPhoto, podNote, kmAkhir } = req.body;

    const trip = await prisma.tripLog.findUnique({ where: { id } });
    if (!trip) return res.status(404).json({ message: 'Trip tidak ditemukan' });

    const totalKm = kmAkhir ? Number(kmAkhir) - trip.kmAwal : trip.totalKm;

    const updated = await prisma.tripLog.update({
      where: { id },
      data: {
        podPhoto,
        podNote,
        podTime: new Date(),
        status: 'DELIVERED',
        kmAkhir: kmAkhir ? Number(kmAkhir) : trip.kmAkhir,
        totalKm: totalKm || 0,
        endTime: new Date(),
      } as any,
      include: { vehicle: true, driver: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error submitting POD:', error);
    res.status(500).json({ message: 'Error submitting POD', error });
  }
};

// Send location update
export const sendLocation = async (req: AuthRequest, res: Response) => {
  try {
    const { tripLogId, latitude, longitude, accuracy, speed } = req.body;

    const location = await prisma.locationLog.create({
      data: {
        tripLogId,
        latitude,
        longitude,
        accuracy,
        speed,
      },
    });

    res.status(201).json(location);
  } catch (error) {
    console.error('Error sending location:', error);
    res.status(500).json({ message: 'Error sending location', error });
  }
};

// Get trip history for driver
export const getTripHistory = async (req: AuthRequest, res: Response) => {
  try {
    const driverId = req.user!.id;

    const trips = await prisma.tripLog.findMany({
      where: { driverId },
      include: {
        vehicle: true,
      },
      orderBy: { tanggal: 'desc' },
      take: 20,
    });

    res.json(trips);
  } catch (error) {
    console.error('Error fetching trip history:', error);
    res.status(500).json({ message: 'Error fetching trip history', error });
  }
};

// Get location history for a trip (for admin)
export const getTripLocations = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const locations = await prisma.locationLog.findMany({
      where: { tripLogId: id },
      orderBy: { timestamp: 'asc' },
    });

    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Error fetching locations', error });
  }
};

// Get all active trips (for admin)
export const getActiveTrips = async (req: AuthRequest, res: Response) => {
  try {
    const activeTrips = await prisma.tripLog.findMany({
      where: { status: 'ONGOING' },
      include: {
        vehicle: true,
        driver: true,
        locationLogs: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    res.json(activeTrips);
  } catch (error) {
    console.error('Error fetching active trips:', error);
    res.status(500).json({ message: 'Error fetching active trips', error });
  }
};
