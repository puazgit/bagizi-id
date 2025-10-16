/**
 * @fileoverview Menu Management Page - Enhanced Rich UI with Analytics
 * @version Next.js 15.5.4 / shadcn/ui / Enterprise-grade
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Grid3x3, List, SlidersHorizontal, Download, Eye, Edit, Trash2, MoreVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, TrendingUp, Award, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useMenus } from '@/features/sppg/menu/hooks'
import type { MenuFilters, Menu as BaseMenu } from '@/features/sppg/menu/types'
import type { MealType } from '@prisma/client'

// Extended Menu interface for display with nutrition data
interface MenuWithNutrition extends BaseMenu {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  nutritionCalc?: {
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
    meetsAKG: boolean
  } | null
}

function MenuListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [mealTypeFilter, setMealTypeFilter] = useState<MealType | 'ALL'>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const filters: Partial<MenuFilters> = {
    search: searchQuery || undefined,
    mealType: mealTypeFilter !== 'ALL' ? mealTypeFilter : undefined,
  }

  const { data: menuResponse, isLoading, error } = useMenus(filters)
  
  // Transform menus data to include nutrition values with proper typing
  const rawMenus = menuResponse?.menus || []
  const menus: MenuWithNutrition[] = rawMenus.map(menu => {
    const menuWithCalc = menu as BaseMenu & {
      nutritionCalc?: {
        totalCalories: number
        totalProtein: number
        totalCarbs: number
        totalFat: number
        meetsAKG: boolean
      } | null
    }
    
    return {
      ...menu,
      calories: menuWithCalc.nutritionCalc?.totalCalories || 0,
      protein: menuWithCalc.nutritionCalc?.totalProtein || 0,
      carbohydrates: menuWithCalc.nutritionCalc?.totalCarbs || 0,
      fat: menuWithCalc.nutritionCalc?.totalFat || 0,
      isVegan: false, // TODO: Add isVegan field to schema
      nutritionCalc: menuWithCalc.nutritionCalc
    }
  })
  
  const totalMenus = menuResponse?.total || 0

  // Calculate statistics
  const halalMenus = menus.filter(m => m.isHalal).length
  const vegetarianMenus = menus.filter(m => m.isVegetarian).length
  const averageCost = menus.length > 0
    ? menus.reduce((sum, m) => sum + m.costPerServing, 0) / menus.length
    : 0

  return (
    <div className="flex-1 space-y-4 md:space-y-6">
      {/* Enhanced Page Header with Stats */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Kelola Menu</h1>
            <p className="text-sm text-muted-foreground mt-1 md:mt-2">
              Kelola menu makanan untuk program gizi
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="default" className="md:size-lg">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Opsi
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button asChild size="default" className="md:size-lg">
              <Link href="/menu/create">
                <Plus className="mr-2 h-4 w-4" />
                Buat Menu Baru
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total Menu
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl font-bold">{totalMenus}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Menu aktif di sistem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Menu Halal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-baseline gap-1 md:gap-2">
                <div className="text-xl md:text-2xl font-bold">{halalMenus}</div>
                <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                  <Award className="mr-1 h-2 w-2 md:h-3 md:w-3" />
                  {totalMenus > 0 ? Math.round((halalMenus / totalMenus) * 100) : 0}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tersertifikasi halal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 md:pb-3">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Menu Vegetarian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vegetarianMenus}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pilihan nabati tersedia
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rata-rata Biaya
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(averageCost)}
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per porsi
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Enhanced Filters with Tabs */}
      <Card>
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Filter className="h-4 w-4 md:h-5 md:w-5" />
                Filter & Pencarian
              </CardTitle>
              <CardDescription className="mt-1 text-xs md:text-sm">
                Cari dan filter menu berdasarkan kriteria
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-3 md:gap-4 md:flex-row">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama menu, kode, atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Meal Type Filter */}
            <Select
              value={mealTypeFilter}
              onValueChange={(value) => setMealTypeFilter(value as MealType | 'ALL')}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Jenis Makanan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Jenis</SelectItem>
                <SelectItem value="SARAPAN">Sarapan</SelectItem>
                <SelectItem value="SNACK_PAGI">Snack Pagi</SelectItem>
                <SelectItem value="MAKAN_SIANG">Makan Siang</SelectItem>
                <SelectItem value="SNACK_SORE">Snack Sore</SelectItem>
                <SelectItem value="MAKAN_MALAM">Makan Malam</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Menu List */}
      {isLoading ? (
        <MenuListSkeleton />
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {(error as Error).message || 'Gagal memuat data menu'}
          </AlertDescription>
        </Alert>
      ) : menus.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada menu</h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchQuery || mealTypeFilter !== 'ALL'
                ? 'Tidak ada menu yang sesuai dengan filter Anda'
                : 'Mulai dengan membuat menu pertama Anda'}
            </p>
            <Button asChild>
              <Link href="/menu/create">
                <Plus className="mr-2 h-4 w-4" />
                Buat Menu Pertama
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Count & View Toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan <span className="font-semibold">{totalMenus}</span> menu
              {(searchQuery || mealTypeFilter !== 'ALL') && (
                <span> dengan filter aktif</span>
              )}
            </p>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {menus.map((menu) => (
                <Card key={menu.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg line-clamp-1">
                          {menu.menuName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">
                            {menu.menuCode}
                          </Badge>
                          <Badge variant="secondary">
                            {getMealTypeLabel(menu.mealType)}
                          </Badge>
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/menu/${menu.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Detail
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/menu/${menu.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Menu
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Nutrition Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Kalori</p>
                        <p className="text-lg font-semibold">
                          {menu.calories} <span className="text-xs font-normal">kkal</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Protein</p>
                        <p className="text-lg font-semibold">
                          {menu.protein} <span className="text-xs font-normal">g</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Karbohidrat</p>
                        <p className="text-lg font-semibold">
                          {menu.carbohydrates} <span className="text-xs font-normal">g</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Lemak</p>
                        <p className="text-lg font-semibold">
                          {menu.fat} <span className="text-xs font-normal">g</span>
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Additional Info */}
                    <div className="flex flex-wrap gap-2">
                      {menu.isHalal && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <Award className="mr-1 h-3 w-3" />
                          Halal
                        </Badge>
                      )}
                      {menu.isVegetarian && (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                          Vegetarian
                        </Badge>
                      )}
                      {menu.isVegan && (
                        <Badge variant="outline" className="text-teal-600 border-teal-600">
                          Vegan
                        </Badge>
                      )}
                    </div>

                    {/* Cost */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Biaya per porsi</span>
                      <span className="text-lg font-bold text-primary flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(menu.costPerServing)}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button asChild className="w-full">
                      <Link href={`/menu/${menu.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {menus.map((menu) => (
                    <div key={menu.id} className="p-6 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg">{menu.menuName}</h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline">{menu.menuCode}</Badge>
                                <Badge variant="secondary">
                                  {getMealTypeLabel(menu.mealType)}
                                </Badge>
                                {menu.isHalal && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    <Award className="mr-1 h-3 w-3" />
                                    Halal
                                  </Badge>
                                )}
                                {menu.isVegetarian && (
                                  <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                                    Vegetarian
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              <div className="text-lg font-bold text-primary flex items-center gap-1 justify-end">
                                <DollarSign className="h-4 w-4" />
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }).format(menu.costPerServing)}
                              </div>
                              <p className="text-xs text-muted-foreground">per porsi</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Kalori:</span>
                              <span className="font-semibold">{menu.calories} kkal</span>
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Protein:</span>
                              <span className="font-semibold">{menu.protein}g</span>
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Karbo:</span>
                              <span className="font-semibold">{menu.carbohydrates}g</span>
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Lemak:</span>
                              <span className="font-semibold">{menu.fat}g</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/menu/${menu.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Detail
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/menu/${menu.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function getMealTypeLabel(mealType: MealType): string {
  const labels: Record<MealType, string> = {
    SARAPAN: 'Sarapan',
    SNACK_PAGI: 'Snack Pagi',
    MAKAN_SIANG: 'Makan Siang',
    SNACK_SORE: 'Snack Sore',
    MAKAN_MALAM: 'Makan Malam',
  }
  return labels[mealType] || mealType
}
