/**
 * @fileoverview School Detail Component - Comprehensive View
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Query
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  School, 
  User, 
  MapPin, 
  Users, 
  Utensils, 
  Truck, 
  Wrench, 
  TrendingUp,
  Edit,
  Trash2,
  RotateCcw,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react'

import { useSchool, useDeleteSchool, useReactivateSchool } from '../hooks'
import type { SchoolMaster } from '../types'
import { SCHOOL_TYPES, SCHOOL_STATUSES, SERVING_METHODS } from '../types'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/**
 * Props for SchoolDetail component
 */
interface SchoolDetailProps {
  schoolId: string
  onEdit?: (school: SchoolMaster) => void
  onDelete?: () => void
}

/**
 * SchoolDetail Component
 * 
 * Comprehensive detail view of a school with tabbed interface.
 * Features:
 * - 6 organized tabs (Overview, Contact, Students, Feeding, Facilities, History)
 * - Quick action buttons (Edit, Delete, Reactivate, Export, Print)
 * - Loading skeleton states
 * - Error handling
 * - Confirmation dialogs
 * - Print-friendly CSS
 * - Dark mode support
 * 
 * @example
 * ```tsx
 * <SchoolDetail 
 *   schoolId="school_123" 
 *   onEdit={(school) => router.push(`/schools/${school.id}/edit`)}
 * />
 * ```
 */
