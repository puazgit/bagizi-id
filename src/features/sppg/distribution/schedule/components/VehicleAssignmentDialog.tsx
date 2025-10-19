/**
 * @fileoverview VehicleAssignmentDialog Component - Modal untuk assign kendaraan ke jadwal distribusi
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @description Modal dialog dengan form untuk assign kendaraan, driver, dan helper ke schedule
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useAssignVehicle } from '../hooks'
import { assignVehicleSchema, type AssignVehicleInput } from '../schemas'
import { Truck, User, Users, Clock, FileText } from 'lucide-react'

interface VehicleAssignmentDialogProps {
  scheduleId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// Mock data - in real app, these would come from API
const mockVehicles = [
  { id: '1', licensePlate: 'B 1234 ABC', type: 'Truk Besar', capacity: 1000 },
  { id: '2', licensePlate: 'B 5678 DEF', type: 'Truk Sedang', capacity: 500 },
  { id: '3', licensePlate: 'B 9012 GHI', type: 'Mobil Box', capacity: 300 },
]

const mockDrivers = [
  { id: '1', name: 'Ahmad Supardi' },
  { id: '2', name: 'Budi Santoso' },
  { id: '3', name: 'Chandra Wijaya' },
]

const mockHelpers = [
  { id: '1', name: 'Dedi Rahman' },
  { id: '2', name: 'Eko Prasetyo' },
  { id: '3', name: 'Fajar Kurniawan' },
  { id: '4', name: 'Galih Pratama' },
]

export function VehicleAssignmentDialog({
  scheduleId,
  open,
  onOpenChange,
  onSuccess,
}: VehicleAssignmentDialogProps) {
  const [selectedHelpers, setSelectedHelpers] = useState<string[]>([])

  const { mutate: assignVehicle, isPending } = useAssignVehicle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(assignVehicleSchema) as any,
    defaultValues: {
      vehicleId: '',
      driverId: '',
      helpers: [],
      estimatedDeparture: '',
      estimatedArrival: '',
      notes: '',
    },
  })

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset()
      setSelectedHelpers([])
    }
  }, [open, form])

  const onSubmit = (data: AssignVehicleInput) => {
    assignVehicle(
      {
        id: scheduleId,
        data: {
          ...data,
          helpers: selectedHelpers,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess?.()
        },
      }
    )
  }

  const toggleHelper = (helperId: string) => {
    setSelectedHelpers((prev) =>
      prev.includes(helperId)
        ? prev.filter((id) => id !== helperId)
        : [...prev, helperId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Tugaskan Kendaraan
          </DialogTitle>
          <DialogDescription>
            Pilih kendaraan, driver, dan helper untuk jadwal distribusi ini
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Vehicle Selection */}
            <FormField
              control={form.control}
              name="vehicleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Kendaraan
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kendaraan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{vehicle.licensePlate}</span>
                            <span className="text-sm text-muted-foreground ml-4">
                              {vehicle.type} • Kapasitas: {vehicle.capacity}kg
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pilih kendaraan yang tersedia untuk distribusi
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Driver Selection */}
            <FormField
              control={form.control}
              name="driverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Pengemudi
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pengemudi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Pilih pengemudi yang akan bertugas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Helper Multi-Select */}
            <div className="space-y-2">
              <FormLabel className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Helper / Pendamping (Opsional)
              </FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {mockHelpers.map((helper) => (
                  <button
                    key={helper.id}
                    type="button"
                    onClick={() => toggleHelper(helper.id)}
                    className={`
                      flex items-center justify-between px-3 py-2 rounded-md border-2 
                      transition-colors text-sm
                      ${
                        selectedHelpers.includes(helper.id)
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:border-primary/50 hover:bg-accent'
                      }
                    `}
                  >
                    <span>{helper.name}</span>
                    {selectedHelpers.includes(helper.id) && (
                      <span className="text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Pilih helper yang akan membantu distribusi (dapat pilih lebih dari satu)
              </p>
            </div>

            {/* Time Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedDeparture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Estimasi Keberangkatan
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedArrival"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Estimasi Tiba
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Catatan (Opsional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tambahkan catatan untuk penugasan kendaraan ini..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Catatan tambahan tentang penugasan kendaraan
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Menugaskan...' : 'Tugaskan Kendaraan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
