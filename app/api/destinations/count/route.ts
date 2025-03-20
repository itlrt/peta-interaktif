import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const count = await prisma.destination.count()
    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error counting destinations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 