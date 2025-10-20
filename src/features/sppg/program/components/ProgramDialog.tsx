/**
 * @fileoverview ProgramDialog Component - Modal wrapper untuk form
 * @version Next.js 15.5.4 / shadcn/ui Dialog
 * @author Bagizi-ID Development Team
 */

'use client'

import { type FC } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProgramForm } from './ProgramForm'
import type { Program } from '../types'
import type { CreateProgramInput } from '../schemas'

interface ProgramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialData?: Program
  onSubmit: (data: CreateProgramInput) => void | Promise<void>
  isSubmitting?: boolean
}

export const ProgramDialog: FC<ProgramDialogProps> = ({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Buat Program Baru' : 'Edit Program'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Isi form di bawah untuk membuat program gizi baru'
              : 'Edit informasi program gizi'}
          </DialogDescription>
        </DialogHeader>
        
        <ProgramForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  )
}
