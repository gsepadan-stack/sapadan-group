import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

const getPeriodRange = (period: string, startDate?: string, endDate?: string): { start: Date; end: Date } => {
  if (period === 'custom' && startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  let start = new Date(now);

  if (period === 'daily') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  }

  return { start, end };
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const period = (req.query.period as string) || 'monthly';
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const { start, end } = getPeriodRange(period, startDate, endDate);

    const dateFilter = { gte: start, lte: end };

    const salesSum = await prisma.salesOrder.aggregate({
      _sum: { totalAmount: true },
      where: { status: 'SELESAI', orderDate: dateFilter },
    });

    const totalOrder = await prisma.salesOrder.count({
      where: { orderDate: dateFilter },
    });

    const pendingOrder = await prisma.salesOrder.count({
      where: { status: 'PENDING', orderDate: dateFilter },
    });

    const allTimeSales = await prisma.salesOrder.aggregate({
      _sum: { totalAmount: true },
      where: { status: 'SELESAI' },
    });

    const allTimeTotalOrder = await prisma.salesOrder.count();
    const allTimePendingOrder = await prisma.salesOrder.count({ where: { status: 'PENDING' } });

    const kolamStats = await prisma.kolam.aggregate({
      _sum: { mortalitas: true, jumlahIkan: true },
    });
    const mortalitasRate = kolamStats._sum.jumlahIkan
      ? ((kolamStats._sum.mortalitas || 0) / kolamStats._sum.jumlahIkan) * 100
      : 0;

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const pakanCost = await prisma.pakanPurchase.aggregate({
      _sum: { totalHarga: true },
      where: { tanggal: { gte: monthStart } },
    });

    const chartData = await getChartData(period, start, end);

    const recentOrders = await prisma.salesOrder.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { createdByUser: { select: { name: true } } },
    });

    const topProducts = await prisma.orderItem.groupBy({
      by: ['productName'],
      _sum: { subtotal: true, quantity: true },
      orderBy: { _sum: { subtotal: 'desc' } },
      take: 5,
    });

    const totalPenjualan = salesSum._sum.totalAmount || 0;

    res.json({
      period,
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      periodStats: {
        totalPenjualan,
        totalProfit: totalPenjualan * 0.3,
        totalOrder,
        pendingOrder,
      },
      allTime: {
        totalPenjualan: allTimeSales._sum.totalAmount || 0,
        totalProfit: (allTimeSales._sum.totalAmount || 0) * 0.3,
        totalOrder: allTimeTotalOrder,
        pendingOrder: allTimePendingOrder,
      },
      mortalitasRate: parseFloat(mortalitasRate.toFixed(2)),
      biayaPakan: pakanCost._sum.totalHarga || 0,
      chartData,
      recentOrders,
      topProducts,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error });
  }
};

async function getChartData(period: string, start: Date, end: Date) {
  const data: { label: string; penjualan: number; profit: number; order: number }[] = [];

  if (period === 'custom') {
    // Split range into daily points (max 31 days)
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const step = diffDays <= 31 ? 1 : Math.ceil(diffDays / 31);

    for (let i = 0; i < diffDays; i += step) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);

      const result = await prisma.salesOrder.aggregate({
        _sum: { totalAmount: true },
        _count: true,
        where: { status: 'SELESAI', orderDate: { gte: dayStart, lte: dayEnd } },
      });

      const penjualan = result._sum.totalAmount || 0;
      data.push({
        label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        penjualan,
        profit: penjualan * 0.3,
        order: result._count,
      });
    }
    return data;
  }

  const now = new Date();

  if (period === 'daily') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const s = new Date(d); s.setHours(0, 0, 0, 0);
      const e = new Date(d); e.setHours(23, 59, 59, 999);
      const result = await prisma.salesOrder.aggregate({
        _sum: { totalAmount: true }, _count: true,
        where: { status: 'SELESAI', orderDate: { gte: s, lte: e } },
      });
      const penjualan = result._sum.totalAmount || 0;
      data.push({ label: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }), penjualan, profit: penjualan * 0.3, order: result._count });
    }
  } else if (period === 'weekly') {
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      const result = await prisma.salesOrder.aggregate({
        _sum: { totalAmount: true }, _count: true,
        where: { status: 'SELESAI', orderDate: { gte: weekStart, lte: weekEnd } },
      });
      const penjualan = result._sum.totalAmount || 0;
      data.push({ label: `Minggu ${4 - i}`, penjualan, profit: penjualan * 0.3, order: result._count });
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const result = await prisma.salesOrder.aggregate({
        _sum: { totalAmount: true }, _count: true,
        where: { status: 'SELESAI', orderDate: { gte: monthStart, lte: monthEnd } },
      });
      const penjualan = result._sum.totalAmount || 0;
      data.push({ label: monthStart.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }), penjualan, profit: penjualan * 0.3, order: result._count });
    }
  }

  return data;
}
