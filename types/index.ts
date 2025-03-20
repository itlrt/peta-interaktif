export interface Station {
  id: number
  name: string
  description?: string
  location: string
  latitude: number
  longitude: number
  image?: string
  destinations?: Destination[]
}

export interface Destination {
  id: number
  name: string
  description?: string
  latitude: number
  longitude: number
  image?: string
  stationId: number
}

export interface User {
  id: number
  username: string
  name: string
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER'
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
} 