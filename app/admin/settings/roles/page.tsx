"use client"

import { Shield, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const roles = [
  {
    name: "ADMIN",
    description: "Akses penuh ke semua fitur sistem",
    permissions: [
      "Mengelola pengguna",
      "Mengelola roles",
      "Mengelola stasiun",
      "Mengelola destinasi",
      "Melihat statistik",
    ],
  },
  {
    name: "OPERATOR",
    description: "Akses untuk mengelola data stasiun dan destinasi",
    permissions: ["Mengelola stasiun", "Mengelola destinasi", "Melihat statistik"],
  },
  {
    name: "VIEWER",
    description: "Akses hanya untuk melihat data",
    permissions: ["Melihat statistik"],
  },
]

export default function RolesPage() {
  return (
    <div className="container p-6 mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Manajemen Role</h1>
      </div>

      <Alert variant="default" className="bg-yellow-50/50 border-yellow-200">
        <Info className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-600">
          Role sistem sudah ditentukan dan tidak dapat diubah untuk menjaga keamanan aplikasi.
          Untuk mengubah hak akses pengguna, silakan atur melalui menu Manajemen Pengguna.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.name} className="border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Shield className="h-5 w-5 text-primary" />
                {role.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Hak Akses:</h4>
                <ul className="space-y-1.5">
                  {role.permissions.map((permission) => (
                    <li key={permission} className="flex items-center text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70 mr-2"></span>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

