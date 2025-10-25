/**
 * Admin Layout Client Wrapper
 * Client-side wrapper to prevent hydration mismatch
 * 
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

'use client'

import { ReactNode, useEffect, useState } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/shared/navigation/AdminSidebar'
import { AdminHeader } from '@/components/shared/navigation/AdminHeader'
import { AdminBreadcrumb } from '@/components/shared/navigation/AdminBreadcrumb'

interface AdminLayoutClientProps {
  children: ReactNode
}

/**
 * Client-side layout wrapper
 * Prevents hydration mismatch by ensuring client-only rendering
 */
export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const [mounted, setMounted] = useState(false)

  // Ensure component only renders on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering interactive components until mounted
  if (!mounted) {
    return (
      <div className="flex min-h-screen w-full">
        <div className="flex flex-1 flex-col">
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
              {/* Loading skeleton or children without interactive components */}
              {children}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <AdminHeader />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <AdminBreadcrumb />
            </div>

            {/* Page Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t py-4">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
                <p>© 2025 Bagizi-ID. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <a href="/admin/help" className="hover:text-foreground transition-colors">
                    Bantuan
                  </a>
                  <a href="/admin/privacy" className="hover:text-foreground transition-colors">
                    Kebijakan Privasi
                  </a>
                  <a href="/admin/terms" className="hover:text-foreground transition-colors">
                    Syarat & Ketentuan
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  )
}
