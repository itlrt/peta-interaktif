"use client"

import { useState, useEffect } from "react"
import { Trash2, Plus, Upload, Pencil, X } from "lucide-react"
import Image from "next/image"
import toast from 'react-hot-toast'

interface Station {
  id: number
  name: string
}

interface Transport {
  id: number
  name: string
  type: string
  icon: string
  stations: Station[]
  isAllStation: boolean
}

interface EditTransportForm {
  id: number
  name: string
  type: string
  icon: string
  stationIds: number[]
  isAllStation: boolean
}

export default function TransportPage() {
  const [transports, setTransports] = useState<Transport[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState<number | "all">("all")
  const [newTransport, setNewTransport] = useState({
    name: "",
    type: "",
    icon: "",
    stationIds: [] as number[],
    isAllStation: false
  })
  const [previewIcon, setPreviewIcon] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editTransport, setEditTransport] = useState<EditTransportForm | null>(null)
  const [editPreviewIcon, setEditPreviewIcon] = useState<string | null>(null)
  const [isEditLoading, setIsEditLoading] = useState(false)

  // Fetch data transportasi dan stasiun saat komponen dimount
  useEffect(() => {
    fetchTransports()
    fetchStations()
  }, [])

  const fetchStations = async () => {
    try {
      const response = await fetch('/api/stations')
      const data = await response.json()
      // Urutkan stasiun berdasarkan ID
      const sortedStations = data.sort((a: Station, b: Station) => a.id - b.id)
      setStations(sortedStations)
      if (sortedStations.length > 0) {
        setNewTransport(prev => ({ ...prev, stationIds: [sortedStations[0].id] }))
      }
    } catch (error) {
      console.error('Error fetching stations:', error)
      alert('Gagal mengambil data stasiun')
    }
  }

  const fetchTransports = async () => {
    try {
      const response = await fetch('/api/transportation')
      const data = await response.json()
      setTransports(data)
    } catch (error) {
      console.error('Error fetching transports:', error)
      alert('Gagal mengambil data transportasi')
    }
  }

  // Filter transportasi berdasarkan stasiun yang dipilih
  const filteredTransports = selectedStation === "all" 
    ? transports 
    : transports.filter(t => t.isAllStation || t.stations.some(s => s.id === selectedStation))

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validasi ukuran file (max 1MB)
      if (file.size > 1024 * 1024) {
        alert('Ukuran file terlalu besar. Maksimal 1MB')
        return
      }

      // Buat URL untuk preview
      const previewUrl = URL.createObjectURL(file)
      setPreviewIcon(previewUrl)

      // Convert gambar ke base64 untuk disimpan
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewTransport({ ...newTransport, icon: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTransport.icon) {
      toast.error("Mohon upload icon transportasi", {
        icon: '🖼️',
      })
      return
    }

    if (!newTransport.isAllStation && newTransport.stationIds.length === 0) {
      toast.error("Mohon pilih minimal satu stasiun", {
        icon: '🚉',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/transportation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransport),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan data')
      }

      await fetchTransports()
      
      setNewTransport({
        name: "",
        type: "",
        icon: "",
        stationIds: [],
        isAllStation: false
      })
      setPreviewIcon(null)

      toast.success('Data transportasi berhasil ditambahkan', {
        icon: '🚀',
      })
    } catch (error: any) {
      console.error('Error saving transport:', error)
      toast.error(error.message || 'Gagal menyimpan data transportasi', {
        icon: '⚠️',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transportasi ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/transportation/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Gagal menghapus data')
      }

      await fetchTransports()
      toast.success('Data transportasi berhasil dihapus', {
        icon: '🗑️',
      })
    } catch (error) {
      console.error('Error deleting transport:', error)
      toast.error('Gagal menghapus data transportasi', {
        icon: '⚠️',
      })
    }
  }

  const handleEdit = (transport: Transport) => {
    setEditTransport({
      id: transport.id,
      name: transport.name,
      type: transport.type,
      icon: transport.icon,
      stationIds: transport.stations.map(s => s.id),
      isAllStation: transport.isAllStation
    })
    setEditPreviewIcon(transport.icon)
    setIsEditModalOpen(true)
  }

  const handleEditIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error('Ukuran file terlalu besar. Maksimal 1MB', {
          icon: '⚠️'
        })
        return
      }

      const previewUrl = URL.createObjectURL(file)
      setEditPreviewIcon(previewUrl)

      const reader = new FileReader()
      reader.onloadend = () => {
        setEditTransport(prev => prev ? { ...prev, icon: reader.result as string } : null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTransport) return

    if (!editTransport.icon) {
      toast.error("Mohon upload icon transportasi", {
        icon: '🖼️'
      })
      return
    }

    if (!editTransport.isAllStation && editTransport.stationIds.length === 0) {
      toast.error("Mohon pilih minimal satu stasiun", {
        icon: '🚉'
      })
      return
    }

    setIsEditLoading(true)

    try {
      const response = await fetch(`/api/transportation/${editTransport.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editTransport),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengupdate data')
      }

      await fetchTransports()
      setIsEditModalOpen(false)
      setEditTransport(null)
      setEditPreviewIcon(null)

      toast.success('Data transportasi berhasil diupdate', {
        icon: '✨'
      })
    } catch (error: any) {
      console.error('Error updating transport:', error)
      toast.error(error.message || 'Gagal mengupdate data transportasi', {
        icon: '⚠️'
      })
    } finally {
      setIsEditLoading(false)
    }
  }

  const getStationNames = (transport: Transport) => {
    if (transport.isAllStation) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Semua Stasiun
        </span>
      )
    }

    // Urutkan stasiun berdasarkan ID
    const sortedStations = [...transport.stations].sort((a, b) => a.id - b.id)
    
    return (
      <div className="flex flex-wrap gap-1">
        {sortedStations.map(station => (
          <span
            key={station.id}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {station.name}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Tambah Transportasi Baru</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tersedia Pada Stasiun
            </label>
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  const allStationIds = stations.map(s => s.id)
                  setNewTransport(prev => ({
                    ...prev,
                    stationIds: prev.stationIds.length === stations.length ? [] : allStationIds,
                    isAllStation: false
                  }))
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                {newTransport.stationIds.length === stations.length ? 'Batalkan semua pilihan' : 'Pilih semua stasiun'}
              </button>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {stations.map((station) => (
                  <label key={station.id} className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={newTransport.stationIds.includes(station.id)}
                        onChange={(e) => {
                          setNewTransport(prev => ({
                            ...prev,
                            stationIds: e.target.checked
                              ? [...prev.stationIds, station.id]
                              : prev.stationIds.filter(id => id !== station.id),
                            isAllStation: false
                          }))
                        }}
                        className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                    </div>
                    <div className="ml-2 text-sm">
                      <span className="font-medium text-gray-700">{station.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Transportasi
            </label>
            <input
              type="text"
              value={newTransport.name}
              onChange={(e) => setNewTransport({ ...newTransport, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Contoh: Bus TransJakarta"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Transportasi
            </label>
            <input
              type="text"
              value={newTransport.type}
              onChange={(e) => setNewTransport({ ...newTransport, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Contoh: Bus"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icon Transportasi
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="flex-shrink-0">
                {previewIcon ? (
                  <div className="relative h-12 w-12">
                    <Image
                      src={previewIcon}
                      alt="Preview"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <input
                  type="file"
                  onChange={handleIconChange}
                  accept="image/*"
                  className="hidden"
                  id="icon-upload"
                />
                <label
                  htmlFor="icon-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Upload className="h-5 w-5 mr-2 text-gray-400" />
                  Upload Icon
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF sampai 1MB
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`flex items-center justify-center w-full px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Plus className="w-5 h-5 mr-2" />
            {isLoading ? 'Menyimpan...' : 'Tambah Transportasi'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Daftar Transportasi</h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Filter Stasiun:</label>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="all">Semua Stasiun</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Icon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stasiun
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransports.map((transport) => (
                  <tr key={transport.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="relative h-10 w-9">
                        <Image
                          src={transport.icon}
                          alt={transport.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transport.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transport.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {getStationNames(transport)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(transport)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(transport.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTransports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="text-gray-500 text-sm">
                        {selectedStation === "all" 
                          ? "Belum ada data transportasi"
                          : "Tidak ada transportasi untuk stasiun ini"}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Edit */}
      {isEditModalOpen && editTransport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold">Edit Transportasi</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false)
                  setEditTransport(null)
                  setEditPreviewIcon(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tersedia Pada Stasiun
                </label>
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => {
                      const allStationIds = stations.map(s => s.id)
                      setEditTransport(prev => prev ? {
                        ...prev,
                        stationIds: prev.stationIds.length === stations.length ? [] : allStationIds,
                        isAllStation: false
                      } : null)
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    {editTransport.stationIds.length === stations.length ? 'Batalkan semua pilihan' : 'Pilih semua stasiun'}
                  </button>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {stations.map((station) => (
                      <label key={station.id} className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={editTransport.stationIds.includes(station.id)}
                            onChange={(e) => {
                              setEditTransport(prev => prev ? {
                                ...prev,
                                stationIds: e.target.checked
                                  ? [...prev.stationIds, station.id]
                                  : prev.stationIds.filter(id => id !== station.id),
                                isAllStation: false
                              } : null)
                            }}
                            className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                        </div>
                        <div className="ml-2 text-sm">
                          <span className="font-medium text-gray-700">{station.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Transportasi
                </label>
                <input
                  type="text"
                  value={editTransport.name}
                  onChange={(e) => setEditTransport(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Transportasi
                </label>
                <input
                  type="text"
                  value={editTransport.type}
                  onChange={(e) => setEditTransport(prev => prev ? { ...prev, type: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon Transportasi
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {editPreviewIcon ? (
                      <div className="relative h-12 w-12">
                        <Image
                          src={editPreviewIcon}
                          alt="Preview"
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <input
                      type="file"
                      onChange={handleEditIconChange}
                      accept="image/*"
                      className="hidden"
                      id="edit-icon-upload"
                    />
                    <label
                      htmlFor="edit-icon-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Upload className="h-5 w-5 mr-2 text-gray-400" />
                      Ganti Icon
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditTransport(null)
                    setEditPreviewIcon(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isEditLoading}
                  className={`px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${isEditLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isEditLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 