"use client"

import { useState, useEffect } from "react"
import { Map, Plus, Pencil, Trash2, X } from "lucide-react"
import Link from "next/link"

export default function VirtualTrackPage() {
  const [stations, setStations] = useState<{ id: number; name: string }[]>([])
  const [virtualTracks, setVirtualTracks] = useState<any[]>([])
  const [selectedStation, setSelectedStation] = useState("")
  const [name, setName] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)

  // Ambil data stasiun dari API
  useEffect(() => {
    async function fetchStations() {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/stations", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error("Gagal mengambil data stasiun")
        const data = await response.json()
        setStations(data.map((s: any) => ({ id: s.id, name: s.name })))
      } catch (err) {
        setStations([])
      }
    }
    fetchStations()
  }, [])

  // Ambil data virtual track dari API
  useEffect(() => {
    async function fetchVirtualTracks() {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/virtual-track", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error("Gagal mengambil data virtual track")
        const data = await response.json()
        setVirtualTracks(data.map((vt: any) => ({
          id: vt.id,
          stationId: vt.stationId,
          stationName: vt.station.name,
          name: vt.name,
          latitude: vt.latitude,
          longitude: vt.longitude,
        })))
      } catch (err) {
        setVirtualTracks([])
      }
    }
    fetchVirtualTracks()
  }, []) // Hapus stations dari dependency karena kita sudah mendapatkan nama stasiun dari API

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccess(false)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/virtual-track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stationId: selectedStation,
          name,
          latitude,
          longitude,
        }),
      })
      if (!response.ok) throw new Error("Gagal menyimpan data")
      const data = await response.json()
      setIsSubmitting(false)
      setSuccess(true)
      setName("")
      setLatitude("")
      setLongitude("")
      setSelectedStation("")
      // Tambahkan ke tabel
      setVirtualTracks(prev => [
        ...prev,
        {
          id: data.id,
          stationId: data.stationId,
          stationName: stations.find(s => s.id === Number(data.stationId))?.name || "",
          name: data.name,
          latitude: data.latitude,
          longitude: data.longitude,
        }
      ])
    } catch (err) {
      setIsSubmitting(false)
      alert("Gagal menyimpan data")
    }
  }

  const handleDelete = (id: number) => {
    setShowDeleteConfirm(id)
  }

  const confirmDelete = () => {
    if (showDeleteConfirm == null) return
    setIsDeleteLoading(true)
    setTimeout(() => {
      setVirtualTracks(prev => prev.filter(vt => vt.id !== showDeleteConfirm))
      setShowDeleteConfirm(null)
      setIsDeleteLoading(false)
    }, 800)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">Virtual Track</h1>
          <p className="text-sm text-gray-500">Kelola mapping virtual track circuit untuk stasiun LRT</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daftar Virtual Track */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Daftar Virtual Track</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stasiun</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Virtual Track</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latitude</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Longitude</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {virtualTracks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                      Belum ada data virtual track
                    </td>
                  </tr>
                ) : (
                  virtualTracks.map((vt) => (
                    <tr key={vt.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">{vt.stationName}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{vt.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{vt.latitude}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{vt.longitude}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {}}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(vt.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Form Tambah Virtual Track */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tambah Virtual Track</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stasiun</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                value={selectedStation}
                onChange={e => setSelectedStation(e.target.value)}
                required
              >
                <option value="">Pilih stasiun</option>
                {stations.map(station => (
                  <option key={station.id} value={station.id}>{station.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Virtual Track</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Masukkan nama/kode virtual track"
                required
              />
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  value={latitude}
                  onChange={e => setLatitude(e.target.value)}
                  placeholder="Masukkan latitude"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                  value={longitude}
                  onChange={e => setLongitude(e.target.value)}
                  placeholder="Masukkan longitude"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow disabled:opacity-60"
                disabled={isSubmitting}
              >
                <Plus className="w-5 h-5" />
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </button>
              {success && <span className="text-green-600 text-sm font-medium">Data berhasil disimpan!</span>}
            </div>
          </form>
        </div>
      </div>
      {/* Modal Konfirmasi Hapus */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Konfirmasi Hapus</h3>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus virtual track ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleteLoading}
                  className={`px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${isDeleteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isDeleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 