export function SchoolDetail({ schoolId, onEdit, onDelete }: SchoolDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Fetch school data
  const { data: school, isLoading, error } = useSchool(schoolId)
  
  // Mutations
  const { mutate: deleteSchool, isPending: isDeleting } = useDeleteSchool()
  const { mutate: reactivateSchool, isPending: isReactivating } = useReactivateSchool()

  /**
   * Handle delete school
   */
  const handleDelete = () => {
    deleteSchool(
      { id: schoolId, permanent: false },
      {
        onSuccess: () => {
          setShowDeleteDialog(false)
          if (onDelete) {
            onDelete()
          } else {
            router.push('/schools')
          }
        },
      }
    )
  }

  /**
   * Handle reactivate school
   */
  const handleReactivate = () => {
    reactivateSchool(schoolId)
  }

  /**
   * Handle print
   */
  const handlePrint = () => {
    window.print()
  }

  /**
   * Handle export (placeholder)
   */
  const handleExport = () => {
    // TODO: Implement export to PDF functionality
    console.log('Export to PDF:', schoolId)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !school) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Error Loading School
          </CardTitle>
          <CardDescription>
            {error ? error.message : 'School not found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/schools')}>
            Back to Schools List
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Get type and status labels
  const schoolTypeLabel = SCHOOL_TYPES.find(t => t.value === school.schoolType)?.label || school.schoolType
  const schoolStatusLabel = SCHOOL_STATUSES.find(s => s.value === school.schoolStatus)?.label || school.schoolStatus
  const servingMethodLabel = school.servingMethod 
    ? SERVING_METHODS.find(m => m.value === school.servingMethod)?.label || school.servingMethod
    : 'Not set'

  return (
    <>
      <div className="space-y-6">
        {/* Header Card with Quick Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <School className="h-6 w-6 text-primary" />
                  <CardTitle className="text-3xl">{school.schoolName}</CardTitle>
                  <Badge variant={school.isActive ? 'default' : 'secondary'}>
                    {school.isActive ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" /> Inactive</>
                    )}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <School className="h-4 w-4" />
                    {schoolTypeLabel}
                  </span>
                  {school.schoolCode && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <span>Code: {school.schoolCode}</span>
                    </>
                  )}
                  {school.npsn && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <span>NPSN: {school.npsn}</span>
                    </>
                  )}
                </CardDescription>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 print:hidden">
                {school.isActive ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit && onEdit(school)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReactivate}
                    disabled={isReactivating}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {isReactivating ? 'Reactivating...' : 'Reactivate'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="feeding">Feeding</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{school.totalStudents}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Target Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{school.targetStudents}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Attendance Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {school.attendanceRate?.toFixed(1) || 'N/A'}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Satisfaction Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {school.satisfactionScore?.toFixed(1) || 'N/A'}/5.0
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">School Type</div>
                    <div className="text-sm">{schoolTypeLabel}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div className="text-sm">{schoolStatusLabel}</div>
                  </div>
                  {school.accreditationGrade && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Accreditation</div>
                      <div className="text-sm">{school.accreditationGrade}</div>
                    </div>
                  )}
                  {school.urbanRural && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Location Type</div>
                      <div className="text-sm">{school.urbanRural === 'URBAN' ? 'Urban' : 'Rural'}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location Quick View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{school.schoolAddress}</p>
                {school.postalCode && (
                  <p className="text-sm text-muted-foreground mt-2">Postal Code: {school.postalCode}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Contact & Location */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Principal Name</div>
                  <div className="text-sm">{school.principalName}</div>
                </div>

                {school.principalNip && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Principal NIP</div>
                    <div className="text-sm">{school.principalNip}</div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Phone</div>
                    <div className="text-sm text-muted-foreground">{school.contactPhone}</div>
                  </div>
                </div>

                {school.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">{school.contactEmail}</div>
                    </div>
                  </div>
                )}

                {school.alternatePhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Alternate Phone</div>
                      <div className="text-sm text-muted-foreground">{school.alternatePhone}</div>
                    </div>
                  </div>
                )}

                {school.whatsappNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">WhatsApp</div>
                      <div className="text-sm text-muted-foreground">{school.whatsappNumber}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Address</div>
                  <div className="text-sm">{school.schoolAddress}</div>
                </div>

                {school.postalCode && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Postal Code</div>
                    <div className="text-sm">{school.postalCode}</div>
                  </div>
                )}

                {school.coordinates && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Coordinates</div>
                    <div className="text-sm text-muted-foreground">{school.coordinates}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Students & Demographics */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Students</div>
                    <div className="text-2xl font-bold">{school.totalStudents}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Target Students</div>
                    <div className="text-2xl font-bold">{school.targetStudents}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Active Students</div>
                    <div className="text-2xl font-bold">{school.activeStudents || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Attendance Rate</div>
                    <div className="text-2xl font-bold">{school.attendanceRate?.toFixed(1) || 'N/A'}%</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm font-medium">Age Group Distribution</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">4-6 years (PAUD)</div>
                      <div className="text-sm font-medium">{school.students4to6Years} students</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">7-12 years (SD)</div>
                      <div className="text-sm font-medium">{school.students7to12Years} students</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">13-15 years (SMP)</div>
                      <div className="text-sm font-medium">{school.students13to15Years} students</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">16-18 years (SMA/SMK)</div>
                      <div className="text-sm font-medium">{school.students16to18Years} students</div>
                    </div>
                  </div>
                </div>

                {(school.maleStudents !== null || school.femaleStudents !== null) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Gender Distribution</div>
                      <div className="grid grid-cols-2 gap-4">
                        {school.maleStudents !== null && (
                          <div>
                            <div className="text-sm text-muted-foreground">Male</div>
                            <div className="text-sm font-medium">{school.maleStudents} students</div>
                          </div>
                        )}
                        {school.femaleStudents !== null && (
                          <div>
                            <div className="text-sm text-muted-foreground">Female</div>
                            <div className="text-sm font-medium">{school.femaleStudents} students</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Feeding & Distribution */}
          <TabsContent value="feeding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Feeding Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Feeding Days</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {school.feedingDays && school.feedingDays.length > 0 ? (
                      school.feedingDays.map((day) => (
                        <Badge key={day} variant="outline">{day}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Not set</span>
                    )}
                  </div>
                </div>

                {school.mealsPerDay && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Meals Per Day</div>
                    <div className="text-sm">{school.mealsPerDay}</div>
                  </div>
                )}

                {school.servingMethod && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Serving Method</div>
                    <div className="text-sm">{servingMethodLabel}</div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  {school.feedingTime && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Feeding Time</div>
                      <div className="text-sm">{school.feedingTime}</div>
                    </div>
                  )}
                  {school.breakfastTime && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Breakfast Time</div>
                      <div className="text-sm">{school.breakfastTime}</div>
                    </div>
                  )}
                  {school.lunchTime && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Lunch Time</div>
                      <div className="text-sm">{school.lunchTime}</div>
                    </div>
                  )}
                  {school.snackTime && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Snack Time</div>
                      <div className="text-sm">{school.snackTime}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Delivery Address</div>
                  <div className="text-sm">{school.deliveryAddress}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Delivery Contact</div>
                  <div className="text-sm">{school.deliveryContact}</div>
                </div>

                {school.deliveryPhone && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Delivery Phone</div>
                    <div className="text-sm">{school.deliveryPhone}</div>
                  </div>
                )}

                {school.deliveryInstructions && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Delivery Instructions</div>
                    <div className="text-sm text-muted-foreground">{school.deliveryInstructions}</div>
                  </div>
                )}

                {school.preferredDeliveryTime && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Preferred Delivery Time</div>
                    <div className="text-sm">{school.preferredDeliveryTime}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 5: Facilities & Performance */}
          <TabsContent value="facilities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  School Facilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    {school.hasKitchen ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Kitchen</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {school.hasStorage ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Storage</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {school.hasCleanWater ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Clean Water</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {school.hasElectricity ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Electricity</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {school.hasRefrigerator ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Refrigerator</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {school.hasDiningArea ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Dining Area</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {school.hasHandwashing ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm">Handwashing</span>
                  </div>
                </div>

                {(school.storageCapacity || school.diningCapacity) && (
                  <>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 gap-4">
                      {school.storageCapacity && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Storage Capacity</div>
                          <div className="text-sm">{school.storageCapacity}</div>
                        </div>
                      )}
                      {school.diningCapacity && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Dining Capacity</div>
                          <div className="text-sm">{school.diningCapacity} students</div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Attendance Rate</div>
                    <div className="text-2xl font-bold">
                      {school.attendanceRate ? `${school.attendanceRate.toFixed(1)}%` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Satisfaction Score</div>
                    <div className="text-2xl font-bold">
                      {school.satisfactionScore ? `${school.satisfactionScore.toFixed(1)}/5.0` : 'N/A'}
                    </div>
                  </div>
                </div>

                {(school.contractStartDate || school.contractEndDate) && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      {school.contractStartDate && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Contract Start</div>
                          <div className="text-sm">
                            {new Date(school.contractStartDate).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      )}
                      {school.contractEndDate && (
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">Contract End</div>
                          <div className="text-sm">
                            {new Date(school.contractEndDate).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {(school.notes || school.specialInstructions) && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes & Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {school.notes && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Notes</div>
                      <div className="text-sm text-muted-foreground mt-1">{school.notes}</div>
                    </div>
                  )}
                  {school.specialInstructions && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Special Instructions</div>
                      <div className="text-sm text-muted-foreground mt-1">{school.specialInstructions}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 6: History & Audit */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Record History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Created At</div>
                    <div className="text-sm">
                      {new Date(school.createdAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                    <div className="text-sm">
                      {new Date(school.updatedAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* Removed deletedAt field - not in SchoolMaster type */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Record ID</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm text-muted-foreground">{school.id}</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete <strong>{school.schoolName}</strong>. The school will be marked as deleted but can be reactivated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete School'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
