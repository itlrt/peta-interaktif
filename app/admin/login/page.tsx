"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock, User } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Check if already logged in
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      router.push("/admin")
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simple validation
    if (!credentials.username || !credentials.password) {
      setError("Username dan password harus diisi")
      setIsLoading(false)
      return
    }

    try {
      // Simulate authentication delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, accept any login with admin/admin
      if (credentials.username === "admin" && credentials.password === "admin") {
        // Set login state in localStorage (in a real app, use secure cookies/tokens)
        localStorage.setItem("isLoggedIn", "true")
        router.push("/admin")
      } else {
        setError("Username atau password salah")
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-LRT-sjqURYP5YQquhOaJ2hXr9JTrH0hFC2.png"
            alt="Logo LRT Jabodebek"
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-800">Admin CMS</h1>
          <p className="text-gray-600">Masuk untuk mengelola data LRT Jabodebek</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                value={credentials.username}
                onChange={handleChange}
                className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
                placeholder="admin"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Untuk demo, gunakan username: admin, password: admin</p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium 
                ${isLoading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"} 
                transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
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
                "Masuk"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

