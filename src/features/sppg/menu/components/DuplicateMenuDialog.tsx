/**
 * @fileoverview Duplicate Menu Dialog Component
 * @version Next.js 15.5.4 / shadcn/ui Dialog + Form
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Copy } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useDuplicateMenu } from '../hooks'

const duplicateMenuSchema = z.object({
  newMenuName: z.string().min(3, 'Nama menu minimal 3 karakter').max(100),
  newMenuCode: z.string().min(2, 'Kode menu minimal 2 karakter').max(20),
  copyIngredients: z.boolean(),
  copyRecipeSteps: z.boolean(),
  copyNutritionData: z.boolean(),
  copyCostData: z.boolean(),
})

type DuplicateMenuFormData = z.infer<typeof duplicateMenuSchema>

interface DuplicateMenuResponse {
  success: boolean
  message?: string
  data?: {
    id: string
    menuName: string
    menuCode: string
  }
  error?: string
}

interface DuplicateMenuDialogProps {
  menuId: string
  menuName: string
  menuCode: string
  trigger?: React.ReactNode
  onSuccess?: (newMenuId: string) => void
}

export function DuplicateMenuDialog({ 
  menuId, 
  menuName, 
  menuCode,
  trigger,
  onSuccess 
}: DuplicateMenuDialogProps) {
  const [open, setOpen] = useState(false)
  const { mutate: duplicate, isPending } = useDuplicateMenu(menuId)

  const form = useForm<DuplicateMenuFormData>({
    resolver: zodResolver(duplicateMenuSchema),
    defaultValues: {
      newMenuName: `${menuName} (Copy)`,
      newMenuCode: `${menuCode}-COPY`,
      copyIngredients: true,
      copyRecipeSteps: true,
      copyNutritionData: false,
      copyCostData: false,
    }
  })

  const onSubmit = (data: DuplicateMenuFormData) => {
    duplicate(data, {
      onSuccess: (response: DuplicateMenuResponse) => {
        setOpen(false)
        form.reset()
        if (onSuccess && response.data) {
          onSuccess(response.data.id)
        }
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Duplikasi Menu
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-primary" />
            Duplikasi Menu
          </DialogTitle>
          <DialogDescription>
            Buat salinan dari menu &quot;{menuName}&quot;
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* New Menu Info */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="newMenuName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Menu Baru</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama menu..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newMenuCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kode Menu Baru</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Masukkan kode unik..." 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      Kode harus unik dan akan diubah ke huruf kapital
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Copy Options */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Pilih Data yang Akan Disalin</Label>
              
              <FormField
                control={form.control}
                name="copyIngredients"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Bahan-Bahan (Ingredients)
                      </FormLabel>
                      <FormDescription>
                        Salin semua bahan beserta quantity dan biaya
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="copyRecipeSteps"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Langkah Resep (Recipe Steps)
                      </FormLabel>
                      <FormDescription>
                        Salin semua langkah memasak dan instruksi
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="copyNutritionData"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Data Nutrisi (Nutrition Calculation)
                      </FormLabel>
                      <FormDescription>
                        Salin hasil kalkulasi nutrisi lengkap
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="copyCostData"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Data Biaya (Cost Calculation)
                      </FormLabel>
                      <FormDescription>
                        Salin hasil kalkulasi biaya lengkap
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

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
                {isPending ? 'Menduplikasi...' : 'Duplikasi Menu'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
