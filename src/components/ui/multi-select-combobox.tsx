/**
 * @fileoverview Multi-select combobox component with autocomplete
 * @version Next.js 15.5.4 / Radix UI
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

export interface MultiSelectOption {
  label: string
  value: string
}

interface MultiSelectComboboxProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  emptyMessage?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
  allowCustom?: boolean
}

/**
 * Multi-select combobox component with autocomplete functionality
 * 
 * Features:
 * - Search/filter options
 * - Multiple selection with badges
 * - Remove selected items
 * - Custom value input (optional)
 * - Keyboard navigation
 * 
 * @example
 * ```tsx
 * const [selectedSchools, setSelectedSchools] = useState<string[]>([])
 * const schoolOptions = schools.map(s => ({ label: s.schoolName, value: s.schoolName }))
 * 
 * <MultiSelectCombobox
 *   options={schoolOptions}
 *   selected={selectedSchools}
 *   onChange={setSelectedSchools}
 *   placeholder="Pilih sekolah..."
 *   searchPlaceholder="Cari sekolah..."
 *   emptyMessage="Tidak ada sekolah ditemukan"
 *   allowCustom={true}
 * />
 * ```
 */
export function MultiSelectCombobox({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  emptyMessage = 'No items found.',
  searchPlaceholder = 'Search...',
  className,
  disabled = false,
  allowCustom = false,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  // Filter options that are not already selected
  const availableOptions = options.filter(
    (option) => !selected.includes(option.value)
  )

  // Handle selecting an option
  const handleSelect = (value: string) => {
    const newSelected = [...selected, value]
    onChange(newSelected)
    setSearchValue('')
  }

  // Handle removing a selected item
  const handleRemove = (value: string) => {
    const newSelected = selected.filter((item) => item !== value)
    onChange(newSelected)
  }

  // Handle adding custom value (if allowed)
  const handleAddCustom = () => {
    if (allowCustom && searchValue.trim() && !selected.includes(searchValue.trim())) {
      handleSelect(searchValue.trim())
      setSearchValue('')
    }
  }

  // Handle Enter key to add custom value
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && allowCustom && searchValue.trim()) {
      e.preventDefault()
      handleAddCustom()
      setOpen(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Selected items as badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((value) => (
            <Badge
              key={value}
              variant="secondary"
              className="flex items-center gap-1 pl-3 pr-1"
            >
              <span className="text-sm">{value}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-transparent"
                onClick={() => handleRemove(value)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {value}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Combobox for adding new items */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="text-muted-foreground">
              {placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
              onKeyDown={handleKeyDown}
            />
            <CommandList>
              <CommandEmpty>
                {allowCustom && searchValue.trim() ? (
                  <div className="py-6 text-center text-sm">
                    <p className="text-muted-foreground mb-2">
                      {emptyMessage}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCustom}
                    >
                      Tambah &quot;{searchValue.trim()}&quot;
                    </Button>
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup>
                {availableOptions
                  .filter((option) =>
                    option.label.toLowerCase().includes(searchValue.toLowerCase())
                  )
                  .map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        handleSelect(option.value)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selected.includes(option.value)
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
