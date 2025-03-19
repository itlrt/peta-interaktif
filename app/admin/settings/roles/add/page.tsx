"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Shield } from "lucide-react"

// Permission types
type PermissionAction = "view" | "create" | "edit" | "delete"
type ModulePermissions = Record<PermissionAction, boolean>

interface RoleData {
  name: string
  description: string
  permissions: {
    dashboard: boolean
    stations: ModulePermissions
    users: ModulePermissions
    roles: ModulePermissions
  }
}

export default function AddRolePage() {
  const [roleData, setRoleData] = useState<RoleData>({
    name: "",
    description: "",
    permissions: {
      dashboard: false,
      stations: { view: false, create: false, edit: false, delete: false },
      users: { view: false, create: false, edit: false, delete: false },
      roles: { view: false, create: false, edit: false, delete: false },
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRoleData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePermissionChange = (module: string, action: string, checked: boolean) => {
    setRoleData((prev) => {
      const newData = { ...prev }

      if (module === "dashboard") {
        newData.permissions.dashboard = checked
      } else if (module === "stations" || module === "users" || module === "roles") {
        newData.permissions[module][action as PermissionAction] = checked

        // If unchecking view, uncheck all other permissions for this module
        if (action === "view" && !checked) {
          newData.permissions[module].create = false
          newData.permissions[module].edit = false
          newData.permissions[module].delete = false
        }

        // If checking any other permission, make sure view is checked
        if (action !== "view" && checked) {
          newData.permissions[module].view = true
        }
      }

      return newData
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!roleData.name) {
      alert("Nama role harus diisi")
      return
    }

    // Here you would typically send this data to your API
    console.log("Submitting role data:", roleData)
    alert("Role berhasil ditambahkan! (simulasi)")

    // In a real application, you would redirect after successful submission
    // router.push('/admin/settings/roles')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Link href="/admin/settings/roles" className="mr-4 p-2 rounded-full hover:bg-gray-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Tambah Role Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="mr-2 h-5 w-5 text-purple-600" />
            Informasi Role
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={roleData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-600 focus:outline-none"
                placeholder="Contoh: Editor"
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
                value={roleData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-600 focus:outline-none"
                placeholder="Deskripsi singkat tentang role ini"
              />
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Hak Akses</h2>

          <div className="space-y-6">
            {/* Dashboard permissions */}
            <div>
              <h3 className="font-medium mb-2 pb-2 border-b">Dashboard</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="perm-dashboard"
                  checked={roleData.permissions.dashboard}
                  onChange={(e) => handlePermissionChange("dashboard", "view", e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="perm-dashboard" className="ml-2 block text-sm text-gray-700">
                  Akses Dashboard
                </label>
              </div>
            </div>

            {/* Stations permissions */}
            <div>
              <h3 className="font-medium mb-2 pb-2 border-b">Stasiun</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-stations-view"
                    checked={roleData.permissions.stations.view}
                    onChange={(e) => handlePermissionChange("stations", "view", e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="perm-stations-view" className="ml-2 block text-sm text-gray-700">
                    Lihat Stasiun
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-stations-create"
                    checked={roleData.permissions.stations.create}
                    onChange={(e) => handlePermissionChange("stations", "create", e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    disabled={!roleData.permissions.stations.view}
                  />
                  <label
                    htmlFor="perm-stations-create"
                    className={`ml-2 block text-sm ${!roleData.permissions.stations.view ? "text-gray-400" : "text-gray-700"}`}
                  >
                    Tambah Stasiun
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-stations-edit"
                    checked={roleData.permissions.stations.edit}
                    onChange={(e) => handlePermissionChange("stations", "edit", e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    disabled={!roleData.permissions.stations.view}
                  />
                  <label
                    htmlFor="perm-stations-edit"
                    className={`ml-2 block text-sm ${!roleData.permissions.stations.view ? "text-gray-400" : "text-gray-700"}`}
                  >
                    Edit Stasiun
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-stations-delete"
                    checked={roleData.permissions.stations.delete}
                    onChange={(e) => handlePermissionChange("stations", "delete", e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    disabled={!roleData.permissions.stations.view}
                  />
                  <label
                    htmlFor="perm-stations-delete"
                    className={`ml-2 block text-sm ${!roleData.permissions.stations.view ? "text-gray-400" : "text-gray-700"}`}
                  >
                    Hapus Stasiun
                  </label>
                </div>
              </div>
            </div>

            {/* Users permissions */}
            <div>
              <h3 className="font-medium mb-2 pb-2 border-b">Pengguna</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-users-view"
                    checked={roleData.permissions.users.view}
                    onChange={(e) => handlePermissionChange("users", "view", e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="perm-users-view" className="ml-2 block text-sm text-gray-700">
                    Lihat Pengguna
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-users-create"
                    checked={roleData.permissions.users.create}
                    onChange={(e) => handlePermissionChange("users", "create", e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    disabled={!roleData.permissions.users.view}
                  />
                  <label
                    htmlFor="perm-users-create"
                    className={`ml-2 block text-sm ${!roleData.permissions.users.view ? "text-gray-400" : "text-gray-700"}`}
                  >
                    Tambah Pengguna
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-users-edit"
                    checked={roleData.permissions.users.edit}
                    onChange={(e) => handlePermissionChange("users", "edit", e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    disabled={!roleData.permissions.users.view}
                  />
                  <label
                    htmlFor="perm-users-edit"
                    className={`ml-2 block text-sm ${!roleData.permissions.users.view ? "text-gray-400" : "text-gray-700"}`}
                  >
                    Edit Pengguna
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-users-delete"
                    checked={roleData.permissions.users.delete}
                    onChange={(e) => handlePermissionChange("users", "delete", e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    disabled={!roleData.permissions.users.view}
                  />
                  <label
                    htmlFor="perm-users-delete"
                    className={`ml-2 block text-sm ${!roleData.permissions.users.view ? "text-gray-400" : "text-gray-700"}`}
                  >
                    Hapus Pengguna
                  </label>
                </div>
              </div>
            </div>

            {/* Roles permissions */}
            <div>
              <h3 className="font-medium mb-2 pb-2 border-b">Roles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-roles-view"
                    checked={roleData.permissions.roles.view}
                    onChange={(e) => handlePermissionChange("roles", "view", e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="perm-roles-view" className="ml-2 block text-sm text-gray-700">
                    Lihat Roles
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-roles-create"
                    checked={roleData.permissions.roles.create}
                    onChange={(e) => handlePermissionChange("roles", "create", e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    disabled={!roleData.permissions.roles.view}
                  />
                  <label
                    htmlFor="perm-roles-create"
                    className={`ml-2 block text-sm ${!roleData.permissions.roles.view ? "text-gray-400" : "text-gray-700"}`}
                  >
                    Tambah Role
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-roles-edit"
                    checked={roleData.permissions.roles.edit}
                    onChange={(e) => handlePermissionChange("roles", "edit", e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    disabled={!roleData.permissions.roles.view}
                  />
                  <label
                    htmlFor="perm-roles-edit"
                    className={`ml-2 block text-sm ${!roleData.permissions.roles.view ? "text-gray-400" : "text-gray-700"}`}
                  >
                    Edit Role
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="perm-roles-delete"
                    checked={roleData.permissions.roles.delete}
                    onChange={(e) => handlePermissionChange("roles", "delete", e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    disabled={!roleData.permissions.roles.view}
                  />
                  <label
                    htmlFor="perm-roles-delete"
                    className={`ml-2 block text-sm ${!roleData.permissions.roles.view ? "text-gray-400" : "text-gray-700"}`}
                  >
                    Hapus Role
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/settings/roles"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Batal
          </Link>
          <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Simpan Role
          </button>
        </div>
      </form>
    </div>
  )
}

