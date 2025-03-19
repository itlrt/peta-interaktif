"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, MapPin, Plus, Trash2, ImageIcon } from "lucide-react"
import { stations } from "@/components/map-component"
import { useParams, useRouter } from "next/navigation"

export default function EditStationPage() {
  const params = useParams()
  const router = useRouter()
  const stationId = Number(params.id)

  const [stationData, setStationData] = useState({
    name: "",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    image: "/placeholder.svg?height=80&width=80",
  })

  const [destinations, setDestinations] = useState<
    Array<{
      name: string
      latitude: string
      longitude: string
      image: string
    }>
  >([])

  const [isLoading, setIsLoading] = useState(true)

  // Load station data
  useEffect(() => {
    const station = stations.find((s) => s.id === stationId)

    if (station) {
      setStationData({
        name: station.name,
        description: station.description,
        location: station.location,
        latitude: String(station.position[0]),
        longitude: String(station.position[1]),
        image: station.image || "/placeholder.svg?height=80&width=80",
      })

      if (station.destinations) {
        setDestinations(
          station.destinations.map((dest) => ({
            name: dest.name,
            latitude: String(dest.position[0]),
            longitude: String(dest.position[1]),
            image: dest.image || "/placeholder.svg?height=80&width=80",
          })),
        )
      } else {
        setDestinations([
          {
            name: "",
            latitude: "",
            longitude: "",
            image: "/placeholder.svg?height=80&width=80",
          },
        ])
      }
    }

    setIsLoading(false)
  }, [stationId])

  const handleStationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setStationData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDestinationChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const newDestinations = [...destinations]
    newDestinations[index] = { ...newDestinations[index], [name]: value }
    setDestinations(newDestinations)
  }

  const addDestination = () => {
    setDestinations([
      ...destinations,
      {
        name: "",
        latitude: "",
        longitude: "",
        image: "/placeholder.svg?height=80&width=80",
      },
    ])
  }

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      const newDestinations = [...destinations]
      newDestinations.splice(index, 1)
      setDestinations(newDestinations)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!stationData.name || !stationData.location || !stationData.latitude || !stationData.longitude) {
      alert("Mohon lengkapi data stasiun")
      return
    }

    // Validate destinations
    for (const dest of destinations) {
      if (!dest.name || !dest.latitude || !dest.longitude) {
        alert("Mohon lengkapi semua data destinasi")
        return
      }
    }

    // Format data for submission
    const formattedData = {
      id: stationId,
      ...stationData,
      position: [Number.parseFloat(stationData.latitude), Number.parseFloat(stationData.longitude)],
      destinations: destinations.map((dest) => ({
        name: dest.name,
        position: [Number.parseFloat(dest.latitude), Number.parseFloat(dest.longitude)],
        image: dest.image,
      })),
    }

    // Here you would typically send this data to your API
    console.log("Updating station data:", formattedData)
    alert("Stasiun berhasil diperbarui! (simulasi)")

    // In a real application, you would redirect after successful submission
    // router.push('/admin/stations')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Link href="/admin/stations" className="mr-4 p-2 rounded-full hover:bg-gray-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Edit Stasiun: {stationData.name}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Station Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-red-600" />
            Informasi Stasiun
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Stasiun <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={stationData.name}
                onChange={handleStationChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={stationData.location}
                onChange={handleStationChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                value={stationData.description}
                onChange={handleStationChange}
                rows={3}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                Latitude <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="latitude"
                name="latitude"
                value={stationData.latitude}
                onChange={handleStationChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                Longitude <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="longitude"
                name="longitude"
                value={stationData.longitude}
                onChange={handleStationChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                URL Gambar
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={stationData.image}
                  onChange={handleStationChange}
                  className="w-full p-2 border rounded-l-md focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
                <div className="bg-gray-100 border border-l-0 rounded-r-md p-2 flex items-center">
                  <ImageIcon className="h-5 w-5 text-gray-500" />
                </div>
              </div>

              {/* Preview gambar stasiun */}
              <div className="mt-3 flex items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden border">
                  <img
                    src={stationData.image || "/placeholder.svg"}
                    alt={`Preview ${stationData.name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80"
                    }}
                  />
                </div>
                <span className="ml-3 text-xs text-gray-500">Preview gambar stasiun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Destinations */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-blue-600" />
              Destinasi Terdekat
            </h2>
            <button
              type="button"
              onClick={addDestination}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah Destinasi
            </button>
          </div>

          {destinations.map((destination, index) => (
            <div key={index} className="border-t pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Destinasi #{index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeDestination(index)}
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                  disabled={destinations.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor={`dest-name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Destinasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`dest-name-${index}`}
                    name="name"
                    value={destination.name}
                    onChange={(e) => handleDestinationChange(index, e)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor={`dest-lat-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`dest-lat-${index}`}
                    name="latitude"
                    value={destination.latitude}
                    onChange={(e) => handleDestinationChange(index, e)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor={`dest-lng-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`dest-lng-${index}`}
                    name="longitude"
                    value={destination.longitude}
                    onChange={(e) => handleDestinationChange(index, e)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label htmlFor={`dest-image-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                    URL Gambar
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id={`dest-image-${index}`}
                      name="image"
                      value={destination.image}
                      onChange={(e) => handleDestinationChange(index, e)}
                      className="w-full p-2 border rounded-l-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      placeholder="URL gambar destinasi"
                    />
                    <div className="bg-gray-100 border border-l-0 rounded-r-md p-2 flex items-center">
                      <ImageIcon className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview gambar destinasi */}
              <div className="mt-3 flex items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden border">
                  <img
                    src={destination.image || "/placeholder.svg"}
                    alt={`Preview ${destination.name}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80"
                    }}
                  />
                </div>
                <span className="ml-3 text-xs text-gray-500">Preview gambar destinasi</span>
              </div>
            </div>
          ))}
        </div>

        {/* Submit buttons */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/stations"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Batal
          </Link>
          <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  )
}

