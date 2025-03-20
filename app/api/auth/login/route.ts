import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePasswords, generateToken } from '@/lib/auth'
import { logActivity } from '@/lib/activity'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validasi input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password harus diisi' },
        { status: 400 }
      )
    }

    // Cari user berdasarkan username
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Verifikasi password
    const isValid = await comparePasswords(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken(user.id)

    // Catat aktivitas login
    await logActivity(
      user.id,
      'USER_LOGIN',
      `${user.name} telah login ke sistem`
    )

    // Return token dan data user (tanpa password)
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login' },
      { status: 500 }
    )
  }
} 