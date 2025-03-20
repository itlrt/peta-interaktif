import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "./prisma"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePasswords(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
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

    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    
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