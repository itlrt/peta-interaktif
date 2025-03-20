import { PrismaClient, UserRole } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  // Buat user admin default
  const adminPassword = await hashPassword('admin')
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      name: 'Administrator',
      role: UserRole.ADMIN,
    },
  })

  // Buat data stasiun contoh
  const dukuhAtas = await prisma.station.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Dukuh Atas',
      description: 'Stasiun LRT di kawasan Dukuh Atas',
      location: 'Jakarta Pusat',
      latitude: -6.200696,
      longitude: 106.822872,
      image: 'https://example.com/dukuh-atas.jpg',
      destinations: {
        create: [
          {
            name: 'Plaza Indonesia',
            description: 'Pusat perbelanjaan mewah',
            latitude: -6.193265,
            longitude: 106.823273,
            image: 'https://example.com/plaza-indonesia.jpg',
          },
          {
            name: 'Bundaran HI',
            description: 'Landmark Jakarta',
            latitude: -6.195196,
            longitude: 106.823229,
            image: 'https://example.com/bundaran-hi.jpg',
          },
        ],
      },
    },
  })

  console.log('Seed data created:', { dukuhAtas })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 