/**
 * SPPG Budget Tab Component
 * Displays budget information and allocation breakdown
 * 
 * @component
 * @example
 * <SppgBudgetTab sppg={sppg} />
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DollarSign, Calendar, Settings, AlertTriangle } from 'lucide-react'
import type { SppgDetail } from '@/features/admin/sppg-management/types'

interface SppgBudgetTabProps {
  sppg: SppgDetail
}

interface BudgetAllocation {
  bahan_baku?: number
  operasional?: number
  sdm?: number
  transportasi?: number
  lainnya?: number
}

export function SppgBudgetTab({ sppg }: SppgBudgetTabProps) {
  // Format currency
  const formatCurrency = (amount?: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: sppg.budgetCurrency || 'IDR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Format date
  const formatDate = (date?: Date | string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Parse budget allocation JSON
  const parseBudgetAllocation = (): BudgetAllocation | null => {
    if (!sppg.budgetAllocation) return null
    
    try {
      // Handle if it's already an object
      if (typeof sppg.budgetAllocation === 'object') {
        return sppg.budgetAllocation as BudgetAllocation
      }
      
      // Handle if it's a string
      if (typeof sppg.budgetAllocation === 'string') {
        return JSON.parse(sppg.budgetAllocation) as BudgetAllocation
      }
      
      return null
    } catch (error) {
      console.error('Failed to parse budget allocation:', error)
      return null
    }
  }

  const budgetAllocation = parseBudgetAllocation()

  // Allocation items with labels
  const allocationItems = [
    { key: 'bahan_baku', label: 'Bahan Baku', color: 'bg-blue-500' },
    { key: 'operasional', label: 'Operasional', color: 'bg-green-500' },
    { key: 'sdm', label: 'SDM', color: 'bg-purple-500' },
    { key: 'transportasi', label: 'Transportasi', color: 'bg-orange-500' },
    { key: 'lainnya', label: 'Lainnya', color: 'bg-gray-500' },
  ]

  return (
    <div className="grid gap-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Bulanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(sppg.monthlyBudget)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Tahunan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(sppg.yearlyBudget)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Periode Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Tanggal Mulai</div>
            <div className="font-medium">{formatDate(sppg.budgetStartDate)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Tanggal Berakhir</div>
            <div className="font-medium">{formatDate(sppg.budgetEndDate)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Mata Uang</div>
            <div className="font-medium">{sppg.budgetCurrency || 'IDR'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Allocation */}
      {budgetAllocation && (
        <Card>
          <CardHeader>
            <CardTitle>Alokasi Budget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {allocationItems.map(({ key, label, color }) => {
              const percentage = budgetAllocation[key as keyof BudgetAllocation] || 0
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="font-medium">{label}</span>
                    </div>
                    <span className="text-lg font-semibold">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}

            {/* Total Check */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Alokasi</span>
                <span className={`font-semibold ${
                  Object.values(budgetAllocation).reduce((sum, val) => sum + (val || 0), 0) === 100
                    ? 'text-green-600'
                    : 'text-orange-600'
                }`}>
                  {Object.values(budgetAllocation).reduce((sum, val) => sum + (val || 0), 0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Pengaturan Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">Auto Reset Budget</div>
              <div className="text-sm text-muted-foreground">
                Reset budget otomatis setiap periode
              </div>
            </div>
            <Badge variant={sppg.budgetAutoReset ? 'default' : 'secondary'}>
              {sppg.budgetAutoReset ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>

          {sppg.budgetAlertThreshold !== null && (
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="font-medium">Batas Peringatan Budget</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={sppg.budgetAlertThreshold} className="flex-1" />
                <span className="text-lg font-semibold min-w-[60px] text-right">
                  {sppg.budgetAlertThreshold}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sistem akan memberikan peringatan saat penggunaan budget mencapai{' '}
                {sppg.budgetAlertThreshold}% dari total budget
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
