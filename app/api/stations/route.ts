import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import { logActivity } from "@/lib/activity"

// GET /api/stations - Mendapatkan semua stasiun
export async function GET() {
  try {
    const stations = await prisma.station.findMany({
      include: {
        destinations: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(stations)
  } catch (error) {
    console.error("Error fetching stations:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/stations - Membuat stasiun baru
export async function POST(request: Request) {
  try {
    // Verifikasi token dan dapatkan user yang sedang login
    const auth = await verifyAuth(request)
    if (!auth.success) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, latitude, longitude, imageUrl, destinations, description, location } = body

    // Validasi input
    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Nama, latitude, dan longitude harus diisi" },
        { status: 400 }
      )
    }

    // Konversi dan validasi latitude dan longitude
    const lat = Number(latitude)
    const lng = Number(longitude)
    
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: "Latitude dan longitude harus berupa angka" },
        { status: 400 }
      )
    }

    // Validasi destinasi jika ada
    if (destinations) {
      for (const dest of destinations) {
        if (!dest.name || dest.latitude === undefined || dest.longitude === undefined) {
          return NextResponse.json(
            { error: "Setiap destinasi harus memiliki nama, latitude, dan longitude" },
            { status: 400 }
          )
        }
        
        const destLat = Number(dest.latitude)
        const destLng = Number(dest.longitude)
        
        if (isNaN(destLat) || isNaN(destLng)) {
          return NextResponse.json(
            { error: "Latitude dan longitude destinasi harus berupa angka" },
            { status: 400 }
          )
        }
      }
    }

    // Cek apakah nama stasiun sudah ada
    const existingStation = await prisma.station.findFirst({
      where: { name },
    })

    if (existingStation) {
      return NextResponse.json(
        { error: "Nama stasiun sudah digunakan" },
        { status: 400 }
      )
    }

    // Buat stasiun baru
    const newStation = await prisma.station.create({
      data: {
        name,
        latitude: lat,
        longitude: lng,
        ...(imageUrl ? { imageUrl } : {}),
        ...(description ? { description } : {}),
        ...(location ? { location } : {}),
        destinations: {
          create: destinations?.map((dest: any) => ({
            name: dest.name,
            latitude: Number(dest.latitude),
            longitude: Number(dest.longitude),
            ...(dest.imageUrl ? { imageUrl: dest.imageUrl } : {}),
            ...(dest.description ? { description: dest.description } : {}),
          })) || [],
        },
      },
      include: {
        destinations: true,
      },
    })

    // Catat aktivitas
    if (auth.user?.id) {
      await logActivity(
        auth.user.id,
        'STATION_CREATED',
        `Stasiun ${newStation.name} telah ditambahkan`
      )
    }

    return NextResponse.json(newStation)
  } catch (error) {
    console.error("Error creating station:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 