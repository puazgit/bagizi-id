/**
 * @fileoverview DeliveryMap component for GPS tracking visualization
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * 
 * @description
 * Real-time map visualization for delivery tracking.
 * Features:
 * - Route visualization with polyline
 * - Markers for departure, arrival, current location
 * - Tracking points on route
 * - Auto-center on current location
 * - Distance and speed calculations
 * 
 * Note: This is a placeholder implementation.
 * For production, integrate with:
 * - react-leaflet (open source, recommended)
 * - @googlemaps/react-wrapper (Google Maps)
 * - mapbox-gl (Mapbox)
 */

'use client'

import { MapPin, Navigation, Flag, TrendingUp } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

// ============================================================================
// Types
// ============================================================================

interface Coordinates {
  latitude: number
  longitude: number
}

interface TrackingPoint {
  id: string
  latitude: number
  longitude: number
  recordedAt: Date | string
  status: string
  accuracy?: number
  notes?: string
}

interface DeliveryMapProps {
  /**
   * Departure location coordinates
   */
  departureLocation?: Coordinates | null

  /**
   * Arrival/destination location coordinates
   */
  arrivalLocation?: Coordinates | null

  /**
   * Current location coordinates (for active deliveries)
   */
  currentLocation?: Coordinates | string | null

  /**
   * Array of tracking points for route visualization
   */
  trackingPoints?: TrackingPoint[]

  /**
   * Total distance traveled (in km)
   */
  totalDistance?: number

  /**
   * Average speed (in km/h)
   */
  averageSpeed?: number

  /**
   * Whether delivery is currently active
   */
  isActive?: boolean
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse GPS string coordinates to lat/lng object
 */
function parseGPSString(gps: string | null | undefined): Coordinates | null {
  if (!gps) return null
  
  const parts = gps.split(',')
  if (parts.length !== 2) return null
  
  const latitude = parseFloat(parts[0].trim())
  const longitude = parseFloat(parts[1].trim())
  
  if (isNaN(latitude) || isNaN(longitude)) return null
  
  return { latitude, longitude }
}

/**
 * Format coordinates for display
 */
function formatCoordinates(coords: Coordinates): string {
  return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
}

// ============================================================================
// Main Component
// ============================================================================

export function DeliveryMap({
  departureLocation,
  arrivalLocation,
  currentLocation,
  trackingPoints = [],
  totalDistance,
  averageSpeed,
  isActive = false,
}: DeliveryMapProps) {
  // Parse current location if it's a GPS string
  const parsedCurrentLocation = 
    typeof currentLocation === 'string' 
      ? parseGPSString(currentLocation) 
      : currentLocation

  // Check if we have any location data
  const hasLocationData = 
    departureLocation || 
    arrivalLocation || 
    parsedCurrentLocation || 
    (trackingPoints && trackingPoints.length > 0)

  if (!hasLocationData) {
    return (
      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          Belum ada data GPS tracking untuk pengiriman ini.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Map Container - Placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Peta Tracking GPS</CardTitle>
              <CardDescription>
                Visualisasi rute pengiriman real-time
              </CardDescription>
            </div>
            {isActive && (
              <Badge variant="outline" className="gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Live Tracking
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Map Placeholder */}
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />
            
            {/* Center content */}
            <div className="relative z-10 text-center space-y-4">
              <MapPin className="h-16 w-16 mx-auto text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-lg">Map Integration Required</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  Integrate dengan react-leaflet, Google Maps, atau Mapbox untuk visualisasi peta interaktif
                </p>
              </div>
              
              {/* Show current location if available */}
              {parsedCurrentLocation && (
                <div className="mt-4 p-3 bg-background/80 rounded-lg backdrop-blur-sm">
                  <p className="text-xs text-muted-foreground">Current Location:</p>
                  <p className="font-mono text-sm">
                    {formatCoordinates(parsedCurrentLocation)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Map Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            {departureLocation && (
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-green-600" />
                <span>Keberangkatan</span>
              </div>
            )}
            {arrivalLocation && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <span>Tujuan</span>
              </div>
            )}
            {parsedCurrentLocation && (
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-600" />
                <span>Posisi Saat Ini</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Departure Location */}
        {departureLocation && (
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-green-600" />
                Lokasi Keberangkatan
              </CardDescription>
              <CardTitle className="text-base font-mono">
                {formatCoordinates(departureLocation)}
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        {/* Arrival Location */}
        {arrivalLocation && (
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                Lokasi Tujuan
              </CardDescription>
              <CardTitle className="text-base font-mono">
                {formatCoordinates(arrivalLocation)}
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        {/* Current Location */}
        {parsedCurrentLocation && (
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-600" />
                Posisi Saat Ini
              </CardDescription>
              <CardTitle className="text-base font-mono">
                {formatCoordinates(parsedCurrentLocation)}
              </CardTitle>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Route Statistics */}
      {(totalDistance !== undefined || averageSpeed !== undefined) && (
        <div className="grid gap-4 md:grid-cols-2">
          {totalDistance !== undefined && (
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Jarak Tempuh
                </CardDescription>
                <CardTitle className="text-2xl">
                  {totalDistance.toFixed(2)} km
                </CardTitle>
              </CardHeader>
            </Card>
          )}

          {averageSpeed !== undefined && (
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Kecepatan Rata-rata
                </CardDescription>
                <CardTitle className="text-2xl">
                  {averageSpeed.toFixed(0)} km/jam
                </CardTitle>
              </CardHeader>
            </Card>
          )}
        </div>
      )}

      {/* Tracking Points Count */}
      {trackingPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tracking Points</CardTitle>
            <CardDescription>
              Total {trackingPoints.length} titik GPS tracking tercatat
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Implementation Guide */}
      <Alert>
        <Navigation className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium mb-2">Integrasi Map Library:</p>
          <ul className="text-sm space-y-1 ml-4 list-disc">
            <li><strong>react-leaflet</strong>: Open source, gratis, populer untuk Next.js</li>
            <li><strong>Google Maps</strong>: Familiar UI, memerlukan API key berbayar</li>
            <li><strong>Mapbox</strong>: Modern styling, free tier available</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
