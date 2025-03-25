import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Data stasiun dan destinasi
  const stationsData = [
    {
      name: 'Dukuh Atas BNI',
      latitude: -6.204828,
      longitude: 106.8255301,
      destinations: [
        {
          name: 'Grha BNI',
          latitude: -6.203251371497656,
          longitude: 106.82132904054815,
        }
      ]
    },
    {
      name: 'Setiabudi',
      latitude: -6.2093184,
      longitude: 106.8302209,
      destinations: [
        {
          name: 'Menara Imperium',
          latitude: -6.210042307952699,
          longitude: 106.83152012705537,
        }
      ]
    },
    {
      name: 'Rasuna Said',
      latitude: -6.2216089,
      longitude: 106.8322373,
      destinations: [
        {
          name: 'Epicentrum Mall',
          latitude: -6.21722916183889,
          longitude: 106.83502392700166,
        }
      ]
    },
    {
      name: 'Kuningan',
      latitude: -6.2287727,
      longitude: 106.8332031,
      destinations: [
        {
          name: 'Balai Kartini',
          latitude: -6.234157259042101,
          longitude: 106.82534455219105,
        }
      ]
    },
    {
      name: 'Pancoran Bank BJB',
      latitude: -6.2421415,
      longitude: 106.8385146,
      destinations: [
        {
          name: 'SMESCO Indonesia',
          latitude: -6.241573667107673,
          longitude: 106.83621515404135,
        }
      ]
    },
    {
      name: 'Cikoko',
      latitude: -6.2434846,
      longitude: 106.8570718,
      destinations: [
        {
          name: 'Stasiun KRL Cawang',
          latitude: -6.242247884915078,
          longitude: 106.85877001171278,
        }
      ]
    },
    {
      name: 'Ciliwung',
      latitude: -6.2434448,
      longitude: 106.8639705,
      destinations: [
        {
          name: 'Kemenkumham',
          latitude: -6.243630090746462,
          longitude: 106.86542841044526,
        }
      ]
    },
    {
      name: 'Cawang',
      latitude: -6.2459023,
      longitude: 106.8712426,
      destinations: [
        {
          name: 'UKI Cawang',
          latitude: -6.250756838273384,
          longitude: 106.87278345034088,
        }
      ]
    },
    {
      name: 'Halim',
      latitude: -6.2458656,
      longitude: 106.8872875,
      destinations: [
        {
          name: 'KCIC Halim',
          latitude: -6.245784837642015,
          longitude: 106.8858337072005,
        }
      ]
    },
    {
      name: 'Jatibening Baru',
      latitude: -6.2577476,
      longitude: 106.9279199,
      destinations: [
        {
          name: 'BSI Kalimalang',
          latitude: -6.249753922438778,
          longitude: 106.92951629822012,
        }
      ]
    },
    {
      name: 'Cikunir 1',
      latitude: -6.2566001,
      longitude: 106.9518734,
      destinations: [
        {
          name: 'Ibis Style',
          latitude: -6.252027285784345,
          longitude: 106.95270845480903,
        }
      ]
    },
    {
      name: 'Cikunir 2',
      latitude: -6.2546849,
      longitude: 106.9632233,
      destinations: [
        {
          name: 'Universitas Gunadarma Bekasi',
          latitude: -6.2583724306591835,
          longitude: 106.95915162510717,
        }
      ]
    },
    {
      name: 'Bekasi Barat',
      latitude: -6.2529489,
      longitude: 106.9904237,
      destinations: [
        {
          name: 'Gerbang Tol Bekasi Barat',
          latitude: -6.249611501782761,
          longitude: 106.99031273368213,
        }
      ]
    },
    {
      name: 'Jatimulya',
      latitude: -6.2641077,
      longitude: 107.0216701,
      destinations: [
        {
          name: 'Gerbang Tol Bekasi Timur',
          latitude: -6.263496221822506,
          longitude: 107.01681174324808,
        }
      ]
    },
    {
      name: 'TMII',
      latitude: -6.2928955,
      longitude: 106.8806355,
      destinations: [
        {
          name: 'Taman Rekreasi TMII',
          latitude: -6.301985273640397,
          longitude: 106.88988166753474,
        }
      ]
    },
    {
      name: 'Kampung Rambutan',
      latitude: -6.3095494,
      longitude: 106.8843804,
      destinations: [
        {
          name: 'GOR Ceger',
          latitude: -6.31591635564195,
          longitude: 106.8886158982208,
        }
      ]
    },
    {
      name: 'Ciracas',
      latitude: -6.3237795,
      longitude: 106.8867366,
      destinations: [
        {
          name: 'Kelurahan Ciracas',
          latitude: -6.328007811038793,
          longitude: 106.87760079481687,
        }
      ]
    },
    {
      name: 'Harjamukti',
      latitude: -6.3739095,
      longitude: 106.8956745,
      destinations: [
        {
          name: 'Cibubur Junction',
          latitude: -6.369343890980611,
          longitude: 106.8941796675354,
        }
      ]
    },
  ]

  // Masukkan data stasiun dan destinasi
  for (const stationData of stationsData) {
    await prisma.station.upsert({
      where: { name: stationData.name },
      update: {},
      create: {
        name: stationData.name,
        latitude: stationData.latitude,
        longitude: stationData.longitude,
        destinations: {
          create: stationData.destinations
        }
      }
    })
  }

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 