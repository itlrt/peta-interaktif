import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat peta...</p>
      </div>
    </div>
  )
})

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
      <header className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg border-b py-3 px-4 sticky top-0 z-10">
        <div className="container mx-auto px-0">
          <div className="flex justify-between items-center relative">
            <div className="flex items-center gap-4 z-20">
              <Image 
                src="/logo-kai-white.png" 
                alt="KAI Logo" 
                width={100} 
                height={100}
                className="h-14 w-auto"
              />
            </div>
            
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <h1 className="text-2xl font-bold">Peta Interaktif LRT Jabodebek</h1>
              <p className="text-sm mt-1">Mulai Perjalananmu dengan LRT JABODEBEK</p>
            </div>
            
            <div className="flex items-center gap-4 z-20">
              <Image 
                src="/logo-lrt-white.png" 
                alt="LRT Jabodebek Logo" 
                width={100} 
                height={100}
                className="h-14 w-auto"
              />
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-1 relative">
        <MapComponent />
      </div>

      {/* <footer className="bg-gray-800 text-white py-2 px-3 text-sm relative z-10">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-between items-center">
            <div>
              <p>Email: info@lrtjabodebek.co.id | Telepon: (021) 1234-5678</p>
            </div>
            <div>
              <p>© {new Date().getFullYear()} LRT Jabodebek. Hak Cipta Dilindungi.</p>
            </div>
          </div>
        </div>
      </footer> */}
    </main>
  )
}

