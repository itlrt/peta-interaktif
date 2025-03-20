"use client"

import { useEffect, useState } from "react"
import { LayoutDashboard, Map, Users, Clock, Activity as ActivityIcon } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface DashboardStats {
  totalStations: number
  totalDestinations: number
  totalUsers: number
}

interface Activity {
  id: number
  type: string
  message: string
  userId: number
  createdAt: string
  user: {
    name: string
    username: string
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStations: 0,
    totalDestinations: 0,
    totalUsers: 0
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [stationsRes, destinationsRes, usersRes] = await Promise.all([
          fetch("/api/stations/count"),
          fetch("/api/destinations/count"),
          fetch("/api/users/count")
        ])

        const stations = await stationsRes.json()
        const destinations = await destinationsRes.json()
        const users = await usersRes.json()

        setStats({
          totalStations: stations.count,
          totalDestinations: destinations.count,
          totalUsers: users.count
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      }
    }

    fetchStats()
  }, [])

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities')
        if (!response.ok) throw new Error('Failed to fetch activities')
        const data = await response.json()
        setActivities(data)
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stasiun</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStations}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <Map className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Destinasi</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalDestinations}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <LayoutDashboard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <ActivityIcon className="h-5 w-5 text-gray-600" />
              Aktivitas Terbaru
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada aktivitas
            </div>
          ) : (
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 pb-6 border-b border-gray-100 last:border-0">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      oleh Administrator •{' '}
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

