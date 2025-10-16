/**
 * @fileoverview Add Custom Allergen Dialog Component
 * @version Next.js 15.5.4 / shadcn/ui
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} shadcn/ui Component Standards
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateAllergen } from '@/features/sppg/menu/hooks/useAllergens'
import { allergenCreateSchema } from '@/features/sppg/menu/schemas/allergenSchema'
import { ALLERGEN_CATEGORY_LABELS } from '@/features/sppg/menu/types/allergen.types'

interface AddAllergenDialogProps {
  onSuccess?: () => void
}

export function AddAllergenDialog({ onSuccess }: AddAllergenDialogProps) {
  const [open, setOpen] = useState(false)
  const { mutate: createAllergen, isPending } = useCreateAllergen()

  // Explicitly type the form to avoid Zod inference issues with .default()
  type FormValues = {
    name: string
    description?: string | null | undefined
    category?: 'DAIRY' | 'EGGS' | 'NUTS' | 'SEAFOOD' | 'GRAINS' | 'SEEDS' | 'FRUITS' | 'ADDITIVES' | 'MEAT' | 'OTHER' | null | undefined
    localName?: string | null | undefined
    isCommon?: boolean | undefined
    isActive?: boolean | undefined
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(allergenCreateSchema),
    defaultValues: {
      name: '',
      description: null,
      category: null,
      localName: null,
      isCommon: false,
      isActive: true,
    },
  })

  const onSubmit = (data: FormValues) => {
    // Ensure isCommon and isActive have default values
    const allergenData = {
      name: data.name,
      description: data.description,
      category: data.category,
      localName: data.localName,
      isCommon: data.isCommon ?? false,
      isActive: data.isActive ?? true,
    }
    
    createAllergen(allergenData, {
      onSuccess: () => {
        form.reset()
        setOpen(false)
        onSuccess?.()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Alergen Kustom
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Alergen Kustom</DialogTitle>
          <DialogDescription>
            Buat alergen khusus untuk SPPG Anda yang tidak tersedia di daftar platform.
            Alergen ini hanya akan terlihat oleh SPPG Anda.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nama Alergen */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nama Alergen <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="contoh: Durian Montong"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Nama alergen yang mudah dikenali (min. 2 karakter)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kategori */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori alergen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ALLERGEN_CATEGORY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Kategori membantu mengelompokkan alergen
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nama Lokal */}
            <FormField
              control={form.control}
              name="localName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lokal/Daerah</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="contoh: Duren, Dorian"
                      {...field}
                      value={field.value || ''}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Nama lokal atau nama lain yang dikenal di daerah Anda
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deskripsi */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Jelaskan detail alergen ini, termasuk produk turunannya jika ada..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Deskripsi lengkap tentang alergen dan produk turunannya
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Alergen
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
