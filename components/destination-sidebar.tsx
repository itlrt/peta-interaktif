"use client"

import React from "react"
import type { LatLngExpression } from "leaflet"
import { ChevronLeft, ChevronRight, MapPin, Navigation } from "lucide-react"
import { stations } from "./map-component" // Import stations dari map-component

interface Destination {
  name: string
  position: [number, number]
  image?: string
}

interface DestinationSidebarProps {
  stationName: string
  stationLocation: string
  destinations: Destination[]
  onDestinationSelect: (position: LatLngExpression) => void
  isOpen: boolean
  onToggle: () => void
}

// Dummy stations data (replace with your actual data source)
// const stations = [
//   { name: "Dukuh Atas", position: [-6.204828, 106.8255301] },
//   { name: "Another Station", position: [-6.1754, 106.8272] }, // Example station
// ];

const DestinationSidebar: React.FC<DestinationSidebarProps> = ({
  stationName,
  stationLocation,
  destinations,
  onDestinationSelect,
  isOpen,
  onToggle,
}) => {
  const [selectedDestination, setSelectedDestination] = React.useState<string | null>(null)

  // Cari stasiun berdasarkan nama untuk mendapatkan posisinya
  const stationPosition = React.useMemo(() => {
    const station = stations.find((s) => s.name === stationName)
    return station ? (station.position as [number, number]) : [-6.204828, 106.8255301] // default to Dukuh Atas if not found
  }, [stationName])

  const handleDestinationClick = (destination: Destination) => {
    setSelectedDestination(destination.name)
    onDestinationSelect(destination.position)
  }

  // Fungsi untuk menghitung jarak dalam kilometer
  const calculateDistance = (position: [number, number]) => {
    // Haversine formula untuk menghitung jarak
    const distance =
      6371 *
      Math.acos(
        Math.cos((position[0] * Math.PI) / 180) *
          Math.cos((stationPosition[0] * Math.PI) / 180) *
          Math.cos((position[1] * Math.PI) / 180 - (stationPosition[1] * Math.PI) / 180) +
          Math.sin((position[0] * Math.PI) / 180) * Math.sin((stationPosition[0] * Math.PI) / 180),
      )

    // Format jarak dalam kilometer dengan 1 desimal
    return distance < 1 ? `${(distance * 1000).toFixed(0)} meter` : `${distance.toFixed(1)} km`
  }

  return (
    <div className="relative h-full">
      <div
        className={`bg-white shadow-lg h-full overflow-hidden transition-all duration-300 ${
          isOpen ? "w-[360px]" : "w-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 pr-8 border-b bg-gradient-to-r from-red-600 to-red-700">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Destinasi Terdekat
            </h2>
          </div>
          <div className="p-3 bg-red-50 border-b border-red-100 flex items-center">
            <MapPin className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-800">Stasiun {stationName}</h3>
              <p className="text-sm text-red-700">{stationLocation}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-gray-50/80">
            <div className="p-2 flex flex-col gap-2">
              {destinations.map((destination, index) => (
                <button
                  key={index}
                  onClick={() => handleDestinationClick(destination)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-all duration-200
                    hover:shadow-md hover:scale-[1.01] active:scale-[0.99]
                    relative overflow-hidden group
                    ${
                      selectedDestination === destination.name
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                        : "bg-white hover:bg-white/80 text-gray-900"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                      {destination.image ? (
                        <img 
                          src={destination.image} 
                          alt={destination.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-red-100">
                          <MapPin size={16} className={selectedDestination === destination.name ? "text-white" : "text-red-600"} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold text-sm
                        ${selectedDestination === destination.name ? "text-white" : "text-navy-900"}`}
                      >
                        {destination.name}
                      </h3>
                      {selectedDestination === destination.name && (
                        <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full mt-1 inline-flex items-center">
                          <svg className="h-2.5 w-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Dipilih
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`
          absolute top-1/2 -translate-y-1/2 
          ${isOpen ? "-left-5" : "-right-0"}
          bg-white p-2.5 rounded-full shadow-lg transition-all duration-300
          hover:bg-gray-50 active:bg-gray-100
          border border-gray-200
          flex items-center justify-center
          z-50 
          focus:outline-none focus:ring-2 focus:ring-red-600
          transform hover:scale-105 active:scale-95
        `}
        aria-label={isOpen ? "Close panel" : "Open panel"}
      >
        <div className={`text-red-600 transition-transform ${isOpen ? "rotate-180" : ""}`}>
          {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </div>
      </button>
    </div>
  )
}

export default DestinationSidebar

