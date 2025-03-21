import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { verifyAuth } from "@/lib/auth"
import { logActivity } from "@/lib/activity"

// Definisikan enum UserRole sesuai dengan schema.prisma
enum UserRole {
  ADMIN = "ADMIN",
  OPERATOR = "OPERATOR",
  VIEWER = "VIEWER"
}

// GET /api/users/[id] - Mendapatkan detail user
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(params.id) },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/users/[id] - Mengupdate user
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

    const body = await request.json()
    const { username, password, name, role } = body
    const userId = parseInt(params.id)

    // Validasi input
    if (!username || !name || !role) {
      return NextResponse.json(
        { error: "Username, nama, dan role harus diisi" },
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

    // Cek apakah user yang akan diupdate ada
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      )
    }

    // Cek apakah username sudah digunakan oleh user lain
    const userWithSameUsername = await prisma.user.findUnique({
      where: { username },
    })

    if (userWithSameUsername && userWithSameUsername.id !== userId) {
      return NextResponse.json(
        { error: "Username sudah digunakan" },
        { status: 400 }
      )
    }

    // Siapkan data update
    const updateData: any = {
      username,
      name,
      role: role as UserRole,
    }

    // Jika password diisi, hash password baru
    if (password) {
      updateData.password = await hashPassword(password)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
      },
    })

    // Catat aktivitas update
    if (auth?.user?.id) {
      await logActivity(
        auth.user.id,
        'USER_UPDATED',
        `Data pengguna ${updatedUser.name} (${updatedUser.username}) telah diperbarui`
      )
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Menghapus user
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

    const userId = parseInt(params.id)

    // Cek apakah user yang akan dihapus ada
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      )
    }

    // Hapus user
    await prisma.user.delete({
      where: { id: userId },
    })

    // Catat aktivitas penghapusan
    if (auth?.user?.id) {
      await logActivity(
        auth.user.id,
        'USER_DELETED',
        `Pengguna ${user.name} (${user.username}) telah dihapus`
      )
    }

    return NextResponse.json({ message: "User berhasil dihapus" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 