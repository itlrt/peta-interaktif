import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/transportation
export async function GET() {
  try {
    const transports = await prisma.transportation.findMany({
      include: {
        stations: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(transports)
  } catch (error) {
    console.error('Error fetching transports:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data transportasi' },
      { status: 500 }
    )
  }
}

// POST /api/transportation
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Cek apakah transportasi dengan nama dan tipe yang sama sudah ada
    const existingTransport = await prisma.transportation.findFirst({
      where: {
        name: body.name,
        type: body.type
      }
    })

    if (existingTransport) {
      return NextResponse.json(
        { error: 'Transportasi dengan nama dan tipe ini sudah ada' },
        { status: 400 }
      )
    }

    // Jika stationIds ada dan bukan untuk semua stasiun, validasi stasiun
    let stationIds: number[] = []
    if (body.stationIds && !body.isAllStation) {
      const stations = await prisma.station.findMany({
        where: {
          id: {
            in: body.stationIds
          }
        }
      })

      if (stations.length !== body.stationIds.length) {
        return NextResponse.json(
          { error: 'Beberapa stasiun yang dipilih tidak ditemukan' },
          { status: 404 }
        )
      }

      stationIds = stations.map(s => s.id)
    }

    // Jika isAllStation true, ambil semua stasiun
    if (body.isAllStation) {
      const allStations = await prisma.station.findMany()
      stationIds = allStations.map(s => s.id)
    }

    const transport = await prisma.transportation.create({
      data: {
        name: body.name,
        type: body.type,
        icon: body.icon,
        isAllStation: body.isAllStation || false,
        stations: {
          connect: stationIds.map(id => ({ id }))
        }
      },
      include: {
        stations: true
      }
    })

    return NextResponse.json(transport)
  } catch (error) {
    console.error('Error creating transport:', error)
    return NextResponse.json(
      { error: 'Gagal menyimpan data transportasi' },
      { status: 500 }
    )
  }
} 