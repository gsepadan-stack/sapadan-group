import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getKolams = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Fetching kolams...');
    const kolams = await prisma.kolam.findMany({
      orderBy: { createdAt: 'desc' },
    });
    console.log('Found kolams:', kolams.length);
    res.json(kolams);
  } catch (error: any) {
    console.error('Error fetching kolams:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching kolams', error: error.message });
  }
};

export const getKolamById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const kolam = await prisma.kolam.findUnique({
      where: { id },
      include: {
        feedingLogs: { orderBy: { tanggal: 'desc' } },
        healthLogs: { orderBy: { tanggal: 'desc' } },
      },
    });

    if (!kolam) {
      return res.status(404).json({ message: 'Kolam not found' });
    }

    res.json(kolam);
  } catch (error) {
    console.error('Error fetching kolam:', error);
    res.status(500).json({ message: 'Error fetching kolam', error });
  }
};

export const createKolam = async (req: AuthRequest, res: Response) => {
  try {
    const { name, jenisIkan, jumlahIkan, cabangId } = req.body;

    const kolam = await prisma.kolam.create({
      data: {
        name,
        jenisIkan,
        jumlahIkan,
        cabangId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Kolam',
        entityId: kolam.id,
        details: JSON.stringify(kolam),
      },
    });

    res.status(201).json(kolam);
  } catch (error) {
    res.status(500).json({ message: 'Error creating kolam', error });
  }
};

export const updateKolam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, jenisIkan, jumlahIkan, mortalitas, cabangId } = req.body;

    const kolam = await prisma.kolam.update({
      where: { id },
      data: {
        name,
        jenisIkan,
        jumlahIkan,
        mortalitas,
        cabangId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Kolam',
        entityId: kolam.id,
        details: JSON.stringify(kolam),
      },
    });

    res.json(kolam);
  } catch (error) {
    res.status(500).json({ message: 'Error updating kolam', error });
  }
};

export const deleteKolam = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.kolam.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'Kolam',
        entityId: id,
      },
    });

    res.json({ message: 'Kolam deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting kolam', error });
  }
};

export const addFeedingLog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { jumlahKg, jenisPakan, tanggal, catatan } = req.body;

    const feedingLog = await prisma.feedingLog.create({
      data: {
        kolamId: id,
        jumlahKg,
        jenisPakan,
        tanggal: new Date(tanggal),
        catatan,
      },
    });

    res.status(201).json(feedingLog);
  } catch (error) {
    res.status(500).json({ message: 'Error adding feeding log', error });
  }
};

export const addHealthLog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tanggal, kondisi, catatan } = req.body;

    const healthLog = await prisma.healthLog.create({
      data: {
        kolamId: id,
        tanggal: new Date(tanggal),
        kondisi,
        catatan,
      },
    });

    res.status(201).json(healthLog);
  } catch (error) {
    res.status(500).json({ message: 'Error adding health log', error });
  }
};
