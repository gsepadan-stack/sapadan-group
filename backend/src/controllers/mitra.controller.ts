import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// ── List semua mitra (20 slot) ──────────────────────────────────────────────
export const getMitras = async (req: AuthRequest, res: Response) => {
  try {
    const mitras = await prisma.mitraPetani.findMany({
      orderBy: { nomorSlot: 'asc' },
      include: {
        transaksiPakan: true,
        transaksiPibit: true,
        transaksiPinjaman: true,
        transaksiPanen: { orderBy: { tanggal: 'desc' }, take: 1 },
      },
    });
    res.json(mitras);
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e });
  }
};

// ── Detail satu mitra ───────────────────────────────────────────────────────
export const getMitraById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const mitra = await prisma.mitraPetani.findUnique({
      where: { id },
      include: {
        transaksiPakan: { orderBy: { tanggal: 'desc' } },
        transaksiPibit: { orderBy: { tanggal: 'desc' } },
        transaksiPinjaman: { orderBy: { tanggal: 'desc' } },
        transaksiPanen: { orderBy: { tanggal: 'desc' } },
      },
    });
    if (!mitra) return res.status(404).json({ message: 'Mitra tidak ditemukan' });
    res.json(mitra);
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e });
  }
};

// ── Buat mitra baru ─────────────────────────────────────────────────────────
export const createMitra = async (req: AuthRequest, res: Response) => {
  try {
    const { nomorSlot, name, phone, address, jenisIkan, luasKolam } = req.body;
    const count = await prisma.mitraPetani.count();
    if (count >= 20) return res.status(400).json({ message: 'Maksimal 20 slot mitra' });

    const mitra = await prisma.mitraPetani.create({
      data: { nomorSlot: Number(nomorSlot), name, phone, address, jenisIkan, luasKolam: Number(luasKolam || 0) },
    });
    res.status(201).json(mitra);
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(400).json({ message: `Slot ${req.body.nomorSlot} sudah terpakai` });
    res.status(500).json({ message: 'Error', error: e });
  }
};

// ── Update mitra ────────────────────────────────────────────────────────────
export const updateMitra = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, address, jenisIkan, luasKolam, status } = req.body;
    const mitra = await prisma.mitraPetani.update({
      where: { id },
      data: { name, phone, address, jenisIkan, luasKolam: Number(luasKolam || 0), status },
    });
    res.json(mitra);
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e });
  }
};

// ── Hapus mitra ─────────────────────────────────────────────────────────────
export const deleteMitra = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.mitraPetani.delete({ where: { id: req.params.id } });
    res.json({ message: 'Mitra dihapus' });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e });
  }
};

// ── Ringkasan hutang mitra ──────────────────────────────────────────────────
export const getMitraSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [pakan, bibit, pinjaman] = await Promise.all([
      prisma.mitraTransaksiPakan.aggregate({ _sum: { totalHarga: true }, where: { mitraId: id } }),
      prisma.mitraTransaksiBibit.aggregate({ _sum: { totalHarga: true }, where: { mitraId: id } }),
      prisma.mitraTransaksiPinjaman.aggregate({ _sum: { jumlah: true }, where: { mitraId: id, lunas: false } }),
    ]);
    const totalPanen = await prisma.mitraTransaksiPanen.aggregate({ _sum: { totalHasilPanen: true }, where: { mitraId: id } });

    const totalHutang =
      (pakan._sum.totalHarga || 0) +
      (bibit._sum.totalHarga || 0) +
      (pinjaman._sum.jumlah || 0);

    res.json({
      totalPakan: pakan._sum.totalHarga || 0,
      totalBibit: bibit._sum.totalHarga || 0,
      totalPinjaman: pinjaman._sum.jumlah || 0,
      totalHutang,
      totalPanen: totalPanen._sum.totalHasilPanen || 0,
      saldoBersih: (totalPanen._sum.totalHasilPanen || 0) - totalHutang,
    });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e });
  }
};

