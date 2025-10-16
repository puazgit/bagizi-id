/**
 * @fileoverview Recipe Step Editor Component - Drag & Drop Recipe Builder
 * @version Next.js 15.5.4 / shadcn/ui / React Hook Form + Zod
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Plus, 
  X, 
  Clock, 
  Thermometer, 
  ChefHat,
  ImageIcon,
  Trash2,
  Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { recipeStepSchema, type RecipeStepFormData } from '../schemas/recipeStepSchema'
import { 
  useRecipeSteps, 
  useCreateRecipeStep, 
  useUpdateRecipeStep,
  useDeleteRecipeStep 
} from '../hooks/useRecipeSteps'
import type { RecipeStep } from '../types/recipe.types'

interface RecipeStepEditorProps {
  menuId: string
}

export function RecipeStepEditor({ menuId }: RecipeStepEditorProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingStep, setEditingStep] = useState<RecipeStep | null>(null)

  const { data: steps = [], isLoading } = useRecipeSteps(menuId)
  const { mutate: deleteStep } = useDeleteRecipeStep(menuId)

  const handleAddNew = () => {
    setIsAdding(true)
    setEditingStep(null)
  }

  const handleEdit = (step: RecipeStep) => {
    setEditingStep(step)
    setIsAdding(false)
  }

  const handleDelete = (stepId: string, stepNumber: number) => {
    if (confirm(`Hapus langkah ${stepNumber}?`)) {
      deleteStep(stepId)
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingStep(null)
  }

  const handleSuccess = () => {
    setIsAdding(false)
    setEditingStep(null)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Langkah-Langkah Resep</h3>
          <p className="text-sm text-muted-foreground">
            {steps.length} langkah tersedia
          </p>
        </div>
        {!isAdding && !editingStep && (
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Langkah
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingStep) && (
        <RecipeStepForm
          menuId={menuId}
          step={editingStep}
          stepNumber={editingStep?.stepNumber || steps.length + 1}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}

      {/* Steps List */}
      {steps.length > 0 ? (
        <div className="space-y-3">
          {steps.map((step) => (
            <RecipeStepCard
              key={step.id}
              step={step}
              onEdit={() => handleEdit(step)}
              onDelete={() => handleDelete(step.id, step.stepNumber)}
            />
          ))}
        </div>
      ) : (
        !isAdding && (
          <Card>
            <CardContent className="py-10">
              <div className="text-center text-muted-foreground">
                <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada langkah resep. Mulai tambahkan langkah pertama!</p>
              </div>
            </CardContent>
          </Card>
        )
      )}
    </div>
  )
}

// ============ Recipe Step Card Component ============

interface RecipeStepCardProps {
  step: RecipeStep
  onEdit: () => void
  onDelete: () => void
}

function RecipeStepCard({ step, onEdit, onDelete }: RecipeStepCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Step Number */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{step.stepNumber}</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            <p className="text-sm leading-relaxed">{step.instruction}</p>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-2">
              {step.duration && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {step.duration} menit
                </Badge>
              )}
              {step.temperature && (
                <Badge variant="outline" className="gap-1">
                  <Thermometer className="h-3 w-3" />
                  {step.temperature}°{step.temperatureUnit === 'CELSIUS' ? 'C' : 'F'}
                </Badge>
              )}
              {step.equipment && step.equipment.length > 0 && (
                step.equipment.map((eq) => (
                  <Badge key={eq} variant="secondary">
                    {eq}
                  </Badge>
                ))
              )}
            </div>

            {step.qualityCheckNotes && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                <strong>Quality Check:</strong> {step.qualityCheckNotes}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============ Recipe Step Form Component ============

interface RecipeStepFormProps {
  menuId: string
  step?: RecipeStep | null
  stepNumber: number
  onSuccess?: () => void
  onCancel?: () => void
}

function RecipeStepForm({ 
  menuId, 
  step, 
  stepNumber,
  onSuccess, 
  onCancel 
}: RecipeStepFormProps) {
  const isEditing = !!step
  
  const { mutate: createStep, isPending: isCreating } = useCreateRecipeStep(menuId)
  const { mutate: updateStep, isPending: isUpdating } = useUpdateRecipeStep(menuId)
  
  const isPending = isCreating || isUpdating

  const form = useForm<RecipeStepFormData>({
    resolver: zodResolver(recipeStepSchema),
    defaultValues: {
      stepNumber: step?.stepNumber || stepNumber,
      instruction: step?.instruction || '',
      duration: step?.duration ?? undefined,
      temperature: step?.temperature ?? undefined,
      temperatureUnit: (step?.temperatureUnit as 'CELSIUS' | 'FAHRENHEIT') || 'CELSIUS',
      equipment: step?.equipment || [],
      qualityCheckNotes: step?.qualityCheckNotes ?? undefined,
      mediaUrl: step?.mediaUrl ?? undefined
    }
  })

  // Equipment input state
  const equipment = form.watch('equipment') || []

  const onSubmit = (data: RecipeStepFormData) => {
    const apiData = {
      ...data,
      duration: data.duration || undefined,
      temperature: data.temperature || undefined,
      temperatureUnit: data.temperature ? (data.temperatureUnit || undefined) : undefined,
      equipment: data.equipment || [],
      qualityCheckNotes: data.qualityCheckNotes || undefined,
      mediaUrl: data.mediaUrl || undefined
    }

    if (isEditing && step) {
      updateStep(
        { stepId: step.id, data: apiData },
        { onSuccess }
      )
    } else {
      createStep(apiData, { onSuccess })
    }
  }

  const addEquipment = () => {
    const input = document.getElementById('equipment-input') as HTMLInputElement
    const newEquipment = input?.value.trim()
    if (newEquipment && !equipment.includes(newEquipment)) {
      form.setValue('equipment', [...equipment, newEquipment])
      input.value = ''
    }
  }

  const removeEquipment = (index: number) => {
    form.setValue('equipment', equipment.filter((_, i) => i !== index))
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="text-base">
          {isEditing ? `Edit Langkah ${step.stepNumber}` : `Tambah Langkah ${stepNumber}`}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Instruction */}
            <FormField
              control={form.control}
              name="instruction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruksi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Panaskan minyak dalam wajan dengan api sedang..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration & Temperature */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durasi (menit)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="15"
                          className="pl-9"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suhu</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Thermometer className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="180"
                          className="pl-9"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperatureUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'CELSIUS'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="°C" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CELSIUS">Celsius (°C)</SelectItem>
                        <SelectItem value="FAHRENHEIT">Fahrenheit (°F)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Equipment */}
            <div className="space-y-3">
              <Label>Peralatan</Label>
              <div className="flex gap-2">
                <Input
                  id="equipment-input"
                  placeholder="Contoh: Wajan, Spatula..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addEquipment()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addEquipment}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {equipment.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {equipment.map((eq, index) => (
                    <Badge key={index} variant="secondary" className="pl-3 pr-1">
                      {eq}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 ml-1"
                        onClick={() => removeEquipment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Check Notes */}
            <FormField
              control={form.control}
              name="qualityCheckNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Quality Check</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Pastikan warna kecoklatan dan aroma harum..."
                      rows={2}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Kriteria kualitas yang harus dicapai pada langkah ini
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Media URL */}
            <FormField
              control={form.control}
              name="mediaUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Media (Opsional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        className="pl-9"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Link ke foto atau video untuk langkah ini
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Langkah'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
