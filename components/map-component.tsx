"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import Sidebar from "./sidebar"
import DestinationSidebar from "./destination-sidebar"
import { MapPin, Train, Navigation, TrainFront, Landmark, Bus, Car, Locate } from "lucide-react"
import { renderToString } from "react-dom/server"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import TransportInfo from "./transport-info"

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.divIcon({
  html: renderToString(
    <MapPin className="text-red-600 fill-red-100" size={28} strokeWidth={2} />
  ),
  className: "custom-div-icon",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
})

// Destination icon
const DestinationIcon = L.divIcon({
  html: renderToString(
    <MapPin className="text-blue-600 fill-blue-100" size={24} strokeWidth={2} />
  ),
  className: "custom-div-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
})

// User location marker, ubah warna dari biru menjadi merah
const UserLocationIcon = L.divIcon({
  html: renderToString(
    <div className="relative">
      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
        <div className="w-4 h-4 bg-white rounded-full"></div>
      </div>
    </div>
  ),
  className: "user-location-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

// Type for nearby destinations
export interface Destination {
  id?: number
  name: string
  position: [number, number]
  distance?: number // jarak dalam meter
  duration?: number // durasi dalam detik
  image?: string // URL gambar destinasi
  description?: string
}

// Type for station data
interface Station {
  id: number
  name: string
  position: [number, number]
  description: string
  location: string
  image: string
  destinations: Destination[]
}

// Type for transport data
interface Transport {
  id: number
  name: string
  type: string
  icon: string
  stations: Station[]
  isAllStation: boolean
}

// Function to transform CMS data to map format
function transformStationData(cmsStation: any): Station {
  return {
    id: cmsStation.id,
    name: cmsStation.name,
    position: [cmsStation.latitude, cmsStation.longitude] as [number, number],
    description: cmsStation.description || "",
    location: cmsStation.location || "",
    image: cmsStation.imageUrl || "/placeholder.svg?height=80&width=80",
    destinations: cmsStation.destinations?.map((dest: any) => ({
      id: dest.id,
      name: dest.name,
      position: [dest.latitude, dest.longitude] as [number, number],
      image: dest.imageUrl || "/placeholder.svg?height=80&width=80",
      description: dest.description || ""
    })) || []
  }
}

// Component to handle map resize and ensure proper rendering
function MapResizeHandler() {
  const map = useMap()

  useEffect(() => {
    // Force map to recalculate size after mounting
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 100)

    // Also invalidate on window resize
    const handleResize = () => {
      map.invalidateSize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [map])

  return null
}

// Component to set up map icons
function SetupMapIcons() {
  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon
  }, [])

  return null
}

// Component to fit bounds
function FitBounds({ stations }: { stations: Station[] }) {
  const map = useMap()

  useEffect(() => {
    if (stations.length > 0) {
      const positions = stations.map((station: Station) => station.position)
      const bounds = L.latLngBounds(positions)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
    }
  }, [map, stations])

  return null
}

// Custom Popup component
const StationPopup = ({
  station,
}: {
  station: Station
}) => {
  return (
    <div className="p-2 min-w-[280px]">
      {/* Header - Gambar dan Info Stasiun */}
      <div className="flex items-start gap-3">
        {/* Gambar Stasiun */}
        <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {station.image ? (
            <Image 
              src={station.image} 
              alt={station.name}
              width={112}
              height={112}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <TrainFront className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Informasi Stasiun */}
        <div className="flex-1 py-1">
          <div className="bg-red-600 text-white text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded inline-block mb-1">
            STASIUN LRT
          </div>
          <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">{station.name.toUpperCase()}</h3>
          {station.location && (
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {station.location}
            </p>
          )}
        </div>
      </div>

      {/* Deskripsi */}
      {station.description && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-700 leading-relaxed">{station.description}</p>
        </div>
      )}
    </div>
  )
}

// Format duration in minutes and seconds
const formatDuration = (seconds?: number): string => {
  if (!seconds) return "-"
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
}

// Component to handle marker references and popup control
function MarkerManager({
  stations,
  selectedStationId,
  showDestinations,
  selectedDestinationPosition,
}: {
  stations: Station[]
  selectedStationId: number | null
  showDestinations: number | null
  selectedDestinationPosition: [number, number] | null
}) {
  const map = useMap()
  const markersRef = useRef<{ [key: number]: L.Marker }>({})
  const destinationMarkersRef = useRef<{ [key: string]: L.Marker }>({})
  const previousDestinationRef = useRef<string | null>(null)
  const previousStationRef = useRef<number | null>(null)

  // Effect untuk menangani popup stasiun
  useEffect(() => {
    if (selectedStationId !== null) {
      // Tutup popup stasiun sebelumnya jika ada
      if (previousStationRef.current && previousStationRef.current !== selectedStationId) {
        const prevMarker = markersRef.current[previousStationRef.current]
        if (prevMarker) {
          prevMarker.closePopup()
        }
      }

      // Buka popup stasiun yang baru dipilih
      const marker = markersRef.current[selectedStationId]
      if (marker) {
        setTimeout(() => {
          marker.openPopup()
        }, 100)
      }

      // Simpan ID stasiun saat ini untuk referensi selanjutnya
      previousStationRef.current = selectedStationId
    }
  }, [selectedStationId])

  // Effect untuk menangani popup destinasi
  useEffect(() => {
    if (selectedDestinationPosition) {
      const key = `${selectedDestinationPosition[0]},${selectedDestinationPosition[1]}`
      
      // Tutup popup destinasi sebelumnya jika ada
      if (previousDestinationRef.current && previousDestinationRef.current !== key) {
        const prevMarker = destinationMarkersRef.current[previousDestinationRef.current]
        if (prevMarker) {
          prevMarker.closePopup()
        }
      }

      // Buka popup destinasi yang baru dipilih
      const marker = destinationMarkersRef.current[key]
      if (marker) {
        setTimeout(() => {
          marker.openPopup()
          // Tutup popup setelah 1.5 detik
          setTimeout(() => {
            marker.closePopup()
          }, 1500)
        }, 100)
      }

      // Simpan key destinasi saat ini untuk referensi selanjutnya
      previousDestinationRef.current = key
    }
  }, [selectedDestinationPosition])

  // Get the selected station's destinations if any
  const selectedStation = showDestinations ? stations.find((s: Station) => s.id === showDestinations) : null

  return (
    <>
      {stations.map((station: Station) => (
        <Marker
          key={station.id}
          position={station.position}
          ref={(ref) => {
            if (ref) {
              markersRef.current[station.id] = ref
            }
          }}
        >
          <Popup closeOnClick={true} autoClose={true}>
            <StationPopup station={station} />
          </Popup>
        </Marker>
      ))}

      {selectedStation?.destinations.map((destination: Destination, index: number) => (
        <Marker
          key={`dest-${selectedStation.id}-${index}`}
          position={destination.position}
          icon={DestinationIcon}
          ref={(ref) => {
            if (ref) {
              const key = `${destination.position[0]},${destination.position[1]}`
              destinationMarkersRef.current[key] = ref
            }
          }}
        >
          <Popup closeOnClick={true} autoClose={true}>
            <div className="p-2 text-center min-w-[200px]">
              <div className="w-full h-24 bg-gray-200 rounded-lg mb-2 overflow-hidden">
                {destination.image ? (
                  <Image 
                    src={destination.image} 
                    alt={destination.name}
                    width={160}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Landmark className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-sm mb-1">{destination.name}</h3>
              {destination.description && (
                <p className="text-xs text-gray-600 leading-relaxed">{destination.description}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  )
}

// Component to handle map actions
function MapActions({
  onMapReady,
}: {
  onMapReady: (map: L.Map) => void
}) {
  const map = useMap()

  useEffect(() => {
    onMapReady(map)
  }, [map, onMapReady])

  return null
}

// Component to handle routing between two points
function RoutingControl({
  startPoint,
  endPoint,
  transportMode,
  onRouteCalculated,
}: {
  startPoint: [number, number] | null
  endPoint: [number, number] | null
  transportMode: "pedestrian" | "auto" | "motorcycle"
  onRouteCalculated?: (distance: number, duration: number) => void
}) {
  const map = useMap()
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null)
  const prevRouteRef = useRef<[number, number][]>([])
  const prevStartPointRef = useRef<[number, number] | null>(null)
  const prevEndPointRef = useRef<[number, number] | null>(null)
  const prevTransportModeRef = useRef<string | null>(null)

  // Pindahkan useEffect untuk fit bounds ke sini
  useEffect(() => {
    if (map && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [map, routeCoordinates])

  useEffect(() => {
    // Jika titik awal, akhir, dan mode transportasi sama dengan sebelumnya, tidak perlu memuat ulang rute
    if (
      startPoint && 
      endPoint && 
      prevStartPointRef.current && 
      prevEndPointRef.current &&
      startPoint[0] === prevStartPointRef.current[0] &&
      startPoint[1] === prevStartPointRef.current[1] &&
      endPoint[0] === prevEndPointRef.current[0] &&
      endPoint[1] === prevEndPointRef.current[1] &&
      transportMode === prevTransportModeRef.current
    ) {
      return;
    }

    // Simpan titik awal, akhir, dan mode transportasi saat ini untuk perbandingan berikutnya
    prevStartPointRef.current = startPoint;
    prevEndPointRef.current = endPoint;
    prevTransportModeRef.current = transportMode;

    async function getRoute() {
      if (!startPoint || !endPoint) {
        // Jangan langsung menghapus rute jika tidak ada titik
        if (!startPoint && !endPoint) {
          setRouteCoordinates([])
          setRouteInfo(null)
        }
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Format coordinates for Valhalla API
        const startLon = startPoint[1]
        const startLat = startPoint[0]
        const endLon = endPoint[1]
        const endLat = endPoint[0]

        // Valhalla API URL (menggunakan server publik)
        const url = `https://valhalla1.openstreetmap.de/route?json={"locations":[{"lat":${startLat},"lon":${startLon}},{"lat":${endLat},"lon":${endLon}}],"costing":"${transportMode}","directions_options":{"language":"id"}}`

        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`Error fetching route: ${response.statusText}`)
        }

        const data = await response.json()
        
        if (data.trip && data.trip.legs && data.trip.legs.length > 0) {
          // Extract coordinates from the response
          const shape = data.trip.legs[0].shape
          const decodedShape = decodePolyline(shape)
          
          // Simpan rute sebelumnya
          prevRouteRef.current = routeCoordinates;
          
          // Update rute baru
          setRouteCoordinates(decodedShape)
          
          // Extract distance and duration
          const distance = data.trip.legs[0].summary.length * 1000 // convert to meters
          const duration = data.trip.legs[0].summary.time // in seconds
          
          setRouteInfo({ distance, duration })
          
          // Call the callback if provided
          if (onRouteCalculated) {
            onRouteCalculated(distance, duration)
          }
        } else {
          throw new Error('No route found')
        }
      } catch (err) {
        console.error('Error getting route:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Jangan langsung menghapus rute jika terjadi error
        // setRouteCoordinates([])
        // setRouteInfo(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Gunakan timeout untuk menghindari terlalu banyak permintaan API
    const timeoutId = setTimeout(() => {
      getRoute()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [startPoint, endPoint, transportMode, map, onRouteCalculated])

  // Function to decode polyline from Valhalla
  function decodePolyline(encoded: string): [number, number][] {
    // This is a simplified version of the polyline decoding algorithm
    // For a full implementation, consider using a library like @mapbox/polyline
    const points: [number, number][] = []
    let index = 0
    let lat = 0
    let lng = 0

    while (index < encoded.length) {
      let b
      let shift = 0
      let result = 0

      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)

      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1))
      lat += dlat

      shift = 0
      result = 0

      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)

      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1))
      lng += dlng

      points.push([lat / 1e6, lng / 1e6])
    }

    return points
  }

  // Tampilkan rute yang ada jika sedang loading
  const displayCoordinates = isLoading && prevRouteRef.current.length > 0 
    ? prevRouteRef.current 
    : routeCoordinates;

  // Warna rute default biru untuk semua mode transportasi
  const routeColor = "#0078FF";

  if (isLoading && !prevRouteRef.current.length) {
    return (
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-50">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 bg-red-600 rounded-full p-1">
            <Image
              src="/logo-lrt-motion.gif"
              alt="Loading..."
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-sm text-gray-600">Mencari rute...</p>
        </div>
      </div>
    )
  }

  if (error && !displayCoordinates.length) {
    return (
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-50">
        <p className="text-sm text-red-500">Error: {error}</p>
      </div>
    )
  }

  return (
    <>
      {displayCoordinates.length > 0 && (
        <Polyline
          positions={displayCoordinates}
          color={routeColor}
          weight={5}
          opacity={0.7}
          className="route-line"
        />
      )}
      
      {(routeInfo || isLoading) && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded shadow z-50 transition-opacity duration-300">
          {isLoading ? (
            <p className="text-sm font-medium">Memperbarui rute...</p>
          ) : (
            <p className="text-sm font-medium">
              Jarak: {Math.round(routeInfo!.distance)}m. Waktu: {formatDuration(routeInfo!.duration)}
            </p>
          )}
        </div>
      )}
    </>
  )
}

// Fungsi untuk menghitung jarak antara dua titik koordinat (dalam meter)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radius bumi dalam meter
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

export default function MapComponent() {
  const [isMounted, setIsMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDestSidebarOpen, setIsDestSidebarOpen] = useState(false)
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null)
  const [showDestinations, setShowDestinations] = useState<number | null>(null)
  const [selectedDestinationPosition, setSelectedDestinationPosition] = useState<[number, number] | null>(null)
  const [routeStartPoint, setRouteStartPoint] = useState<[number, number] | null>(null)
  const [routeEndPoint, setRouteEndPoint] = useState<[number, number] | null>(null)
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null)
  const [transportMode, setTransportMode] = useState<"pedestrian" | "auto" | "motorcycle">("pedestrian")
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [transports, setTransports] = useState<Transport[]>([])
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [nearestStationId, setNearestStationId] = useState<number | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [geolocationCompleted, setGeolocationCompleted] = useState(false)

  // Fetch stations data from CMS
  useEffect(() => {
    async function fetchStations() {
      try {
        const response = await fetch('/api/stations')
        if (!response.ok) {
          throw new Error('Failed to fetch stations')
        }
        const data = await response.json()
        const transformedStations = data.map(transformStationData)
        setStations(transformedStations)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching stations:', err)
        setError(err instanceof Error ? err.message : 'Failed to load stations')
        setLoading(false)
      }
    }

    fetchStations()
  }, [])

  // Fetch transports data
  useEffect(() => {
    async function fetchTransports() {
      try {
        const response = await fetch('/api/transportation')
        if (!response.ok) {
          throw new Error('Failed to fetch transports')
        }
        const data = await response.json()
        setTransports(data)
      } catch (err) {
        console.error('Error fetching transports:', err)
      }
    }

    fetchTransports()
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Tambahkan useEffect untuk meminta lokasi otomatis saat komponen dimuat
  useEffect(() => {
    // Minta lokasi otomatis setelah komponen dimuat dan data stasiun tersedia
    if (isMounted && stations.length > 0 && !userLocation) {
      getUserLocation();
    }
  }, [isMounted, stations, userLocation]);

  const handleMapReady = (map: L.Map) => {
    mapRef.current = map
  }

  const handleStationSelect = (position: L.LatLngExpression, stationId: number) => {
    // Jika memilih stasiun yang sama, tidak perlu melakukan apa-apa
    if (selectedStationId === stationId) {
      console.log("Same station selected, no action needed");
      return
    }
    
    console.log("New station selected:", stationId, "at position:", position);
    
    // Reset rute sepenuhnya saat memilih stasiun baru
    // Untuk stasiun baru, kita perlu reset semua termasuk titik awal
    setRouteEndPoint(null)
    setRouteInfo(null)
    setSelectedDestinationPosition(null)
    
    // Set stasiun baru yang dipilih
    setSelectedStationId(stationId)
    
    // Automatically show destinations for the selected station
    setShowDestinations(stationId)
    setIsDestSidebarOpen(true)
    
    // Set as start point
    setRouteStartPoint(position as [number, number])
    console.log("Set new start point:", position);

    // Auto minimize sidebar setelah memilih stasiun baru (setelah sedikit delay)
    setTimeout(() => {
      setGeolocationCompleted(true);
    }, 300);

    if (mapRef.current) {
      mapRef.current.flyTo(position, 14, { // Zoom level 14 to show destinations
        duration: 2,
        easeLinearity: 0.25,
      })
    }
  }

  // Fungsi reset route yang lebih "hardcore"
  const resetRoute = () => {
    console.log("Reset route called, keeping start point:", routeStartPoint);
    // Reset titik akhir dan informasi rute
    setRouteEndPoint(null)
    setRouteInfo(null)
    setSelectedDestinationPosition(null)
    
    // Jangan reset titik awal (routeStartPoint) karena itu adalah posisi stasiun yang dipilih
    // Ini memastikan bahwa ketika pengguna memilih destinasi baru di stasiun yang sama,
    // rute akan dihitung dari stasiun yang sama
    
    // Reset view ke seluruh peta jika diperlukan
    if (mapRef.current && !selectedStationId) {
      const positions = stations.map((station: Station) => station.position)
      const bounds = L.latLngBounds(positions)
      mapRef.current.flyToBounds(bounds, { padding: [50, 50], maxZoom: 12, duration: 1.5 })
    }
  }

  const handleDestinationSelect = (position: L.LatLngExpression) => {
    // Simpan posisi destinasi yang dipilih
    setSelectedDestinationPosition(position as [number, number])

    // Jika titik awal sudah ada (stasiun sudah dipilih), set destinasi sebagai titik akhir
    if (routeStartPoint) {
      console.log("Setting end point:", position, "with start point:", routeStartPoint);
      setRouteEndPoint(position as [number, number])
      
      // Hitung jarak antara stasiun dan destinasi untuk menentukan level zoom
      const startLatLng = L.latLng(routeStartPoint[0], routeStartPoint[1]);
      const endLatLng = L.latLng((position as [number, number])[0], (position as [number, number])[1]);
      const distanceInMeters = startLatLng.distanceTo(endLatLng);
      
      // Tentukan zoom level berdasarkan jarak (3 level: 0-1000m, 1000-2000m, >2000m)
      let zoomLevel = 16; // Default zoom level
      
      if (distanceInMeters <= 1000) {
        zoomLevel = 17; // Dekat (0-1000m)
      } else if (distanceInMeters <= 2000) {
        zoomLevel = 16; // Sedang (1000-2000m)
      } else {
        zoomLevel = 15; // Jauh (>2000m)
      }
      
      console.log(`Jarak ke destinasi: ${Math.round(distanceInMeters)}m, zoom level: ${zoomLevel}`);
      
      // Buat bounds yang mencakup kedua titik
      const bounds = L.latLngBounds([startLatLng, endLatLng]);
      
      // Zoom ke bounds yang mencakup kedua titik dengan padding
      if (mapRef.current) {
        mapRef.current.flyToBounds(bounds, {
          padding: [50, 50],
          maxZoom: zoomLevel,
          duration: 1.5
        });
      }

      // Auto minimize sidebar stasiun setelah memilih destinasi
      setGeolocationCompleted(true);
    } else {
      console.log("No start point available, cannot set end point");
    }
  }

  const handleTransportModeChange = (mode: "pedestrian" | "auto" | "motorcycle") => {
    setTransportMode(mode);
    // Reset route info when changing transport mode
    setRouteInfo(null);
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleDestSidebar = () => {
    setIsDestSidebarOpen(!isDestSidebarOpen)
  }

  const handleRouteCalculated = (distance: number, duration: number) => {
    setRouteInfo({ distance, duration })
  }

  // Get the selected station for destination sidebar
  const selectedStation = showDestinations ? stations.find((s: Station) => s.id === showDestinations) : null

  // Fungsi untuk mendapatkan lokasi user
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation tidak didukung browser Anda");
      return;
    }

    // Reset state geolocationCompleted sebelum memulai proses geolokasi baru
    setGeolocationCompleted(false);
    setIsLoadingLocation(true);
    setLocationError(null);

    // Opsi geolokasi yang lebih ketat
    const options = {
      enableHighAccuracy: true, // Gunakan GPS jika tersedia
      timeout: 30000,          // Timeout 30 detik
      maximumAge: 0,           // Selalu minta posisi baru
    };

    // Fungsi success handler yang lebih detail
    const successHandler = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      
      // Log untuk debugging
      console.log('Akurasi lokasi:', accuracy, 'meter');
      console.log('Koordinat:', latitude, longitude);

      // Hanya terima lokasi jika akurasi cukup baik (kurang dari 100 meter)
      if (accuracy > 1000000) {
        setLocationError(`Akurasi lokasi (${Math.round(accuracy)}m) kurang baik. Mohon coba di area terbuka.`);
        setIsLoadingLocation(false);
        return;
      }

      setUserLocation([latitude, longitude]);
      setIsLoadingLocation(false);
      
      // Cari stasiun terdekat
      findNearestStation(latitude, longitude);
      
      // Tandai bahwa geolokasi telah selesai
      setGeolocationCompleted(true);
    };

    // Error handler yang lebih informatif
    const errorHandler = (error: GeolocationPositionError) => {
      setIsLoadingLocation(false);
      let errorMessage = "Terjadi kesalahan saat mendapatkan lokasi";
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Mohon izinkan akses lokasi di pengaturan browser Anda";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Lokasi tidak tersedia. Mohon cek GPS Anda dan coba di area terbuka";
          break;
        case error.TIMEOUT:
          errorMessage = "Waktu mendapatkan lokasi habis. Mohon coba lagi";
          break;
      }
      
      console.error('Geolocation error:', error);
      setLocationError(errorMessage);
    };

    // Mulai watch position untuk mendapatkan update lokasi
    const watchId = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      options
    );

    // Cleanup: clear watch setelah 30 detik atau ketika berhasil
    setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
      if (isLoadingLocation) {
        setIsLoadingLocation(false);
        setLocationError("Timeout: Tidak dapat mendapatkan lokasi yang akurat. Mohon coba lagi.");
      }
    }, 30000);
  };

  // Fungsi untuk menemukan stasiun terdekat dari lokasi user
  const findNearestStation = (latitude: number, longitude: number) => {
    if (stations.length === 0) {
      console.log("Tidak ada data stasiun tersedia");
      return;
    }

    let minDistance = Infinity;
    let closestStationId: number | null = null;
    let closestDistance: number = 0;

    stations.forEach(station => {
      const distance = calculateDistance(
        latitude, 
        longitude, 
        station.position[0], 
        station.position[1]
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestStationId = station.id;
        closestDistance = distance;
      }
    });

    // Log jarak ke stasiun terdekat untuk debugging
    console.log(`Jarak ke stasiun terdekat: ${Math.round(closestDistance)}m`);

    setNearestStationId(closestStationId);
    
    // Jika ditemukan stasiun terdekat
    if (closestStationId !== null) {
      const nearestStation = stations.find(s => s.id === closestStationId);
      if (nearestStation) {
        // Tampilkan informasi jarak ke stasiun terdekat
        console.log(`Stasiun terdekat: ${nearestStation.name} (${Math.round(minDistance)}m)`);
        
        // Gunakan handleStationSelect agar pengalaman konsisten dengan pemilihan manual
        handleStationSelect(nearestStation.position, nearestStation.id);
      }
    }
  };

  if (!isMounted) return null

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center bg-white p-6 rounded-xl shadow-lg max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">Gagal memuat data</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full relative">
      {/* Left Sidebar - Stations */}
      <Sidebar
        stations={stations}
        onStationSelect={(position: L.LatLngExpression, stationId: number) => handleStationSelect(position, stationId)}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        nearestStationId={nearestStationId}
        selectedStationId={selectedStationId}
        geolocationCompleted={geolocationCompleted}
      />

      {/* Map Container with Transport Info */}
      <div className="flex-1 relative">
        <MapContainer
          center={[-6.2851, 106.8683]}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <SetupMapIcons />
          <FitBounds stations={stations} />
          <MapActions onMapReady={handleMapReady} />
          <MapResizeHandler />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            minZoom={1}
          />
          <MarkerManager
            stations={stations}
            selectedStationId={selectedStationId}
            showDestinations={showDestinations}
            selectedDestinationPosition={selectedDestinationPosition}
          />
          
          {/* User location marker */}
          {userLocation && (
            <Marker position={userLocation} icon={UserLocationIcon}>
              <Popup>
                <div className="p-2 text-center">
                  <p className="font-medium">Lokasi Anda</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Routing component */}
          <RoutingControl 
            startPoint={routeStartPoint} 
            endPoint={routeEndPoint}
            transportMode={transportMode}
            onRouteCalculated={handleRouteCalculated}
          />
        </MapContainer>

        {/* Location button */}
        <button
          onClick={getUserLocation}
          className={`absolute top-4 left-4 z-[1000] p-2.5 rounded-full bg-white shadow-md hover:bg-gray-100 transition-all ${isLoadingLocation ? 'animate-pulse' : ''}`}
          title="Perbarui lokasi saya"
        >
          <Locate size={22} className={isLoadingLocation ? 'text-red-500' : 'text-gray-700'} />
        </button>

        {/* Location error message */}
        {locationError && (
          <div className="absolute top-16 left-4 z-[1000] bg-white p-2 rounded-lg shadow-md max-w-[250px] text-sm text-red-500">
            {locationError}
          </div>
        )}

        {/* Transport Info Component */}
        <TransportInfo 
          transports={transports}
          selectedStationId={selectedStationId}
        />
      </div>

      {/* Right Sidebar - Destinations */}
      {selectedStation && (
        <div className={`absolute top-0 right-0 h-full transition-transform duration-300 z-[1000] ${isDestSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <DestinationSidebar
            key={`station-${selectedStation.id}`}
            stationName={selectedStation.name}
            stationLocation={selectedStation.location}
            destinations={selectedStation.destinations as Destination[]}
            onDestinationSelect={handleDestinationSelect}
            isOpen={isDestSidebarOpen}
            onToggle={toggleDestSidebar}
            stationPosition={selectedStation.position}
            routeInfo={routeInfo}
            routeStartPoint={routeStartPoint}
            routeEndPoint={routeEndPoint}
            onResetRoute={resetRoute}
            transportMode={transportMode}
            onTransportModeChange={handleTransportModeChange}
            formatDuration={formatDuration}
          />
        </div>
      )}
    </div>
  )
}

