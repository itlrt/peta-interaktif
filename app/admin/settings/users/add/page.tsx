"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Shield } from "lucide-react"

// Dummy data for roles
const availableRoles = [
  { id: 1, name: "Administrator" },
  { id: 2, name: "Operator" },
  { id: 3, name: "Petugas" },
]

interface UserData {
  name: string
  email: string
  password: string
  confirmPassword: string
  roleId: number
  status: "active" | "inactive"
}

export default function AddUserPage() {
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleId: 0,
    status: "active",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof UserData, string>>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (errors[name as keyof UserData]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof UserData]
        return newErrors
      })
    }
  }

  const handleStatusChange = (status: "active" | "inactive") => {
    setUserData((prev) => ({ ...prev, status }))
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserData, string>> = {}

    // Validate name
    if (!userData.name.trim()) {
      newErrors.name = "Nama harus diisi"
    }

    // Validate email
    if (!userData.email.trim()) {
      newErrors.email = "Email harus diisi"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = "Format email tidak valid"
    }

    // Validate password
    if (!userData.password) {
      newErrors.password = "Password harus diisi"
    } else if (userData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter"
    }

    // Validate confirm password
    if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok"
    }

    // Validate role
    if (!userData.roleId) {
      newErrors.roleId = "Role harus dipilih"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Here you would typically send this data to your API
    console.log("Submitting user data:", userData)
    alert("Pengguna berhasil ditambahkan! (simulasi)")

    // In a real application, you would redirect after successful submission
    // router.push('/admin/settings/users')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Link href="/admin/settings/users" className="mr-4 p-2 rounded-full hover:bg-gray-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Tambah Pengguna Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User className="mr-2 h-5 w-5 text-blue-600" />
            Informasi Pengguna
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="email@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={userData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={userData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Masukkan password yang sama"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>
        </div>

        {/* Role and Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="mr-2 h-5 w-5 text-purple-600" />
            Role dan Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="roleId"
                  name="roleId"
                  value={userData.roleId}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-purple-600 focus:outline-none appearance-none bg-white ${
                    errors.roleId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value={0}>Pilih Role</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              {errors.roleId && <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="flex space-x-4 mt-2">
                <div
                  className={`flex items-center px-4 py-2 rounded-md cursor-pointer border ${
                    userData.status === "active"
                      ? "bg-green-50 border-green-500 text-green-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleStatusChange("active")}
                >
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${userData.status === "active" ? "bg-green-500" : "bg-gray-300"}`}
                  ></div>
                  <span>Aktif</span>
                </div>
                <div
                  className={`flex items-center px-4 py-2 rounded-md cursor-pointer border ${
                    userData.status === "inactive"
                      ? "bg-gray-50 border-gray-500 text-gray-700"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleStatusChange("inactive")}
                >
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${userData.status === "inactive" ? "bg-gray-500" : "bg-gray-300"}`}
                  ></div>
                  <span>Tidak Aktif</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/settings/users"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Batal
          </Link>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Simpan Pengguna
          </button>
        </div>
      </form>
    </div>
  )
}

