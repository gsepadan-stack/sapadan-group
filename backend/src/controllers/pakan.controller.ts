import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getSuppliers = async (req: AuthRequest, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Error fetching suppliers', error });
  }
};

export const createSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address, email } = req.body;

    const supplier = await prisma.supplier.create({
      data: { name, phone, address, email },
    });

    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Error creating supplier', error });
  }
};

export const updateSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, address, email } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: { name, phone, address, email },
    });

    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Error updating supplier', error });
  }
};

export const deleteSupplier = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.supplier.delete({ where: { id } });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting supplier', error });
  }
};

export const getPurchases = async (req: AuthRequest, res: Response) => {
  try {
    const purchases = await prisma.pakanPurchase.findMany({
      include: {
        supplier: true,
      },
      orderBy: { tanggal: 'desc' },
    });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching purchases', error });
  }
};

export const createPurchase = async (req: AuthRequest, res: Response) => {
  try {
    const { supplierId, jenisPakan, jumlahKg, hargaPerKg, tanggal } = req.body;
    const totalHarga = jumlahKg * hargaPerKg;

    const purchase = await prisma.pakanPurchase.create({
      data: {
        supplierId,
        jenisPakan,
        jumlahKg,
        hargaPerKg,
        totalHarga,
        tanggal: new Date(tanggal),
      },
      include: {
        supplier: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'PakanPurchase',
        entityId: purchase.id,
        details: JSON.stringify(purchase),
      },
    });

    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ message: 'Error creating purchase', error });
  }
};

export const getPakanStock = async (req: AuthRequest, res: Response) => {
  try {
    const purchases = await prisma.pakanPurchase.groupBy({
      by: ['jenisPakan'],
      _sum: {
        jumlahKg: true,
        totalHarga: true,
      },
    });

    const feeding = await prisma.feedingLog.groupBy({
      by: ['jenisPakan'],
      _sum: {
        jumlahKg: true,
      },
    });

    const stock = purchases.map((p: any) => {
      const fed = feeding.find((f: any) => f.jenisPakan === p.jenisPakan);
      const purchased = p._sum.jumlahKg || 0;
      const used = fed?._sum.jumlahKg || 0;
      const remaining = purchased - used;

      return {
        jenisPakan: p.jenisPakan,
        purchased,
        used,
        remaining,
        totalCost: p._sum.totalHarga || 0,
      };
    });

    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock', error });
  }
};
