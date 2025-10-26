/**
 * @fileoverview SPPG Users List Page
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { Metadata } from 'next'
import { UserList } from '@/features/sppg/user/components'

export const metadata: Metadata = {
  title: 'Manajemen User | Bagizi-ID',
  description: 'Kelola user SPPG: tambah, edit, hapus, dan reset password',
}

export default function UsersPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen User</h1>
        <p className="text-muted-foreground mt-2">
          Kelola user dan hak akses di SPPG Anda
        </p>
      </div>

      {/* User List Component */}
      <UserList />
    </div>
  )
}
