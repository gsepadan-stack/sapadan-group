import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing database connection...');
    
    const kolams = await prisma.kolam.findMany();
    console.log('Kolams:', kolams.length);
    
    const suppliers = await prisma.supplier.findMany();
    console.log('Suppliers:', suppliers.length);
    
    const karyawans = await prisma.karyawan.findMany();
    console.log('Karyawans:', karyawans.length);
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
