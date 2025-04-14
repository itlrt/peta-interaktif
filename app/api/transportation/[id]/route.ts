import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/transportation/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const id = parseInt(params.id)

    // Cek apakah transportasi dengan nama dan tipe yang sama sudah ada (kecuali dirinya sendiri)
    const existingTransport = await prisma.transportation.findFirst({
      where: {
        name: body.name,
        type: body.type,
        id: {
          not: id
        }
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

    // Update data transportasi
    const transport = await prisma.transportation.update({
      where: {
        id: id
      },
      data: {
        name: body.name,
        type: body.type,
        icon: body.icon,
        isAllStation: body.isAllStation || false,
        stations: {
          set: stationIds.map(id => ({ id }))
        }
      },
      include: {
        stations: true
      }
    })

    return NextResponse.json(transport)
  } catch (error) {
    console.error('Error updating transport:', error)
    return NextResponse.json(
      { error: 'Gagal mengupdate data transportasi' },
      { status: 500 }
    )
  }
}

// DELETE /api/transportation/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    await prisma.transportation.delete({
      where: {
        id: id
      }
    })

    return NextResponse.json({ message: 'Data transportasi berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting transport:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus data transportasi' },
      { status: 500 }
    )
  }
} 