/**
 * @fileoverview Menu Plan Calendar Component
 * @version Next.js 15.5.4 / shadcn/ui / TanStack Query
 * @see {@link /docs/copilot-instructions.md} Calendar patterns
 */

'use client'

import { type FC, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isWeekend, startOfWeek, endOfWeek } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { MealType } from '@prisma/client'
import type { MenuAssignmentWithMenu } from '../types'
import { AssignmentDialog } from './AssignmentDialog'

interface MenuPlanCalendarProps {
  planId: string
  startDate: Date
  endDate: Date
  assignments: MenuAssignmentWithMenu[]
  programTargetRecipients?: number
  isLoading?: boolean
  className?: string
}

interface DayCell {
  date: Date
  assignments: MenuAssignmentWithMenu[]
  isInRange: boolean
  isWeekend: boolean
  isToday: boolean
}

const mealTypeColors: Record<MealType, string> = {
  SARAPAN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  SNACK_PAGI: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  MAKAN_SIANG: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  SNACK_SORE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  MAKAN_MALAM: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

const mealTypeLabels: Record<MealType, string> = {
  SARAPAN: 'Sarapan',
  SNACK_PAGI: 'Snack Pagi',
  MAKAN_SIANG: 'Makan Siang',
  SNACK_SORE: 'Snack Sore',
  MAKAN_MALAM: 'Makan Malam',
}

export const MenuPlanCalendar: FC<MenuPlanCalendarProps> = ({
  planId,
  startDate,
  endDate,
  assignments,
  programTargetRecipients,
  isLoading = false,
  className,
}) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date(startDate)))
  const [mealTypeFilter, setMealTypeFilter] = useState<MealType | 'ALL'>('ALL')
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<MenuAssignmentWithMenu | null>(null)

  // Handle add assignment (empty cell click)
  const handleAddAssignment = (date: Date) => {
    setSelectedDate(date)
    setSelectedAssignment(null) // Create mode
    setDialogOpen(true)
  }

  // Handle edit assignment (assignment click)
  const handleEditAssignment = (assignment: MenuAssignmentWithMenu) => {
    setSelectedDate(assignment.assignedDate)
    setSelectedAssignment(assignment) // Edit mode
    setDialogOpen(true)
  }

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      // Reset state when closing
      setSelectedDate(null)
      setSelectedAssignment(null)
    }
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { locale: localeId })
    const calendarEnd = endOfWeek(monthEnd, { locale: localeId })

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return days.map((date): DayCell => {
      const dayAssignments = assignments.filter(a => 
        isSameDay(new Date(a.assignedDate), date) &&
        (mealTypeFilter === 'ALL' || a.mealType === mealTypeFilter)
      )

      return {
        date,
        assignments: dayAssignments,
        isInRange: date >= startDate && date <= endDate,
        isWeekend: isWeekend(date),
        isToday: isSameDay(date, new Date()),
      }
    })
  }, [currentMonth, assignments, startDate, endDate, mealTypeFilter])

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleToday = () => {
    setCurrentMonth(startOfMonth(new Date()))
  }

  // Statistics
  const stats = useMemo(() => {
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const assignedDays = new Set(assignments.map(a => format(new Date(a.assignedDate), 'yyyy-MM-dd'))).size
    const coverage = totalDays > 0 ? (assignedDays / totalDays) * 100 : 0

    return {
      totalDays,
      assignedDays,
      coverage: Math.round(coverage),
      totalAssignments: assignments.length,
    }
  }, [startDate, endDate, assignments])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar View
            </CardTitle>
            <CardDescription>
              {format(startDate, 'd MMMM yyyy', { locale: localeId })} - {format(endDate, 'd MMMM yyyy', { locale: localeId })}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {/* Meal Type Filter */}
            <Select
              value={mealTypeFilter}
              onValueChange={(value) => setMealTypeFilter(value as MealType | 'ALL')}
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
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
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Coverage:</span>{' '}
            <span className="font-semibold">{stats.coverage}%</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Assigned Days:</span>{' '}
            <span className="font-semibold">{stats.assignedDays} / {stats.totalDays}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Total Assignments:</span>{' '}
            <span className="font-semibold">{stats.totalAssignments}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {format(currentMonth, 'MMMM yyyy', { locale: localeId })}
            </h3>
            <Button variant="ghost" size="sm" onClick={handleToday}>
              Today
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayCell) => (
              <CalendarDay
                key={dayCell.date.toISOString()}
                dayCell={dayCell}
                onAddClick={handleAddAssignment}
                onAssignmentClick={handleEditAssignment}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Legend:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(mealTypeLabels).map(([type, label]) => (
              <Badge
                key={type}
                variant="outline"
                className={cn('text-xs', mealTypeColors[type as MealType])}
              >
                {label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Assignment Dialog */}
      <AssignmentDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        planId={planId}
        planStartDate={startDate}
        planEndDate={endDate}
        programTargetRecipients={programTargetRecipients || 100}
        assignment={selectedAssignment}
        selectedDate={selectedDate}
      />
    </Card>
  )
}

// ===================== CalendarDay Component =====================

interface CalendarDayProps {
  dayCell: DayCell
  onAddClick?: (date: Date) => void
  onAssignmentClick?: (assignment: MenuAssignmentWithMenu) => void
}

const CalendarDay: FC<CalendarDayProps> = ({ dayCell, onAddClick, onAssignmentClick }) => {
  const { date, assignments, isInRange, isWeekend, isToday } = dayCell

  return (
    <div
      className={cn(
        'min-h-[120px] border rounded-lg p-2 transition-colors',
        isInRange ? 'bg-background' : 'bg-muted/30',
        isWeekend && 'bg-muted/50',
        isToday && 'ring-2 ring-primary',
        'hover:shadow-md'
      )}
    >
      {/* Date Header */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            'text-sm font-medium',
            !isInRange && 'text-muted-foreground',
            isToday && 'text-primary font-bold'
          )}
        >
          {format(date, 'd')}
        </span>

        {isInRange && onAddClick && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => onAddClick(date)}
            title="Tambah Assignment"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Assignments */}
      <div className="space-y-1">
        {assignments.map((assignment) => (
          <button
            key={assignment.id}
            onClick={() => onAssignmentClick?.(assignment)}
            className={cn(
              'w-full text-left text-xs px-1.5 py-1 rounded truncate transition-colors',
              mealTypeColors[assignment.mealType],
              'hover:opacity-80 cursor-pointer'
            )}
            title={`${mealTypeLabels[assignment.mealType]}: ${assignment.menu.menuName}`}
          >
            <div className="font-medium truncate">{assignment.menu.menuName}</div>
            <div className="text-[10px] opacity-75">{assignment.plannedPortions || 0} porsi</div>
          </button>
        ))}
      </div>
    </div>
  )
}
