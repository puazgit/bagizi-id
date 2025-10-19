/**
 * @fileoverview Execution Photo Gallery Component
 * 
 * Displays photos from all deliveries in an execution with:
 * - Photo grid with category filtering
 * - Lightbox modal for full-size viewing
 * - Photo metadata (timestamp, location, uploader, type)
 * - Navigation controls (previous/next)
 * - Download functionality
 * - Upload capability (future enhancement)
 * 
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Camera,
  Download,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Image as ImageIcon,
  Filter,
} from 'lucide-react'
import { PhotoType } from '@prisma/client'
import type { ExecutionPhotoData } from '../api/executionPhotosApi'

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Photo data structure (re-export from API with Date conversion)
 */
export interface ExecutionPhoto extends Omit<ExecutionPhotoData, 'takenAt'> {
  takenAt: Date
}

/**
 * Props for ExecutionPhotoGallery component
 */
export interface ExecutionPhotoGalleryProps {
  /** Execution ID */
  executionId: string
  /** Array of photos from all deliveries */
  photos: ExecutionPhoto[]
  /** Loading state */
  isLoading?: boolean
  /** Error message */
  error?: string | null
}

// ============================================================================
// Photo Type Configuration
// ============================================================================

const PHOTO_TYPE_CONFIG: Record<
  PhotoType,
  { label: string; color: string; icon: string }
