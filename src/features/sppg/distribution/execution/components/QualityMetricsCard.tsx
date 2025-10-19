'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Award,
  Star,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Sparkles,
} from 'lucide-react'
import { QualityGrade } from '@prisma/client'
import { cn } from '@/lib/utils'

/**
 * Quality metrics data structure
 */
export interface QualityMetricsData {
  foodQuality?: QualityGrade | null
  hygieneScore?: number | null
  packagingCondition?: string | null
  // Feedback related (if available)
  feedbackCount?: number
  complaintCount?: number
  averageRating?: number
}

interface QualityMetricsCardProps {
  data: QualityMetricsData
  compact?: boolean
}

/**
 * Get quality grade label in Indonesian
 */
function getQualityLabel(grade: QualityGrade): string {
  const labels: Record<QualityGrade, string> = {
    EXCELLENT: 'Sangat Baik',
    GOOD: 'Baik',
    FAIR: 'Cukup',
    POOR: 'Kurang',
    REJECTED: 'Ditolak',
  }
  return labels[grade]
}

/**
 * Get quality grade color and variant
 */
function getQualityStatus(grade: QualityGrade) {
  const statuses = {
    EXCELLENT: {
      label: 'Sangat Baik',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-200 dark:border-green-800',
      variant: 'default' as const,
      icon: Sparkles,
    },
    GOOD: {
      label: 'Baik',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      variant: 'secondary' as const,
      icon: CheckCircle2,
    },
    FAIR: {
      label: 'Cukup',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      variant: 'outline' as const,
      icon: ThumbsUp,
    },
    POOR: {
      label: 'Kurang',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      borderColor: 'border-orange-200 dark:border-orange-800',
      variant: 'outline' as const,
      icon: ThumbsDown,
    },
    REJECTED: {
      label: 'Ditolak',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-800',
      variant: 'destructive' as const,
      icon: AlertTriangle,
    },
  }

  return statuses[grade]
}

/**
 * Get hygiene score status
 */
function getHygieneStatus(score: number) {
  if (score >= 90) {
    return {
      label: 'Sangat Baik',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      icon: Sparkles,
    }
  } else if (score >= 75) {
    return {
      label: 'Baik',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      icon: CheckCircle2,
    }
  } else if (score >= 60) {
    return {
      label: 'Cukup',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      icon: ThumbsUp,
    }
  } else {
    return {
      label: 'Perlu Perbaikan',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      icon: AlertTriangle,
    }
  }
}

/**
 * Food Quality Section
 */
function FoodQualitySection({ grade }: { grade?: QualityGrade | null }) {
  if (!grade) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Kualitas makanan belum dinilai</p>
      </div>
    )
  }

  const status = getQualityStatus(grade)
  const StatusIcon = status.icon

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Award className="h-4 w-4" />
        <span>Kualitas Makanan</span>
      </div>

      <div className={cn('p-4 rounded-lg border', status.bgColor, status.borderColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-full', status.bgColor)}>
              <StatusIcon className={cn('h-6 w-6', status.color)} />
            </div>
            <div>
              <p className={cn('text-2xl font-bold', status.color)}>{status.label}</p>
              <p className="text-sm text-muted-foreground mt-0.5">Grade: {grade}</p>
            </div>
          </div>
          <Badge variant={status.variant} className="text-lg px-4 py-2">
            {grade}
          </Badge>
        </div>
      </div>
    </div>
  )
}

/**
 * Hygiene Score Section
 */
function HygieneScoreSection({ score }: { score?: number | null }) {
  if (score === undefined || score === null) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Skor kebersihan belum tersedia</p>
      </div>
    )
  }

  const status = getHygieneStatus(score)
  const StatusIcon = status.icon

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <span>Skor Kebersihan</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn('h-5 w-5', status.color)} />
            <span className="text-sm font-medium">{status.label}</span>
          </div>
          <span className={cn('text-3xl font-bold', status.color)}>{score}/100</span>
        </div>

        <Progress value={score} className={cn('h-3', status.bgColor)} />

        <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
          <div className="text-center">
            <div className="font-medium">0-59</div>
            <div>Perlu Perbaikan</div>
          </div>
          <div className="text-center">
            <div className="font-medium">60-74</div>
            <div>Cukup</div>
          </div>
          <div className="text-center">
            <div className="font-medium">75-89</div>
            <div>Baik</div>
          </div>
          <div className="text-center">
            <div className="font-medium">90-100</div>
            <div>Sangat Baik</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Packaging Condition Section
 */
