/**
 * @fileoverview School Card Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 */

'use client'

import type { SchoolMaster } from '../types'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  School, 
  MapPin, 
  Users, 
  Target, 
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Utensils,
  Truck
} from 'lucide-react'
import { SCHOOL_TYPES } from '../types'
import { cn } from '@/lib/utils'

interface SchoolCardProps {
  school: SchoolMaster
  variant?: 'default' | 'compact' | 'detailed'
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  className?: string
}

/**
 * School Card Component
 * 
 * Display school information in a card format
 * 
 * Variants:
 * - default: Standard view with key information
 * - compact: Minimal view for lists
 * - detailed: Expanded view with all details
 * 
 * @example
 * ```tsx
 * <SchoolCard
 *   school={schoolData}
 *   variant="default"
 *   onView={(id) => router.push(`/school/${id}`)}
 *   onEdit={(id) => router.push(`/school/${id}/edit`)}
 * />
 * ```
 */
export function SchoolCard({ 
  school, 
  variant = 'default',
  onView,
  onEdit,
  className 
}: SchoolCardProps) {
  const schoolTypeLabel = SCHOOL_TYPES.find(t => t.value === school.schoolType)?.label || school.schoolType

  if (variant === 'compact') {
    return (
      <Card className={cn('hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{school.schoolName}</h3>
                {!school.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Tidak Aktif
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {school.totalStudents}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {school.targetStudents}
                </span>
              </div>
            </div>
            <Badge variant="outline">{schoolTypeLabel}</Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      'hover:shadow-lg transition-all duration-200',
      'dark:hover:shadow-xl dark:hover:shadow-primary/5',
      !school.isActive && 'opacity-75',
      className
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <School className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {school.schoolName}
                </h3>
                {school.schoolCode && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Kode: {school.schoolCode}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge variant="outline">{schoolTypeLabel}</Badge>
            {school.isActive ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="mr-1 h-3 w-3" />
                Aktif
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="mr-1 h-3 w-3" />
                Tidak Aktif
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{school.contactPhone}</span>
          </div>
          {school.contactEmail && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{school.contactEmail}</span>
            </div>
          )}
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="flex-1">{school.schoolAddress}</span>
          </div>
        </div>

        <Separator />

        {/* Student Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatItem
            label="Total Siswa"
            value={school.totalStudents}
            icon={Users}
          />
          <StatItem
            label="Target Penerima"
            value={school.targetStudents}
            icon={Target}
          />
          <StatItem
            label="Siswa Aktif"
            value={school.activeStudents}
            icon={CheckCircle}
          />
          <StatItem
            label="Hari Makan"
            value={school.feedingDays.length}
            icon={Utensils}
          />
        </div>

        {variant === 'detailed' && (
          <>
            <Separator />

            {/* Facilities */}
            <div>
              <h4 className="text-sm font-medium mb-2">Fasilitas</h4>
              <div className="flex flex-wrap gap-2">
                <FacilityBadge
                  label="Dapur"
                  available={school.hasKitchen}
                />
                <FacilityBadge
                  label="Gudang"
                  available={school.hasStorage}
                />
                <FacilityBadge
                  label="Air Bersih"
                  available={school.hasCleanWater}
                />
                <FacilityBadge
                  label="Listrik"
                  available={school.hasElectricity}
                />
              </div>
            </div>

            <Separator />

            {/* Delivery Information */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Informasi Pengiriman
              </h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Alamat:</span>{' '}
                  {school.deliveryAddress}
                </p>
                <p>
                  <span className="text-muted-foreground">Kontak:</span>{' '}
                  {school.deliveryContact}
                </p>
                {school.deliveryInstructions && (
                  <p>
                    <span className="text-muted-foreground">Instruksi:</span>{' '}
                    {school.deliveryInstructions}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>

      {(onView || onEdit) && (
        <CardFooter className="flex gap-2">
          {onView && (
            <Button
              onClick={() => onView(school.id)}
              variant="outline"
              className="flex-1"
            >
              Lihat Detail
            </Button>
          )}
          {onEdit && (
            <Button
              onClick={() => onEdit(school.id)}
              className="flex-1"
            >
              Edit Data
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

/**
 * Stat Item Component
 */
interface StatItemProps {
  label: string
  value: number
  icon: React.ElementType
}

function StatItem({ label, value, icon: Icon }: StatItemProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-semibold">{value.toLocaleString('id-ID')}</p>
    </div>
  )
}

/**
 * Facility Badge Component
 */
interface FacilityBadgeProps {
  label: string
  available: boolean
}

function FacilityBadge({ label, available }: FacilityBadgeProps) {
  return (
    <Badge
      variant={available ? 'default' : 'outline'}
      className={cn(
        available 
          ? 'bg-green-600 hover:bg-green-700' 
          : 'text-muted-foreground'
      )}
    >
      {available ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  )
}
