"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import Sidebar from "./sidebar"
import DestinationSidebar from "./destination-sidebar-new"
import { MapPin, Train, Navigation } from "lucide-react"
import { renderToString } from "react-dom/server"
import { ScrollArea } from "@/components/ui/scroll-area"

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

// Type for nearby destinations
export interface Destination {
  name: string
  position: [number, number]
  distance?: number // jarak dalam meter
  duration?: number // durasi dalam detik
  image?: string // URL gambar destinasi
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

// Stations data with nearby destinations
export const stations: Station[] = [
  {
    id: 1,
    name: "Dukuh Atas",
    position: [-6.204828, 106.8255301] as [number, number],
    description: "Stasiun LRT Dukuh Atas - Interchange dengan MRT dan Commuter Line",
    location: "Jakarta Pusat",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { 
        name: "Taman Menteng Dukuh Atas", 
        position: [-6.196270033723199, 106.82936424054809],
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Taman_Menteng.JPG/640px-Taman_Menteng.JPG"
      },
      { name: "Grha BNI", position: [-6.203251371497656, 106.82132904054815] },
      { 
        name: "Grand Indonesia", 
        position: [-6.1949099877325455, 106.82111740905012],
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Grand_Indonesia_Shopping_Town%2C_Jakarta.jpg/640px-Grand_Indonesia_Shopping_Town%2C_Jakarta.jpg"
      },
      { 
        name: "MRT Dukuh Atas", 
        position: [-6.201275304534395, 106.82251849580109],
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/MRT_Jakarta_Dukuh_Atas_BNI_Station.jpg/640px-MRT_Jakarta_Dukuh_Atas_BNI_Station.jpg"
      },
      { name: "KRL Sudirman", position: [-6.202636553988454, 106.82500627960421] },
      { name: "BNI City", position: [-6.201456452119922, 106.8212522193132] },
      { name: "Waduk Setiabudi", position: [-6.203983905635702, 106.82641393993572] },
      { name: "Taman Suropati", position: [-6.199195004011805, 106.83260110986217] },
    ],
  },
  {
    id: 2,
    name: "Setiabudi",
    position: [-6.2093184, 106.8302209] as [number, number],
    description: "Stasiun LRT Setiabudi",
    location: "Jakarta Selatan",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "Halte Kuningan Madya", position: [-6.213190011663756, 106.83047303869803] },
      { name: "Menara Imperium", position: [-6.210042307952699, 106.83152012705537] },
      { name: "Taman Menteng", position: [-6.196270033723199, 106.82936424054809] },
    ],
  },
  {
    id: 3,
    name: "Rasuna Said",
    position: [-6.2216089, 106.8322373] as [number, number],
    description: "Stasiun LRT Rasuna Said",
    location: "Jakarta Selatan",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "Epicentrum Mall", position: [-6.21722916183889, 106.83502392700166] },
      { name: "Kedutaan Besar Malaysia", position: [-6.224615082098639, 106.83257046938405] },
      { name: "Mall Ambassador", position: [-6.223787650571488, 106.82682019636965] },
      { name: "Rumah Sakit MMC", position: [-6.219607717348644, 106.83240942520536] },
    ],
  },
  {
    id: 4,
    name: "Kuningan",
    position: [-6.2287727, 106.8332031] as [number, number],
    description: "Stasiun LRT Kuningan",
    location: "Jakarta Selatan",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "Balai Kartini", position: [-6.234157259042101, 106.82534455219105] },
      { name: "Kementerian Kesehatan RI", position: [-6.230353663756283, 106.83266803609065] },
      { name: "Kuningan Timur", position: [-6.237143984247232, 106.82799359395773] },
      { name: "Tempo Pavilion", position: [-6.228012214496362, 106.83278165404111] },
    ],
  },
  {
    id: 5,
    name: "Pancoran",
    position: [-6.2421415, 106.8385146] as [number, number],
    description: "Stasiun LRT Pancoran",
    location: "Jakarta Selatan",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "T Tower", position: [-6.242038919617259, 106.83728272520561] },
      { name: "SMESCO Indonesia", position: [-6.241573667107673, 106.83621515404135] },
      { name: "SMESCO Outdoor Arena", position: [-6.241019484491149, 106.8346851386983] },
      { name: "RS Medistra", position: [-6.239572379820828, 106.83376632335539] },
      { name: "Menara Bidakara-2", position: [-6.240377727457824, 106.84091819636986] },
    ],
  },
  {
    id: 6,
    name: "Cikoko",
    position: [-6.2434846, 106.8570718] as [number, number],
    description: "Stasiun LRT Cikoko",
    location: "Jakarta Selatan",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "Apartemen Kalibata", position: [-6.256010698103132, 106.85040683951043] },
      { name: "Rumah Sakit Tebet", position: [-6.242401819749913, 106.85021764054858] },
      { name: "Stasiun KRL Cawang", position: [-6.242247884915078, 106.85877001171278] },
    ],
  },
  {
    id: 7,
    name: "Ciliwung",
    position: [-6.2434448, 106.8639705] as [number, number],
    description: "Stasiun LRT Ciliwung",
    location: "Jakarta Timur",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "Kemenkumham", position: [-6.243630090746462, 106.86542841044526] },
      { name: "Rajawali Tower", position: [-6.242733159027045, 106.8650765252056] },
      { name: "Signature Park Grande", position: [-6.244235484572998, 106.86619685728708] },
      { name: "Honda Service Nusantara", position: [-6.2426175286250185, 106.86161612684019] },
      { name: "Halte Ciliwung", position: [-6.243248602033125, 106.86359130927647] },
      { name: "GOR Otista Ciliwung", position: [-6.234802494264775, 106.86807029244594] },
    ],
  },
  {
    id: 8,
    name: "Cawang",
    position: [-6.2459023, 106.8712426] as [number, number],
    description: "Stasiun LRT Cawang",
    location: "Jakarta Timur",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "UKI Cawang", position: [-6.250756838273384, 106.87278345034088] },
      { name: "BNN", position: [-6.246082437266471, 106.87107461902471] },
      { name: "GOR Otista", position: [-6.234802494264775, 106.86807029244594] },
      { name: "RS Otak Nasional", position: [-6.245882625581666, 106.87047712520567] },
      { name: "RS Budhi Asih", position: [-6.255598769939686, 106.86324646753424] },
      { name: "Mall PGC Cawang", position: [-6.262148573276088, 106.86522389637004] },
      { name: "Halte Cawang Sutoyo", position: [-6.250056171130162, 106.87364433911155] },
    ],
  },
  {
    id: 9,
    name: "Halim",
    position: [-6.2458656, 106.8872875] as [number, number],
    description: "Stasiun LRT Halim",
    location: "Jakarta Timur",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "Cipinang Indah", position: [-6.239151287993815, 106.89444465589145] },
      { name: "KCIC Halim", position: [-6.245784837642015, 106.8858337072005] },
      { name: "Halte Cawang Sutoyo", position: [-6.250056171130162, 106.87364433911155] },
      { name: "Penas Kalimalang", position: [-6.239066336943245, 106.87799916201978] },
      { name: "PGC", position: [-6.2620098226986824, 106.86521853819053] },
      { name: "UKI Halim", position: [-6.250762987855988, 106.87274933869836] },
      { name: "Bandara Halim", position: [-6.265156592836332, 106.88560644054874] },
    ],
  },
  {
    id: 10,
    name: "Jatibening Baru",
    position: [-6.2577476, 106.9279199] as [number, number],
    description: "Stasiun LRT Jatibening Baru",
    location: "Kota Bekasi",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "BSI Kalimalang", position: [-6.249753922438778, 106.92951629822012] },
      { name: "Pasar Kapin", position: [-6.255143424411891, 106.92977292520573] },
    ],
  },
  {
    id: 11,
    name: "Cikunir 1",
    position: [-6.2566001, 106.9518734] as [number, number],
    description: "Stasiun LRT Cikunir 1",
    location: "Kota Bekasi",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "Grand Kota Bintang", position: [-6.249395259843384, 106.95703904792673] },
      { name: "Ibis Style", position: [-6.252027285784345, 106.95270845480903] },
      { name: "Masjid Nurul Yaqin", position: [-6.255686869449336, 106.95087499903306] },
    ],
  },
  {
    id: 12,
    name: "Cikunir 2",
    position: [-6.2546849, 106.9632233] as [number, number],
    description: "Stasiun LRT Cikunir 2",
    location: "Kota Bekasi",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "Grand Kota Bintang", position: [-6.249395259843384, 106.95703904792673] },
      { name: "Universitas Gunadarma Bekasi", position: [-6.2583724306591835, 106.95915162510717] },
      { name: "Graha Delima", position: [-6.25059799264576, 106.95780678287723] },
      { name: "Royal Wells School", position: [-6.2522787233628945, 106.96143342520571] },
    ],
  },
  {
    id: 13,
    name: "Bekasi Barat",
    position: [-6.2529489, 106.9904237] as [number, number],
    description: "Stasiun LRT Bekasi Barat",
    location: "Kota Bekasi",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "Gerbang Tol Bekasi Barat", position: [-6.249611501782761, 106.99031273368213] },
      { name: "Mall Revo", position: [-6.254655429328831, 106.9897706521911] },
      { name: "Mall Mega Bekasi", position: [-6.249291796883307, 106.99258100986253] },
      { name: "Apartemen Mutiara", position: [-6.252258138372795, 106.99101067890605] },
    ],
  },
  {
    id: 14,
    name: "Jatimulya",
    position: [-6.2641077, 107.0216701] as [number, number],
    description: "Stasiun LRT Jatimulya - Bekasi",
    location: "Kota Bekasi",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "Gerbang Tol Bekasi Timur", position: [-6.263496221822506, 107.01681174324808] },
      { name: "Apartemen Grand Dhika City", position: [-6.262141684305612, 107.0203736630113] },
      { name: "Mall BTC", position: [-6.258161622562967, 107.02124967439384] },
      { name: "Rumah Sakit Primaya", position: [-6.259468247642008, 107.02016115135616] },
      { name: "Rumah Sakit Mitra Keluarga", position: [-6.260124136994632, 107.01292522238488] },
    ],
  },
  {
    id: 15,
    name: "TMII",
    position: [-6.2928955, 106.8806355] as [number, number],
    description: "Stasiun LRT TMII",
    location: "Jakarta Timur",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "SPBU TMII", position: [-6.294967071045271, 106.88218812764049] },
      { name: "RS Meuraksa", position: [-6.294243008997178, 106.88232786417683] },
      { name: "Shuttle Stasiun", position: [-6.302187983621508, 106.88424121581924] },
      { name: "Tamini Square", position: [-6.291028685956752, 106.88215234637043] },
      { 
        name: "Taman Rekreasi TMII", 
        position: [-6.301985273640397, 106.88988166753474],
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Taman_Mini_Indonesia_Indah_Aerial.jpg/640px-Taman_Mini_Indonesia_Indah_Aerial.jpg"
      },
      { name: "Terminal Pinang Ranti", position: [-6.29008400188741, 106.88091230715386] },
    ],
  },
  {
    id: 16,
    name: "Kampung Rambutan",
    position: [-6.3095494, 106.8843804] as [number, number],
    description: "Stasiun LRT Kampung Rambutan",
    location: "Jakarta Timur",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "GOR Ceger", position: [-6.31591635564195, 106.8886158982208] },
      { name: "Direktorat Hukum", position: [-6.305679765123931, 106.88039123904272] },
      { name: "Tempat Wisata TMII Pintu 1", position: [-6.302187983621508, 106.88424121581924] },
      { name: "Taman RPTRA Tanah Merdeka", position: [-6.312639600688823, 106.88239548287774] },
      { name: "Pasar Rebo", position: [-6.310089944624839, 106.8845772252063] },
      { name: "Pasar Kramat Jati", position: [-6.268399993960178, 106.86685582520586] },
    ],
  },
  {
    id: 17,
    name: "Ciracas",
    position: [-6.3237795, 106.8867366] as [number, number],
    description: "Stasiun LRT Ciracas",
    location: "Jakarta Timur",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "Kelurahan Ciracas", position: [-6.328007811038793, 106.87760079481687] },
      { name: "SDN 11 Ciracas Pagi", position: [-6.323454636395133, 106.88376634602487] },
      { name: "Politeknik Ketenagakerjaan", position: [-6.320794321359618, 106.88083375219196] },
      { name: "Lab Damkar", position: [-6.32854966314849, 106.87862306753497] },
      { name: "GOR Ciracas", position: [-6.324821744782175, 106.86544833924053] },
      { name: "Pengadilan Agama Jaktim", position: [-6.339733665941194, 106.87775963869952] },
      { name: "Apartemen LRT City Ciracas", position: [-6.324679431216758, 106.88391756753508] },
    ],
  },
  {
    id: 18,
    name: "Harjamukti",
    position: [-6.3739095, 106.8956745] as [number, number],
    description: "Stasiun LRT Harjamukti - Depok",
    location: "Kota Depok",
    image: "/placeholder.svg?height=80&width=80",
    destinations: [
      { name: "Cibubur Junction", position: [-6.369343890980611, 106.8941796675354] },
      { name: "GOR POPKI", position: [-6.367522791231724, 106.89006426938572] },
      { name: "RS Meilia", position: [-6.376343269231946, 106.90198652520708] },
      { name: "Taman Wiladatika", position: [-6.3699974042702925, 106.89332699637117] },
      { name: "Lapangan Panahan Cibubur", position: [-6.373686232936477, 106.89537597911702] },
      { name: "Trans Studio Cibubur", position: [-6.375423343467786, 106.90198606167311] },
    ],
  },
]

