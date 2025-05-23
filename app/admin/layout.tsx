"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from 'next/image'
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Map, LogOut, Settings, Users, ChevronDown, Shield, Navigation, Bus } from "lucide-react"

// Simple auth check - in a real app, use a proper auth solution
const useAuth = () => {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")

      if (token && userData) {
        setIsAuthenticated(true)
        setUser(JSON.parse(userData))
      } else if (!window.location.pathname.includes("/admin/login")) {
        router.push("/admin/login")
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  return { isAuthenticated, isLoading, user }
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { isAuthenticated, isLoading, user } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [stationsOpen, setStationsOpen] = useState(false)

  // Automatically open settings submenu if we're on a settings page
  useEffect(() => {
    if (pathname?.includes("/admin/settings")) {
      setSettingsOpen(true)
    }
    if (pathname?.includes("/admin/stations")) {
      setStationsOpen(true)
    }
  }, [pathname])

  // Don't show sidebar on login page
  const isLoginPage = pathname === "/admin/login"

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/admin/login"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  // If it's the login page or user is not authenticated, just render the children
  if (isLoginPage || !isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        {/* Logo and title */}
        <div className="flex items-center p-4 border-b border-gray-200">
          <div className="relative w-48 h-16">
            <Image
              src="/logo-lrt-merah.png"
              alt="Logo LRT JABODEBEK"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          <ul className="space-y-1">
            <li>
              <Link
                href="/admin"
                className={`flex items-center px-4 py-2 rounded-md ${
                  pathname === "/admin" ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <button
                onClick={() => setStationsOpen(!stationsOpen)}
                className={`flex items-center justify-between w-full px-4 py-2 rounded-md ${
                  pathname?.includes("/admin/stations") ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  <Map className="h-5 w-5 mr-3" />
                  Stasiun
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${stationsOpen ? "transform rotate-180" : ""}`}
                />
              </button>

              {/* Stasiun submenu */}
              {stationsOpen && (
                <ul className="pl-10 space-y-1">
                  <li>
                    <Link
                      href="/admin/stations"
                      className={`flex items-center px-4 py-2 rounded-md text-sm ${
                        pathname === "/admin/stations"
                          ? "bg-red-50 text-red-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Kelola Stasiun
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/stations/transport"
                      className={`flex items-center px-4 py-2 rounded-md text-sm ${
                        pathname === "/admin/stations/transport"
                          ? "bg-red-50 text-red-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Bus className="h-4 w-4 mr-2" />
                      Kelola Transportasi
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {user?.role === 'ADMIN' && (
              <>
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className={`flex items-center justify-between w-full px-4 py-2 rounded-md ${
                    pathname?.includes("/admin/settings") ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 mr-3" />
                    Pengaturan
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${settingsOpen ? "transform rotate-180" : ""}`}
                  />
                </button>

                {/* Settings submenu */}
                {settingsOpen && (
                  <ul className="pl-10 space-y-1">
                    <li>
                      <Link
                        href="/admin/settings/users"
                        className={`flex items-center px-4 py-2 rounded-md text-sm ${
                          pathname === "/admin/settings/users"
                            ? "bg-red-50 text-red-600"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Pengguna
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/settings/roles"
                        className={`flex items-center px-4 py-2 rounded-md text-sm ${
                          pathname === "/admin/settings/roles"
                            ? "bg-red-50 text-red-600"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Roles
                      </Link>
                    </li>
                  </ul>
                )}
              </>
            )}
          </ul>
        </nav>

        {/* Footer navigation */}
        <div className="absolute bottom-0 w-64 border-t border-gray-200 p-2">
          <ul className="space-y-1">
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 rounded-md w-full text-left text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </li>
            <li>
              <Link href="/" className="flex items-center px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                <Map className="h-5 w-5 mr-3" />
                Lihat Peta
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex justify-between items-center px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">Panel Admin LRT JABODEBEK</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.name || 'Admin'}</span>
              <div className="h-8 w-8 rounded-full bg-red-600 text-white flex items-center justify-center">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  )
}

