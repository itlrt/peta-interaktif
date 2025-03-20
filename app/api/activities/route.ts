import { NextResponse } from 'next/server'
import { getRecentActivities } from '@/lib/activity'

export async function GET() {
  try {
    const activities = await getRecentActivities()
    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data aktivitas' },
      { status: 500 }
    )
  }
} 