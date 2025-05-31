"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from 'next/image'
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Map, LogOut, Settings, Users, ChevronDown, Shield, Navigation, Bus, Clock, Menu, ChevronLeft } from "lucide-react"

// Simple auth check - in a real app, use a proper auth solution
const useAuth = () => {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  // Function to check if token is expired
  const isTokenExpired = (loginTime: string) => {
    const now = new Date().getTime()
    const loginTimestamp = parseInt(loginTime)
    const oneHour = 60 * 60 * 1000 // 1 hour in milliseconds
    
    return (now - loginTimestamp) > oneHour
  }

  // Function to logout user
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("loginTime")
    setIsAuthenticated(false)
    setUser(null)
    router.push("/admin/login")
  }

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")
      const loginTime = localStorage.getItem("loginTime")

      if (token && userData && loginTime) {
        // Check if token is expired
        if (isTokenExpired(loginTime)) {
          // Token expired, logout user
          logout()
          return
        }

        setIsAuthenticated(true)
        setUser(JSON.parse(userData))
      } else if (!window.location.pathname.includes("/admin/login")) {
        router.push("/admin/login")
      }
      setIsLoading(false)
    }

    checkAuth()

    // Set up interval to check token expiration every minute
    const interval = setInterval(() => {
      const loginTime = localStorage.getItem("loginTime")
      if (loginTime && isTokenExpired(loginTime)) {
        logout()
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [router])

  return { isAuthenticated, isLoading, user, logout }
}

// Session Warning Component
const SessionWarning = ({ 
  timeLeft, 
  onExtend, 
  onLogout 
}: { 
  timeLeft: number
  onExtend: () => void
  onLogout: () => void
}) => {
  const minutes = Math.floor(timeLeft / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <Clock className="h-6 w-6 text-orange-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Session Akan Berakhir</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Session Anda akan berakhir dalam{" "}
          <span className="font-semibold text-orange-600">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Apakah Anda ingin memperpanjang session atau logout sekarang?
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onExtend}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Perpanjang Session
          </button>
          <button
            onClick={onLogout}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Logout Sekarang
          </button>
        </div>
      </div>
    </div>
  )
}

