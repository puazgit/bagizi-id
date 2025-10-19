'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Thermometer, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Temperature safety ranges for food distribution
 * Based on food safety standards
 */
export const TEMP_SAFETY_RANGES = {
  HOT_FOOD: {
    SAFE_MIN: 60,
    SAFE_MAX: 85,
    WARNING_MIN: 55,
    WARNING_MAX: 90,
  },
  COLD_FOOD: {
    SAFE_MIN: 0,
    SAFE_MAX: 5,
    WARNING_MIN: -2,
    WARNING_MAX: 8,
  },
  DANGER_ZONE: {
    MIN: 5,
    MAX: 60,
  },
} as const

export type FoodType = 'HOT' | 'COLD'

export interface TemperatureData {
  departureTemp?: number | null
  arrivalTemp?: number | null
  servingTemp?: number | null
}

interface TemperatureMonitoringCardProps {
  data: TemperatureData
  foodType?: FoodType
  compact?: boolean
}

function getTemperatureStatus(temp: number, foodType: FoodType) {
  const ranges = foodType === 'HOT' ? TEMP_SAFETY_RANGES.HOT_FOOD : TEMP_SAFETY_RANGES.COLD_FOOD

  if (temp >= ranges.SAFE_MIN && temp <= ranges.SAFE_MAX) {
    return {
      status: 'safe' as const,
      label: 'Aman',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800',
      icon: CheckCircle,
    }
  }

  if (
    (temp >= ranges.WARNING_MIN && temp < ranges.SAFE_MIN) ||
    (temp > ranges.SAFE_MAX && temp <= ranges.WARNING_MAX)
  ) {
    return {
      status: 'warning' as const,
      label: 'Perhatian',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      icon: AlertTriangle,
    }
  }

  return {
    status: 'danger' as const,
    label: 'Bahaya',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: AlertTriangle,
  }
}

function getTempPercentage(temp: number, foodType: FoodType) {
  if (foodType === 'HOT') {
    return Math.min(Math.max((temp / 100) * 100, 0), 100)
  } else {
    return Math.min(Math.max(((temp + 5) / 20) * 100, 0), 100)
  }
}

function TemperatureReading({
  label,
  temp,
  foodType,
}: {
  label: string
  temp?: number | null
  foodType: FoodType
}) {
  if (temp === undefined || temp === null) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="text-sm text-muted-foreground">-</span>
        </div>
        <div className="h-2 bg-muted rounded-full" />
        <p className="text-xs text-muted-foreground">Data tidak tersedia</p>
      </div>
    )
  }

  const status = getTemperatureStatus(temp, foodType)
  const percentage = getTempPercentage(temp, foodType)
  const StatusIcon = status.icon

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className={cn('text-2xl font-bold', status.color)}>
            {temp.toFixed(1)}°C
          </span>
          <StatusIcon className={cn('h-4 w-4', status.color)} />
        </div>
      </div>

      <Progress value={percentage} className={cn('h-2', status.bgColor)} />

      <div className="flex items-center justify-between">
        <Badge variant="outline" className={cn('text-xs', status.color, status.borderColor)}>
          {status.label}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Aman: {TEMP_SAFETY_RANGES[`${foodType}_FOOD`].SAFE_MIN}°C - {TEMP_SAFETY_RANGES[`${foodType}_FOOD`].SAFE_MAX}°C
        </span>
      </div>
    </div>
  )
}

export function TemperatureMonitoringCard({
  data,
  foodType = 'HOT',
  compact = false,
}: TemperatureMonitoringCardProps) {
  const { departureTemp, arrivalTemp, servingTemp } = data

  const hasDanger = [departureTemp, arrivalTemp, servingTemp]
    .filter((t): t is number => t !== undefined && t !== null)
    .some((temp) => {
      const status = getTemperatureStatus(temp, foodType)
      return status.status === 'danger'
    })

  const hasWarning = [departureTemp, arrivalTemp, servingTemp]
    .filter((t): t is number => t !== undefined && t !== null)
    .some((temp) => {
      const status = getTemperatureStatus(temp, foodType)
      return status.status === 'warning'
    })

  const tempChange =
    departureTemp && servingTemp
      ? servingTemp - departureTemp
      : arrivalTemp && servingTemp
      ? servingTemp - arrivalTemp
      : null

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Monitoring Suhu</span>
          {hasDanger && (
            <Badge variant="destructive" className="text-xs">
              Bahaya!
            </Badge>
          )}
          {!hasDanger && hasWarning && (
            <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
              Perhatian
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {departureTemp !== undefined && departureTemp !== null && (
            <div>
              <p className="text-xs text-muted-foreground">Berangkat</p>
              <p className="text-lg font-semibold">{departureTemp.toFixed(1)}°C</p>
            </div>
          )}
          {arrivalTemp !== undefined && arrivalTemp !== null && (
            <div>
              <p className="text-xs text-muted-foreground">Tiba</p>
              <p className="text-lg font-semibold">{arrivalTemp.toFixed(1)}°C</p>
            </div>
          )}
          {servingTemp !== undefined && servingTemp !== null && (
            <div>
              <p className="text-xs text-muted-foreground">Sajian</p>
              <p className="text-lg font-semibold">{servingTemp.toFixed(1)}°C</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Monitoring Suhu
          </CardTitle>
          <Badge variant={hasDanger ? 'destructive' : hasWarning ? 'outline' : 'secondary'}>
            {hasDanger ? 'Bahaya!' : hasWarning ? 'Perhatian' : 'Normal'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {hasDanger && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-semibold">Suhu di Luar Rentang Aman!</span>
              <br />
              Makanan berada dalam zona bahaya pertumbuhan bakteri.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <TemperatureReading label="Suhu Saat Berangkat" temp={departureTemp} foodType={foodType} />
          <TemperatureReading label="Suhu Saat Tiba" temp={arrivalTemp} foodType={foodType} />
          <TemperatureReading label="Suhu Saat Disajikan" temp={servingTemp} foodType={foodType} />
        </div>

        {tempChange !== null && (
          <div className={cn(
            'p-3 rounded-lg border',
            Math.abs(tempChange) > 10 ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800' : 'bg-muted'
          )}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Perubahan Suhu</span>
              <span className={cn(
                'text-lg font-bold',
                tempChange < 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
              )}>
                {tempChange > 0 ? '+' : ''}{tempChange.toFixed(1)}°C
              </span>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p className="font-medium">Standar Keamanan Pangan:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Makanan Panas: Harus dijaga di atas {TEMP_SAFETY_RANGES.HOT_FOOD.SAFE_MIN}°C</li>
            <li>Makanan Dingin: Harus dijaga di bawah {TEMP_SAFETY_RANGES.COLD_FOOD.SAFE_MAX}°C</li>
            <li>Zona Bahaya: {TEMP_SAFETY_RANGES.DANGER_ZONE.MIN}°C - {TEMP_SAFETY_RANGES.DANGER_ZONE.MAX}°C</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
