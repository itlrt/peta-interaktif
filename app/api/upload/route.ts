import { NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { logActivity, ActivityType } from "@/lib/activity"
import { headers } from "next/headers"

export async function POST(request: Request) {
  try {
    // Verifikasi token
    const headersList = headers()
    const authHeader = headersList.get("authorization")
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const auth = await verifyAuth(new Request("http://localhost", {
      headers: { authorization: authHeader }
    }))
    
    if (!auth.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Dapatkan file dari form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      )
    }

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File harus berupa gambar" },
        { status: 400 }
      )
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file tidak boleh lebih dari 5MB" },
        { status: 400 }
      )
    }

    // Konversi file ke base64
    const buffer = await file.arrayBuffer()
    const base64String = Buffer.from(buffer).toString('base64')
    const mimeType = file.type
    const dataUrl = `data:${mimeType};base64,${base64String}`

    // Catat aktivitas
    await logActivity(
      auth.user.id,
      "STATION_UPDATED" as ActivityType,
      `Gambar telah diunggah`
    )

    return NextResponse.json({ url: dataUrl })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Gagal mengunggah file" },
      { status: 500 }
    )
  }
} 