import Link from "next/link"
import { Map, Users, Settings, PlusCircle } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Map className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">Total Stasiun</h3>
              <p className="text-2xl font-semibold">18</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">Total Destinasi</h3>
              <p className="text-2xl font-semibold">87</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/stations/add"
            className="p-4 border rounded-lg text-center hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mb-2">
                <PlusCircle className="h-6 w-6" />
              </div>
              <span className="font-medium">Tambah Stasiun Baru</span>
            </div>
          </Link>

          <Link
            href="/admin/stations"
            className="p-4 border rounded-lg text-center hover:bg-blue-50 hover:border-blue-200 transition-colors"
          >
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-2">
                <Map className="h-6 w-6" />
              </div>
              <span className="font-medium">Kelola Stasiun</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 pb-3">
          <h2 className="text-lg font-semibold">Aktivitas Terbaru</h2>
        </div>
        <div className="divide-y">
          <div className="flex items-start p-6">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium">Admin menambahkan destinasi baru di Stasiun Dukuh Atas</p>
              <p className="text-xs text-gray-500 mt-1">2 jam yang lalu</p>
            </div>
          </div>

          <div className="flex items-start p-6">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Map className="h-4 w-4" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium">Admin memperbarui informasi Stasiun Cikunir 2</p>
              <p className="text-xs text-gray-500 mt-1">Kemarin, 15:30</p>
            </div>
          </div>

          <div className="flex items-start p-6">
            <div className="h-8 w-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center flex-shrink-0">
              <Settings className="h-4 w-4" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium">Admin mengubah pengaturan tampilan peta</p>
              <p className="text-xs text-gray-500 mt-1">2 hari yang lalu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

