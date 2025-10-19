/**
 * @fileoverview Weather Conditions Card Component
 * @version shadcn/ui + React 19
 * @see {@link /docs/copilot-instructions.md} Component Guidelines
 */

'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudDrizzle,
  Sun,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  CloudFog,
  CloudLightning,
  Eye,
} from 'lucide-react'

/**
 * Weather condition configuration with icons and colors
 */
const WEATHER_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string; color: string; severity: 'safe' | 'warning' | 'danger' }
> = {
  // Clear conditions
  SUNNY: {
    icon: <Sun className="h-5 w-5" />,
    label: 'Cerah',
    color: 'text-yellow-500',
    severity: 'safe',
  },
  CLEAR: {
    icon: <Sun className="h-5 w-5" />,
    label: 'Cerah',
    color: 'text-yellow-500',
    severity: 'safe',
  },
  
  // Cloudy conditions
  CLOUDY: {
    icon: <Cloud className="h-5 w-5" />,
    label: 'Berawan',
    color: 'text-gray-500',
    severity: 'safe',
  },
  PARTLY_CLOUDY: {
    icon: <Cloud className="h-5 w-5" />,
    label: 'Berawan Sebagian',
    color: 'text-gray-400',
    severity: 'safe',
  },
  
  // Rainy conditions
  LIGHT_RAIN: {
    icon: <CloudDrizzle className="h-5 w-5" />,
    label: 'Hujan Ringan',
    color: 'text-blue-500',
    severity: 'warning',
  },
  RAIN: {
    icon: <CloudRain className="h-5 w-5" />,
    label: 'Hujan',
    color: 'text-blue-600',
    severity: 'warning',
  },
  HEAVY_RAIN: {
    icon: <CloudRain className="h-5 w-5" />,
    label: 'Hujan Lebat',
    color: 'text-blue-700',
    severity: 'danger',
  },
  
  // Storm conditions
  THUNDERSTORM: {
    icon: <CloudLightning className="h-5 w-5" />,
    label: 'Badai Petir',
    color: 'text-purple-600',
    severity: 'danger',
  },
  STORM: {
    icon: <Wind className="h-5 w-5" />,
    label: 'Badai',
    color: 'text-purple-700',
    severity: 'danger',
  },
  
  // Other conditions
  FOG: {
    icon: <CloudFog className="h-5 w-5" />,
    label: 'Kabut',
    color: 'text-gray-600',
    severity: 'warning',
  },
  MIST: {
    icon: <CloudFog className="h-5 w-5" />,
    label: 'Berkabut',
    color: 'text-gray-500',
    severity: 'warning',
  },
  SNOW: {
    icon: <CloudSnow className="h-5 w-5" />,
    label: 'Salju',
    color: 'text-blue-300',
    severity: 'warning',
  },
}

interface WeatherConditionsCardProps {
  weatherCondition: string | null
  temperature: number | null
  humidity: number | null
  isLoading?: boolean
  error?: string | null
}

/**
 * Weather Conditions Card Component
 * 
 * Displays weather conditions during distribution:
 * - Weather icon and description
 * - Temperature reading (°C)
 * - Humidity percentage
 * - Impact assessment on food quality
 * - Weather alerts for extreme conditions
 * 
 * @param props - Component props
 */
