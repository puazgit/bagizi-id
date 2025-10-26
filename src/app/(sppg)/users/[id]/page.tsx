/**
 * @fileoverview User Detail Page - View detailed user profile
 * Renders UserDetail component with tabs for profile, security, activity, permissions
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import { Metadata } from 'next'
import { UserDetail } from '@/features/sppg/user/components'

export const metadata: Metadata = {
  title: 'Detail User | Bagizi-ID',
  description: 'Informasi lengkap user SPPG',
}

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params

  return (
    <div className="container mx-auto py-6">
      <UserDetail userId={id} />
    </div>
  )
}
