/**
 * @fileoverview MenuCard component - displays menu summary with actions
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/domain-menu-workflow.md} Menu Domain Documentation
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  Users, 
  DollarSign,
  ChefHat,
  AlertCircle,
  CheckCircle2,
  Calculator
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDeleteMenu } from '../hooks'
import type { Menu } from '../types'
import { toast } from 'sonner'

// ================================ COMPONENT INTERFACES ================================

interface MenuCardProps {
  menu: Menu
  variant?: 'default' | 'compact' | 'detailed'
  showActions?: boolean
  onEdit?: (menu: Menu) => void
  onView?: (menu: Menu) => void
  className?: string
}

interface MenuStatsProps {
  menu: Menu
  variant: 'default' | 'compact' | 'detailed'
}

// ================================ MENU STATS SUBCOMPONENT ================================

function MenuStats({ menu, variant }: MenuStatsProps) {
  const isCompact = variant === 'compact'
  const isDetailed = variant === 'detailed'

  if (isCompact) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {menu.servingSize}g
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            notation: 'compact'
          }).format(menu.costPerServing)}
        </span>
      </div>
    )
  }

  // Get nutrition data from calculation or direct values
  const calories = menu.nutritionCalc?.totalCalories || menu.calories || 0
  const protein = menu.nutritionCalc?.totalProtein || menu.protein || 0
  const carbs = menu.nutritionCalc?.totalCarbs || menu.carbohydrates || 0
  const cost = menu.costCalc?.costPerPortion || menu.costPerServing || 0

  // DEBUG: Always log for Susu Kedelai Cokelat
  console.log('🔍 MenuCard Render:', menu.menuName, {
    id: menu.id,
    costPerServing: menu.costPerServing,
    hasCostCalc: !!menu.costCalc,
    costCalcValue: menu.costCalc?.costPerPortion,
    finalCostUsed: cost
  })

  return (
    <div className={cn(
      "grid gap-3",
      isDetailed ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 md:grid-cols-4"
    )}>
      {/* Serving Size */}
      <div className="flex flex-col items-center space-y-1 rounded-lg bg-muted/50 p-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Porsi</span>
        <span className="text-sm font-semibold">{menu.servingSize}g</span>
      </div>

      {/* Calories */}
      <div className="flex flex-col items-center space-y-1 rounded-lg bg-muted/50 p-2">
        <ChefHat className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Kalori</span>
        <span className="text-sm font-semibold">
          {calories > 0 ? `${calories} kal` : '-'}
        </span>
      </div>

      {/* Protein */}
      <div className="flex flex-col items-center space-y-1 rounded-lg bg-muted/50 p-2">
        <Calculator className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Protein</span>
        <span className="text-sm font-semibold">
          {protein > 0 ? `${protein}g` : '-'}
        </span>
      </div>

      {/* Cost per Serving */}
      <div className="flex flex-col items-center space-y-1 rounded-lg bg-muted/50 p-2">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Biaya</span>
        <span className="text-sm font-semibold">
          {cost > 0 ? new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            notation: 'compact'
          }).format(cost) : '-'}
        </span>
      </div>

      {/* Detailed view additional stats */}
      {isDetailed && (
        <>
          {/* Carbs */}
          <div className="flex flex-col items-center space-y-1 rounded-lg bg-muted/50 p-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Karbohidrat</span>
            <span className="text-sm font-semibold">
              {carbs > 0 ? `${carbs}g` : '-'}
            </span>
          </div>

          {/* Cooking Time */}
          <div className="flex flex-col items-center space-y-1 rounded-lg bg-muted/50 p-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Waktu</span>
            <span className="text-sm font-semibold">
              {menu.cookingTime ? `${menu.cookingTime}m` : '-'}
            </span>
          </div>

          {/* AKG Status */}
          <div className="flex flex-col items-center space-y-1 rounded-lg bg-muted/50 p-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Status AKG</span>
            <div className="flex items-center gap-1">
              {menu.nutritionStandardCompliance ? (
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              ) : (
                <AlertCircle className="h-3 w-3 text-amber-500" />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ================================ MAIN COMPONENT ================================

export function MenuCard({
  menu,
  variant = 'default',
  showActions = true,
  onEdit,
  onView,
  className
}: MenuCardProps) {
  const { mutate: deleteMenu, isPending: isDeleting } = useDeleteMenu()

  // ================================ EVENT HANDLERS ================================

  const handleEdit = () => {
    if (onEdit) {
      onEdit(menu)
    }
  }

  const handleView = () => {
    if (onView) {
      onView(menu)
    }
  }

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus menu "${menu.menuName}"?\n\nTindakan ini tidak dapat dibatalkan.`
    )
    
    if (confirmed) {
      deleteMenu(menu.id, {
        onError: (error) => {
          toast.error(error.message)
        }
      })
    }
  }

  // ================================ HELPER FUNCTIONS ================================

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'BREAKFAST':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'LUNCH':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'DINNER':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'SNACK':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getMealTypeLabel = (mealType: string) => {
    switch (mealType) {
      case 'BREAKFAST':
        return 'Sarapan'
      case 'LUNCH':
        return 'Makan Siang'
      case 'DINNER':
        return 'Makan Malam'
      case 'SNACK':
        return 'Makanan Tambahan'
      default:
        return mealType
    }
  }

  // ================================ RENDER ================================

  return (
    <Card 
      className={cn(
        "group transition-all duration-200 hover:shadow-lg dark:hover:shadow-primary/5",
        !menu.isActive && "opacity-60",
        variant === 'compact' && "p-3",
        className
      )}
    >
      {/* Header */}
      <CardHeader className={cn(
        "pb-3",
        variant === 'compact' && "pb-2 pt-0"
      )}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Menu Avatar */}
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                <ChefHat className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>

            {/* Menu Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={cn(
                  "font-semibold text-foreground truncate",
                  variant === 'compact' ? "text-sm" : "text-base"
                )}>
                  {menu.menuName}
                </h3>
                {!menu.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Non-aktif
                  </Badge>
                )}
              </div>

              {/* Menu Code & Meal Type */}
              <div className="flex items-center gap-2 mb-2">
                <code className="px-2 py-0.5 text-xs bg-muted rounded font-mono">
                  {menu.menuCode}
                </code>
                <Badge 
                  variant="secondary"
                  className={cn("text-xs", getMealTypeColor(menu.mealType))}
                >
                  {getMealTypeLabel(menu.mealType)}
                </Badge>
              </div>

              {/* Description */}
              {variant !== 'compact' && menu.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {menu.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Menu
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Menghapus...' : 'Hapus Menu'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      {/* Content - Menu Stats */}
      {variant !== 'compact' && (
        <CardContent className="pb-3">
          <MenuStats menu={menu} variant={variant} />
          
          {/* Nutrition Compliance */}
          {variant === 'detailed' && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Kepatuhan AKG
                </span>
                <div className="flex items-center gap-2">
                  {menu.nutritionStandardCompliance ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Memenuhi
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        Perlu Review
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}

      {/* Footer */}
      <CardFooter className={cn(
        "pt-0 gap-2",
        variant === 'compact' && "pt-2"
      )}>
        {variant === 'compact' ? (
          <MenuStats menu={menu} variant="compact" />
        ) : (
          <>
            <Button asChild className="flex-1">
              <Link href={`/menu/${menu.id}`}>
                Lihat Detail
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/menu/${menu.id}/edit`}>
                Edit
              </Link>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

// ================================ EXPORT ================================

export default MenuCard