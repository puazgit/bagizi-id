/**
 * @fileoverview Cascade Select Component for Regional Data
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 * 
 * Hierarchical selector: Province → Regency → District → Village
 * Auto-resets child selects when parent changes
 */

'use client'

import { useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useProvinceOptions,
  useRegenciesByProvince,
  useDistrictsByRegency,
  useVillagesByDistrict,
} from '../hooks'

/**
 * Cascade value structure
 */
export interface CascadeValue {
  provinceId?: string
  regencyId?: string
  districtId?: string
  villageId?: string
}

/**
 * Component props
 */
interface CascadeSelectProps {
  /**
   * Current cascade value
   */
  value: CascadeValue
  
  /**
   * Callback when value changes
   */
  onChange: (value: CascadeValue) => void
  
  /**
   * Maximum level to show
   * @default 'village'
   */
  maxLevel?: 'province' | 'regency' | 'district' | 'village'
  
  /**
   * Whether to show labels
   * @default true
   */
  showLabels?: boolean
  
  /**
   * Whether to show clear buttons
   * @default true
   */
  showClear?: boolean
  
  /**
   * Whether to show counts in options
   * @default true
   */
  showCounts?: boolean
  
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean
  
  /**
   * Layout direction
   * @default 'vertical'
   */
  layout?: 'vertical' | 'horizontal'
  
  /**
   * Custom class name
   */
  className?: string
  
  /**
   * Required fields
   */
  required?: {
    province?: boolean
    regency?: boolean
    district?: boolean
    village?: boolean
  }
  
  /**
   * Error messages
   */
  errors?: {
    province?: string
    regency?: string
    district?: string
    village?: string
  }
}

/**
 * Cascade Select Component
 * 
 * Hierarchical regional selector with auto-reset on parent change
 * 
 * @example
 * ```tsx
 * const [location, setLocation] = useState<CascadeValue>({})
 * 
 * <CascadeSelect
 *   value={location}
 *   onChange={setLocation}
 *   maxLevel="district"
 *   showLabels
 *   showClear
 * />
 * ```
 */
