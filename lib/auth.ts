import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "./prisma"

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET tidak ditemukan di environment variables")
}

export async function hashPassword(password: string) {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

export async function comparePasswords(password: string, hashedPassword: string) {
  return bcryptjs.compare(password, hashedPassword)
}

interface JWTPayload {
  userId: number
}

export function generateToken(userId: number): string {
  const payload: JWTPayload = { userId }
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET tidak ditemukan")
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export async function verifyAuth(request: Request) {
  try {
    // Dapatkan token dari header Authorization
    const authHeader = request.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return { success: false, error: "Token tidak valid" }
    }

    const token = authHeader.split(" ")[1]
    if (!token) {
      return { success: false, error: "Token tidak ditemukan" }
    }

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET tidak ditemukan")
    }

    // Verifikasi token
    const decodedToken = jwt.verify(token, JWT_SECRET)
    const decoded = decodedToken as unknown as JWTPayload
    
    if (!decoded || typeof decoded.userId !== 'number') {
      return { success: false, error: "Token tidak valid" }
    }
    
    // Dapatkan data user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
      },
    })

    if (!user) {
      return { success: false, error: "User tidak ditemukan" }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Error verifying auth:", error)
    return { success: false, error: "Token tidak valid" }
  }
} 