/**
 * @fileoverview School Hooks Barrel Export
 * @version Next.js 15.5.4 / TanStack Query v5
 */

// School Master Hooks (New Comprehensive Implementation)
export {
  // Query Hooks
  useSchools,
  useSchool,
  useSchoolAutocomplete,
  useExpiringContracts,
  useHighPerformers,
  useSchoolStatsByType,
  
  // Mutation Hooks
  useCreateSchool,
  useUpdateSchool,
  usePartialUpdateSchool,
  useDeleteSchool,
  useReactivateSchool,
  
  // Query Key Factory
  schoolKeys,
} from './useSchools'

// Legacy exports (if needed for backward compatibility)
// export { useSchools as useLegacySchools } from './useSchoolMaster'

export { usePrograms } from './usePrograms'
export { useVillages } from './useVillages'

// Regional Data Hooks
export { 
  useProvinces,
  useRegencies, 
  useDistricts,
  useVillagesByDistrict 
} from './useRegional'
