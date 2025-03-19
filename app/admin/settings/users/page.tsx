"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Search, Edit, Trash2, User, Mail, Shield } from "lucide-react"

// Dummy data for users
const dummyUsers = [
  {
    id: 1,
    name: "Admin Utama",
    email: "admin@lrtjabodebek.co.id",
    role: "Administrator",
    lastLogin: "2 jam yang lalu",
    status: "active",
  },
  {
    id: 2,
    name: "Operator Stasiun",
    email: "operator@lrtjabodebek.co.id",
    role: "Operator",
    lastLogin: "Kemarin, 15:30",
    status: "active",
  },
  {
    id: 3,
    name: "Petugas Lapangan",
    email: "petugas@lrtjabodebek.co.id",
    role: "Petugas",
    lastLogin: "3 hari yang lalu",
    status: "inactive",
  },
]

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter users based on search query
  const filteredUsers = dummyUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold">Kelola Pengguna</h1>
        <Link
          href="/admin/settings/users/add"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Pengguna
        </Link>
      </div>

      {/* Search and filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari pengguna berdasarkan nama, email, atau role..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Pengguna
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Login Terakhir
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Shield className="h-4 w-4 mr-2 text-gray-400" />
                      {user.role}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.status === "active" ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/admin/settings/users/edit/${user.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus pengguna ${user.name}?`)) {
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

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada pengguna yang ditemukan
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

