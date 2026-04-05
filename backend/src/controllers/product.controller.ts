import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getProducts = async (req: AuthRequest, res: Response) => {
  const products = await prisma.product.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  res.json(products);
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  const { name, jenis, hargaPerKg, stokKg, deskripsi } = req.body;

  const product = await prisma.product.create({
    data: {
      name,
      jenis,
      hargaPerKg: parseFloat(hargaPerKg),
      stokKg: parseFloat(stokKg),
      deskripsi,
    },
  });

  res.status(201).json(product);
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, jenis, hargaPerKg, stokKg, deskripsi } = req.body;

  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      jenis,
      hargaPerKg: parseFloat(hargaPerKg),
      stokKg: parseFloat(stokKg),
      deskripsi,
    },
  });

  res.json(product);
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  await prisma.product.delete({
    where: { id },
  });

  res.json({ message: 'Produk berhasil dihapus' });
};
