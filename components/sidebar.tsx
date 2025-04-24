"use client"

import React from "react"
import type { LatLngExpression } from "leaflet"
import { ChevronLeft, ChevronRight, MapPin, ChevronDown, ChevronUp, MapPinned } from "lucide-react"

interface Destination {
  name: string
  position: [number, number]
}

interface Station {
  id: number
  name: string
  position: LatLngExpression
  description: string
  location: string
  destinations?: Destination[]
}

interface SidebarProps {
  stations: Station[]
  onStationSelect: (position: LatLngExpression, stationId: number) => void
  isOpen: boolean
  onToggle: () => void
  nearestStationId?: number | null
  selectedStationId?: number | null
}

const Sidebar: React.FC<SidebarProps> = ({ 
  stations, 
  onStationSelect, 
  isOpen, 
  onToggle, 
  nearestStationId,
  selectedStationId: externalSelectedStationId 
}) => {
  // Local state sebagai fallback jika tidak ada selectedStationId yang diberikan dari parent
  const [localSelectedStation, setLocalSelectedStation] = React.useState<number | null>(null)
  const [isMinimized, setIsMinimized] = React.useState(false)
  
  // Gunakan selectedStationId dari props jika ada, jika tidak gunakan state lokal
  const selectedStation = externalSelectedStationId !== undefined ? externalSelectedStationId : localSelectedStation

  const handleStationClick = (station: Station) => {
    setLocalSelectedStation(station.id)
    onStationSelect(station.position, station.id)
  }

  return (
    <div
      className={`shadow-lg overflow-hidden transition-all duration-300 ${
        isOpen ? (isMinimized ? "w-[76px]" : "w-[360px]") : "w-0"
      } h-full`}
    >
      <div className="flex flex-col h-full">
        <div className={`p-4 border-b bg-gradient-to-r from-red-600 to-red-700 ${isMinimized ? "border-none" : ""}`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-lg font-bold text-white flex items-center gap-2 ${isMinimized ? "hidden" : ""}`}>
              <MapPin className="h-5 w-5" />
              Stasiun LRT JABODEBEK
            </h2>
            {isMinimized && (
              <MapPin className="h-5 w-5 text-white" />
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              {isMinimized ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto bg-gray-50/80">
            <div className="grid grid-cols-2 gap-2 p-2">
              {stations
                .sort((a, b) => a.id - b.id)
                .map((station) => (
                  <button
                    key={station.id}
                    onClick={() => handleStationClick(station)}
                    className={`
                      w-full text-left p-2 rounded-lg transition-all duration-200
                      hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
                      relative overflow-hidden group shadow-sm
                      ${
                        selectedStation === station.id
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                          : "bg-white hover:bg-white/80 text-gray-900 hover:shadow-md"
                      }
                    `}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                        ${selectedStation === station.id ? "bg-white" : "bg-red-600"}`}
                      />
                      <div className="flex-1">
                        <h3
                          className={`font-semibold text-sm
                          ${selectedStation === station.id ? "text-white" : "text-navy-900"}`}
                        >
                          {station.name.replace("St ", "Stasiun ")}
                        </h3>
                        <span
                          className={`text-xs mt-0.5 inline-block
                          ${selectedStation === station.id ? "text-white/80" : "text-gray-600"}`}
                        >
                          {station.location}
                        </span>
                        
                        {/* You are here badge */}
                        {nearestStationId === station.id && (
                          <div className={`mt-1 flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 w-fit
                            ${selectedStation === station.id ? "bg-white/20 text-white" : "bg-red-100 text-red-700"}`}>
                            <MapPinned size={12} />
                            <span>You are here</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar

