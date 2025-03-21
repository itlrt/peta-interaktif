"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, MapPin, Upload } from "lucide-react"
import Image from "next/image"

interface Destination {
  id?: number
  name: string
  latitude: number | string
  longitude: number | string
  imageUrl?: string
  imageFile?: File
}

export default function AddStationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    imageUrl: "",
  })
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [destinationPreviews, setDestinationPreviews] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddDestination = () => {
    setDestinations((prev) => [
      ...prev,
      {
        name: "",
        latitude: 0,
        longitude: 0,
        imageUrl: "",
        imageFile: undefined,
      },
    ])
    setDestinationPreviews((prev) => [...prev, ""])
  }

  const handleDestinationChange = (index: number, field: keyof Destination, value: string) => {
    setDestinations((prev) =>
      prev.map((dest, i) =>
        i === index
          ? {
              ...dest,
              [field]: field === "latitude" || field === "longitude" ? parseFloat(value) || 0 : value,
            }
          : dest
      )
    )
  }

  const handleRemoveDestination = (index: number) => {
    setDestinations((prev) => prev.filter((_, i) => i !== index))
    setDestinationPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Ukuran gambar tidak boleh lebih dari 5MB")
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setFormData((prev) => ({ ...prev, imageUrl: "" }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDestinationImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Ukuran gambar tidak boleh lebih dari 5MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const newPreviews = [...destinationPreviews]
        newPreviews[index] = reader.result as string
        setDestinationPreviews(newPreviews)
        
        const newDestinations = [...destinations]
        newDestinations[index] = {
          ...newDestinations[index],
          imageUrl: undefined,
          imageFile: file
        }
        setDestinations(newDestinations)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Gagal mengunggah gambar")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Error uploading image:", error)
      throw new Error("Gagal mengunggah gambar")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Validasi input
      if (!formData.name || !formData.latitude || !formData.longitude) {
        throw new Error("Nama, latitude, dan longitude harus diisi")
      }

      // Validasi format latitude dan longitude
      const latitude = parseFloat(formData.latitude)
      const longitude = parseFloat(formData.longitude)

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error("Latitude dan longitude harus berupa angka")
      }

      // Validasi destinasi
      const validDestinations = destinations.filter(
        (dest) => dest.name && !isNaN(Number(dest.latitude)) && !isNaN(Number(dest.longitude))
      )

      // Upload gambar stasiun jika ada
      let stationImageUrl = formData.imageUrl
      const stationImageInput = document.querySelector<HTMLInputElement>('#station-image')
      if (stationImageInput?.files?.[0]) {
        stationImageUrl = await uploadImage(stationImageInput.files[0])
      }

      // Upload gambar destinasi dan persiapkan data
      const destinationsWithImages = await Promise.all(
        destinations.map(async (dest, index) => {
          let imageUrl = dest.imageUrl
          const input = document.querySelector<HTMLInputElement>(`#destination-image-${index}`)
          if (input?.files?.[0]) {
            imageUrl = await uploadImage(input.files[0])
          }
          return {
            ...dest,
            imageUrl
          }
        })
      )

      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/admin/login")
        return
      }

      // Kirim request
      const response = await fetch("/api/stations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          latitude,
          longitude,
          imageUrl: stationImageUrl,
          destinations: destinationsWithImages.map(dest => ({
            name: dest.name,
            latitude: Number(dest.latitude),
            longitude: Number(dest.longitude),
            imageUrl: dest.imageUrl
          }))
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Gagal menambahkan stasiun")
      }

      // Redirect ke halaman daftar stasiun
      router.push("/admin/stations")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/stations"
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Tambah Stasiun</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Data Stasiun */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Stasiun</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Stasiun
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gambar Stasiun
              </label>
              <div className="space-y-2">
                {imagePreview && (
                  <div className="relative w-full h-48">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Pilih Gambar</span>
                  <input
                    type="file"
                    id="station-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Destinasi */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Destinasi Terdekat</h2>
            <button
              type="button"
              onClick={handleAddDestination}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Tambah Destinasi
            </button>
          </div>

          <div className="space-y-6">
            {destinations.map((destination, index) => (
              <div key={index} className="relative bg-gray-50 rounded-lg p-4">
                <button
                  type="button"
                  onClick={() => handleRemoveDestination(index)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Destinasi
                    </label>
                    <input
                      type="text"
                      value={destination.name}
                      onChange={(e) => handleDestinationChange(index, "name", e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                      </label>
                      <input
                        type="text"
                        value={destination.latitude}
                        onChange={(e) => handleDestinationChange(index, "latitude", e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                      </label>
                      <input
                        type="text"
                        value={destination.longitude}
                        onChange={(e) => handleDestinationChange(index, "longitude", e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gambar Destinasi
                    </label>
                    <div className="space-y-2">
                      {destinationPreviews[index] && (
                        <div className="relative w-full h-48">
                          <Image
                            src={destinationPreviews[index]}
                            alt="Preview"
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                        <Upload className="h-5 w-5 text-gray-500" />
                        <span className="text-sm text-gray-600">Pilih Gambar</span>
                        <input
                          type="file"
                          id={`destination-image-${index}`}
                          accept="image/*"
                          onChange={(e) => handleDestinationImageChange(index, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {destinations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Belum ada destinasi terdekat</p>
                <p className="text-sm">Klik tombol "Tambah Destinasi" untuk menambahkan</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white font-medium 
              ${isLoading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"} 
              transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Memproses...
              </span>
            ) : (
              "Simpan Stasiun"
            )}
          </button>

          <Link
            href="/admin/stations"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}

