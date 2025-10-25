/**
 * PhoneInput Component
 * 
 * Professional phone number input with country code selector
 * Built on react-phone-number-input with shadcn/ui styling
 * 
 * Features:
 * - Country flag and code selector
 * - Auto-formatting based on country
 * - International format support
 * - Validation built-in
 * - Accessible with ARIA labels
 * 
 * @example
 * ```tsx
 * <PhoneInput
 *   value={phoneNumber}
 *   onChange={setPhoneNumber}
 *   defaultCountry="ID"
 *   placeholder="Enter phone number"
 * />
 * ```
 */

'use client'

import * as React from 'react'
import PhoneInputComponent, { 
  type Country,
  getCountryCallingCode 
} from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import { cn } from '@/lib/utils'

export interface PhoneInputProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof PhoneInputComponent>,
    'onChange'
  > {
  onChange?: (value: string | undefined) => void
}

const PhoneInput = React.forwardRef<
  React.ElementRef<typeof PhoneInputComponent>,
  PhoneInputProps
>(({ className, onChange, ...props }, ref) => {
  return (
    <PhoneInputComponent
      ref={ref}
      className={cn(
        'flex rounded-md border border-input bg-transparent text-sm shadow-xs',
        'dark:bg-input/30',
        className
      )}
      flagComponent={({ country, countryName }) => (
        <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20">
          {flags[country as Country]?.({ title: countryName })}
        </span>
      )}
      countrySelectComponent={({ 
        value, 
        onChange: onCountryChange, 
        options,
        disabled,
        name,
        ...rest
      }) => {
        // Filter out React-specific props that shouldn't be passed to DOM elements
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { iconComponent, unicodeFlags, ...validSelectProps } = rest as Record<string, unknown>
        
        return (
          <select
            value={value}
            onChange={(e) => onCountryChange?.(e.target.value as Country)}
            disabled={disabled}
            name={name}
            className={cn(
              'flex h-9 items-center justify-center rounded-l-md border-r border-input',
              'bg-transparent px-2 text-sm transition-[color,box-shadow] outline-none',
              'dark:bg-input/30 dark:hover:bg-input/50',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'min-w-[90px]' // Ensure enough width for "ID +62" format
            )}
            {...validSelectProps}
          >
            {options.map((option: { value?: string; label: string }) => {
              const countryCode = option.value as Country
              let displayText = option.value
              
              // Try to get calling code, fallback to country code only if fails
              try {
                if (countryCode) {
                  const callingCode = getCountryCallingCode(countryCode)
                  displayText = `${countryCode} +${callingCode}`
                }
              } catch {
                // If getCountryCallingCode fails, just use country code
                displayText = option.value || option.label
              }
              
              return (
                <option key={option.value || option.label} value={option.value}>
                  {displayText}
                </option>
              )
            })}
          </select>
        )
      }}
      numberInputProps={{
        className: cn(
          'flex h-9 w-full rounded-r-md bg-transparent px-3 py-1 text-base shadow-xs',
          'border-input transition-[color,box-shadow] outline-none',
          'dark:bg-input/30',
          'placeholder:text-muted-foreground',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'md:text-sm'
        ),
      }}
      onChange={(value) => onChange?.(value)}
      {...props}
    />
  )
})

PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }
