import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { logActivity } from "@/lib/activity"

interface Destination {
  id?: number
  name: string
  latitude: number
  longitude: number
  imageUrl?: string
  description?: string
}

// GET /api/stations/[id] - Mendapatkan detail stasiun
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const station = await prisma.station.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        destinations: true,
      },
    })

    if (!station) {
      return NextResponse.json(
        { error: "Stasiun tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(station)
  } catch (error) {
    console.error("Error fetching station:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/stations/[id] - Mengupdate stasiun
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verifikasi token dan dapatkan user yang sedang login
    const auth = await verifyAuth(request)
    if (!auth.success) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const stationId = parseInt(params.id)
    const body = await request.json()
    const { name, latitude, longitude, imageUrl, destinations, description, location } = body

    // Validasi input
    if (!name || !latitude || !longitude) {
      return NextResponse.json(
        { error: "Nama, latitude, dan longitude harus diisi" },
        { status: 400 }
      )
    }

    // Validasi format latitude dan longitude
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: "Latitude dan longitude harus berupa angka" },
        { status: 400 }
      )
    }

    // Cek apakah stasiun yang akan diupdate ada
    const existingStation = await prisma.station.findUnique({
      where: { id: stationId },
    })

    if (!existingStation) {
      return NextResponse.json(
        { error: "Stasiun tidak ditemukan" },
        { status: 404 }
      )
    }

    // Cek apakah nama stasiun sudah digunakan oleh stasiun lain
    const stationWithSameName = await prisma.station.findFirst({
      where: {
        name,
        NOT: {
          id: stationId
        }
      },
    })

    if (stationWithSameName) {
      return NextResponse.json(
        { error: "Nama stasiun sudah digunakan" },
        { status: 400 }
      )
    }

    // Update stasiun
    const updatedStation = await prisma.$transaction(async (prisma) => {
      // Update stasiun
      const updated = await prisma.station.update({
        where: { id: stationId },
        data: {
          name,
          latitude,
          longitude,
          ...(imageUrl ? { imageUrl } : {}),
          ...(description ? { description } : {}),
          ...(location ? { location } : {}),
        },
        include: {
          destinations: true,
        },
      })

      // Hapus semua destinasi yang ada
      await prisma.destination.deleteMany({
        where: { stationId },
      })

      // Buat ulang semua destinasi
      if (destinations && destinations.length > 0) {
        await prisma.destination.createMany({
          data: destinations.map((dest: any) => {
            // Hapus id dari data destinasi untuk menghindari konflik
            const { id, ...destinationData } = dest
            return {
              name: destinationData.name,
              latitude: destinationData.latitude,
              longitude: destinationData.longitude,
              ...(destinationData.imageUrl ? { imageUrl: destinationData.imageUrl } : {}),
              ...(destinationData.description ? { description: destinationData.description } : {}),
              stationId
            }
          })
        })
      }

      // Ambil data terbaru
      const result = await prisma.station.findUnique({
        where: { id: stationId },
        include: {
          destinations: true,
        },
      })

      if (!result) {
        throw new Error('Stasiun tidak ditemukan setelah update')
      }

      return result
    })

    // Catat aktivitas
    if (auth.user?.id) {
      await logActivity(
        auth.user.id,
        'STATION_UPDATED',
        `Stasiun ${updatedStation.name} telah diperbarui`
      )
    }

    return NextResponse.json(updatedStation)
  } catch (error) {
    console.error("Error updating station:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/stations/[id] - Menghapus stasiun
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verifikasi token dan dapatkan user yang sedang login
    const auth = await verifyAuth(request)
    if (!auth.success) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const stationId = parseInt(params.id)

    // Cek apakah stasiun yang akan dihapus ada
    const station = await prisma.station.findUnique({
      where: { id: stationId },
    })

    if (!station) {
      return NextResponse.json(
        { error: "Stasiun tidak ditemukan" },
        { status: 404 }
      )
    }

    // Hapus stasiun (destinasi akan terhapus otomatis karena onDelete: Cascade)
    await prisma.station.delete({
      where: { id: stationId },
    })

    // Catat aktivitas
    if (auth.user?.id) {
      await logActivity(
        auth.user.id,
        'STATION_DELETED',
        `Stasiun ${station.name} telah dihapus`
      )
    }

    return NextResponse.json({ message: "Stasiun berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting station:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 