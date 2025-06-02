import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health check - bisa ditambahkan pengecekan database jika perlu
    return NextResponse.json(
      { 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'peta-interaktif'
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 