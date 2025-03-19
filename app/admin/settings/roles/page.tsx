"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Edit, Trash2, Shield } from "lucide-react"

// Dummy data for roles
const dummyRoles = [
  {
    id: 1,
    name: "Administrator",
    description: "Akses penuh ke seluruh sistem",
    userCount: 1,
    permissions: {
      dashboard: true,
      stations: { view: true, create: true, edit: true, delete: true },
      users: { view: true, create: true, edit: true, delete: true },
      roles: { view: true, create: true, edit: true, delete: true },
    },
  },
  {
    id: 2,
    name: "Operator",
    description: "Mengelola stasiun dan destinasi",
    userCount: 3,
    permissions: {
      dashboard: true,
      stations: { view: true, create: true, edit: true, delete: false },
      users: { view: false, create: false, edit: false, delete: false },
      roles: { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: 3,
    name: "Petugas",
    description: "Hanya dapat melihat data",
    userCount: 5,
    permissions: {
      dashboard: true,
      stations: { view: true, create: false, edit: false, delete: false },
      users: { view: false, create: false, edit: false, delete: false },
      roles: { view: false, create: false, edit: false, delete: false },
    },
  },
]

export default function RolesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter roles based on search query
  const filteredRoles = dummyRoles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold">Kelola Roles</h1>
        <Link
          href="/admin/settings/roles/add"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Role
        </Link>
      </div>

      {/* Search and filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari role berdasarkan nama atau deskripsi..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Roles table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Deskripsi
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Pengguna
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Hak Akses
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
              {filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Shield className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{role.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.userCount} pengguna</td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {role.permissions.stations.view && (
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">Stasiun</span>
                      )}
                      {role.permissions.users.view && (
                        <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Pengguna</span>
                      )}
                      {role.permissions.roles.view && (
                        <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">Roles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/admin/settings/roles/edit/${role.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus role ${role.name}?`)) {
                            // Handle delete logic here
                            alert("Fitur penghapusan belum diimplementasikan")
                          }
                        }}
                        disabled={role.name === "Administrator"}
                      >
                        <Trash2
                          className={`h-5 w-5 ${role.name === "Administrator" ? "opacity-50 cursor-not-allowed" : ""}`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRoles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada role yang ditemukan
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

