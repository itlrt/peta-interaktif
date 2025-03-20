import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const count = await prisma.station.count()
    return NextResponse.json({ count })
  } catch (error) {
    console.error("Error counting stations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 