"use client"

import { useState } from "react"
import { Shield, Info } from "lucide-react"

const roles = [
  {
    name: "ADMIN",
    description: "Akses penuh ke semua fitur sistem",
    permissions: [
      "Mengelola pengguna",
      "Mengelola roles",
      "Mengelola stasiun",
      "Mengelola destinasi",
      "Melihat statistik",
    ],
  },
  {
    name: "OPERATOR",
    description: "Akses untuk mengelola data stasiun dan destinasi",
    permissions: ["Mengelola stasiun", "Mengelola destinasi", "Melihat statistik"],
  },
  {
    name: "VIEWER",
    description: "Akses hanya untuk melihat data",
    permissions: ["Melihat statistik"],
  },
]

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Role</h1>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Role sistem sudah ditentukan dan tidak dapat diubah untuk menjaga keamanan aplikasi.
              Untuk mengubah hak akses pengguna, silakan atur melalui menu Manajemen Pengguna.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.name}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-red-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">{role.description}</p>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Hak Akses:</h4>
                <ul className="space-y-1">
                  {role.permissions.map((permission) => (
                    <li key={permission} className="flex items-center text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600 mr-2"></span>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

