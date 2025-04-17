import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as argon2 from 'argon2';

dotenv.config();

const prisma = new PrismaClient();

const USERS_COUNT = 20;

const seed = async () => {
  await prisma.company.deleteMany();
  await prisma.account.deleteMany();

  const password = '12345678';
  const hashedPassword = await argon2.hash(password, {
    salt: Buffer.from(process.env.PASSWORD_SALT),
  });

  // superadmin
  await prisma.account.create({
    data: {
      email: 'superadmin@example.com',
      username: 'superadmin',
      role: 'superadmin',
      hashedPassword,
    },
  });

  // admins
  await prisma.account.createMany({
    data: [
      {
        email: 'admin1@example.com',
        username: 'admin1',
        role: 'admin',
        hashedPassword,
      },
      {
        email: 'admin2@example.com',
        username: 'admin2',
        role: 'admin',
        hashedPassword,
      },
    ],
  });

  // users
  for (let i = 1; i <= USERS_COUNT; i++) {
    const user = await prisma.account.create({
      data: {
        email: `user${i}@example.com`,
        username: `user${i}`,
        role: 'user',
        hashedPassword,
      },
    });

    const companiesCount = Math.floor(Math.random() * 30) + 1;

    for (let j = 1; j <= companiesCount; j++) {
      await prisma.company.create({
        data: {
          name: `Company ${i}-${j}`,
          service: ['AI', 'Hosting', 'Finance', 'Logistics'][j % 4],
          capital: Math.floor(Math.random() * 1000000) + 50000,
          logoUrl: null,
          account: {
            connect: { id: user.id },
          },
        },
      });
    }
  }

  console.log('✅ Seed completed');
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
