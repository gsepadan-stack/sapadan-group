import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getCustomers = async (req: AuthRequest, res: Response) => {
  const customers = await prisma.customer.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  res.json(customers);
};

export const getCustomerById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      salesOrders: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!customer) {
    return res.status(404).json({ message: 'Customer tidak ditemukan' });
  }

  res.json(customer);
};

export const createCustomer = async (req: AuthRequest, res: Response) => {
  const { name, phone, address, email } = req.body;

  const customer = await prisma.customer.create({
    data: {
      name,
      phone,
      address,
      email,
    },
  });

  res.status(201).json(customer);
};

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, phone, address, email } = req.body;

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name,
      phone,
      address,
      email,
    },
  });

  res.json(customer);
};

export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  await prisma.customer.delete({
    where: { id },
  });

  res.json({ message: 'Customer berhasil dihapus' });
};
