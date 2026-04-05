import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const getOrders = async (req: AuthRequest, res: Response) => {
  const { status, startDate, endDate } = req.query;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (startDate && endDate) {
    where.orderDate = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  const orders = await prisma.salesOrder.findMany({
    where,
    include: {
      items: true,
      customer: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.json(orders);
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      items: true,
      customer: true,
    },
  });

  if (!order) {
    return res.status(404).json({ message: 'Order tidak ditemukan' });
  }

  res.json(order);
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const { customerName, customerPhone, customerAddress, items, totalAmount, orderDate, deliveryDate, notes } = req.body;

  let customer = await prisma.customer.findFirst({
    where: { phone: customerPhone },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
      },
    });
  }

  const orderNumber = `ORD-${Date.now()}`;

  const order = await prisma.salesOrder.create({
    data: {
      orderNumber,
      customerId: customer.id,
      customerName,
      customerPhone,
      customerAddress,
      totalAmount,
      orderDate: new Date(orderDate),
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      notes,
      createdBy: req.user!.id,
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          pricePerKg: item.pricePerKg,
          subtotal: item.subtotal,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: 'CREATE',
      entity: 'SalesOrder',
      entityId: order.id,
      details: `Created order ${orderNumber}`,
    },
  });

  res.status(201).json(order);
};

export const updateOrder = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const order = await prisma.salesOrder.update({
    where: { id },
    data,
    include: {
      items: true,
    },
  });

  res.json(order);
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await prisma.salesOrder.update({
    where: { id },
    data: { status },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user!.id,
      action: 'UPDATE_STATUS',
      entity: 'SalesOrder',
      entityId: order.id,
      details: `Changed status to ${status}`,
    },
  });

  res.json(order);
};

export const deleteOrder = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  await prisma.salesOrder.delete({
    where: { id },
  });

  res.json({ message: 'Order berhasil dihapus' });
};