export function WeatherConditionsCard({
  weatherCondition,
  temperature,
  humidity,
  isLoading = false,
  error = null,
}: WeatherConditionsCardProps) {
  // Get weather configuration
  const weatherKey = weatherCondition?.toUpperCase() || 'UNKNOWN'
  const weatherConfig = WEATHER_CONFIG[weatherKey] || {
    icon: <Eye className="h-5 w-5" />,
    label: weatherCondition || 'Tidak Diketahui',
    color: 'text-muted-foreground',
    severity: 'safe' as const,
  }

  // Temperature assessment
  const getTempStatus = (temp: number | null) => {
    if (!temp) return { label: 'Tidak Ada Data', color: 'text-muted-foreground', severity: 'safe' as const }
    if (temp < 10) return { label: 'Sangat Dingin', color: 'text-blue-600', severity: 'warning' as const }
    if (temp < 20) return { label: 'Dingin', color: 'text-blue-500', severity: 'safe' as const }
    if (temp < 28) return { label: 'Nyaman', color: 'text-green-600', severity: 'safe' as const }
    if (temp < 35) return { label: 'Panas', color: 'text-orange-500', severity: 'warning' as const }
    return { label: 'Sangat Panas', color: 'text-red-600', severity: 'danger' as const }
  }

  // Humidity assessment
  const getHumidityStatus = (hum: number | null) => {
    if (!hum) return { label: 'Tidak Ada Data', color: 'text-muted-foreground', severity: 'safe' as const }
    if (hum < 30) return { label: 'Sangat Kering', color: 'text-orange-600', severity: 'warning' as const }
    if (hum < 60) return { label: 'Normal', color: 'text-green-600', severity: 'safe' as const }
    if (hum < 80) return { label: 'Lembap', color: 'text-blue-500', severity: 'warning' as const }
    return { label: 'Sangat Lembap', color: 'text-blue-700', severity: 'danger' as const }
  }

  const tempStatus = getTempStatus(temperature)
  const humidityStatus = getHumidityStatus(humidity)

  // Food quality impact assessment
  const getFoodQualityImpact = () => {
    const impacts: string[] = []

    // Weather impact
    if (weatherConfig.severity === 'danger') {
      impacts.push('Cuaca ekstrem dapat mempengaruhi kualitas makanan')
    } else if (weatherConfig.severity === 'warning') {
      impacts.push('Cuaca perlu diperhatikan untuk menjaga kualitas')
    }

    // Temperature impact
    if (tempStatus.severity === 'danger') {
      impacts.push('Suhu ekstrem berisiko menurunkan kualitas makanan')
    } else if (tempStatus.severity === 'warning') {
      impacts.push('Perhatikan kontrol suhu makanan')
    }

    // Humidity impact
    if (humidityStatus.severity === 'danger') {
      impacts.push('Kelembapan tinggi dapat mempercepat pembusukan')
    } else if (humidityStatus.severity === 'warning' && (humidity || 0) > 60) {
      impacts.push('Kelembapan cukup tinggi, pastikan kemasan rapat')
    }

    return impacts
  }

  const qualityImpacts = getFoodQualityImpact()

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Kondisi Cuaca
          </CardTitle>
          <CardDescription>Data cuaca saat distribusi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-muted animate-pulse rounded-lg" />
            <div className="h-16 bg-muted animate-pulse rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Kondisi Cuaca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Gagal Memuat Data</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // No data state
  if (!weatherCondition && !temperature && !humidity) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Kondisi Cuaca
          </CardTitle>
          <CardDescription>Data cuaca saat distribusi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Cloud className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">Data Cuaca Tidak Tersedia</p>
            <p className="text-sm text-muted-foreground">
              Data cuaca akan ditampilkan setelah distribusi dimulai
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              Kondisi Cuaca
            </CardTitle>
            <CardDescription>Data cuaca saat distribusi</CardDescription>
          </div>

          {/* Weather severity badge */}
          {weatherConfig.severity !== 'safe' && (
            <Badge
              variant={weatherConfig.severity === 'danger' ? 'destructive' : 'default'}
              className="gap-1"
            >
              <AlertTriangle className="h-3 w-3" />
              {weatherConfig.severity === 'danger' ? 'Perhatian Khusus' : 'Waspada'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Weather Display */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
          <div className={`text-4xl ${weatherConfig.color}`}>
            {weatherConfig.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-semibold">{weatherConfig.label}</h3>
            <p className="text-sm text-muted-foreground">
              {weatherConfig.severity === 'danger'
                ? 'Kondisi cuaca ekstrem'
                : weatherConfig.severity === 'warning'
                ? 'Kondisi cuaca memerlukan perhatian'
                : 'Kondisi cuaca mendukung distribusi'}
            </p>
          </div>
        </div>

        {/* Temperature & Humidity Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Temperature */}
          {temperature !== null && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Suhu</span>
                </div>
                <Badge variant="outline" className={tempStatus.color}>
                  {tempStatus.label}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{temperature.toFixed(1)}</span>
                  <span className="text-lg text-muted-foreground">°C</span>
                </div>

                {/* Temperature gauge */}
                <div className="space-y-1">
                  <Progress
                    value={Math.min((temperature / 40) * 100, 100)}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0°C</span>
                    <span>40°C</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Humidity */}
          {humidity !== null && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Kelembapan</span>
                </div>
                <Badge variant="outline" className={humidityStatus.color}>
                  {humidityStatus.label}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{humidity.toFixed(0)}</span>
                  <span className="text-lg text-muted-foreground">%</span>
                </div>

                {/* Humidity gauge */}
                <div className="space-y-1">
                  <Progress value={humidity} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Food Quality Impact Assessment */}
        {qualityImpacts.length > 0 && (
          <Alert
            variant={
              weatherConfig.severity === 'danger' || tempStatus.severity === 'danger' || humidityStatus.severity === 'danger'
                ? 'destructive'
                : 'default'
            }
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Dampak pada Kualitas Makanan</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {qualityImpacts.map((impact, index) => (
                  <li key={index} className="text-sm">
                    {impact}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Weather Tips */}
        {weatherConfig.severity !== 'safe' && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Rekomendasi
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              {weatherConfig.severity === 'danger' && (
                <>
                  <li>• Pertimbangkan untuk menunda distribusi jika memungkinkan</li>
                  <li>• Pastikan kemasan makanan ekstra rapat dan terlindungi</li>
                  <li>• Monitor suhu makanan lebih sering</li>
                </>
              )}
              {weatherConfig.severity === 'warning' && (
                <>
                  <li>• Pastikan kendaraan dalam kondisi prima</li>
                  <li>• Lindungi makanan dari paparan cuaca</li>
                  <li>• Siapkan rencana alternatif jika kondisi memburuk</li>
                </>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
