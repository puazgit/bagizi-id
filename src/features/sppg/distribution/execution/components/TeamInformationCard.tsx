'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  UserCircle,
  Phone,
  Truck,
  User,
  Shield,
  Mail,
} from 'lucide-react'

/**
 * Team member type definition
 */
export interface TeamMember {
  id: string
  name: string
  role: 'DRIVER' | 'COORDINATOR' | 'VOLUNTEER' | 'SUPERVISOR'
  phone?: string
  email?: string
}

/**
 * Vehicle information type
 */
export interface VehicleInfo {
  id: string
  vehicleName: string
  vehiclePlate: string
  vehicleType: string
  capacity?: number
}

/**
 * Team information data structure
 */
export interface TeamInformationData {
  driver?: {
    id: string
    name: string
    phone?: string
    email?: string
  } | null
  vehicle?: VehicleInfo | null
  volunteers?: string[]
  distributionTeam?: TeamMember[]
}

interface TeamInformationCardProps {
  data: TeamInformationData
  compact?: boolean
}

/**
 * Get initials from name for avatar
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Get role label in Indonesian
 */
function getRoleLabel(role: TeamMember['role']): string {
  const labels: Record<TeamMember['role'], string> = {
    DRIVER: 'Sopir',
    COORDINATOR: 'Koordinator',
    VOLUNTEER: 'Relawan',
    SUPERVISOR: 'Supervisor',
  }
  return labels[role]
}

/**
 * Get role badge variant
 */
function getRoleBadgeVariant(role: TeamMember['role']): 'default' | 'secondary' | 'outline' {
  const variants: Record<TeamMember['role'], 'default' | 'secondary' | 'outline'> = {
    DRIVER: 'default',
    COORDINATOR: 'default',
    VOLUNTEER: 'secondary',
    SUPERVISOR: 'outline',
  }
  return variants[role]
}

/**
 * Team member card component
 */
function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary/10 text-primary">
          {getInitials(member.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{member.name}</p>
          <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
            {getRoleLabel(member.role)}
          </Badge>
        </div>

        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          {member.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{member.phone}</span>
            </div>
          )}
          {member.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Driver information section
 */
function DriverSection({ driver }: { driver: TeamInformationData['driver'] }) {
  if (!driver) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <UserCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Informasi sopir belum tersedia</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <UserCircle className="h-4 w-4" />
        <span>Sopir</span>
      </div>

      <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(driver.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-lg">{driver.name}</p>
          <div className="flex flex-col gap-1 mt-1">
            {driver.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{driver.phone}</span>
              </div>
            )}
            {driver.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{driver.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Vehicle information section
 */
function VehicleSection({ vehicle }: { vehicle: TeamInformationData['vehicle'] }) {
  if (!vehicle) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Informasi kendaraan belum tersedia</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Truck className="h-4 w-4" />
        <span>Kendaraan</span>
      </div>

      <div className="p-4 border rounded-lg bg-card space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">{vehicle.vehicleName}</p>
            <p className="text-sm text-muted-foreground">{vehicle.vehicleType}</p>
          </div>
          <Badge variant="outline" className="text-base font-mono">
            {vehicle.vehiclePlate}
          </Badge>
        </div>

        {vehicle.capacity && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <Shield className="h-3 w-3" />
            <span>Kapasitas: {vehicle.capacity} porsi</span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Distribution team section
 */
function TeamSection({
  team,
  volunteers,
}: {
  team?: TeamMember[]
  volunteers?: string[]
}) {
  const hasTeam = team && team.length > 0
  const hasVolunteers = volunteers && volunteers.length > 0

  if (!hasTeam && !hasVolunteers) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Informasi tim distribusi belum tersedia</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Tim Distribusi</span>
        {(hasTeam || hasVolunteers) && (
          <Badge variant="secondary" className="text-xs">
            {(team?.length || 0) + (volunteers?.length || 0)} Anggota
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {/* Team members with full info */}
        {team?.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}

        {/* Volunteers (simple list) */}
        {volunteers?.map((volunteer, index) => (
          <div
            key={`volunteer-${index}`}
            className="flex items-center gap-3 p-3 border rounded-lg"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-secondary/10 text-secondary-foreground">
                {getInitials(volunteer)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{volunteer}</p>
              <Badge variant="secondary" className="text-xs mt-1">
                Relawan
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Main Team Information Card Component
 */
export function TeamInformationCard({ data, compact = false }: TeamInformationCardProps) {
  const { driver, vehicle, volunteers, distributionTeam } = data

  const hasAnyInfo =
    driver || vehicle || (volunteers && volunteers.length > 0) || (distributionTeam && distributionTeam.length > 0)

  if (!hasAnyInfo) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Informasi Tim Belum Tersedia</p>
            <p className="text-sm mt-1">Data sopir, kendaraan, dan tim distribusi akan ditampilkan di sini</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Tim Distribusi</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {driver && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Sopir</p>
              <p className="font-medium">{driver.name}</p>
            </div>
          )}
          {vehicle && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Kendaraan</p>
              <p className="font-medium">{vehicle.vehiclePlate}</p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-muted-foreground">Anggota Tim</p>
            <p className="font-medium">
              {(distributionTeam?.length || 0) + (volunteers?.length || 0)} orang
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Informasi Tim Distribusi
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Driver Section */}
        <DriverSection driver={driver} />

        <Separator />

        {/* Vehicle Section */}
        <VehicleSection vehicle={vehicle} />

        <Separator />

        {/* Distribution Team Section */}
        <TeamSection team={distributionTeam} volunteers={volunteers} />

        {/* Contact Directory Summary */}
        {hasAnyInfo && (
          <>
            <Separator />
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Direktori Kontak
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {driver?.phone && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Sopir:</span>
                    <span className="font-medium">{driver.phone}</span>
                  </div>
                )}
                {distributionTeam
                  ?.filter((member) => member.phone)
                  .slice(0, 3)
                  .map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{member.name}:</span>
                      <span className="font-medium">{member.phone}</span>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
