/**
 * @fileoverview Currency Formatting Utilities
 * @version Next.js 15.5.4 / Indonesian Locale
 */

/**
 * Format number as Indonesian Rupiah currency
 * 
 * IMPORTANT: Always rounds to nearest integer to avoid decimal display issues.
 * 
 * Indonesian locale uses:
 * - "." (dot) as thousand separator
 * - "," (comma) as decimal separator
 * 
 * Example: 68.023 would be displayed as "Rp 68.023" (68 thousand) if not rounded.
 * This function rounds to 68 and displays as "Rp 68" ✅
 * 
 * @param value - The numeric value to format
 * @param options - Optional formatting options
 * @returns Formatted currency string (e.g., "Rp 1.234.567")
 * 
 * @example
 * ```typescript
 * formatCurrency(1234567.89)     // "Rp 1.234.568" (rounded)
 * formatCurrency(68.023)          // "Rp 68" (not "Rp 68.023")
 * formatCurrency(1500)            // "Rp 1.500"
 * formatCurrency(999.5)           // "Rp 1.000" (rounded up)
 * 
 * // With decimals (for precise financial reports):
 * formatCurrency(68.023, { showDecimals: true })  // "Rp 68,02"
 * ```
 */
export function formatCurrency(
  value: number | null | undefined,
  options: {
    showDecimals?: boolean
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {}
): string {
  // Handle null/undefined
  if (value === null || value === undefined || isNaN(value)) {
    return 'Rp 0'
  }

  const {
    showDecimals = false,
    minimumFractionDigits = 0,
    maximumFractionDigits = showDecimals ? 2 : 0
  } = options

  // Round to nearest integer by default to avoid decimal display issues
  const displayValue = showDecimals ? value : Math.round(value)

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(displayValue)
}

/**
 * Format number as Indonesian number format (without currency symbol)
 * 
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 * 
 * @example
 * ```typescript
 * formatNumber(1234567)          // "1.234.567"
 * formatNumber(1234.567)         // "1.235" (rounded)
 * formatNumber(1234.567, 2)      // "1.234,57"
 * ```
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 0
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }

  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Parse Indonesian currency string to number
 * 
 * @param currencyString - Currency string (e.g., "Rp 1.234.567" or "1.234.567,89")
 * @returns Numeric value
 * 
 * @example
 * ```typescript
 * parseCurrency("Rp 1.234.567")     // 1234567
 * parseCurrency("1.234.567,89")     // 1234567.89
 * parseCurrency("Rp 68")            // 68
 * ```
 */
export function parseCurrency(currencyString: string): number {
  if (!currencyString) return 0

  // Remove currency symbol and spaces
  let cleaned = currencyString.replace(/Rp\s*/g, '').trim()

  // Replace Indonesian thousand separator (.) with nothing
  cleaned = cleaned.replace(/\./g, '')

  // Replace Indonesian decimal separator (,) with dot
  cleaned = cleaned.replace(/,/g, '.')

  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format cost per unit with appropriate precision
 * 
 * @param cost - Cost value
 * @param quantity - Quantity value
 * @param unit - Unit of measurement
 * @returns Formatted string
 * 
 * @example
 * ```typescript
 * formatCostPerUnit(12000, 1, 'kg')          // "Rp 12.000/kg"
 * formatCostPerUnit(1872, 0.156, 'kg')       // "Rp 12.000/kg" (calculated)
 * ```
 */
export function formatCostPerUnit(
  cost: number,
  quantity: number,
  unit: string
): string {
  if (quantity === 0) return `Rp 0/${unit}`

  const costPerUnit = cost / quantity
  return `${formatCurrency(costPerUnit)}/${unit}`
}

/**
 * Format percentage value
 * 
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 * 
 * @example
 * ```typescript
 * formatPercentage(23.456)         // "23,5%"
 * formatPercentage(23.456, 2)      // "23,46%"
 * formatPercentage(100)            // "100,0%"
 * ```
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

/**
 * Compact number formatting for large values
 * 
 * @param value - The numeric value to format
 * @returns Compacted string (e.g., "1,2 jt" for 1.234.567)
 * 
 * @example
 * ```typescript
 * formatCompactCurrency(1234567)      // "Rp 1,2 jt"
 * formatCompactCurrency(1500000)      // "Rp 1,5 jt"
 * formatCompactCurrency(1234567890)   // "Rp 1,2 M"
 * formatCompactCurrency(500)          // "Rp 500"
 * ```
 */
export function formatCompactCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'Rp 0'
  }

  // For values less than 1 million, show full amount
  if (Math.abs(value) < 1000000) {
    return formatCurrency(value)
  }

  // For millions
  if (Math.abs(value) < 1000000000) {
    const millions = value / 1000000
    return `Rp ${formatNumber(millions, 1)} jt`
  }

  // For billions
  const billions = value / 1000000000
  return `Rp ${formatNumber(billions, 1)} M`
}
