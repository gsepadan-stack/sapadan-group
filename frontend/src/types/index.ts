export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  STAFF = 'STAFF',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  DIPROSES = 'DIPROSES',
  DIKIRIM = 'DIKIRIM',
  SELESAI = 'SELESAI',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  cabangId?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface Product {
  id: string;
  name: string;
  jenis: string;
  hargaPerKg: number;
  stokKg: number;
  deskripsi?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  pricePerKg: number;
  subtotal: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
}

export interface DashboardStats {
  totalPenjualan: number;
  totalProfit: number;
  totalOrder: number;
  pendingOrder: number;
  mortalitasRate: number;
  biayaPakan: number;
}

export interface Kolam {
  id: string;
  name: string;
  jenisIkan: string;
  jumlahIkan: number;
  mortalitas: number;
  cabangId?: string;
  createdAt: string;
  updatedAt: string;
  feedingLogs?: FeedingLog[];
  healthLogs?: HealthLog[];
}

export interface FeedingLog {
  id: string;
  kolamId: string;
  jumlahKg: number;
  jenisPakan: string;
  tanggal: string;
  catatan?: string;
  createdAt: string;
}

export interface HealthLog {
  id: string;
  kolamId: string;
  tanggal: string;
  kondisi: string;
  catatan?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PakanPurchase {
  id: string;
  supplierId: string;
  supplier?: Supplier;
  jenisPakan: string;
  jumlahKg: number;
  hargaPerKg: number;
  totalHarga: number;
  tanggal: string;
  createdAt: string;
}

export interface PakanStock {
  jenisPakan: string;
  purchased: number;
  used: number;
  remaining: number;
  totalCost: number;
}

export interface Karyawan {
  id: string;
  name: string;
  phone: string;
  address: string;
  position: string;
  gajiPokok: number;
  createdAt: string;
  updatedAt: string;
  payrolls?: Payroll[];
  lemburs?: Lembur[];
}

export interface Payroll {
  id: string;
  karyawanId: string;
  karyawan?: Karyawan;
  bulan: string;
  tahun: number;
  gajiPokok: number;
  tunjangan: number;
  potongan: number;
  totalGaji: number;
  createdAt: string;
}

export interface Lembur {
  id: string;
  karyawanId: string;
  karyawan?: Karyawan;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  totalJam: number;
  upahPerJam: number;
  totalUpah: number;
  approved: boolean;
  approvedBy?: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  platNomor: string;
  merk: string;
  model: string;
  tahun: number;
  jenis: string;
  kapasitas: number;
  statusAktif: boolean;
  cabangId?: string;
  createdAt: string;
  updatedAt: string;
  maintenances?: Maintenance[];
  fuelLogs?: FuelLog[];
  tripLogs?: TripLog[];
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  tanggal: string;
  jenis: string;
  deskripsi?: string;
  biaya: number;
  kilometer: number;
  bengkel?: string;
  createdAt: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  tanggal: string;
  jumlahLiter: number;
  hargaPerLiter: number;
  totalBiaya: number;
  kilometer: number;
  lokasiPengisian?: string;
  createdAt: string;
}

export interface TripLog {
  id: string;
  vehicleId: string;
  driverId?: string;
  driver?: Karyawan;
  tanggal: string;
  tujuan: string;
  kmAwal: number;
  kmAkhir: number;
  totalKm: number;
  muatan?: string;
  catatan?: string;
  status: string;
  startTime?: string;
  endTime?: string;
  podPhoto?: string;
  podNote?: string;
  podTime?: string;
  createdAt: string;
}

export interface VehicleStats {
  totalVehicles: number;
  activeVehicles: number;
  inactiveVehicles: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalTrips: number;
  totalKm: number;
}

// ===== MITRA PETANI =====
export interface MitraPetani {
  id: string;
  nomorSlot: number;
  name: string;
  phone: string;
  address: string;
  jenisIkan: string;
  luasKolam: number;
  status: 'AKTIF' | 'PANEN' | 'NONAKTIF';
  createdAt: string;
  updatedAt: string;
  transaksiPakan?: MitraTransaksiPakan[];
  transaksiPibit?: MitraTransaksiBibit[];
  transaksiPinjaman?: MitraTransaksiPinjaman[];
  transaksiPanen?: MitraTransaksiPanen[];
}

export interface MitraTransaksiBibit {
  id: string;
  mitraId: string;
  tanggal: string;
  jenisIkan: string;
  jumlahEkor: number;
  hargaPerEkor: number;
  totalHarga: number;
  catatan?: string;
  createdAt: string;
}

export interface MitraTransaksiPakan {
  id: string;
  mitraId: string;
  tanggal: string;
  jenisPakan: string;
  jumlahKg: number;
  hargaPerKg: number;
  totalHarga: number;
  catatan?: string;
  createdAt: string;
}

export interface MitraTransaksiPinjaman {
  id: string;
  mitraId: string;
  tanggal: string;
  jumlah: number;
  keterangan: string;
  lunas: boolean;
  createdAt: string;
}

export interface MitraTransaksiPanen {
  id: string;
  mitraId: string;
  tanggal: string;
  jumlahKg: number;
  hargaPerKg: number;
  totalHasilPanen: number;
  totalHutang: number;
  saldoBersih: number;
  catatan?: string;
  createdAt: string;
}

export interface MitraSummary {
  totalPakan: number;
  totalBibit: number;
  totalPinjaman: number;
  totalHutang: number;
  totalPanen: number;
  saldoBersih: number;
}
