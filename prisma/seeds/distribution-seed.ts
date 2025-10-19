/**
 * @fileoverview Distribution Domain Seed Data
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Prisma Seed Architecture
 * 
 * Seeds comprehensive distribution data including:
 * - Food distributions with full lifecycle (SCHEDULED → COMPLETED)
 * - Distribution status tracking
 * - Staff assignments (distributors, drivers)
 * - Logistics data (vehicles, costs)
 * - Temperature & quality tracking
 * - Real-world distribution scenarios
 */

import { PrismaClient, DistributionStatus, MealType, DistributionMethod, QualityGrade } from '@prisma/client'
import { addDays, subDays } from 'date-fns'

/**
 * Seed Distribution Domain Data
 * Creates comprehensive distribution data for SPPG Purwakarta testing
 * 
 * This seed integrates with existing data:
 * - Uses existing SPPG Purwakarta
 * - Links to existing production batches
 * - Uses existing staff (distributors, drivers)
 * - Creates realistic distribution workflow scenarios
 * 
 * @param prisma - Prisma Client instance
 * @returns Promise<void>
 */
export async function seedDistribution(
  prisma: PrismaClient,
  sppgs: { id: string; name: string; code: string }[],
  programs: { id: string; name: string; sppgId: string }[]
): Promise<void> {
  console.log('  → Creating distribution data for SPPG Purwakarta...')

  try {
    // ========================================================================
    // STEP 1: Get SPPG Purwakarta from passed data
    // ========================================================================
    
    // Get SPPG Purwakarta from passed data
    const sppg = sppgs.find(s => s.code === 'SPPG-PWK-001')
    if (!sppg) {
      console.log('  ⚠️  SPPG Purwakarta not found, skipping distribution seed')
      return
    }

    console.log(`  ✅ Found SPPG: ${sppg.name}`)

    // Get programs for this SPPG from passed data
    const sppgPrograms = programs.filter(p => p.sppgId === sppg.id)
    if (sppgPrograms.length === 0) {
      console.log('  ⚠️  No programs found for SPPG Purwakarta')
      return
    }

    console.log(`  ✅ Found ${sppgPrograms.length} programs`)

        // Get COMPLETED productions to link distributions
    const productions = await prisma.foodProduction.findMany({
      where: {
        program: {
          id: { in: sppgPrograms.map(p => p.id) }
        },
        status: 'COMPLETED'
      },
      take: 5
    })

    console.log(`  ✅ Found ${productions.length} completed productions`)

    // Get staff members for distribution roles
    const distributor = await prisma.user.findFirst({
      where: {
        sppgId: sppg.id,
        userRole: { in: ['SPPG_DISTRIBUSI_MANAGER', 'SPPG_KEPALA'] }
      }
    })

    const driver = await prisma.user.findFirst({
      where: {
        sppgId: sppg.id,
        userRole: { in: ['SPPG_STAFF_DISTRIBUSI'] }
      }
    })

    if (!distributor) {
      console.log('  ⚠️  No distributor found for SPPG Purwakarta')
      return
    }

    console.log(`  ✅ Found distributor: ${distributor.name}`)
    if (driver) {
      console.log(`  ✅ Found driver: ${driver.name}`)
    }

    // ========================================================================
    // STEP 2: Create Distribution Scenarios for SPPG Purwakarta
    // ========================================================================

    // Distribution scenarios for Purwakarta
    const scenarios = [
        // Scenario 1: Completed distribution (last week)
        {
          status: 'COMPLETED' as DistributionStatus,
          date: subDays(new Date(), 7),
          mealType: 'SARAPAN' as MealType,
          method: 'DELIVERY' as DistributionMethod,
          vehicleType: 'MOBIL',
          plannedRecipients: 150,
          actualRecipients: 148,
          foodQuality: 'EXCELLENT' as QualityGrade,
          notes: 'Distribusi berjalan lancar, semua makanan dalam kondisi baik',
        },
        // Scenario 2: In-transit distribution (today)
        {
          status: 'IN_TRANSIT' as DistributionStatus,
          date: new Date(),
          mealType: 'SNACK_PAGI' as MealType,
          method: 'DELIVERY' as DistributionMethod,
          vehicleType: 'TRUCK',
          plannedRecipients: 200,
          actualRecipients: null,
          foodQuality: null,
          notes: null,
        },
        // Scenario 3: Scheduled distribution (tomorrow)
        {
          status: 'SCHEDULED' as DistributionStatus,
          date: addDays(new Date(), 1),
          mealType: 'MAKAN_SIANG' as MealType,
          method: 'DELIVERY' as DistributionMethod,
          vehicleType: 'MOTOR',
          plannedRecipients: 100,
          actualRecipients: null,
          foodQuality: null,
          notes: null,
        },
        // Scenario 4: Distributing (now)
        {
          status: 'DISTRIBUTING' as DistributionStatus,
          date: new Date(),
          mealType: 'SNACK_SORE' as MealType,
          method: 'PICKUP' as DistributionMethod,
          vehicleType: null,
          plannedRecipients: 80,
          actualRecipients: null,
          foodQuality: null,
          notes: null,
        },
        // Scenario 5: Preparing distribution (today)
        {
          status: 'PREPARING' as DistributionStatus,
          date: new Date(),
          mealType: 'SARAPAN' as MealType,
          method: 'DELIVERY' as DistributionMethod,
          vehicleType: 'MOBIL',
          plannedRecipients: 120,
          actualRecipients: null,
          foodQuality: null,
          notes: null,
        },
        // Scenario 6: Cancelled distribution (yesterday)
        {
          status: 'CANCELLED' as DistributionStatus,
          date: subDays(new Date(), 1),
          mealType: 'MAKAN_SIANG' as MealType,
          method: 'DELIVERY' as DistributionMethod,
          vehicleType: 'MOTOR',
          plannedRecipients: 90,
          actualRecipients: null,
          foodQuality: null,
          notes: 'Cuaca buruk, distribusi ditunda',
        },
      ]

    let distributionCount = 0

    // Create distributions for SPPG Purwakarta
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i]
      const program = programs[i % programs.length]
      const production = productions[i % productions.length] || null

      // Generate distribution code
      const distCode = `DIST-${sppg.code}-${format(scenario.date, 'yyyyMMdd')}-${(i + 1).toString().padStart(3, '0')}`

      // Calculate timing based on status
      const plannedStartTime = new Date(scenario.date)
      plannedStartTime.setHours(
        scenario.mealType === 'SARAPAN' ? 6 : 
        scenario.mealType === 'SNACK_PAGI' ? 9 : 
        scenario.mealType === 'MAKAN_SIANG' ? 11 : 
        scenario.mealType === 'SNACK_SORE' ? 15 : 17, 
        0, 0, 0
      )
      
      const plannedEndTime = new Date(plannedStartTime)
      plannedEndTime.setHours(plannedEndTime.getHours() + 2)

      // Set actual times based on status
      let actualStartTime = null
      const actualEndTime = null
      let departureTime = null
      let arrivalTime = null
      let completionTime = null

      if (['PREPARING', 'IN_TRANSIT', 'DISTRIBUTING', 'COMPLETED'].includes(scenario.status)) {
        actualStartTime = new Date(plannedStartTime)
      }
      
      if (['IN_TRANSIT', 'DISTRIBUTING', 'COMPLETED'].includes(scenario.status)) {
        departureTime = new Date(actualStartTime!)
        departureTime.setMinutes(departureTime.getMinutes() + 30)
      }
      
      if (['DISTRIBUTING', 'COMPLETED'].includes(scenario.status)) {
        arrivalTime = new Date(departureTime!)
        arrivalTime.setMinutes(arrivalTime.getMinutes() + 45)
      }
      
      if (scenario.status === 'COMPLETED') {
        completionTime = new Date(arrivalTime!)
        completionTime.setHours(completionTime.getHours() + 1)
      }

      // Create distribution
      const distribution = await prisma.foodDistribution.create({
        data: {
          sppgId: sppg.id,
          programId: program.id,
          productionId: production?.id,
          
          // Distribution Details
          distributionDate: scenario.date,
          distributionCode: distCode,
          mealType: scenario.mealType,
          
          // Location Information
          distributionPoint: getDistributionPoint(i),
          address: getDistributionAddress(i),
          coordinates: getCoordinates(i),
          
          // Planning
          plannedRecipients: scenario.plannedRecipients,
          actualRecipients: scenario.actualRecipients,
          plannedStartTime,
          plannedEndTime,
          
          // Staff Assignment
          distributorId: distributor?.id || '',
          driverId: scenario.method === 'DELIVERY' ? (driver?.id || '') : null,
          volunteers: scenario.method === 'DELIVERY' ? [distributor?.id || '', driver?.id || ''] : [distributor?.id || ''],
          
          // Logistics
          distributionMethod: scenario.method,
          vehicleType: scenario.vehicleType,
          vehiclePlate: scenario.vehicleType ? getVehiclePlate(i) : null,
          transportCost: scenario.method === 'DELIVERY' ? getTransportCost() : null,
          fuelCost: scenario.method === 'DELIVERY' ? getFuelCost() : null,
          otherCosts: Math.random() > 0.5 ? getOtherCosts() : null,
          
          // Food Details
          menuItems: generateMenuItems(scenario.mealType) as never,
          totalPortions: scenario.plannedRecipients,
          portionSize: 200,
          
          // Temperature Tracking
          departureTemp: departureTime ? 60 + Math.random() * 10 : null,
          arrivalTemp: arrivalTime ? 55 + Math.random() * 10 : null,
          servingTemp: scenario.status === 'COMPLETED' ? 50 + Math.random() * 10 : null,
          
          // Status Tracking
          status: scenario.status,
          
          // Timing
          actualStartTime,
          actualEndTime,
          departureTime,
          arrivalTime,
          completionTime,
          
          // Quality Assessment
          foodQuality: scenario.foodQuality,
          hygieneScore: scenario.status === 'COMPLETED' ? 85 + Math.floor(Math.random() * 15) : null,
          packagingCondition: scenario.status === 'COMPLETED' ? 'INTACT' : null,
          
          // Weather & Environment
          weatherCondition: getWeatherCondition(),
          temperature: 28 + Math.random() * 5,
          humidity: 60 + Math.random() * 20,
          
          // Notes
          notes: scenario.notes || null,
          signature: scenario.status === 'COMPLETED' ? 'data:image/png;base64,iVBORw0KG...' : null,
        },
      })

      distributionCount++

      // Create audit log for distribution
      await prisma.auditLog.create({
        data: {
          entityType: 'FoodDistribution',
          entityId: distribution.id,
          action: 'CREATE',
          userId: distributor?.id,
          sppgId: sppg.id,
          metadata: {
            action: 'CREATE_DISTRIBUTION',
            distributionCode: distCode,
            status: scenario.status,
            mealType: scenario.mealType,
            plannedRecipients: scenario.plannedRecipients,
          },
        },
      })
    }

    console.log(`  ✓ Created ${distributionCount} distribution records`)
    console.log(`  ✓ Distribution scenarios: Scheduled, Preparing, In-Transit, Distributing, Completed, Cancelled`)

  } catch (error) {
    console.error('  ❌ Error seeding distribution data:', error)
    throw error
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function format(date: Date, formatStr: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  if (formatStr === 'yyyyMMdd') {
    return `${year}${month}${day}`
  }
  return `${year}-${month}-${day}`
}

function getDistributionPoint(index: number): string {
  const points = [
    'SDN Purwakarta 1',
    'SDN Maniis 2',
    'TK Pembina Purwakarta',
    'PAUD Melati Purwakarta',
    'SDN Bungursari 3',
    'Posyandu Mawar Purwakarta',
    'SDN Jatiluhur 1',
    'TK Islam Al-Ikhlas Purwakarta',
  ]
  return points[index % points.length]
}

function getDistributionAddress(index: number): string {
  const addresses = [
    'Jl. Veteran No. 45, Purwakarta',
    'Jl. Maniis Raya No. 12, Purwakarta',
    'Jl. Kapten Halim No. 89, Purwakarta',
    'Jl. Gandanegara No. 156, Purwakarta',
    'Jl. Bungursari Raya No. 234, Purwakarta',
    'Jl. Pasar Baru No. 67, Purwakarta',
    'Jl. Jatiluhur No. 45, Purwakarta',
    'Jl. Ipik Gandamanah No. 78, Purwakarta',
  ]
  return addresses[index % addresses.length]
}

function getCoordinates(index: number): string {
  const coords = [
    '-6.5567,107.4437', // Purwakarta center
    '-6.5600,107.4500', // Maniis area
    '-6.5520,107.4480', // North Purwakarta
    '-6.5650,107.4400', // West Purwakarta
    '-6.5580,107.4520', // East Purwakarta
    '-6.5540,107.4420', // Central market area
    '-6.6000,107.4300', // Jatiluhur area
    '-6.5500,107.4460', // South Purwakarta
  ]
  return coords[index % coords.length]
}

function getVehiclePlate(index: number): string {
  const plates = [
    'D 1234 PWK', // Purwakarta area code
    'D 5678 ABC',
    'D 9012 DEF',
    'D 3456 GHI',
    'D 7890 JKL',
    'D 2345 MNO',
  ]
  return plates[index % plates.length]
}

function getTransportCost(): number {
  return Math.floor(50000 + Math.random() * 150000)
}

function getFuelCost(): number {
  return Math.floor(30000 + Math.random() * 70000)
}

function getOtherCosts(): number {
  return Math.floor(10000 + Math.random() * 40000)
}

function getWeatherCondition(): string {
  const conditions = ['CERAH', 'BERAWAN', 'HUJAN_RINGAN', 'PANAS']
  return conditions[Math.floor(Math.random() * conditions.length)]
}

function generateMenuItems(mealType: MealType): Record<string, unknown> {
  const breakfastItems = [
    { name: 'Nasi Uduk', quantity: 1, unit: 'porsi' },
    { name: 'Telur Dadar', quantity: 1, unit: 'butir' },
    { name: 'Tempe Goreng', quantity: 2, unit: 'potong' },
    { name: 'Sambal', quantity: 1, unit: 'sdm' },
  ]

  const snackItems = [
    { name: 'Roti Isi', quantity: 2, unit: 'potong' },
    { name: 'Susu UHT', quantity: 200, unit: 'ml' },
    { name: 'Pisang', quantity: 1, unit: 'buah' },
  ]

  const lunchItems = [
    { name: 'Nasi Putih', quantity: 1, unit: 'porsi' },
    { name: 'Ayam Goreng', quantity: 1, unit: 'potong' },
    { name: 'Sayur Asem', quantity: 1, unit: 'mangkok' },
    { name: 'Tahu Goreng', quantity: 2, unit: 'potong' },
    { name: 'Lalapan', quantity: 1, unit: 'porsi' },
  ]

  if (mealType === 'SARAPAN') return { items: breakfastItems }
  if (mealType === 'SNACK_PAGI' || mealType === 'SNACK_SORE') return { items: snackItems }
  return { items: lunchItems }
}
