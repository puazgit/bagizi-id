/**
 * @fileoverview SPPG Dashboard Layout dengan sidebar navigation dan header
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import { useState } from 'react'
import { SppgSidebar } from '@/components/shared/navigation/SppgSidebar'
import { SppgHeader } from '@/components/shared/navigation/SppgHeader'
import { cn } from '@/lib/utils'

interface SppgLayoutProps {
  children: React.ReactNode
}

export function SppgLayout({ children }: SppgLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <SppgSidebar 
          className="hidden lg:flex lg:flex-col lg:w-64"
        />

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <SppgSidebar 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <SppgHeader onMenuClick={() => setSidebarOpen(true)} />
          
          <main className={cn(
            'flex-1 overflow-y-auto',
            'bg-muted/30 dark:bg-background',
            'p-4 lg:p-6'
          )}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}