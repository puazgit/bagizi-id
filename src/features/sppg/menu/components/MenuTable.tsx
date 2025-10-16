/**
 * @fileoverview MenuTable component - Simple table for menu management
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 * @author Bagizi-ID Development Team
 * @see {@link /docs/domain-menu-workflow.md} Menu Domain Documentation
 */

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2,
  AlertCircle,
  Users,
  DollarSign,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDeleteMenu } from '../hooks'
import type { Menu } from '../types'
import type { MealType } from '@prisma/client'

// ================================ COMPONENT INTERFACES ================================

interface MenuTableProps {
  data: Menu[]
  onEdit?: (menu: Menu) => void
  onView?: (menu: Menu) => void
  isLoading?: boolean
  className?: string
}

// ================================ UTILITY FUNCTIONS ================================

const getMealTypeColor = (mealType: MealType) => {
  switch (mealType) {
    case 'SARAPAN':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    case 'MAKAN_SIANG':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    case 'MAKAN_MALAM':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    case 'SNACK_PAGI':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'SNACK_SORE':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }
}

const getMealTypeLabel = (mealType: MealType) => {
  switch (mealType) {
    case 'SARAPAN':
      return 'Sarapan'
    case 'MAKAN_SIANG':
      return 'Makan Siang'
    case 'MAKAN_MALAM':
      return 'Makan Malam'
    case 'SNACK_PAGI':
      return 'Snack Pagi'
    case 'SNACK_SORE':
      return 'Snack Sore'
    default:
      return mealType
  }
}

// ================================ MAIN COMPONENT ================================

export function MenuTable({
  data,
  onEdit,
  onView,
  isLoading = false,
  className
}: MenuTableProps) {
  const { mutate: deleteMenu, isPending: isDeleting } = useDeleteMenu()

  const handleDelete = (menu: Menu) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus menu "${menu.menuName}"?`
    )
    
    if (confirmed) {
      deleteMenu(menu.id)
    }
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Belum ada menu</h3>
          <p className="mt-2 text-muted-foreground">
            Mulai dengan membuat menu pertama untuk program gizi Anda
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Menu</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Users className="h-4 w-4" />
                Porsi
              </div>
            </TableHead>
            <TableHead className="text-right">
              <div className="flex items-center justify-end gap-1">
                <DollarSign className="h-4 w-4" />
                Biaya
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                Waktu
              </div>
            </TableHead>
            <TableHead className="text-center">AKG</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((menu) => (
            <TableRow key={menu.id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium text-foreground">{menu.menuName}</div>
                  <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                    {menu.menuCode}
                  </code>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge 
                  variant="secondary"
                  className={cn("text-xs", getMealTypeColor(menu.mealType))}
                >
                  {getMealTypeLabel(menu.mealType)}
                </Badge>
              </TableCell>
              
              <TableCell className="text-center font-medium">
                {menu.servingSize}g
              </TableCell>
              
              <TableCell className="text-right font-medium">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  notation: 'compact',
                  maximumFractionDigits: 0
                }).format(menu.costPerServing)}
              </TableCell>
              
              <TableCell className="text-center">
                {menu.cookingTime ? `${menu.cookingTime}m` : '-'}
              </TableCell>
              
              <TableCell className="text-center">
                {menu.nutritionStandardCompliance ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 mx-auto" />
                )}
              </TableCell>
              
              <TableCell>
                <Badge variant={menu.isActive ? 'default' : 'secondary'}>
                  {menu.isActive ? 'Aktif' : 'Non-aktif'}
                </Badge>
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onView?.(menu)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Lihat Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(menu)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Menu
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(menu)}
                      disabled={isDeleting}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? 'Menghapus...' : 'Hapus Menu'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ================================ EXPORT ================================

export default MenuTable