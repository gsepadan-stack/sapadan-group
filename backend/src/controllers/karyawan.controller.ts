import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getKaryawans = async (req: AuthRequest, res: Response) => {
  try {
    const karyawans = await prisma.karyawan.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(karyawans);
  } catch (error) {
    console.error('Error fetching karyawans:', error);
    res.status(500).json({ message: 'Error fetching karyawans', error });
  }
};

export const getKaryawanById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const karyawan = await prisma.karyawan.findUnique({
      where: { id },
      include: {
        payrolls: { orderBy: { createdAt: 'desc' } },
        lemburs: { orderBy: { tanggal: 'desc' } },
      },
    });

    if (!karyawan) {
      return res.status(404).json({ message: 'Karyawan not found' });
    }

    res.json(karyawan);
  } catch (error) {
    console.error('Error fetching karyawan:', error);
    res.status(500).json({ message: 'Error fetching karyawan', error });
  }
};

export const createKaryawan = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address, position, gajiPokok } = req.body;

    const karyawan = await prisma.karyawan.create({
      data: { name, phone, address, position, gajiPokok },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Karyawan',
        entityId: karyawan.id,
        details: JSON.stringify(karyawan),
      },
    });

    res.status(201).json(karyawan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating karyawan', error });
  }
};

export const updateKaryawan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, address, position, gajiPokok } = req.body;

    const karyawan = await prisma.karyawan.update({
      where: { id },
      data: { name, phone, address, position, gajiPokok },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Karyawan',
        entityId: karyawan.id,
        details: JSON.stringify(karyawan),
      },
    });

    res.json(karyawan);
  } catch (error) {
    res.status(500).json({ message: 'Error updating karyawan', error });
  }
};

export const deleteKaryawan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.karyawan.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'Karyawan',
        entityId: id,
      },
    });

    res.json({ message: 'Karyawan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting karyawan', error });
  }
};

export const getPayrolls = async (req: AuthRequest, res: Response) => {
  try {
    const { bulan, tahun } = req.query;
    const where: any = {};

    if (bulan) where.bulan = bulan;
    if (tahun) where.tahun = parseInt(tahun as string);

    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        karyawan: true,
      },
      orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
    });

    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payrolls', error });
  }
};

export const generatePayroll = async (req: AuthRequest, res: Response) => {
  try {
    const { karyawanId, bulan, tahun, tunjangan, potongan } = req.body;

    const karyawan = await prisma.karyawan.findUnique({
      where: { id: karyawanId },
    });

    if (!karyawan) {
      return res.status(404).json({ message: 'Karyawan not found' });
    }

    // Calculate lembur for the month
    const lemburTotal = await prisma.lembur.aggregate({
      where: {
        karyawanId,
        approved: true,
        tanggal: {
          gte: new Date(`${tahun}-${bulan}-01`),
          lt: new Date(`${tahun}-${parseInt(bulan) + 1}-01`),
        },
      },
      _sum: {
        totalUpah: true,
      },
    });

    const totalGaji =
      karyawan.gajiPokok +
      (tunjangan || 0) +
      (lemburTotal._sum.totalUpah || 0) -
      (potongan || 0);

    const payroll = await prisma.payroll.create({
      data: {
        karyawanId,
        bulan,
        tahun,
        gajiPokok: karyawan.gajiPokok,
        tunjangan: tunjangan || 0,
        potongan: potongan || 0,
        totalGaji,
      },
      include: {
        karyawan: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Payroll',
        entityId: payroll.id,
        details: JSON.stringify(payroll),
      },
    });

    res.status(201).json(payroll);
  } catch (error) {
    res.status(500).json({ message: 'Error generating payroll', error });
  }
};

export const getLemburs = async (req: AuthRequest, res: Response) => {
  try {
    const { approved } = req.query;
    const where: any = {};

    if (approved !== undefined) {
      where.approved = approved === 'true';
    }

    const lemburs = await prisma.lembur.findMany({
      where,
      include: {
        karyawan: true,
      },
      orderBy: { tanggal: 'desc' },
    });

    res.json(lemburs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lemburs', error });
  }
};

export const createLembur = async (req: AuthRequest, res: Response) => {
  try {
    const { karyawanId, tanggal, jamMulai, jamSelesai, upahPerJam } = req.body;

    // Calculate total hours
    const start = new Date(`2000-01-01 ${jamMulai}`);
    const end = new Date(`2000-01-01 ${jamSelesai}`);
    const totalJam = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    const totalUpah = totalJam * upahPerJam;

    const lembur = await prisma.lembur.create({
      data: {
        karyawanId,
        tanggal: new Date(tanggal),
        jamMulai,
        jamSelesai,
        totalJam,
        upahPerJam,
        totalUpah,
      },
      include: {
        karyawan: true,
      },
    });

    res.status(201).json(lembur);
  } catch (error) {
    res.status(500).json({ message: 'Error creating lembur', error });
  }
};

export const approveLembur = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const lembur = await prisma.lembur.update({
      where: { id },
      data: {
        approved: true,
        approvedBy: req.user!.id,
      },
      include: {
        karyawan: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'APPROVE',
        entity: 'Lembur',
        entityId: lembur.id,
        details: JSON.stringify(lembur),
      },
    });

    res.json(lembur);
  } catch (error) {
    res.status(500).json({ message: 'Error approving lembur', error });
  }
};