function PackagingSection({ condition }: { condition?: string | null }) {
  if (!condition) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Award className="h-4 w-4" />
        <span>Kondisi Kemasan</span>
      </div>
      <div className="p-3 bg-muted rounded-lg">
        <p className="text-sm">{condition}</p>
      </div>
    </div>
  )
}

/**
 * Feedback Summary Section
 */
function FeedbackSummarySection({
  feedbackCount = 0,
  complaintCount = 0,
  averageRating,
}: {
  feedbackCount?: number
  complaintCount?: number
  averageRating?: number
}) {
  const hasData = feedbackCount > 0 || complaintCount > 0 || averageRating !== undefined

  if (!hasData) {
    return null
  }

  const satisfactionRate =
    feedbackCount > 0 ? ((feedbackCount - complaintCount) / feedbackCount) * 100 : 0

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Star className="h-4 w-4" />
        <span>Umpan Balik</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Total Feedback */}
        <div className="p-3 border rounded-lg bg-card">
          <div className="text-2xl font-bold">{feedbackCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Feedback</div>
        </div>

        {/* Complaints */}
        {complaintCount > 0 && (
          <div className="p-3 border rounded-lg bg-card">
            <div className="flex items-center gap-1">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {complaintCount}
              </div>
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">Keluhan</div>
          </div>
        )}

        {/* Average Rating */}
        {averageRating !== undefined && (
          <div className="p-3 border rounded-lg bg-card">
            <div className="flex items-center gap-1">
              <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="text-xs text-muted-foreground mt-1">Rata-rata Rating</div>
          </div>
        )}
      </div>

      {/* Satisfaction Rate */}
      {feedbackCount > 0 && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tingkat Kepuasan</span>
            <span className="text-sm font-bold">{satisfactionRate.toFixed(0)}%</span>
          </div>
          <Progress value={satisfactionRate} className="h-2" />
        </div>
      )}
    </div>
  )
}

/**
 * Main Quality Metrics Card Component
 */
export function QualityMetricsCard({ data, compact = false }: QualityMetricsCardProps) {
  const { foodQuality, hygieneScore, packagingCondition, feedbackCount, complaintCount, averageRating } = data

  const hasAnyMetric =
    foodQuality || hygieneScore !== undefined || packagingCondition || feedbackCount || complaintCount

  const hasIssue = foodQuality === 'POOR' || foodQuality === 'REJECTED' || (hygieneScore !== undefined && hygieneScore !== null && hygieneScore < 60)

  if (!hasAnyMetric && !compact) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Metrik Kualitas Belum Tersedia</p>
            <p className="text-sm mt-1">Data kualitas makanan dan kebersihan akan ditampilkan di sini</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Metrik Kualitas</span>
          {hasIssue && (
            <Badge variant="destructive" className="text-xs">
              Perhatian!
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {foodQuality && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Kualitas</p>
              <p className="font-medium">{getQualityLabel(foodQuality)}</p>
            </div>
          )}
          {hygieneScore !== undefined && hygieneScore !== null && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Kebersihan</p>
              <p className="font-medium">{hygieneScore}/100</p>
            </div>
          )}
          {feedbackCount !== undefined && feedbackCount > 0 && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Feedback</p>
              <p className="font-medium">{feedbackCount} respon</p>
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
            <TrendingUp className="h-5 w-5" />
            Metrik Kualitas
          </CardTitle>
          {hasIssue && (
            <Badge variant="destructive">Perlu Perhatian</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Alert for poor quality */}
        {hasIssue && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-semibold">Kualitas Di Bawah Standar!</span>
              <br />
              {foodQuality === 'POOR' || foodQuality === 'REJECTED'
                ? `Kualitas makanan dinilai ${getQualityLabel(foodQuality)}. `
                : ''}
              {hygieneScore !== undefined && hygieneScore !== null && hygieneScore < 60
                ? `Skor kebersihan (${hygieneScore}/100) perlu ditingkatkan.`
                : ''}
            </AlertDescription>
          </Alert>
        )}

        {/* Food Quality */}
        <FoodQualitySection grade={foodQuality} />

        {/* Hygiene Score */}
        <HygieneScoreSection score={hygieneScore} />

        {/* Packaging Condition */}
        <PackagingSection condition={packagingCondition} />

        {/* Feedback Summary */}
        <FeedbackSummarySection
          feedbackCount={feedbackCount}
          complaintCount={complaintCount}
          averageRating={averageRating}
        />
      </CardContent>
    </Card>
  )
}
