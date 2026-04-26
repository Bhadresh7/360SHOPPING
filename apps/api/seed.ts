import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Welcome@123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'aadhya@360shopie.com' },
    update: {},
    create: {
      email: 'aadhya@360shopie.com',
      name: 'Aadhya Sharma',
      passwordHash: password,
      loyaltyPoints: 1250,
      referralCode: 'AADHYA500'
    }
  });

  console.log('Seeded user:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