// ── Transaksi Pakan ─────────────────────────────────────────────────────────
export const addPakan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tanggal, jenisPakan, jumlahKg, hargaPerKg, catatan } = req.body;
    const totalHarga = Number(jumlahKg) * Number(hargaPerKg);
    const t = await prisma.mitraTransaksiPakan.create({
      data: { mitraId: id, tanggal: new Date(tanggal), jenisPakan, jumlahKg: Number(jumlahKg), hargaPerKg: Number(hargaPerKg), totalHarga, catatan },
    });
    res.status(201).json(t);
  } catch (e) { res.status(500).json({ message: 'Error', error: e }); }
};

export const deletePakan = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.mitraTransaksiPakan.delete({ where: { id: req.params.tid } });
    res.json({ message: 'Dihapus' });
  } catch (e) { res.status(500).json({ message: 'Error', error: e }); }
};

// ── Transaksi Bibit ─────────────────────────────────────────────────────────
export const addBibit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tanggal, jenisIkan, jumlahEkor, hargaPerEkor, catatan } = req.body;
    const totalHarga = Number(jumlahEkor) * Number(hargaPerEkor);
    const t = await prisma.mitraTransaksiBibit.create({
      data: { mitraId: id, tanggal: new Date(tanggal), jenisIkan, jumlahEkor: Number(jumlahEkor), hargaPerEkor: Number(hargaPerEkor), totalHarga, catatan },
    });
    res.status(201).json(t);
  } catch (e) { res.status(500).json({ message: 'Error', error: e }); }
};

export const deleteBibit = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.mitraTransaksiBibit.delete({ where: { id: req.params.tid } });
    res.json({ message: 'Dihapus' });
  } catch (e) { res.status(500).json({ message: 'Error', error: e }); }
};

// ── Transaksi Pinjaman ──────────────────────────────────────────────────────
export const addPinjaman = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tanggal, jumlah, keterangan } = req.body;
    const t = await prisma.mitraTransaksiPinjaman.create({
      data: { mitraId: id, tanggal: new Date(tanggal), jumlah: Number(jumlah), keterangan },
    });
    res.status(201).json(t);
  } catch (e) { res.status(500).json({ message: 'Error', error: e }); }
};

export const lunasPinjaman = async (req: AuthRequest, res: Response) => {
  try {
    const t = await prisma.mitraTransaksiPinjaman.update({
      where: { id: req.params.tid }, data: { lunas: true },
    });
    res.json(t);
  } catch (e) { res.status(500).json({ message: 'Error', error: e }); }
};

export const deletePinjaman = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.mitraTransaksiPinjaman.delete({ where: { id: req.params.tid } });
    res.json({ message: 'Dihapus' });
  } catch (e) { res.status(500).json({ message: 'Error', error: e }); }
};

// ── Transaksi Panen ─────────────────────────────────────────────────────────
export const addPanen = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tanggal, jumlahKg, hargaPerKg, catatan } = req.body;

    // Hitung total hutang saat ini
    const [pakan, bibit, pinjaman] = await Promise.all([
      prisma.mitraTransaksiPakan.aggregate({ _sum: { totalHarga: true }, where: { mitraId: id } }),
      prisma.mitraTransaksiBibit.aggregate({ _sum: { totalHarga: true }, where: { mitraId: id } }),
      prisma.mitraTransaksiPinjaman.aggregate({ _sum: { jumlah: true }, where: { mitraId: id, lunas: false } }),
    ]);

    const totalHutang =
      (pakan._sum.totalHarga || 0) +
      (bibit._sum.totalHarga || 0) +
      (pinjaman._sum.jumlah || 0);

    const totalHasilPanen = Number(jumlahKg) * Number(hargaPerKg);
    const saldoBersih = totalHasilPanen - totalHutang;

    const t = await prisma.mitraTransaksiPanen.create({
      data: {
        mitraId: id,
        tanggal: new Date(tanggal),
        jumlahKg: Number(jumlahKg),
        hargaPerKg: Number(hargaPerKg),
        totalHasilPanen,
        totalHutang,
        saldoBersih,
        catatan,
      },
    });

    // Tandai semua pinjaman lunas setelah panen
    await prisma.mitraTransaksiPinjaman.updateMany({
      where: { mitraId: id, lunas: false },
      data: { lunas: true },
    });

    // Update status mitra ke AKTIF kembali
    await prisma.mitraPetani.update({ where: { id }, data: { status: 'AKTIF' } });

    res.status(201).json(t);
  } catch (e) { res.status(500).json({ message: 'Error', error: e }); }
};
