"use client"

import React from "react"
import type { LatLngExpression } from "leaflet"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"

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
}

const Sidebar: React.FC<SidebarProps> = ({ stations, onStationSelect, isOpen, onToggle }) => {
  const [selectedStation, setSelectedStation] = React.useState<number | null>(null)

  const handleStationClick = (station: Station) => {
    setSelectedStation(station.id)
    onStationSelect(station.position, station.id)
  }

  return (
    <div className="relative h-full">
      <div
        className={`bg-white shadow-lg h-full overflow-hidden transition-all duration-300 ${isOpen ? "w-[360px]" : "w-0"}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 pr-8 border-b bg-gradient-to-r from-red-600 to-red-700">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Stasiun LRT JABODEBEK
            </h2>
          </div>
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
                      relative overflow-hidden group
                      ${
                        selectedStation === station.id
                          ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                          : "bg-white hover:bg-white/80 text-gray-900"
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
          ${isOpen ? "-right-5" : "-left-0"}
          bg-white p-2.5 rounded-full shadow-lg transition-all duration-300
          hover:bg-gray-50 active:bg-gray-100
          border border-gray-200
          flex items-center justify-center
          z-[1000] 
          focus:outline-none focus:ring-2 focus:ring-red-600
          transform hover:scale-105 active:scale-95
        `}
        aria-label={isOpen ? "Close panel" : "Open panel"}
      >
        <div className={`text-red-600 transition-transform ${isOpen ? "" : "rotate-180"}`}>
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </div>
      </button>
    </div>
  )
}

export default Sidebar

