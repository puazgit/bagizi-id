/**
 * @fileoverview Edit User Page - Update existing SPPG user
 * Renders UserForm component in edit mode with userId from params
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Metadata } from 'next'
import { UserForm } from '@/features/sppg/user/components'

export const metadata: Metadata = {
  title: 'Edit User | Bagizi-ID',
  description: 'Perbarui informasi user SPPG',
}

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="text-muted-foreground">
          Perbarui informasi user. Password tidak akan diubah kecuali diisi kolom password baru.
        </p>
      </div>

      {/* User Form in Edit Mode */}
      <UserForm mode="edit" userId={id} />
    </div>
  )
}
