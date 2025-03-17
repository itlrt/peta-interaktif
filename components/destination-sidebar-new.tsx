"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { MapPin, Navigation, ChevronLeft, ChevronRight } from "lucide-react"
import { Destination } from "./map-component"
import Image from "next/image"

interface DestinationSidebarProps {
  stationName: string
  stationLocation: string
  destinations: Destination[]
  onDestinationSelect: (position: [number, number]) => void
  isOpen: boolean
  onToggle: () => void
  stationPosition: [number, number]
  routeInfo: { distance: number; duration: number } | null
  routeStartPoint: [number, number] | null
  routeEndPoint: [number, number] | null
  onResetRoute: () => void
  transportMode: "pedestrian" | "auto" | "motorcycle"
  onTransportModeChange: (mode: "pedestrian" | "auto" | "motorcycle") => void
  formatDuration: (seconds?: number) => string
}

export default function DestinationSidebar({
  stationName,
  stationLocation,
  destinations,
  onDestinationSelect,
  isOpen,
  onToggle,
  stationPosition,
  routeInfo,
  routeStartPoint,
  routeEndPoint,
  onResetRoute,
  transportMode,
  onTransportModeChange,
  formatDuration,
}: DestinationSidebarProps) {
  // Inisialisasi state dengan array kosong untuk menghindari masalah referensi
  const [destinationsWithRoute, setDestinationsWithRoute] = useState<Destination[]>([])
  const [isCalculating, setIsCalculating] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 5
  const [processingDestinations, setProcessingDestinations] = useState<boolean[]>([])
  const [currentStationPosition, setCurrentStationPosition] = useState<[number, number] | null>(null)
  const calculationRef = useRef<boolean>(true)
  
  // Refs untuk menghindari dependency yang berubah
  const destinationsRef = useRef(destinations)
  const stationPositionRef = useRef(stationPosition)
  const transportModeRef = useRef(transportMode)
  const retryCountRef = useRef(retryCount)
  const destinationsWithRouteRef = useRef(destinationsWithRoute)
  const processingDestinationsRef = useRef(processingDestinations)
  
  // Update refs saat props berubah
  useEffect(() => {
    destinationsRef.current = destinations
    stationPositionRef.current = stationPosition
    transportModeRef.current = transportMode
    retryCountRef.current = retryCount
    destinationsWithRouteRef.current = destinationsWithRoute
    processingDestinationsRef.current = processingDestinations
  }, [destinations, stationPosition, transportMode, retryCount, destinationsWithRoute, processingDestinations])
  
  // Reset state ketika destinasi berubah (stasiun baru dipilih)
  // Ini penting untuk memastikan destinasi terdekat diperbarui dengan benar
  useEffect(() => {
    console.log("Destinations changed, resetting state", destinations.length)
    setDestinationsWithRoute([...destinations])
    setProcessingDestinations(new Array(destinations.length).fill(false))
    setIsCalculating(true)
    setRetryCount(0)
    setCurrentStationPosition(stationPosition)
    calculationRef.current = true
  }, [destinations, stationPosition])
  
  // Definisikan calculateRoutes dengan useCallback dan gunakan refs
  const calculateRoutes = useCallback(async () => {
    setIsCalculating(true)
    const destinations = destinationsRef.current
    const stationPosition = stationPositionRef.current
    const transportMode = transportModeRef.current
    const destinationsWithRoute = destinationsWithRouteRef.current
    const processingDestinations = processingDestinationsRef.current
    
    const updatedDestinations = [...destinationsWithRoute.length > 0 ? destinationsWithRoute : destinations]
    const updatedProcessing = [...processingDestinations]
    let failedDestinations = 0
    let pendingDestinations = 0
    
    for (let i = 0; i < updatedDestinations.length; i++) {
      // Periksa apakah perhitungan masih valid (stasiun belum berubah)
      if (!calculationRef.current) {
        console.log("Perhitungan dibatalkan karena stasiun berubah")
        return
      }
      
      const destination = updatedDestinations[i]
      
      // Lewati destinasi yang sudah memiliki data jarak dan waktu
      if (destination.distance && destination.duration) {
        updatedProcessing[i] = false
        continue
      }
      
      // Tandai destinasi ini sedang diproses
      updatedProcessing[i] = true
      pendingDestinations++
      
      try {
        const startLat = stationPosition[0]
        const startLon = stationPosition[1]
        const endLat = destination.position[0]
        const endLon = destination.position[1]
        
        const url = `https://valhalla1.openstreetmap.de/route?json={"locations":[{"lat":${startLat},"lon":${startLon}},{"lat":${endLat},"lon":${endLon}}],"costing":"${transportMode}","directions_options":{"language":"id"}}`
        
        const response = await fetch(url)
        
        // Periksa lagi apakah perhitungan masih valid setelah respons diterima
        if (!calculationRef.current) {
          console.log("Perhitungan dibatalkan setelah menerima respons API")
          return
        }
        
        if (response.ok) {
          const data = await response.json()
          if (data.trip && data.trip.legs && data.trip.legs.length > 0) {
            updatedDestinations[i] = {
              ...destination,
              distance: data.trip.legs[0].summary.length * 1000, // convert to meters
              duration: data.trip.legs[0].summary.time // in seconds
            }
            // Berhasil mendapatkan data, tandai sebagai selesai
            updatedProcessing[i] = false
          } else {
            failedDestinations++
          }
        } else {
          failedDestinations++
        }
      } catch (err) {
        // Periksa apakah perhitungan masih valid setelah error
        if (!calculationRef.current) return
        
        console.error(`Error calculating route for ${destination.name}:`, err)
        failedDestinations++
      }
      
      // Update state setelah setiap 2 destinasi atau di akhir loop
      if ((i % 2 === 0 || i === updatedDestinations.length - 1) && calculationRef.current) {
        setDestinationsWithRoute([...updatedDestinations])
        setProcessingDestinations([...updatedProcessing])
      }
      
      // Tambahkan jeda kecil antara permintaan untuk mengurangi beban server
      if (i < updatedDestinations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300))
        // Periksa lagi setelah jeda
        if (!calculationRef.current) return
      }
    }
    
    // Pastikan perhitungan masih valid sebelum menyelesaikan
    if (!calculationRef.current) return
    
    // Sort destinations by distance
    const sortedDestinations = [...updatedDestinations].sort((a, b) => {
      const distA = a.distance || Infinity
      const distB = b.distance || Infinity
      return distA - distB
    })
    
    setDestinationsWithRoute(sortedDestinations)
    setIsCalculating(false)
    
    // Jika masih ada destinasi yang gagal dan belum mencapai batas percobaan ulang
    if (failedDestinations > 0 && retryCountRef.current < maxRetries && calculationRef.current) {
      console.log(`${failedDestinations} destinasi gagal mendapatkan data. Mencoba ulang (${retryCountRef.current + 1}/${maxRetries})...`)
      setTimeout(() => {
        if (calculationRef.current) {
          setRetryCount(prev => prev + 1)
        }
      }, 3000) // Tunggu 3 detik sebelum mencoba lagi
    }
  }, []) // Empty dependency array karena kita menggunakan refs
  
  useEffect(() => {
    // Jika posisi stasiun berubah, batalkan perhitungan yang sedang berjalan
    if (currentStationPosition && 
        (currentStationPosition[0] !== stationPosition[0] || 
         currentStationPosition[1] !== stationPosition[1])) {
      console.log("Stasiun berubah, menghentikan perhitungan sebelumnya")
      calculationRef.current = false
      return
    }
    
    // Inisialisasi array status pemrosesan
    if (processingDestinations.length === 0 && destinations.length > 0) {
      setProcessingDestinations(new Array(destinations.length).fill(false))
    }
    
    // Set flag perhitungan aktif
    calculationRef.current = true
    
    // Panggil calculateRoutes
    calculateRoutes()
    
    // Cleanup function untuk membatalkan perhitungan saat komponen unmount
    return () => {
      calculationRef.current = false
    }
  }, [destinations, stationPosition, retryCount, transportMode, calculateRoutes, currentStationPosition, processingDestinations.length])

  // Fungsi untuk mencoba ulang perhitungan rute secara manual
  const handleRetryCalculation = () => {
    setRetryCount(prev => prev + 1)
    setIsCalculating(true)
    calculationRef.current = true
  }

  // Hitung jumlah destinasi yang belum memiliki data
  const incompleteDestinations = destinationsWithRoute.filter(d => !d.distance || !d.duration).length

  return (
    <div
      className={`bg-white h-full w-80 shadow-lg transition-all duration-300 overflow-hidden ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header Sidebar */}
      <div className="p-4 border-b bg-gradient-to-r from-red-600 to-red-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Destinasi Terdekat
          </h2>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="mt-2 flex items-center bg-white/10 rounded-lg p-2">
          <MapPin className="h-4 w-4 text-white mr-2" />
          <div>
            <p className="text-sm text-white font-medium">Stasiun {stationName}</p>
            <p className="text-xs text-white/80">{stationLocation}</p>
          </div>
        </div>
        
        {/* Tampilkan status dan tombol refresh jika ada destinasi yang belum lengkap */}
        {incompleteDestinations > 0 && !isCalculating && (
          <div className="mt-2 flex items-center justify-between bg-white/10 rounded-lg p-2">
            <p className="text-xs text-white">{incompleteDestinations} destinasi belum lengkap</p>
            <button 
              onClick={handleRetryCalculation}
              className="text-xs bg-white text-red-600 px-2 py-1 rounded-full font-medium hover:bg-red-50 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        )}
      </div>

      <div className="max-h-[calc(100%-4rem)]">
        {/* Daftar destinasi terdekat */}
        <div className="h-[calc(60vh-14rem)] overflow-auto">
          <div className="p-2">
            {isCalculating && incompleteDestinations > 0 && (
              <div className="text-center py-2 text-gray-500 bg-blue-50 mb-2 rounded">
                <p>Menghitung {incompleteDestinations} rute{retryCount > 0 ? ` (percobaan ${retryCount + 1}/${maxRetries})` : ''}...</p>
              </div>
            )}
            
            {destinationsWithRoute.map((destination, index) => {
              const isProcessing = processingDestinations[index]
              const isIncomplete = !destination.distance || !destination.duration
              const isSelected = routeEndPoint && 
                routeEndPoint[0] === destination.position[0] && 
                routeEndPoint[1] === destination.position[1]
              
              return (
                <div
                  key={index}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                    isIncomplete ? (isProcessing ? 'bg-blue-50' : 'bg-amber-50/50') : ''
                  } ${isSelected ? 'bg-red-50 border-l-4 border-red-500 pl-2' : ''}`}
                  onClick={() => onDestinationSelect(destination.position)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {destination.image ? (
                        <Image 
                          src={destination.image} 
                          alt={destination.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-red-100">
                          <MapPin size={20} className="text-red-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{destination.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {isProcessing && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full inline-flex items-center">
                            <svg className="animate-spin -ml-0.5 mr-1.5 h-2 w-2 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Memuat
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full inline-flex items-center">
                            <svg className="h-2.5 w-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Dipilih
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Panel informasi rute di bagian bawah sidebar */}
        {(routeStartPoint || routeEndPoint) && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 sticky bottom-0 shadow-inner">
            <h3 className="font-bold text-lg mb-3 text-center">Rute Perjalanan</h3>
            
            {/* Mode transportasi selector dengan ikon */}
            <div className="mb-4 flex justify-between gap-2">
              <button 
                onClick={() => onTransportModeChange("auto")}
                className={`px-3 py-2 rounded-lg flex items-center justify-center shadow-md transition-all duration-200 flex-1 ${
                  transportMode === "auto" 
                    ? "bg-white border-2 border-red-500" 
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                <Image 
                  src={transportMode === "auto" ? "/car-red.png" : "/car-white.png"} 
                  alt="Mobil" 
                  width={24}
                  height={24}
                />
              </button>
              <button 
                onClick={() => onTransportModeChange("pedestrian")}
                className={`px-3 py-2 rounded-lg flex items-center justify-center shadow-md transition-all duration-200 flex-1 ${
                  transportMode === "pedestrian" 
                    ? "bg-white border-2 border-red-500" 
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                <Image 
                  src={transportMode === "pedestrian" ? "/walking-red.png" : "/walking-white.png"} 
                  alt="Jalan Kaki" 
                  width={24}
                  height={24}
                />
              </button>
              <button 
                onClick={() => onTransportModeChange("motorcycle")}
                className={`px-3 py-2 rounded-lg flex items-center justify-center shadow-md transition-all duration-200 flex-1 ${
                  transportMode === "motorcycle" 
                    ? "bg-white border-2 border-red-500" 
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                <Image 
                  src={transportMode === "motorcycle" ? "/motorcycle-red.png" : "/motorcycle-white.png"} 
                  alt="Motor" 
                  width={24}
                  height={24}
                />
              </button>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-md mb-4">
              {routeStartPoint ? (
                <div className="flex items-start mb-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mr-3">
                    <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Titik Awal</p>
                    <p className="text-base font-semibold">Stasiun {stationName}</p>
                  </div>
                </div>
              ) : (
                <p className="text-base mb-2 text-gray-400">Titik Awal: Belum dipilih</p>
              )}
              
              {routeEndPoint ? (
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mr-3">
                    <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Titik Akhir</p>
                    <p className="text-base font-semibold">{
                      destinationsWithRoute.find(d => 
                        d.position[0] === routeEndPoint[0] && 
                        d.position[1] === routeEndPoint[1]
                      )?.name || 'Destinasi'
                    }</p>
                  </div>
                </div>
              ) : (
                <p className="text-base mb-2 text-gray-400">Titik Akhir: Belum dipilih</p>
              )}
            </div>
            
            {routeInfo && (
              <div className="bg-white rounded-lg p-4 shadow-md mb-4">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium">Jarak</p>
                    <p className="text-xl font-bold">{routeInfo.distance >= 1000 ? `${(routeInfo.distance/1000).toFixed(1)} km` : `${Math.round(routeInfo.distance)} m`}</p>
                  </div>
                  <div className="h-10 w-px bg-gray-200"></div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium">Waktu</p>
                    <p className="text-xl font-bold">{formatDuration(routeInfo.duration)} menit</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 