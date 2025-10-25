/**
 * SPPG Management Components
 * Export barrel file
 */

export { SppgStatistics } from './SppgStatistics'
export { SppgCard } from './SppgCard'
export { SppgFilters } from './SppgFilters'
export { SppgList } from './SppgList'

/**
 * SppgForm - Reusable dual-mode form component for SPPG management
 * 
 * @description
 * Enterprise-grade form component with 35 fields across 8 sections:
 * - Basic Information (7 fields)
 * - Management (3 fields)  
 * - Person in Charge (5 fields with PhoneInput)
 * - Regional & Geographic (8 fields with cascading Province→Regency→District→Village)
 * - Operations (4 fields)
 * - Budget & Finance (5 fields with DatePickers)
 * - Demo Account Settings (3 conditional fields)
 * 
 * @features
 * - ✅ Dual-mode operation (create/edit)
 * - ✅ React Hook Form + Zod validation
 * - ✅ Professional PhoneInput with country selector (+62 ID default)
 * - ✅ Cascading regional dropdowns with useEffect chains
 * - ✅ DatePicker with Indonesian locale (date-fns)
 * - ✅ Demo account conditional rendering
 * - ✅ TanStack Query integration (useCreateSppg/useUpdateSppg)
 * - ✅ Toast notifications & router navigation
 * - ✅ Comprehensive ARIA labels & accessibility
 * - ✅ Loading states (Skeleton for async dropdowns)
 * - ✅ Error handling with proper messages
 * - ✅ Null to undefined transformation for API compatibility
 * 
 * @example Create Mode
 * ```tsx
 * import { SppgForm } from '@/features/admin/sppg-management/components'
 * 
 * export default function CreateSppgPage() {
 *   return (
 *     <div className="container py-6">
 *       <h1 className="text-3xl font-bold mb-6">Tambah SPPG Baru</h1>
 *       <SppgForm mode="create" />
 *     </div>
 *   )
 * }
 * ```
 * 
 * @example Edit Mode
 * ```tsx
 * import { SppgForm } from '@/features/admin/sppg-management/components'
 * import { useSppgDetail } from '@/features/admin/sppg-management/hooks'
 * 
 * export default function EditSppgPage({ params }: { params: { id: string } }) {
 *   const { data: sppg, isLoading } = useSppgDetail(params.id)
 * 
 *   return (
 *     <div className="container py-6">
 *       <h1 className="text-3xl font-bold mb-6">Edit SPPG</h1>
 *       <SppgForm 
 *         mode="edit" 
 *         initialData={sppg}
 *         isLoading={isLoading}
 *       />
 *     </div>
 *   )
 * }
 * ```
 * 
 * @props
 * - mode: 'create' | 'edit' - Form operation mode
 * - initialData?: Partial<SppgFormInput> - Initial form data for edit mode
 * - isLoading?: boolean - Loading state for edit mode data fetching
 * 
 * @validation
 * All fields validated with Zod schema from '@/features/admin/sppg-management/schemas'
 * - Required fields: code, name, organizationType, phone, email, address, provinceId
 * - Optional fields: website, coordinates, description, demo settings
 * - Phone fields: International format with country code
 * - Date fields: ISO string format with date-fns formatting
 * - Regional: Cascading validation (regencyId requires provinceId, etc.)
 * 
 * @see {@link /docs/copilot-instructions.md} Enterprise Development Guidelines
 * @see {@link /src/features/admin/sppg-management/schemas} Validation Schemas
 * @version 1.0.0 - Complete implementation with 1577 lines + PhoneInput component
 */
export { SppgForm } from './SppgForm'