export function CascadeSelect({
  value,
  onChange,
  maxLevel = 'village',
  showLabels = true,
  showClear = true,
  showCounts = true,
  disabled = false,
  layout = 'vertical',
  className,
  required,
  errors,
}: CascadeSelectProps) {
  // Debug logging
  console.log('[CascadeSelect] Render - value:', value, 'maxLevel:', maxLevel)
  
  // Fetch province options
  const { data: provinces, isLoading: provincesLoading } = useProvinceOptions()
  
  console.log('[CascadeSelect] Provinces:', provinces, 'loading:', provincesLoading)
  
  // Fetch regency options (only when province selected)
  const { 
    data: regencies, 
    isLoading: regenciesLoading 
  } = useRegenciesByProvince(value.provinceId || '', !!value.provinceId)
  
  console.log('[CascadeSelect] Regencies:', regencies, 'loading:', regenciesLoading, 'provinceId:', value.provinceId)
  
  // Fetch district options (only when regency selected)
  const { 
    data: districts, 
    isLoading: districtsLoading 
  } = useDistrictsByRegency(value.regencyId || '', !!value.regencyId)
  
  console.log('[CascadeSelect] Districts:', districts, 'loading:', districtsLoading, 'regencyId:', value.regencyId)
  
  // Fetch village options (only when district selected)
  const { 
    data: villages, 
    isLoading: villagesLoading 
  } = useVillagesByDistrict(value.districtId || '', !!value.districtId)

  console.log('[CascadeSelect] Villages:', villages, 'loading:', villagesLoading, 'districtId:', value.districtId)

  // Auto-reset child selects when parent changes
  useEffect(() => {
    if (!value.provinceId && (value.regencyId || value.districtId || value.villageId)) {
      onChange({})
    }
  }, [value.provinceId, value.regencyId, value.districtId, value.villageId, onChange])

  // Determine which levels to show
  const showProvince = true
  const showRegency = maxLevel === 'regency' || maxLevel === 'district' || maxLevel === 'village'
  const showDistrict = maxLevel === 'district' || maxLevel === 'village'
  const showVillage = maxLevel === 'village'

  // Handle province change
  const handleProvinceChange = (provinceId: string) => {
    onChange({
      provinceId,
      regencyId: undefined,
      districtId: undefined,
      villageId: undefined,
    })
  }

  // Handle regency change
  const handleRegencyChange = (regencyId: string) => {
    onChange({
      ...value,
      regencyId,
      districtId: undefined,
      villageId: undefined,
    })
  }

  // Handle district change
  const handleDistrictChange = (districtId: string) => {
    onChange({
      ...value,
      districtId,
      villageId: undefined,
    })
  }

  // Handle village change
  const handleVillageChange = (villageId: string) => {
    onChange({
      ...value,
      villageId,
    })
  }

  // Clear province (clears all)
  const handleClearProvince = () => {
    onChange({})
  }

  // Clear regency (keeps province)
  const handleClearRegency = () => {
    onChange({
      provinceId: value.provinceId,
      regencyId: undefined,
      districtId: undefined,
      villageId: undefined,
    })
  }

  // Clear district (keeps province + regency)
  const handleClearDistrict = () => {
    onChange({
      provinceId: value.provinceId,
      regencyId: value.regencyId,
      districtId: undefined,
      villageId: undefined,
    })
  }

  // Clear village (keeps province + regency + district)
  const handleClearVillage = () => {
    onChange({
      provinceId: value.provinceId,
      regencyId: value.regencyId,
      districtId: value.districtId,
      villageId: undefined,
    })
  }

  // Format option label with count
  const formatOptionLabel = (label: string, count?: number) => {
    if (!showCounts || count === undefined) return label
    return `${label} (${count})`
  }

  // Container class based on layout
  const containerClass = cn(
    layout === 'horizontal' 
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'
      : 'space-y-4',
    className
  )

  return (
    <div className={containerClass}>
      {/* Province Select */}
      {showProvince && (
        <div className="space-y-2">
          {showLabels && (
            <Label htmlFor="province-select" className="flex items-center gap-1">
              Provinsi
              {required?.province && <span className="text-destructive">*</span>}
            </Label>
          )}
          
          <div className="flex gap-2">
            <div className="flex-1">
              {provincesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={value.provinceId || ''}
                  onValueChange={handleProvinceChange}
                  disabled={disabled}
                >
                  <SelectTrigger 
                    id="province-select"
                    className={cn('w-full', errors?.province && 'border-destructive')}
                  >
                    <SelectValue placeholder="Pilih Provinsi" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces?.map((province) => (
                      <SelectItem key={province.value} value={province.value}>
                        {formatOptionLabel(province.label, province.count)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {showClear && value.provinceId && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearProvince}
                disabled={disabled}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear province</span>
              </Button>
            )}
          </div>
          
          {errors?.province && (
            <p className="text-sm text-destructive">{errors.province}</p>
          )}
        </div>
      )}

      {/* Regency Select */}
      {showRegency && (
        <div className="space-y-2">
          {showLabels && (
            <Label htmlFor="regency-select" className="flex items-center gap-1">
              Kabupaten/Kota
              {required?.regency && <span className="text-destructive">*</span>}
            </Label>
          )}
          
          <div className="flex gap-2">
            <div className="flex-1">
              {regenciesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={value.regencyId || ''}
                  onValueChange={handleRegencyChange}
                  disabled={disabled || !value.provinceId}
                >
                  <SelectTrigger 
                    id="regency-select"
                    className={cn('w-full', errors?.regency && 'border-destructive')}
                  >
                    <SelectValue 
                      placeholder={
                        value.provinceId 
                          ? 'Pilih Kabupaten/Kota' 
                          : 'Pilih Provinsi terlebih dahulu'
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {regencies?.map((regency) => (
                      <SelectItem key={regency.value} value={regency.value}>
                        {formatOptionLabel(regency.label, regency.count)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {showClear && value.regencyId && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearRegency}
                disabled={disabled}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear regency</span>
              </Button>
            )}
          </div>
          
          {errors?.regency && (
            <p className="text-sm text-destructive">{errors.regency}</p>
          )}
        </div>
      )}

      {/* District Select */}
      {showDistrict && (
        <div className="space-y-2">
          {showLabels && (
            <Label htmlFor="district-select" className="flex items-center gap-1">
              Kecamatan
              {required?.district && <span className="text-destructive">*</span>}
            </Label>
          )}
          
          <div className="flex gap-2">
            <div className="flex-1">
              {districtsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={value.districtId || ''}
                  onValueChange={handleDistrictChange}
                  disabled={disabled || !value.regencyId}
                >
                  <SelectTrigger 
                    id="district-select"
                    className={cn('w-full', errors?.district && 'border-destructive')}
                  >
                    <SelectValue 
                      placeholder={
                        value.regencyId 
                          ? 'Pilih Kecamatan' 
                          : 'Pilih Kabupaten/Kota terlebih dahulu'
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {districts?.map((district) => (
                      <SelectItem key={district.value} value={district.value}>
                        {formatOptionLabel(district.label, district.count)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {showClear && value.districtId && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearDistrict}
                disabled={disabled}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear district</span>
              </Button>
            )}
          </div>
          
          {errors?.district && (
            <p className="text-sm text-destructive">{errors.district}</p>
          )}
        </div>
      )}

      {/* Village Select */}
      {showVillage && (
        <div className="space-y-2">
          {showLabels && (
            <Label htmlFor="village-select" className="flex items-center gap-1">
              Desa/Kelurahan
              {required?.village && <span className="text-destructive">*</span>}
            </Label>
          )}
          
          <div className="flex gap-2">
            <div className="flex-1">
              {villagesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={value.villageId || ''}
                  onValueChange={handleVillageChange}
                  disabled={disabled || !value.districtId}
                >
                  <SelectTrigger 
                    id="village-select"
                    className={cn('w-full', errors?.village && 'border-destructive')}
                  >
                    <SelectValue 
                      placeholder={
                        value.districtId 
                          ? 'Pilih Desa/Kelurahan' 
                          : 'Pilih Kecamatan terlebih dahulu'
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {villages?.map((village) => (
                      <SelectItem key={village.value} value={village.value}>
                        {village.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {showClear && value.villageId && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearVillage}
                disabled={disabled}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear village</span>
              </Button>
            )}
          </div>
          
          {errors?.village && (
            <p className="text-sm text-destructive">{errors.village}</p>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Compact version without labels (for filters)
 */
export function CascadeSelectCompact(props: Omit<CascadeSelectProps, 'showLabels'>) {
  return <CascadeSelect {...props} showLabels={false} />
}

/**
 * Horizontal layout version (for forms)
 */
export function CascadeSelectHorizontal(props: Omit<CascadeSelectProps, 'layout'>) {
  return <CascadeSelect {...props} layout="horizontal" />
}
