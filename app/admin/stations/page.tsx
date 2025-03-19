"use client"

import { useState } from "react"
import Link from "next/link"
import { Edit, Trash2, Plus, Search, MapPin } from "lucide-react"
import { stations } from "@/components/map-component"

export default function StationsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter stations based on search query
  const filteredStations = stations.filter(
    (station) =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold">Kelola Stasiun</h1>
        <Link
          href="/admin/stations/add"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Stasiun
        </Link>
      </div>

      {/* Search and filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari stasiun berdasarkan nama atau lokasi..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stations table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Stasiun
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Lokasi
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Koordinat
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Destinasi
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStations.map((station) => (
                <tr key={station.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{station.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{station.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-[150px] md:max-w-xs">
                          {station.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{station.location}</td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Array.isArray(station.position)
                      ? `${station.position[0].toFixed(6)}, ${station.position[1].toFixed(6)}`
                      : "Invalid position"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {station.destinations ? station.destinations.length : 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/admin/stations/edit/${station.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus stasiun ${station.name}?`)) {
                            // Handle delete logic here
                            alert("Fitur penghapusan belum diimplementasikan")
                          }
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada stasiun yang ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

