/**
 * @fileoverview New User Page - Create new SPPG user
 * Renders UserForm component in create mode
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Metadata } from 'next'
import { UserForm } from '@/features/sppg/user/components'

export const metadata: Metadata = {
  title: 'Tambah User Baru | Bagizi-ID',
  description: 'Buat akun user baru untuk SPPG',
}

export default function NewUserPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tambah User Baru</h1>
        <p className="text-muted-foreground">
          Buat akun user baru untuk SPPG Anda. Semua field wajib diisi kecuali yang ditandai opsional.
        </p>
      </div>

      {/* User Form in Create Mode */}
      <UserForm mode="create" />
    </div>
  )
}
