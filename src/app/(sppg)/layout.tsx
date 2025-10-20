/**
 * @fileoverview SPPG Layout - Protected layout with enterprise-grade sidebar
 * @version Next.js 15.5.4 / Auth.js v5 / shadcn/ui
 * @author Bagizi-ID Development Team
 */

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { SppgSidebar } from '@/components/shared/navigation/SppgSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

interface SppgLayoutProps {
  children: React.ReactNode
}

export default async function SppgLayout({ children }: SppgLayoutProps) {
  const session = await auth()

  // Authentication check
  if (!session?.user) {
    redirect('/login')
  }

  // SPPG role check
  if (!session.user.userRole?.startsWith('SPPG_')) {
    redirect('/access-denied')
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SppgSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>SPPG</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}