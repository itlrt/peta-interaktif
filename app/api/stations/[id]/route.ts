import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { logActivity } from "@/lib/activity"

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
    const { name, latitude, longitude, imageUrl, destinations } = body

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
      // Hapus semua destinasi yang ada
      await prisma.destination.deleteMany({
        where: { stationId },
      })

      // Update stasiun dan buat destinasi baru
      return prisma.station.update({
        where: { id: stationId },
        data: {
          name,
          latitude,
          longitude,
          ...(imageUrl ? { imageUrl } : {}),
          destinations: {
            create: destinations?.map((dest: any) => ({
              name: dest.name,
              latitude: dest.latitude,
              longitude: dest.longitude,
              ...(dest.imageUrl ? { imageUrl: dest.imageUrl } : {}),
            })) || [],
          },
        },
        include: {
          destinations: true,
        },
      })
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