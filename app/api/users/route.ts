import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { logActivity } from "@/lib/activity"
import { verifyAuth } from "@/lib/auth"

// Definisikan enum UserRole sesuai dengan schema.prisma
enum UserRole {
  ADMIN = "ADMIN",
  OPERATOR = "OPERATOR",
  VIEWER = "VIEWER"
}

// GET /api/users - Mendapatkan semua pengguna
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
      },
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/users - Membuat pengguna baru
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
    const { username, password, name, role } = body

    // Validasi input
    if (!username || !password || !name || !role) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      )
    }

    // Validasi role
    if (![UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER].includes(role)) {
      return NextResponse.json(
        { error: "Role tidak valid" },
        { status: 400 }
      )
    }

    // Cek apakah username sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: role as UserRole,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
      },
    })

    // Catat aktivitas dengan user yang sedang login sebagai pembuat aktivitas
    await logActivity(
      auth.user.id,
      'USER_CREATED',
      `Pengguna baru ${user.name} (${user.username}) telah dibuat dengan role ${user.role}`
    )

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 