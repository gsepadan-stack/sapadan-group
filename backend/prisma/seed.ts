import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const owner = await prisma.user.upsert({
    where: { email: 'owner@sapadan.com' },
    update: {},
    create: {
      email: 'owner@sapadan.com',
      password: hashedPassword,
      name: 'Owner Sapadan',
      role: 'OWNER',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sapadan.com' },
    update: {},
    create: {
      email: 'admin@sapadan.com',
      password: hashedPassword,
      name: 'Admin Sapadan',
      role: 'ADMIN',
    },
  });

  // Create driver user
  const driver = await prisma.user.upsert({
    where: { email: 'driver@sapadan.com' },
    update: {},
    create: {
      email: 'driver@sapadan.com',
      password: hashedPassword,
      name: 'Driver Sapadan',
      role: 'STAFF',
    },
  });

  // Create products (skip if already exist)
  const productData = [
    {
      name: 'Ikan Lele Jumbo',
      jenis: 'Lele',
      hargaPerKg: 25000,
      stokKg: 500,
      deskripsi: 'Ikan lele segar ukuran jumbo',
    },
    {
      name: 'Ikan Nila Merah',
      jenis: 'Nila',
      hargaPerKg: 30000,
      stokKg: 300,
      deskripsi: 'Ikan nila merah berkualitas',
    },
    {
      name: 'Ikan Gurame',
      jenis: 'Gurame',
      hargaPerKg: 45000,
      stokKg: 200,
      deskripsi: 'Ikan gurame segar',
    },
  ];

  const existingProducts = await prisma.product.count();
  if (existingProducts === 0) {
    for (const product of productData) {
      await prisma.product.create({ data: product });
    }
  }

  // Create sample kolam
  const existingKolam = await prisma.kolam.count();
  if (existingKolam === 0) {
    await prisma.kolam.createMany({
      data: [
        {
          name: 'Kolam A1',
          jenisIkan: 'Lele',
          jumlahIkan: 5000,
          mortalitas: 50,
        },
        {
          name: 'Kolam A2',
          jenisIkan: 'Nila',
          jumlahIkan: 3000,
          mortalitas: 30,
        },
        {
          name: 'Kolam B1',
          jenisIkan: 'Gurame',
          jumlahIkan: 2000,
          mortalitas: 20,
        },
      ],
    });
  }

  // Create sample supplier
  const existingSupplier = await prisma.supplier.count();
  if (existingSupplier === 0) {
    await prisma.supplier.createMany({
      data: [
        {
          name: 'PT Pakan Ikan Jaya',
          phone: '081234567890',
          address: 'Jl. Perikanan No. 123, Jakarta',
          email: 'info@pakanikan.com',
        },
        {
          name: 'CV Mitra Pakan',
          phone: '081234567891',
          address: 'Jl. Industri No. 45, Bekasi',
          email: 'sales@mitrapakan.com',
        },
      ],
    });
  }

  // Create sample karyawan
  const existingKaryawan = await prisma.karyawan.count();
  if (existingKaryawan === 0) {
    await prisma.karyawan.createMany({
      data: [
        {
          id: driver.id, // Link to driver user
          name: 'Driver Sapadan',
          phone: '081234567890',
          address: 'Jl. Raya No. 1, Jakarta',
          position: 'Driver',
          gajiPokok: 4000000,
        },
        {
          name: 'Budi Santoso',
          phone: '081234567892',
          address: 'Jl. Mawar No. 10, Jakarta',
          position: 'Supervisor Kolam',
          gajiPokok: 5000000,
        },
        {
          name: 'Siti Aminah',
          phone: '081234567893',
          address: 'Jl. Melati No. 20, Jakarta',
          position: 'Staff Pakan',
          gajiPokok: 3500000,
        },
        {
          name: 'Ahmad Yani',
          phone: '081234567894',
          address: 'Jl. Kenanga No. 30, Jakarta',
          position: 'Staff Kolam',
          gajiPokok: 3000000,
        },
      ],
    });
  }

  // Create sample vehicles
  const existingVehicles = await prisma.vehicle.count();
  if (existingVehicles === 0) {
    await prisma.vehicle.createMany({
      data: [
        {
          platNomor: 'B 1234 ABC',
          merk: 'Mitsubishi',
          model: 'Colt Diesel',
          tahun: 2020,
          jenis: 'Truk',
          kapasitas: 3.5,
          statusAktif: true,
        },
        {
          platNomor: 'B 5678 DEF',
          merk: 'Isuzu',
          model: 'Elf',
          tahun: 2021,
          jenis: 'Truk',
          kapasitas: 2.5,
          statusAktif: true,
        },
        {
          platNomor: 'B 9012 GHI',
          merk: 'Toyota',
          model: 'Dyna',
          tahun: 2019,
          jenis: 'Truk',
          kapasitas: 4.0,
          statusAktif: true,
        },
      ],
    });
  }

  console.log('✅ Seeding completed!');
  console.log('📧 Login credentials:');
  console.log('   Owner: owner@sapadan.com / password123');
  console.log('   Admin: admin@sapadan.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