// Session Timer Component
const SessionTimer = ({ loginTime }: { loginTime: string }) => {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime()
      const loginTimestamp = parseInt(loginTime)
      const oneHour = 60 * 60 * 1000
      const remaining = oneHour - (now - loginTimestamp)
      
      setTimeLeft(Math.max(0, remaining))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [loginTime])

  const minutes = Math.floor(timeLeft / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)

  if (timeLeft <= 0) return null

  return (
    <div className="flex items-center text-xs text-gray-500">
      <Clock className="h-3 w-3 mr-1" />
      <span>
        Session: {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [stationsOpen, setStationsOpen] = useState(false)
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0)
  const [loginTime, setLoginTime] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  // Function to extend session
  const extendSession = () => {
    const newLoginTime = new Date().getTime().toString()
    localStorage.setItem("loginTime", newLoginTime)
    setLoginTime(newLoginTime)
    setShowSessionWarning(false)
    showToastMessage("Session berhasil diperpanjang 1 jam")
  }

  // Check session time and show warning
  useEffect(() => {
    if (!isAuthenticated) return

    const checkSessionTime = () => {
      const loginTime = localStorage.getItem("loginTime")
      if (!loginTime) return

      const now = new Date().getTime()
      const loginTimestamp = parseInt(loginTime)
      const oneHour = 60 * 60 * 1000 // 1 hour
      const fiveMinutes = 5 * 60 * 1000 // 5 minutes
      
      const timeElapsed = now - loginTimestamp
      const timeLeft = oneHour - timeElapsed

      // Show warning if less than 5 minutes left
      if (timeLeft <= fiveMinutes && timeLeft > 0) {
        setSessionTimeLeft(timeLeft)
        setShowSessionWarning(true)
      } else {
        setShowSessionWarning(false)
      }
    }

    // Check immediately
    checkSessionTime()

    // Check every 30 seconds
    const interval = setInterval(checkSessionTime, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Update countdown timer
  useEffect(() => {
    if (!showSessionWarning) return

    const interval = setInterval(() => {
      const loginTime = localStorage.getItem("loginTime")
      if (!loginTime) return

      const now = new Date().getTime()
      const loginTimestamp = parseInt(loginTime)
      const oneHour = 60 * 60 * 1000
      const timeLeft = oneHour - (now - loginTimestamp)

      if (timeLeft <= 0) {
        logout()
      } else {
        setSessionTimeLeft(timeLeft)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [showSessionWarning, logout])

  // Get login time from localStorage
  useEffect(() => {
    const storedLoginTime = localStorage.getItem("loginTime")
    setLoginTime(storedLoginTime)
  }, [isAuthenticated])

  // Function to show toast
  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleLogout = () => {
    logout()
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
    // Close submenus when collapsing
    if (!sidebarCollapsed) {
      setSettingsOpen(false)
      setStationsOpen(false)
    }
  }

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${sidebarCollapsed ? 'w-16' : 'w-64'} 
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white border-r border-gray-200 transition-all duration-300 relative
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
      `}>
        {/* Logo and title */}
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-6'} py-4 border-b border-gray-200 transition-all duration-300`}>
          {sidebarCollapsed ? (
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
          ) : (
            <div className="relative w-48 h-16">
              <Image
                src="/logo-lrt-merah.png"
                alt="Logo LRT JABODEBEK"
                fill
                className="object-contain"
                priority
              />
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:bg-gray-50 transition-colors z-10 hidden lg:flex"
        >
          {sidebarCollapsed ? (
            <Menu className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>

        {/* Navigation */}
        <nav className={`${sidebarCollapsed ? 'px-2' : 'px-4'} py-4 transition-all duration-300`}>
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin"
                className={`flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'px-4'} py-3 rounded-lg transition-colors group relative ${
                  pathname === "/admin" ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"
                }`}
                title={sidebarCollapsed ? "Dashboard" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="ml-3">Dashboard</span>}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    Dashboard
                  </div>
                )}
              </Link>
            </li>
            <li>
              <button
                onClick={() => {
                  if (!sidebarCollapsed) {
                    setStationsOpen(!stationsOpen)
                  }
                }}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'justify-between px-4'} w-full py-3 rounded-lg transition-colors group relative ${
                  pathname?.includes("/admin/stations") ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"
                }`}
                title={sidebarCollapsed ? "Stasiun" : ""}
              >
                <div className="flex items-center">
                  <Map className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="ml-3">Stasiun</span>}
                </div>
                {!sidebarCollapsed && (
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${stationsOpen ? "transform rotate-180" : ""}`}
                  />
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    Stasiun
                  </div>
                )}
              </button>

              {/* Stasiun submenu */}
              {stationsOpen && !sidebarCollapsed && (
                <ul className="mt-2 ml-6 space-y-1">
                  <li>
                    <Link
                      href="/admin/stations"
                      className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                        pathname === "/admin/stations"
                          ? "bg-red-50 text-red-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Navigation className="h-4 w-4 mr-3" />
                      Kelola Stasiun
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/stations/transport"
                      className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                        pathname === "/admin/stations/transport"
                          ? "bg-red-50 text-red-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Bus className="h-4 w-4 mr-3" />
                      Kelola Transportasi
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {user?.role === 'ADMIN' && (
              <li>
                <button
                  onClick={() => {
                    if (!sidebarCollapsed) {
                      setSettingsOpen(!settingsOpen)
                    }
                  }}
                  className={`flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'justify-between px-4'} w-full py-3 rounded-lg transition-colors group relative ${
                    pathname?.includes("/admin/settings") ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title={sidebarCollapsed ? "Pengaturan" : ""}
                >
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="ml-3">Pengaturan</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${settingsOpen ? "transform rotate-180" : ""}`}
                    />
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      Pengaturan
                    </div>
                  )}
                </button>

                {/* Settings submenu */}
                {settingsOpen && !sidebarCollapsed && (
                  <ul className="mt-2 ml-6 space-y-1">
                    <li>
                      <Link
                        href="/admin/settings/users"
                        className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                          pathname === "/admin/settings/users"
                            ? "bg-red-50 text-red-600"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Users className="h-4 w-4 mr-3" />
                        Pengguna
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/settings/roles"
                        className={`flex items-center px-4 py-2 rounded-lg text-sm transition-colors ${
                          pathname === "/admin/settings/roles"
                            ? "bg-red-50 text-red-600"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4 mr-3" />
                        Roles
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            )}
          </ul>
        </nav>

        {/* Footer navigation */}
        <div className={`absolute bottom-0 ${sidebarCollapsed ? 'w-16' : 'w-64'} border-t border-gray-200 ${sidebarCollapsed ? 'px-2' : 'px-4'} py-4 transition-all duration-300`}>
          <ul className="space-y-2">
            <li>
              <button
                onClick={handleLogout}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'px-4'} py-3 rounded-lg w-full text-left text-gray-700 hover:bg-gray-100 transition-colors group relative`}
                title={sidebarCollapsed ? "Logout" : ""}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="ml-3">Logout</span>}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    Logout
                  </div>
                )}
              </button>
            </li>
            <li>
              <Link 
                href="/" 
                className={`flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'px-4'} py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group relative`}
                title={sidebarCollapsed ? "Lihat Peta" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Map className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="ml-3">Lihat Peta</span>}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    Lihat Peta
                  </div>
                )}
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
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Panel Admin LRT JABODEBEK</h2>
                {loginTime && <SessionTimer loginTime={loginTime} />}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.name || 'Admin'}</span>
              <div className="h-8 w-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-medium">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>

      {/* Session Warning Modal */}
      {showSessionWarning && (
        <SessionWarning
          timeLeft={sessionTimeLeft}
          onExtend={extendSession}
          onLogout={logout}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  )
}