// Component to set up map icons
function SetupMapIcons() {
  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon
  }, [])

  return null
}

// Component to fit bounds
function FitBounds() {
  const map = useMap()

  useEffect(() => {
    const positions = stations.map((station: Station) => station.position)
    const bounds = L.latLngBounds(positions)
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
  }, [map])

  return null
}

// Custom Popup component
const StationPopup = ({
  station,
}: {
  station: Station
}) => {
  return (
    <div className="min-w-[280px]">
      <div className="flex gap-2 items-start">
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
          <img
            src={station.image || "/placeholder.svg"}
            alt={`Gambar Stasiun ${station.name}`}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="flex-1">
          <div className="mb-1">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-LRT-sjqURYP5YQquhOaJ2hXr9JTrH0hFC2.png"
              alt="Logo LRT Jabodebek"
              className="h-4 object-contain"
            />
          </div>
          <h3 className="font-bold text-base leading-tight">STASIUN {station.name.toUpperCase()}</h3>
          <p className="text-xs text-gray-600">{station.location}</p>
        </div>
      </div>
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

  // Effect to handle opening popup when selectedStationId changes
  useEffect(() => {
    if (selectedStationId !== null) {
      const marker = markersRef.current[selectedStationId]
      if (marker) {
        // Wait for flyTo animation to complete before opening popup
        setTimeout(() => {
          marker.openPopup()
        }, 1000) // Adjust timing as needed
      }
    }
  }, [selectedStationId])

  // Effect to handle opening popup when a destination is selected
  useEffect(() => {
    if (selectedDestinationPosition) {
      const key = `${selectedDestinationPosition[0]},${selectedDestinationPosition[1]}`
      const marker = destinationMarkersRef.current[key]
      if (marker) {
        setTimeout(() => {
          marker.openPopup()
        }, 1000)
      }
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
          <Popup>
            <StationPopup station={station} />
          </Popup>
        </Marker>
      ))}

      {/* Render destination markers if a station is selected */}
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
          <Popup>
            <div className="p-2 text-center min-w-[200px]">
              <div className="w-full h-24 bg-gray-200 rounded-lg mb-2 overflow-hidden">
                <img
                  src={destination.image || "/placeholder.svg?height=96&width=200"}
                  alt={`Gambar ${destination.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold text-sm">{destination.name}</h3>
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
      <div className="absolute top-4 right-4 bg-white p-2 rounded shadow z-50">
        <p>Mencari rute...</p>
      </div>
    )
  }

  if (error && !displayCoordinates.length) {
    return (
      <div className="absolute top-4 right-4 bg-white p-2 rounded shadow z-50 text-red-500">
        <p>Error: {error}</p>
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
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  if (!isMounted) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
        <p className="text-xl">Loading map...</p>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Stations */}
      <Sidebar
        stations={stations}
        onStationSelect={(position: L.LatLngExpression, stationId: number) => handleStationSelect(position, stationId)}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Map Container */}
      <div
        className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "pl-0" : "pl-8"} ${isDestSidebarOpen ? "pr-0" : "pr-8"}`}
      >
        <MapContainer
          center={[-6.2851, 106.8683]}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          maxBounds={L.latLngBounds(stations.map((station) => station.position)).pad(0.5)}
          maxBoundsViscosity={1.0}
        >
          <SetupMapIcons />
          <FitBounds />
          <MapActions onMapReady={handleMapReady} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />
          <MarkerManager
            stations={stations}
            selectedStationId={selectedStationId}
            showDestinations={showDestinations}
            selectedDestinationPosition={selectedDestinationPosition}
          />
          
          {/* Routing component */}
          <RoutingControl 
            startPoint={routeStartPoint} 
            endPoint={routeEndPoint}
            transportMode={transportMode}
            onRouteCalculated={handleRouteCalculated}
          />
        </MapContainer>
      </div>

      {/* Right Sidebar - Destinations */}
      {selectedStation && (
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
      )}
    </div>
  )
}

