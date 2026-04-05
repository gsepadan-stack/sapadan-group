import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// Vehicles
export const getVehicles = async (req: AuthRequest, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { platNomor: 'asc' },
    });
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Error fetching vehicles', error });
  }
};

export const getVehicleById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        maintenances: { orderBy: { tanggal: 'desc' }, take: 10 },
        fuelLogs: { orderBy: { tanggal: 'desc' }, take: 10 },
        tripLogs: { 
          orderBy: { tanggal: 'desc' }, 
          take: 10,
          include: { driver: true }
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ message: 'Error fetching vehicle', error });
  }
};

export const createVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { platNomor, merk, model, tahun, jenis, kapasitas, cabangId } = req.body;

    const vehicle = await prisma.vehicle.create({
      data: {
        platNomor,
        merk,
        model,
        tahun,
        jenis,
        kapasitas,
        cabangId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Vehicle',
        entityId: vehicle.id,
        details: JSON.stringify(vehicle),
      },
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ message: 'Error creating vehicle', error });
  }
};

export const updateVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { platNomor, merk, model, tahun, jenis, kapasitas, statusAktif, cabangId } = req.body;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        platNomor,
        merk,
        model,
        tahun,
        jenis,
        kapasitas,
        statusAktif,
        cabangId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Vehicle',
        entityId: vehicle.id,
        details: JSON.stringify(vehicle),
      },
    });

    res.json(vehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ message: 'Error updating vehicle', error });
  }
};

export const deleteVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.vehicle.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'Vehicle',
        entityId: id,
      },
    });

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ message: 'Error deleting vehicle', error });
  }
};

// Maintenance
export const addMaintenance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tanggal, jenis, deskripsi, biaya, kilometer, bengkel } = req.body;

    const maintenance = await prisma.maintenance.create({
      data: {
        vehicleId: id,
        tanggal: new Date(tanggal),
        jenis,
        deskripsi,
        biaya,
        kilometer,
        bengkel,
      },
    });

    res.status(201).json(maintenance);
  } catch (error) {
    console.error('Error adding maintenance:', error);
    res.status(500).json({ message: 'Error adding maintenance', error });
  }
};

// Fuel Log
export const addFuelLog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tanggal, jumlahLiter, hargaPerLiter, kilometer, lokasiPengisian } = req.body;
    const totalBiaya = jumlahLiter * hargaPerLiter;

    const fuelLog = await prisma.fuelLog.create({
      data: {
        vehicleId: id,
        tanggal: new Date(tanggal),
        jumlahLiter,
        hargaPerLiter,
        totalBiaya,
        kilometer,
        lokasiPengisian,
      },
    });

    res.status(201).json(fuelLog);
  } catch (error) {
    console.error('Error adding fuel log:', error);
    res.status(500).json({ message: 'Error adding fuel log', error });
  }
};

// Trip Log
export const addTripLog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { driverId, tanggal, tujuan, kmAwal, kmAkhir, muatan, catatan } = req.body;
    const totalKm = kmAkhir - kmAwal;

    const tripLog = await prisma.tripLog.create({
      data: {
        vehicleId: id,
        driverId,
        tanggal: new Date(tanggal),
        tujuan,
        kmAwal,
        kmAkhir,
        totalKm,
        muatan,
        catatan,
      },
      include: {
        driver: true,
      },
    });

    res.status(201).json(tripLog);
  } catch (error) {
    console.error('Error adding trip log:', error);
    res.status(500).json({ message: 'Error adding trip log', error });
  }
};

// Statistics
export const getVehicleStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalVehicles = await prisma.vehicle.count();
    const activeVehicles = await prisma.vehicle.count({
      where: { statusAktif: true },
    });

    const totalFuelCost = await prisma.fuelLog.aggregate({
      _sum: { totalBiaya: true },
    });

    const totalMaintenanceCost = await prisma.maintenance.aggregate({
      _sum: { biaya: true },
    });

    const totalTrips = await prisma.tripLog.count();
    const totalKm = await prisma.tripLog.aggregate({
      _sum: { totalKm: true },
    });

    res.json({
      totalVehicles,
      activeVehicles,
      inactiveVehicles: totalVehicles - activeVehicles,
      totalFuelCost: totalFuelCost._sum.totalBiaya || 0,
      totalMaintenanceCost: totalMaintenanceCost._sum.biaya || 0,
      totalTrips,
      totalKm: totalKm._sum.totalKm || 0,
    });
  } catch (error) {
    console.error('Error fetching vehicle stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};