> = {
  VEHICLE_BEFORE: {
    label: 'Kendaraan (Sebelum)',
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    icon: '🚚',
  },
  VEHICLE_AFTER: {
    label: 'Kendaraan (Sesudah)',
    color: 'bg-green-500/10 text-green-700 dark:text-green-400',
    icon: '✅',
  },
  FOOD_QUALITY: {
    label: 'Kualitas Makanan',
    color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    icon: '🍱',
  },
  DELIVERY_PROOF: {
    label: 'Bukti Pengiriman',
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    icon: '📋',
  },
  RECIPIENT: {
    label: 'Penerima',
    color: 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
    icon: '👤',
  },
  OTHER: {
    label: 'Lainnya',
    color: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    icon: '📸',
  },
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format file size to human-readable string
 */
function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return 'Unknown'
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * Parse GPS coordinates from "lat,lng" string
 */
function parseGPS(location: string | null | undefined): {
  lat: number
  lng: number
} | null {
  if (!location) return null
  
  const [lat, lng] = location.split(',').map(Number)
  if (isNaN(lat) || isNaN(lng)) return null
  
  return { lat, lng }
}

/**
 * Get Google Maps link for coordinates
 */
function getMapLink(location: string | null | undefined): string | null {
  const coords = parseGPS(location)
  if (!coords) return null
  
  return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
}

// ============================================================================
// Main Component
// ============================================================================

export function ExecutionPhotoGallery({
  photos,
  isLoading = false,
  error = null,
}: ExecutionPhotoGalleryProps) {
  // State Management
  const [selectedPhoto, setSelectedPhoto] = useState<ExecutionPhoto | null>(null)
  const [filterType, setFilterType] = useState<PhotoType | 'ALL'>('ALL')

  // Filtered photos based on selected type
  const filteredPhotos = useMemo(() => {
    if (filterType === 'ALL') return photos
    return photos.filter((photo) => photo.photoType === filterType)
  }, [photos, filterType])

  // Current photo index in filtered list
  const currentPhotoIndex = useMemo(() => {
    if (!selectedPhoto) return -1
    return filteredPhotos.findIndex((p) => p.id === selectedPhoto.id)
  }, [selectedPhoto, filteredPhotos])

  // Navigation handlers
  const handlePrevious = () => {
    if (currentPhotoIndex > 0) {
      setSelectedPhoto(filteredPhotos[currentPhotoIndex - 1])
    }
  }

  const handleNext = () => {
    if (currentPhotoIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[currentPhotoIndex + 1])
    }
  }

  // Download handler
  const handleDownload = async (photo: ExecutionPhoto) => {
    try {
      const response = await fetch(photo.photoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${photo.delivery.targetName.replace(/\s+/g, '_')}_${photo.photoType}_${format(photo.takenAt, 'yyyyMMdd_HHmmss')}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  // Count photos by type
  const photoCountsByType = useMemo(() => {
    const counts: Record<PhotoType, number> = {
      VEHICLE_BEFORE: 0,
      VEHICLE_AFTER: 0,
      FOOD_QUALITY: 0,
      DELIVERY_PROOF: 0,
      RECIPIENT: 0,
      OTHER: 0,
    }
    
    photos.forEach((photo) => {
      counts[photo.photoType]++
    })
    
    return counts
  }, [photos])

  // Loading State
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <CardTitle>Galeri Foto</CardTitle>
          </div>
          <CardDescription>Memuat galeri foto...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error State
  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-destructive" />
            <CardTitle>Galeri Foto</CardTitle>
          </div>
          <CardDescription className="text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Empty State
  if (photos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <CardTitle>Galeri Foto</CardTitle>
          </div>
          <CardDescription>
            Foto eksekusi distribusi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium mb-1">
              Belum Ada Foto
            </p>
            <p className="text-sm text-muted-foreground">
              Foto akan muncul ketika tim distribusi mengunggah dokumentasi
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <CardTitle>Galeri Foto</CardTitle>
                <Badge variant="secondary" className="ml-2">
                  {filteredPhotos.length} Foto
                </Badge>
              </div>
              <CardDescription>
                Dokumentasi visual eksekusi distribusi
              </CardDescription>
            </div>

            {/* Filter by Photo Type */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as PhotoType | 'ALL')}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter Tipe Foto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    Semua ({photos.length})
                  </SelectItem>
                  <Separator className="my-1" />
                  {Object.entries(PHOTO_TYPE_CONFIG).map(([type, config]) => (
                    <SelectItem key={type} value={type}>
                      <span className="flex items-center gap-2">
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                        <span className="text-muted-foreground text-xs">
                          ({photoCountsByType[type as PhotoType]})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => {
              const typeConfig = PHOTO_TYPE_CONFIG[photo.photoType]
              
              return (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative aspect-square rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all"
                >
                  {/* Photo Image */}
                  <Image
                    src={photo.photoUrl}
                    alt={photo.caption || typeConfig.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-white" />
                  </div>

                  {/* Photo Type Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant="secondary"
                      className={`${typeConfig.color} text-xs`}
                    >
                      {typeConfig.icon} {typeConfig.label}
                    </Badge>
                  </div>

                  {/* Timestamp */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(photo.takenAt, 'dd MMM HH:mm', { locale: id })}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox Modal */}
      <Dialog
        open={selectedPhoto !== null}
        onOpenChange={(open) => !open && setSelectedPhoto(null)}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          {selectedPhoto && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <DialogHeader className="p-6 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <DialogTitle className="flex items-center gap-2">
                      <span className="text-2xl">
                        {PHOTO_TYPE_CONFIG[selectedPhoto.photoType].icon}
                      </span>
                      {PHOTO_TYPE_CONFIG[selectedPhoto.photoType].label}
                    </DialogTitle>
                    {selectedPhoto.caption && (
                      <p className="text-sm text-muted-foreground">
                        {selectedPhoto.caption}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(selectedPhoto)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <Separator />

              {/* Photo Content */}
              <div className="flex-1 relative bg-black/5 dark:bg-black/20 min-h-[400px]">
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="relative w-full h-full max-w-4xl max-h-[600px]">
                    <Image
                      src={selectedPhoto.photoUrl}
                      alt={selectedPhoto.caption || 'Photo'}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>

                {/* Navigation Buttons */}
                {currentPhotoIndex > 0 && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                )}
                {currentPhotoIndex < filteredPhotos.length - 1 && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                )}

                {/* Photo Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    {currentPhotoIndex + 1} / {filteredPhotos.length}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Photo Metadata */}
              <div className="p-6 space-y-4 bg-muted/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Timestamp */}
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Waktu Foto</p>
                      <p className="text-sm text-muted-foreground">
                        {format(selectedPhoto.takenAt, "dd MMMM yyyy 'pukul' HH:mm", {
                          locale: id,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Lokasi Pengiriman</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPhoto.delivery.targetName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Menu: {selectedPhoto.delivery.schedule.menuName}
                      </p>
                    </div>
                  </div>

                  {/* GPS Coordinates (if available) */}
                  {selectedPhoto.locationTaken && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Koordinat GPS</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPhoto.locationTaken}
                        </p>
                        {getMapLink(selectedPhoto.locationTaken) && (
                          <a
                            href={getMapLink(selectedPhoto.locationTaken)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Buka di Google Maps →
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* File Information */}
                  <div className="flex items-start gap-3">
                    <ImageIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Informasi File</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPhoto.mimeType || 'image/jpeg'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedPhoto.fileSize)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
