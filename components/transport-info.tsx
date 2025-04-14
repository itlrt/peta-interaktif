import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin } from "lucide-react"
import Image from "next/image"

interface Transport {
  id: number
  name: string
  type: string
  icon: string
  stations: {
    id: number
    name: string
  }[]
  isAllStation: boolean
}

interface TransportInfoProps {
  transports: Transport[]
  selectedStationId: number | null
}

export default function TransportInfo({ transports, selectedStationId }: TransportInfoProps) {
  const filteredTransports = transports.filter(transport => 
    transport.isAllStation || 
    (selectedStationId && transport.stations.some(station => station.id === selectedStationId))
  )

  if (filteredTransports.length === 0 && !selectedStationId) {
    return null
  }

  return (
    <div className="absolute bottom-4 left-1/3 -translate-x-1/3 bg-white shadow-lg rounded-xl z-[1000] w-[600px]">
      <div className="p-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-0.5 w-6 bg-red-500 rounded-full"></div>
          <h2 className="text-sm font-semibold text-center">Integrasi Transportasi</h2>
          <div className="h-0.5 w-6 bg-red-500 rounded-full"></div>
        </div>
        <ScrollArea className="h-[100px]">
          <div className="grid grid-cols-4 gap-2 p-1">
            {filteredTransports.length > 0 ? (
              filteredTransports.map((transport) => (
                <div
                  key={transport.id}
                  className="bg-white rounded-lg border border-gray-100 p-1.5 hover:border-red-500 hover:shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative h-6 w-6 flex-shrink-0">
                      <Image
                        src={transport.icon}
                        alt={transport.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-[11px] text-gray-900 line-clamp-2">{transport.name}</h3>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 flex items-center justify-center h-[40px] text-xs text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200 px-4">
                <div className="flex flex-col items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  Tidak ada transportasi di stasiun ini
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
} 