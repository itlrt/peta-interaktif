"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, Pencil } from "lucide-react"

interface Destination {
  id: number
  name: string
  latitude: number
  longitude: number
  imageUrl?: string
}

interface Station {
  id: number
  name: string
  latitude: number
  longitude: number
  imageUrl?: string
  destinations: Destination[]
}

export default function StationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [station, setStation] = useState<Station | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/admin/login")
          return
        }

        const response = await fetch(`/api/stations/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Gagal mengambil data stasiun")
        }

        const data = await response.json()
        setStation(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStation()
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="text-gray-600">Memuat data stasiun...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        {error}
      </div>
    )
  }

  if (!station) {
    return (
      <div className="bg-yellow-50 text-yellow-600 p-4 rounded-md">
        Stasiun tidak ditemukan
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/stations"
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Kembali
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{station.name}</h1>
        </div>

        <Link
          href={`/admin/stations/edit/${station.id}`}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <Pencil className="h-4 w-4" />
          Edit Stasiun
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Stasiun */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Stasiun</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Nama Stasiun
              </label>
              <p className="text-gray-900">{station.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Latitude
                </label>
                <p className="text-gray-900">{station.latitude}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Longitude
                </label>
                <p className="text-gray-900">{station.longitude}</p>
              </div>
            </div>

            {station.imageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Gambar Stasiun
                </label>
                <div className="mt-2">
                  <img
                    src={station.imageUrl}
                    alt={station.name}
                    className="w-full max-w-md rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Destinasi */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Destinasi Terdekat</h2>

          <div className="space-y-6">
            {station.destinations.length > 0 ? (
              station.destinations.map((destination) => (
                <div key={destination.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Nama Destinasi
                      </label>
                      <p className="text-gray-900">{destination.name}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Latitude
                        </label>
                        <p className="text-gray-900">{destination.latitude}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Longitude
                        </label>
                        <p className="text-gray-900">{destination.longitude}</p>
                      </div>
                    </div>

                    {destination.imageUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Gambar Destinasi
                        </label>
                        <div className="mt-2">
                          <img
                            src={destination.imageUrl}
                            alt={destination.name}
                            className="w-full max-w-md rounded-lg border border-gray-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Belum ada destinasi terdekat</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 