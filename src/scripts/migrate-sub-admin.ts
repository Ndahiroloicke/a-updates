import { PrismaClient } from '@prisma/client';

async function migrateSubAdminUsers() {
  const prisma = new PrismaClient();

  try {
    // Update all SUB_ADMIN users to ADMIN
    const result = await prisma.user.updateMany({
      where: {
        role: 'SUB_ADMIN',
      },
      data: {
        role: 'ADMIN',
      },
    });

    console.log(`Updated ${result.count} users from SUB_ADMIN to ADMIN`);
  } catch (error) {
    console.error('Error migrating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateSubAdminUsers(); 