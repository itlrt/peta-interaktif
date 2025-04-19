"use client"

import { useEffect, useState } from "react"
import { LayoutDashboard, Map, Users, Clock, Activity as ActivityIcon, Bus, Train, Navigation } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"

interface DashboardStats {
  totalStations: number
  totalDestinations: number
  totalUsers: number
  totalTransports: number
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

interface Transport {
  id: number
  name: string
  type: string
  stations: { id: number; name: string }[]
  isAllStation: boolean
  icon: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStations: 0,
    totalDestinations: 0,
    totalUsers: 0,
    totalTransports: 0
  })
  const [activities, setActivities] = useState<Activity[]>([])
  const [transports, setTransports] = useState<Transport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [stationsRes, destinationsRes, usersRes, transportsRes] = await Promise.all([
          fetch("/api/stations/count"),
          fetch("/api/destinations/count"),
          fetch("/api/users/count"),
          fetch("/api/transportation")
        ])

        const stations = await stationsRes.json()
        const destinations = await destinationsRes.json()
        const users = await usersRes.json()
        const transportsData = await transportsRes.json()

        setTransports(transportsData)
        setStats({
          totalStations: stations.count,
          totalDestinations: destinations.count,
          totalUsers: users.count,
          totalTransports: transportsData.length
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stasiun</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStations}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <Train className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Stasiun LRT yang tersedia</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Destinasi</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalDestinations}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Navigation className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Destinasi wisata terdekat</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transportasi</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTransports}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full">
              <Bus className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Transportasi umum terintegrasi</p>
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
          <p className="mt-2 text-sm text-gray-500">Pengguna terdaftar</p>
        </div>
      </div>

      {/* Transport & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transport Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
              <Bus className="h-5 w-5 text-gray-600" />
              Jenis Transportasi
            </h2>
            
            {transports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada data transportasi
              </div>
            ) : (
              <ScrollArea className="h-[400px] w-full">
                <div className="grid grid-cols-2 gap-3 pr-4">
                  {transports.map((transport) => (
                    <div key={transport.id} className="flex flex-col p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                          <Image
                            src={transport.icon}
                            alt={transport.name}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 line-clamp-1">{transport.name}</p>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                            transport.isAllStation ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {transport.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {transport.isAllStation 
                          ? "Tersedia di semua stasiun" 
                          : `${transport.stations.length} stasiun terhubung`}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
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
                <div className="relative w-20 h-20">
                  <Image
                    src="/logo-lrt-motion.gif"
                    alt="Loading..."
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada aktivitas
              </div>
            ) : (
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-4 pr-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-red-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          oleh {activity.user.name} •{' '}
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                            locale: id,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

