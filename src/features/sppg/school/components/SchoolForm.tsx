/**
 * @fileoverview School Form Component
 * @version Next.js 15.5.4 / shadcn/ui / React Hook Form
 * @author Bagizi-ID Development Team
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { schoolMasterSchema, type SchoolMasterInput } from '@/features/sppg/school/schemas'
import { SCHOOL_TYPES } from '@/features/sppg/school/types'
import { School, Users, MapPin, Truck, Utensils, Calendar } from 'lucide-react'

interface SchoolFormProps {
  defaultValues?: Partial<SchoolMasterInput>
  onSubmit: (data: SchoolMasterInput) => Promise<void>
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

/**
 * School Form Component
 * 
 * Multi-section form for creating/editing school data
 * 
 * Sections:
 * 1. Basic Information
 * 2. Contact Details
 * 3. Location
 * 4. Student Information
 * 5. Feeding Schedule
 * 6. Delivery Information
 * 7. Facilities
 * 8. Special Requirements
 * 
 * @example
 * ```tsx
 * <SchoolForm
 *   defaultValues={schoolData}
 *   onSubmit={handleSubmit}
 *   isSubmitting={isLoading}
 *   mode="edit"
 * />
 * ```
 */
export function SchoolForm({ 
  defaultValues, 
  onSubmit, 
  isSubmitting = false,
  mode = 'create'
}: SchoolFormProps) {
  const [activeSection, setActiveSection] = useState(0)

  const form = useForm<SchoolMasterInput>({
    resolver: zodResolver(schoolMasterSchema),
    defaultValues: {
      programId: defaultValues?.programId || '',
      schoolName: defaultValues?.schoolName || '',
      schoolCode: defaultValues?.schoolCode || null,
      schoolType: defaultValues?.schoolType || 'SD',
      schoolStatus: defaultValues?.schoolStatus || 'ACTIVE',
      principalName: defaultValues?.principalName || '',
      contactPhone: defaultValues?.contactPhone || '',
      contactEmail: defaultValues?.contactEmail || null,
      schoolAddress: defaultValues?.schoolAddress || '',
      villageId: defaultValues?.villageId || '',
      postalCode: defaultValues?.postalCode || null,
      coordinates: defaultValues?.coordinates || null,
      totalStudents: defaultValues?.totalStudents ?? 0,
      targetStudents: defaultValues?.targetStudents ?? 0,
      activeStudents: defaultValues?.activeStudents ?? 0,
      students4to6Years: defaultValues?.students4to6Years ?? 0,
      students7to12Years: defaultValues?.students7to12Years ?? 0,
      students13to15Years: defaultValues?.students13to15Years ?? 0,
      students16to18Years: defaultValues?.students16to18Years ?? 0,
      feedingDays: defaultValues?.feedingDays ?? [1, 2, 3, 4, 5],
      mealsPerDay: defaultValues?.mealsPerDay ?? 1,
      feedingTime: defaultValues?.feedingTime || null,
      deliveryAddress: defaultValues?.deliveryAddress || '',
      deliveryContact: defaultValues?.deliveryContact || '',
      deliveryInstructions: defaultValues?.deliveryInstructions || null,
      storageCapacity: defaultValues?.storageCapacity || null,
      servingMethod: defaultValues?.servingMethod || 'CAFETERIA',
      hasKitchen: defaultValues?.hasKitchen ?? false,
      hasStorage: defaultValues?.hasStorage ?? false,
      hasCleanWater: defaultValues?.hasCleanWater ?? true,
      hasElectricity: defaultValues?.hasElectricity ?? true,
      isActive: defaultValues?.isActive ?? true,
      suspendedAt: defaultValues?.suspendedAt || null,
      suspensionReason: defaultValues?.suspensionReason || null,
      beneficiaryType: defaultValues?.beneficiaryType || 'CHILD',
      specialDietary: defaultValues?.specialDietary ?? [],
      allergyAlerts: defaultValues?.allergyAlerts ?? [],
      culturalReqs: defaultValues?.culturalReqs ?? [],
    }
  })

  const sections = [
    { id: 0, title: 'Informasi Dasar', icon: School },
    { id: 1, title: 'Lokasi & Kontak', icon: MapPin },
    { id: 2, title: 'Data Siswa', icon: Users },
    { id: 3, title: 'Jadwal Makan', icon: Calendar },
    { id: 4, title: 'Pengiriman', icon: Truck },
    { id: 5, title: 'Fasilitas', icon: Utensils },
  ]

  const handleSubmit = async (data: SchoolMasterInput) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Section Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <Button
                    key={section.id}
                    type="button"
                    variant={activeSection === section.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveSection(section.id)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {section.title}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Section 0: Basic Information */}
        {activeSection === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                Informasi Dasar
              </CardTitle>
              <CardDescription>
                Data dasar sekolah dan informasi identitas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* School Name */}
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nama Sekolah *</FormLabel>
                      <FormControl>
                        <Input placeholder="SD Negeri 1 Jakarta" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* School Code */}
                <FormField
                  control={form.control}
                  name="schoolCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Sekolah</FormLabel>
                      <FormControl>
                        <Input placeholder="SDN001JKT" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        Kode unik sekolah (NPSN atau kode internal)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* School Type */}
                <FormField
                  control={form.control}
                  name="schoolType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Sekolah *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis sekolah" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SCHOOL_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Principal Name */}
                <FormField
                  control={form.control}
                  name="principalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kepala Sekolah *</FormLabel>
                      <FormControl>
                        <Input placeholder="Budi Santoso, S.Pd" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="schoolStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Sekolah *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Aktif</SelectItem>
                          <SelectItem value="SUSPENDED">Ditangguhkan</SelectItem>
                          <SelectItem value="CLOSED">Ditutup</SelectItem>
                          <SelectItem value="PLANNING">Perencanaan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 1: Location & Contact */}
        {activeSection === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Lokasi & Kontak
              </CardTitle>
              <CardDescription>
                Informasi lokasi dan cara menghubungi sekolah
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Phone */}
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon *</FormLabel>
                      <FormControl>
                        <Input placeholder="021-12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Email */}
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="sekolah@example.com" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="schoolAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Alamat Lengkap *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Jl. Sudirman No. 123, Jakarta Pusat"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Postal Code */}
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Pos</FormLabel>
                      <FormControl>
                        <Input placeholder="10110" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Coordinates */}
                <FormField
                  control={form.control}
                  name="coordinates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Koordinat GPS</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="-6.2088, 106.8456" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Format: latitude, longitude
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 2: Student Information - Continue in next message due to length */}
        {activeSection === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Data Siswa
              </CardTitle>
              <CardDescription>
                Informasi jumlah dan distribusi siswa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Students */}
                <FormField
                  control={form.control}
                  name="totalStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Siswa *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="500"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Target Students */}
                <FormField
                  control={form.control}
                  name="targetStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Penerima *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="250"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Jumlah siswa yang menerima manfaat
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Active Students */}
                <FormField
                  control={form.control}
                  name="activeStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Siswa Aktif *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="480"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-3">Distribusi Usia Siswa</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Students 4-6 years */}
                  <FormField
                    control={form.control}
                    name="students4to6Years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usia 4-6 tahun *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Students 7-12 years */}
                  <FormField
                    control={form.control}
                    name="students7to12Years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usia 7-12 tahun *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="250"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Students 13-15 years */}
                  <FormField
                    control={form.control}
                    name="students13to15Years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usia 13-15 tahun *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Students 16-18 years */}
                  <FormField
                    control={form.control}
                    name="students16to18Years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usia 16-18 tahun *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 3: Feeding Schedule */}
        {activeSection === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Jadwal Pemberian Makanan
              </CardTitle>
              <CardDescription>
                Informasi jadwal dan waktu pemberian makanan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Feeding Days */}
                <FormField
                  control={form.control}
                  name="feedingDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hari Pemberian Makanan *</FormLabel>
                      <FormDescription>
                        Pilih hari-hari pemberian makanan (1=Senin, 7=Minggu)
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="1,2,3,4,5"
                          value={field.value?.join(',') || ''}
                          onChange={(e) => {
                            const days = e.target.value
                              .split(',')
                              .map(d => Number(d.trim()))
                              .filter(d => !isNaN(d) && d >= 1 && d <= 7)
                            field.onChange(days)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Meals Per Day */}
                  <FormField
                    control={form.control}
                    name="mealsPerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah Makan per Hari *</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih jumlah" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1x sehari</SelectItem>
                            <SelectItem value="2">2x sehari</SelectItem>
                            <SelectItem value="3">3x sehari</SelectItem>
                            <SelectItem value="4">4x sehari</SelectItem>
                            <SelectItem value="5">5x sehari</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Feeding Time */}
                  <FormField
                    control={form.control}
                    name="feedingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Waktu Pemberian</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Waktu pemberian makanan (opsional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 4: Delivery Information */}
        {activeSection === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Informasi Pengiriman
              </CardTitle>
              <CardDescription>
                Detail alamat dan kontak untuk pengiriman makanan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Delivery Address */}
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Pengiriman *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Jl. Contoh No. 123, Kelurahan ABC..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Alamat lengkap untuk pengiriman makanan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Delivery Contact */}
                <FormField
                  control={form.control}
                  name="deliveryContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kontak Pengiriman *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="081234567890"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Nomor yang dapat dihubungi saat pengiriman
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Delivery Instructions */}
                <FormField
                  control={form.control}
                  name="deliveryInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instruksi Pengiriman</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contoh: Masuk dari pintu samping, parkir di area loading dock..."
                          className="min-h-[80px]"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Petunjuk khusus untuk kurir (opsional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 5: Facilities */}
        {activeSection === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Fasilitas Sekolah
              </CardTitle>
              <CardDescription>
                Informasi fasilitas pendukung pemberian makanan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Storage Capacity */}
                  <FormField
                    control={form.control}
                    name="storageCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kapasitas Penyimpanan</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Contoh: 500 porsi, 100kg, dll"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          Kapasitas penyimpanan makanan (opsional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Serving Method */}
                  <FormField
                    control={form.control}
                    name="servingMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metode Penyajian *</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih metode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CAFETERIA">Kafetaria</SelectItem>
                            <SelectItem value="CLASSROOM">Di Kelas</SelectItem>
                            <SelectItem value="TAKEAWAY">Bawa Pulang</SelectItem>
                            <SelectItem value="OTHER">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Facilities Checkboxes */}
                <div className="space-y-4">
                  <div className="text-sm font-medium">Fasilitas Tersedia</div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Has Kitchen */}
                    <FormField
                      control={form.control}
                      name="hasKitchen"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Dapur</FormLabel>
                            <FormDescription>
                              Memiliki fasilitas dapur
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Has Storage */}
                    <FormField
                      control={form.control}
                      name="hasStorage"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Penyimpanan</FormLabel>
                            <FormDescription>
                              Memiliki ruang penyimpanan
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Has Clean Water */}
                    <FormField
                      control={form.control}
                      name="hasCleanWater"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Air Bersih</FormLabel>
                            <FormDescription>
                              Akses air bersih memadai
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Has Electricity */}
                    <FormField
                      control={form.control}
                      name="hasElectricity"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Listrik</FormLabel>
                            <FormDescription>
                              Akses listrik memadai
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Form Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                * Field wajib diisi
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : mode === 'edit' ? 'Simpan Perubahan' : 'Tambah Sekolah'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
