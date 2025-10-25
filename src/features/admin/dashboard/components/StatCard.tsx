/**
 * @fileoverview Dashboard Stat Card Component
 * @version Next.js 15.5.4
 * @author Bagizi-ID Development Team
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { StatCardProps } from '../types'

export function StatCard({ 
  title, 
  value, 
  description, 
  trend, 
  icon: Icon,
  href 
}: StatCardProps) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend.value > 0 ? (
              <ArrowUpRight className="h-3 w-3 text-green-600" />
            ) : trend.value < 0 ? (
              <ArrowDownRight className="h-3 w-3 text-red-600" />
            ) : (
              <TrendingUp className="h-3 w-3 text-gray-600" />
            )}
            <span className={`text-xs font-medium ${
              trend.value > 0 ? 'text-green-600' : 
              trend.value < 0 ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {trend.value > 0 && '+'}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  return content
}
