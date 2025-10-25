/**
 * SPPG Location & Contacts Tab Component
 * Displays location, contact information, and PIC details
 * 
 * @component
 * @example
 * <SppgLocationTab sppg={sppg} />
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Mail, User, Map, MessageCircle, ExternalLink } from 'lucide-react'
import type { SppgDetail } from '@/features/admin/sppg-management/types'

interface SppgLocationTabProps {
  sppg: SppgDetail
}

export function SppgLocationTab({ sppg }: SppgLocationTabProps) {
  // Generate Google Maps link from coordinates
  const getGoogleMapsLink = (coordinates?: string | null) => {
    if (!coordinates) return null
    // Expected format: "latitude,longitude" or "lat,lng"
    const [lat, lng] = coordinates.split(',').map(s => s.trim())
    if (!lat || !lng) return null
    return `https://www.google.com/maps?q=${lat},${lng}`
  }

  // Generate WhatsApp link
  const getWhatsAppLink = (phone?: string | null) => {
    if (!phone) return null
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '')
    // Add 62 prefix if starts with 0
    const whatsappNumber = cleanPhone.startsWith('0') 
      ? '62' + cleanPhone.substring(1)
      : cleanPhone.startsWith('62') 
        ? cleanPhone 
        : '62' + cleanPhone
    return `https://wa.me/${whatsappNumber}`
  }

  const googleMapsLink = getGoogleMapsLink(sppg.coordinates)
  const picWhatsAppLink = getWhatsAppLink(sppg.picWhatsapp)

  return (
    <div className="grid gap-6">
      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Alamat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Alamat Lengkap</div>
            <div className="font-medium leading-relaxed">{sppg.addressDetail}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {sppg.province && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Provinsi</div>
                <div className="font-medium">{sppg.province.name}</div>
              </div>
            )}

            {sppg.regency && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Kabupaten/Kota</div>
                <div className="font-medium">{sppg.regency.name}</div>
              </div>
            )}

            {sppg.district && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Kecamatan</div>
                <div className="font-medium">{sppg.district.name}</div>
              </div>
            )}

            {sppg.village && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Kelurahan/Desa</div>
                <div className="font-medium">{sppg.village.name}</div>
              </div>
            )}

            {sppg.postalCode && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Kode Pos</div>
                <div className="font-medium">{sppg.postalCode}</div>
              </div>
            )}

            {sppg.timezone && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Zona Waktu</div>
                <div className="font-medium">{sppg.timezone}</div>
              </div>
            )}
          </div>

          {/* Coordinates with Google Maps Link */}
          {sppg.coordinates && (
            <div className="space-y-2 pt-2 border-t">
              <div className="text-sm text-muted-foreground">Koordinat</div>
              <div className="flex items-center gap-3">
                <div className="font-mono text-sm">{sppg.coordinates}</div>
                {googleMapsLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Map className="h-4 w-4" />
                      Lihat di Google Maps
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Kontak
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sppg.phone && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Telepon</div>
                <a
                  href={`tel:${sppg.phone}`}
                  className="font-medium hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {sppg.phone}
                </a>
              </div>
            )}

            {sppg.email && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Email</div>
                <a
                  href={`mailto:${sppg.email}`}
                  className="font-medium hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  {sppg.email}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PIC Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Penanggung Jawab (PIC)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sppg.picName && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Nama</div>
                <div className="font-medium">{sppg.picName}</div>
              </div>
            )}

            {sppg.picPosition && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Jabatan</div>
                <div className="font-medium">{sppg.picPosition}</div>
              </div>
            )}

            {sppg.picEmail && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Email</div>
                <a
                  href={`mailto:${sppg.picEmail}`}
                  className="font-medium hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  {sppg.picEmail}
                </a>
              </div>
            )}

            {sppg.picPhone && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Telepon</div>
                <a
                  href={`tel:${sppg.picPhone}`}
                  className="font-medium hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  {sppg.picPhone}
                </a>
              </div>
            )}
          </div>

          {/* WhatsApp Contact */}
          {sppg.picWhatsapp && (
            <div className="space-y-2 pt-2 border-t">
              <div className="text-sm text-muted-foreground">WhatsApp</div>
              <div className="flex items-center gap-3">
                <div className="font-medium">{sppg.picWhatsapp}</div>
                {picWhatsAppLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={picWhatsAppLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-600 hover:text-green-700 dark:text-green-500"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Hubungi via WhatsApp
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
