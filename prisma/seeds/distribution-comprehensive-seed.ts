/**
 * @fileoverview COMPREHENSIVE Distribution Domain Seed Data
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * Seeds COMPLETE distribution workflow including:
 * - DistributionSchedule (PHASE 1)
 * - FoodDistribution (PHASE 2)
 * - DistributionDelivery with GPS tracking (PHASE 3)
 * - VehicleAssignment
 * - DeliveryPhoto
 * - DeliveryIssue
 * - DeliveryTracking (GPS trail)
 * - BeneficiaryReceipt
 */

import { PrismaClient } from '@prisma/client'
import { addDays, subDays, addHours, addMinutes, format } from 'date-fns'

export async function seedDistributionComprehensive(
  prisma: PrismaClient,
  sppgs: { id: string; name: string; code: string }[],
  programs: { id: string; name: string; sppgId: string }[]
): Promise<void> {
  console.log('  → Creating COMPREHENSIVE distribution data (ALL PHASES)...')

  try {
    // ========================================================================
    // STEP 1: Get SPPG Purwakarta & Related Data
    // ========================================================================
    
    const sppg = sppgs.find(s => s.code === 'SPPG-PWK-001')
    if (!sppg) {
      console.log('  ⚠️  SPPG Purwakarta not found, skipping')
      return
    }

    const sppgPrograms = programs.filter(p => p.sppgId === sppg.id)
    if (sppgPrograms.length === 0) {
      console.log('  ⚠️  No programs found')
      return
    }

    // Get menus for distribution
    const menus = await prisma.nutritionMenu.findMany({
      where: {
        program: {
          id: { in: sppgPrograms.map(p => p.id) }
        }
      },
      take: 10
    })

    // Get schools for delivery
    const schools = await prisma.schoolBeneficiary.findMany({
      where: {
        programId: { in: sppgPrograms.map(p => p.id) }
      },
      take: 5
    })

    // Get vehicles
    const vehicles = await prisma.vehicle.findMany({
      where: {
        sppgId: sppg.id,
        status: 'AVAILABLE'
      },
      take: 3
    })

    // Get users for roles
    const distributor = await prisma.user.findFirst({
      where: {
        sppgId: sppg.id,
        userRole: { in: ['SPPG_DISTRIBUSI_MANAGER', 'SPPG_KEPALA'] }
      }
    })

    const drivers = await prisma.user.findMany({
      where: {
        sppgId: sppg.id,
        userRole: { in: ['SPPG_STAFF_DISTRIBUSI'] }
      },
      take: 3
    })

    console.log(`  ✅ Found: ${menus.length} menus, ${schools.length} schools, ${vehicles.length} vehicles`)

    if (!distributor || drivers.length === 0) {
      console.log('  ⚠️  Insufficient staff data')
      return
    }

    // ========================================================================
    // STEP 2: Create Distribution Schedules (PHASE 1)
    // ========================================================================
    
    console.log('  → Creating DistributionSchedule entities...')

    const schedules = []

    // Schedule 1: Completed (last week) - MORNING
    schedules.push(await prisma.distributionSchedule.create({
      data: {
        sppgId: sppg.id,
        distributionDate: subDays(new Date(), 7),
        wave: 'MORNING',
        targetCategories: ['EARLY_CHILDHOOD', 'ELEMENTARY_GRADE_1_3'],
        estimatedBeneficiaries: 450,
        menuName: menus[0]?.menuName || 'Nasi Gudeg Ayam + Sayur',
        menuDescription: 'Menu bergizi tinggi dengan protein hewani',
        portionSize: 250,
        totalPortions: 450,
        packagingType: 'LUNCH_BOX',
        packagingCost: 2000,
        deliveryMethod: 'DELIVERY',
        distributionTeam: [distributor.id, ...drivers.slice(0, 2).map(d => d.id)],
        vehicleCount: 2,
        estimatedTravelTime: 120,
        fuelCost: 150000,
        status: 'COMPLETED',
        startedAt: subDays(new Date(), 7),
        completedAt: addHours(subDays(new Date(), 7), 3),
      }
    }))

    // Schedule 2: In Progress (today) - MIDDAY
    schedules.push(await prisma.distributionSchedule.create({
      data: {
        sppgId: sppg.id,
        distributionDate: new Date(),
        wave: 'MIDDAY',
        targetCategories: ['ELEMENTARY_GRADE_1_3'],
        estimatedBeneficiaries: 300,
        menuName: menus[1]?.menuName || 'Nasi Ayam Geprek + Sayur',
        menuDescription: 'Menu favorit anak-anak',
        portionSize: 250,
        totalPortions: 300,
        packagingType: 'STYROFOAM',
        packagingCost: 1500,
        deliveryMethod: 'DELIVERY',
        distributionTeam: [distributor.id, drivers[0].id],
        vehicleCount: 1,
        estimatedTravelTime: 90,
        fuelCost: 100000,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      }
    }))

    // Schedule 3: Planned (tomorrow) - MORNING
    schedules.push(await prisma.distributionSchedule.create({
      data: {
        sppgId: sppg.id,
        distributionDate: addDays(new Date(), 1),
        wave: 'MORNING',
        targetCategories: ['TODDLER', 'EARLY_CHILDHOOD'],
        estimatedBeneficiaries: 200,
        menuName: menus[2]?.menuName || 'Bubur Kacang Hijau',
        menuDescription: 'Menu khusus balita dan anak usia dini',
        portionSize: 150,
        totalPortions: 200,
        packagingType: 'PLASTIC_CUP',
        packagingCost: 1000,
        deliveryMethod: 'DELIVERY',
        distributionTeam: [distributor.id],
        vehicleCount: 1,
        estimatedTravelTime: 60,
        fuelCost: 75000,
        status: 'PLANNED',
      }
    }))

    // Schedule 4: Scheduled (next week) - MORNING
    schedules.push(await prisma.distributionSchedule.create({
      data: {
        sppgId: sppg.id,
        distributionDate: addDays(new Date(), 7),
        wave: 'MORNING',
        targetCategories: ['ELEMENTARY_GRADE_1_3', 'JUNIOR_HIGH'],
        estimatedBeneficiaries: 500,
        menuName: menus[3]?.menuName || 'Nasi Rendang + Sayur Asem',
        menuDescription: 'Menu spesial akhir pekan',
        portionSize: 300,
        totalPortions: 500,
        packagingType: 'LUNCH_BOX',
        packagingCost: 2500,
        deliveryMethod: 'DELIVERY',
        distributionTeam: [distributor.id, ...drivers.map(d => d.id)],
        vehicleCount: 3,
        estimatedTravelTime: 150,
        fuelCost: 200000,
        status: 'PLANNED',
      }
    }))

    console.log(`  ✅ Created ${schedules.length} DistributionSchedule entities`)

    // ========================================================================
    // STEP 3: Create FoodDistribution (PHASE 2)
    // ========================================================================
    
    console.log('  → Creating FoodDistribution executions...')

    const distributions = []

    // Distribution 1: COMPLETED (linked to Schedule 1)
    distributions.push(await prisma.foodDistribution.create({
      data: {
        sppgId: sppg.id,
        programId: sppgPrograms[0].id,
        scheduleId: schedules[0].id,
        distributionDate: subDays(new Date(), 7),
        distributionCode: `DIST-${sppg.code}-${format(subDays(new Date(), 7), 'yyyyMMdd')}-001`,
        mealType: 'MAKAN_SIANG',
        distributionPoint: 'SDN Purwakarta 1',
        address: 'Jl. Veteran No. 123, Purwakarta',
        coordinates: '-6.5467,107.4333',
        plannedRecipients: 150,
        actualRecipients: 148,
        plannedStartTime: subDays(new Date(), 7),
        plannedEndTime: addHours(subDays(new Date(), 7), 2),
        distributorId: distributor.id,
        driverId: drivers[0].id,
        volunteers: [drivers[1].name],
        distributionMethod: 'DELIVERY',
        vehicleType: vehicles[0]?.vehicleType || 'MOBIL',
        vehiclePlate: vehicles[0]?.licensePlate || 'D-1234-ABC',
        menuItems: {
          [menus[0]?.id || 'menu1']: {
            name: menus[0]?.menuName || 'Nasi Gudeg',
            portions: 150
          }
        },
        totalPortions: 150,
        portionSize: 250,
        departureTemp: 75.5,
        arrivalTemp: 68.2,
        servingTemp: 65.0,
        status: 'COMPLETED',
        actualStartTime: subDays(new Date(), 7),
        actualEndTime: addHours(subDays(new Date(), 7), 2.5),
        departureTime: addMinutes(subDays(new Date(), 7), 15),
        arrivalTime: addMinutes(subDays(new Date(), 7), 75),
        completionTime: addMinutes(subDays(new Date(), 7), 150),
        foodQuality: 'EXCELLENT',
        hygieneScore: 95,
        packagingCondition: 'BAIK',
        weatherCondition: 'CERAH',
        temperature: 28.5,
        humidity: 65,
        notes: 'Distribusi berjalan lancar, semua makanan dalam kondisi baik',
        totalBeneficiariesReached: 148,
        totalPortionsDelivered: 148,
      }
    }))

    // Distribution 2: IN_TRANSIT (linked to Schedule 2)
    distributions.push(await prisma.foodDistribution.create({
      data: {
        sppgId: sppg.id,
        programId: sppgPrograms[0].id,
        scheduleId: schedules[1].id,
        distributionDate: new Date(),
        distributionCode: `DIST-${sppg.code}-${format(new Date(), 'yyyyMMdd')}-002`,
        mealType: 'MAKAN_SIANG',
        distributionPoint: 'SDN Purwakarta 2',
        address: 'Jl. Raya Sadang No. 45, Purwakarta',
        coordinates: '-6.5478,107.4345',
        plannedRecipients: 100,
        plannedStartTime: new Date(),
        plannedEndTime: addHours(new Date(), 2),
        distributorId: distributor.id,
        driverId: drivers[1].id,
        volunteers: [],
        distributionMethod: 'DELIVERY',
        vehicleType: vehicles[1]?.vehicleType || 'TRUCK',
        vehiclePlate: vehicles[1]?.licensePlate || 'D-5678-XYZ',
        menuItems: {
          [menus[1]?.id || 'menu2']: {
            name: menus[1]?.menuName || 'Nasi Ayam',
            portions: 100
          }
        },
        totalPortions: 100,
        portionSize: 250,
        departureTemp: 76.0,
        status: 'IN_TRANSIT',
        actualStartTime: new Date(),
        departureTime: addMinutes(new Date(), 10),
      }
    }))

    // Distribution 3: DISTRIBUTING (linked to Schedule 2)
    distributions.push(await prisma.foodDistribution.create({
      data: {
        sppgId: sppg.id,
        programId: sppgPrograms[0].id,
        scheduleId: schedules[1].id,
        distributionDate: new Date(),
        distributionCode: `DIST-${sppg.code}-${format(new Date(), 'yyyyMMdd')}-003`,
        mealType: 'SNACK_PAGI',
        distributionPoint: 'TK Pembina Purwakarta',
        address: 'Jl. Kartini No. 12, Purwakarta',
        coordinates: '-6.5489,107.4356',
        plannedRecipients: 80,
        plannedStartTime: addHours(new Date(), -1),
        plannedEndTime: addHours(new Date(), 1),
        distributorId: distributor.id,
        driverId: drivers[2].id,
        volunteers: [],
        distributionMethod: 'PICKUP',
        menuItems: {
          [menus[2]?.id || 'menu3']: {
            name: menus[2]?.menuName || 'Bubur Kacang',
            portions: 80
          }
        },
        totalPortions: 80,
        portionSize: 150,
        departureTemp: 72.0,
        arrivalTemp: 68.5,
        status: 'DISTRIBUTING',
        actualStartTime: addHours(new Date(), -1),
        departureTime: addMinutes(new Date(), -50),
        arrivalTime: addMinutes(new Date(), -10),
      }
    }))

    // Distribution 4: SCHEDULED (linked to Schedule 3)
    distributions.push(await prisma.foodDistribution.create({
      data: {
        sppgId: sppg.id,
        programId: sppgPrograms[0].id,
        scheduleId: schedules[2].id,
        distributionDate: addDays(new Date(), 1),
        distributionCode: `DIST-${sppg.code}-${format(addDays(new Date(), 1), 'yyyyMMdd')}-004`,
        mealType: 'SARAPAN',
        distributionPoint: 'PAUD Ceria',
        address: 'Jl. Merdeka No. 67, Purwakarta',
        coordinates: '-6.5501,107.4367',
        plannedRecipients: 60,
        plannedStartTime: addDays(new Date(), 1),
        plannedEndTime: addDays(addHours(new Date(), 2), 1),
        distributorId: distributor.id,
        distributionMethod: 'DELIVERY',
        vehicleType: 'MOTOR',
        menuItems: {
          [menus[3]?.id || 'menu4']: {
            name: menus[3]?.menuName || 'Nasi Uduk',
            portions: 60
          }
        },
        totalPortions: 60,
        portionSize: 200,
        status: 'SCHEDULED',
      }
    }))

    // Distribution 5: PREPARING
    distributions.push(await prisma.foodDistribution.create({
      data: {
        sppgId: sppg.id,
        programId: sppgPrograms[0].id,
        scheduleId: schedules[1].id,
        distributionDate: new Date(),
        distributionCode: `DIST-${sppg.code}-${format(new Date(), 'yyyyMMdd')}-005`,
        mealType: 'MAKAN_SIANG',
        distributionPoint: 'SDN Purwakarta 3',
        address: 'Jl. Siliwangi No. 88, Purwakarta',
        coordinates: '-6.5512,107.4378',
        plannedRecipients: 120,
        plannedStartTime: addHours(new Date(), 2),
        plannedEndTime: addHours(new Date(), 4),
        distributorId: distributor.id,
        distributionMethod: 'DELIVERY',
        vehicleType: 'MOBIL',
        menuItems: {
          [menus[4]?.id || 'menu5']: {
            name: menus[4]?.menuName || 'Nasi Goreng',
            portions: 120
          }
        },
        totalPortions: 120,
        portionSize: 250,
        status: 'PREPARING',
      }
    }))

    console.log(`  ✅ Created ${distributions.length} FoodDistribution entities`)

    // ========================================================================
    // STEP 4: Create DistributionDelivery (PHASE 3) with GPS
    // ========================================================================
    
    console.log('  → Creating DistributionDelivery with GPS tracking...')

    const deliveries = []

    // Delivery 1: DELIVERED (for Distribution 1)
    if (schools[0]) {
      deliveries.push(await prisma.distributionDelivery.create({
        data: {
          scheduleId: schedules[0].id,
          distributionId: distributions[0].id,
          schoolBeneficiaryId: schools[0].id,
          targetType: 'SCHOOL',
          targetName: schools[0].schoolName,
          targetAddress: schools[0].schoolAddress,
          targetContact: schools[0].contactPhone,
          estimatedArrival: addMinutes(subDays(new Date(), 7), 60),
          actualArrival: addMinutes(subDays(new Date(), 7), 65),
          plannedTime: addMinutes(subDays(new Date(), 7), 60),
          actualTime: addMinutes(subDays(new Date(), 7), 65),
          departureTime: addMinutes(subDays(new Date(), 7), 15),
          arrivalTime: addMinutes(subDays(new Date(), 7), 65),
          deliveryCompletedAt: addMinutes(subDays(new Date(), 7), 75),
          plannedRoute: 'Rute A: SPPG → Jl. Veteran → SDN Purwakarta 1',
          actualRoute: 'Rute A (sesuai rencana)',
          estimatedTime: 50,
          departureLocation: '-6.5456,107.4323',
          arrivalLocation: '-6.5467,107.4333',
          currentLocation: '-6.5467,107.4333',
          routeTrackingPoints: [
            '-6.5456,107.4323',
            '-6.5460,107.4328',
            '-6.5463,107.4330',
            '-6.5467,107.4333'
          ],
          portionsDelivered: 50,
          portionsPlanned: 50,
          driverName: drivers[0].name,
          helperNames: [drivers[1].name],
          vehicleInfo: `${vehicles[0]?.vehicleName || 'Toyota Avanza'} (${vehicles[0]?.licensePlate || 'D-1234-ABC'})`,
          status: 'DELIVERED',
          deliveredBy: drivers[0].id,
          deliveredAt: addMinutes(subDays(new Date(), 7), 75),
          recipientName: 'Pak Budi (Kepala Sekolah)',
          recipientTitle: 'Kepala Sekolah',
          recipientSignature: '/uploads/signatures/sign-001.png',
          deliveryNotes: 'Makanan diterima dalam kondisi baik, suhu optimal',
          foodQualityChecked: true,
          foodQualityNotes: 'Suhu 65°C, kemasan rapi, tidak ada kebocoran',
          foodTemperature: 65.0,
        }
      }))
    }

    // Delivery 2: EN_ROUTE (for Distribution 2)
    if (schools[1]) {
      deliveries.push(await prisma.distributionDelivery.create({
        data: {
          scheduleId: schedules[1].id,
          distributionId: distributions[1].id,
          schoolBeneficiaryId: schools[1].id,
          targetType: 'SCHOOL',
          targetName: schools[1].schoolName,
          targetAddress: schools[1].schoolAddress,
          targetContact: schools[1].contactPhone,
          estimatedArrival: addMinutes(new Date(), 30),
          plannedTime: addMinutes(new Date(), 30),
          departureTime: addMinutes(new Date(), -20),
          plannedRoute: 'Rute B: SPPG → Jl. Raya Sadang → SDN Purwakarta 2',
          estimatedTime: 50,
          departureLocation: '-6.5456,107.4323',
          currentLocation: '-6.5470,107.4340',
          routeTrackingPoints: [
            '-6.5456,107.4323',
            '-6.5465,107.4335',
            '-6.5470,107.4340',
          ],
          portionsPlanned: 50,
          portionsDelivered: 0,
          driverName: drivers[1].name,
          helperNames: [],
          vehicleInfo: `${vehicles[1]?.vehicleName || 'Isuzu Elf'} (${vehicles[1]?.licensePlate || 'D-5678-XYZ'})`,
          status: 'DEPARTED',
          foodQualityChecked: true,
          foodTemperature: 70.0,
        }
      }))
    }

    // Delivery 3: ASSIGNED (for Distribution 3)
    if (schools[2]) {
      deliveries.push(await prisma.distributionDelivery.create({
        data: {
          scheduleId: schedules[1].id,
          distributionId: distributions[2].id,
          schoolBeneficiaryId: schools[2].id,
          targetType: 'SCHOOL',
          targetName: schools[2].schoolName,
          targetAddress: schools[2].schoolAddress,
          targetContact: schools[2].contactPhone,
          estimatedArrival: addHours(new Date(), 1),
          plannedTime: addHours(new Date(), 1),
          plannedRoute: 'Rute C: SPPG → Jl. Kartini → TK Pembina',
          estimatedTime: 40,
          departureLocation: '-6.5456,107.4323',
          portionsPlanned: 30,
          portionsDelivered: 0,
          driverName: drivers[2].name,
          helperNames: [],
          vehicleInfo: 'Pickup (tidak menggunakan kendaraan SPPG)',
          status: 'ASSIGNED',
        }
      }))
    }

    console.log(`  ✅ Created ${deliveries.length} DistributionDelivery entities`)

    // ========================================================================
    // STEP 5: Create VehicleAssignment
    // ========================================================================
    
    console.log('  → Creating VehicleAssignment...')

    const assignments = []

    if (vehicles[0]) {
      assignments.push(await prisma.vehicleAssignment.create({
        data: {
          scheduleId: schedules[0].id,
          distributionId: distributions[0].id,
          vehicleId: vehicles[0].id,
          sppgId: sppg.id,
          driverId: drivers[0].id,
          helpers: [drivers[1].id],
          assignedDate: subDays(new Date(), 7),
          startTime: addMinutes(subDays(new Date(), 7), 15),
          endTime: addMinutes(subDays(new Date(), 7), 150),
          startLocation: '-6.5456,107.4323',
          endLocation: '-6.5467,107.4333',
          startMileage: 15000,
          endMileage: 15035,
          fuelUsed: 3.5,
          fuelCost: 35000,
          status: 'COMPLETED',
        }
      }))
    }

    if (vehicles[1]) {
      assignments.push(await prisma.vehicleAssignment.create({
        data: {
          scheduleId: schedules[1].id,
          distributionId: distributions[1].id,
          vehicleId: vehicles[1].id,
          sppgId: sppg.id,
          driverId: drivers[1].id,
          helpers: [],
          assignedDate: new Date(),
          startTime: addMinutes(new Date(), -20),
          startLocation: '-6.5456,107.4323',
          endLocation: '-6.5470,107.4340',
          startMileage: 8500,
          status: 'IN_USE',
        }
      }))
    }

    console.log(`  ✅ Created ${assignments.length} VehicleAssignment entities`)

    // ========================================================================
    // STEP 6: Create DeliveryPhoto (PHASE 3)
    // ========================================================================
    
    console.log('  → Creating DeliveryPhoto...')

    const photos = []

    if (deliveries[0]) {
      photos.push(await prisma.deliveryPhoto.create({
        data: {
          deliveryId: deliveries[0].id,
          photoUrl: '/uploads/delivery/food-package-001.jpg',
          photoType: 'FOOD_QUALITY',
          caption: 'Kemasan makanan siap distribusi',
          locationTaken: '-6.5456,107.4323',
          fileSize: 245678,
          mimeType: 'image/jpeg',
          takenAt: addMinutes(subDays(new Date(), 7), 10),
        }
      }))

      photos.push(await prisma.deliveryPhoto.create({
        data: {
          deliveryId: deliveries[0].id,
          photoUrl: '/uploads/delivery/delivery-001.jpg',
          photoType: 'DELIVERY_PROOF',
          caption: 'Penyerahan makanan ke sekolah',
          locationTaken: '-6.5467,107.4333',
          fileSize: 312456,
          mimeType: 'image/jpeg',
          takenAt: addMinutes(subDays(new Date(), 7), 70),
        }
      }))

      photos.push(await prisma.deliveryPhoto.create({
        data: {
          deliveryId: deliveries[0].id,
          photoUrl: '/uploads/delivery/recipient-001.jpg',
          photoType: 'RECIPIENT',
          caption: 'Foto bersama kepala sekolah',
          locationTaken: '-6.5467,107.4333',
          fileSize: 298765,
          mimeType: 'image/jpeg',
          takenAt: addMinutes(subDays(new Date(), 7), 75),
        }
      }))
    }

    console.log(`  ✅ Created ${photos.length} DeliveryPhoto entities`)

    // ========================================================================
    // STEP 7: Create DeliveryTracking (GPS Trail - PHASE 3)
    // ========================================================================
    
    console.log('  → Creating DeliveryTracking (GPS trail)...')

    const trackingPoints = []

    if (deliveries[0]) {
      const baseTime = subDays(new Date(), 7)
      
      trackingPoints.push(await prisma.deliveryTracking.create({
        data: {
          deliveryId: deliveries[0].id,
          latitude: -6.5456,
          longitude: 107.4323,
          accuracy: 5.0,
          recordedAt: addMinutes(baseTime, 15),
          status: 'DEPARTED',
        }
      }))

      trackingPoints.push(await prisma.deliveryTracking.create({
        data: {
          deliveryId: deliveries[0].id,
          latitude: -6.5460,
          longitude: 107.4328,
          accuracy: 8.0,
          recordedAt: addMinutes(baseTime, 30),
          status: 'DEPARTED',
        }
      }))

      trackingPoints.push(await prisma.deliveryTracking.create({
        data: {
          deliveryId: deliveries[0].id,
          latitude: -6.5463,
          longitude: 107.4330,
          accuracy: 6.0,
          recordedAt: addMinutes(baseTime, 50),
          status: 'DEPARTED',
        }
      }))

      trackingPoints.push(await prisma.deliveryTracking.create({
        data: {
          deliveryId: deliveries[0].id,
          latitude: -6.5467,
          longitude: 107.4333,
          accuracy: 4.0,
          recordedAt: addMinutes(baseTime, 65),
          status: 'ARRIVED',
        }
      }))

      trackingPoints.push(await prisma.deliveryTracking.create({
        data: {
          deliveryId: deliveries[0].id,
          latitude: -6.5467,
          longitude: 107.4333,
          accuracy: 3.0,
          recordedAt: addMinutes(baseTime, 75),
          status: 'DELIVERED',
        }
      }))
    }

    if (deliveries[1]) {
      const baseTime = new Date()
      
      trackingPoints.push(await prisma.deliveryTracking.create({
        data: {
          deliveryId: deliveries[1].id,
          latitude: -6.5456,
          longitude: 107.4323,
          accuracy: 5.0,
          recordedAt: addMinutes(baseTime, -20),
          status: 'DEPARTED',
        }
      }))

      trackingPoints.push(await prisma.deliveryTracking.create({
        data: {
          deliveryId: deliveries[1].id,
          latitude: -6.5465,
          longitude: 107.4335,
          accuracy: 7.0,
          recordedAt: addMinutes(baseTime, -10),
          status: 'DEPARTED',
        }
      }))

      trackingPoints.push(await prisma.deliveryTracking.create({
        data: {
          deliveryId: deliveries[1].id,
          latitude: -6.5470,
          longitude: 107.4340,
          accuracy: 6.0,
          recordedAt: addMinutes(baseTime, -2),
          status: 'DEPARTED',
        }
      }))
    }

    console.log(`  ✅ Created ${trackingPoints.length} DeliveryTracking points`)

    // ========================================================================
    // STEP 8: Create DeliveryIssue (PHASE 3)
    // ========================================================================
    
    console.log('  → Creating DeliveryIssue...')

    const issues = []

    if (deliveries[1]) {
      issues.push(await prisma.deliveryIssue.create({
        data: {
          deliveryId: deliveries[1].id,
          issueType: 'TRAFFIC_JAM',
          severity: 'LOW',
          description: 'Kemacetan ringan di Jl. Raya Sadang',
          reportedAt: addMinutes(new Date(), -10),
        }
      }))
    }

    console.log(`  ✅ Created ${issues.length} DeliveryIssue entities`)

    // ========================================================================
    // STEP 9: Create BeneficiaryReceipt (PHASE 3)
    // ========================================================================
    
    console.log('  → Creating BeneficiaryReceipt...')

    const receipts = []

    if (deliveries[0] && schools[0]) {
      receipts.push(await prisma.beneficiaryReceipt.create({
        data: {
          sppgId: sppg.id,
          deliveryId: deliveries[0].id,
          receiptNumber: `RCP-${sppg.code}-${format(subDays(new Date(), 7), 'yyyyMMdd')}-001`,
          beneficiaryId: schools[0].id,
          beneficiaryName: schools[0].schoolName,
          beneficiaryCategory: 'ELEMENTARY_GRADE_1_3',
          schoolName: schools[0].schoolName,
          mealType: 'MAKAN_SIANG',
          menuName: menus[0]?.menuName || 'Nasi Gudeg Ayam',
          portionCount: 50,
          status: 'RECEIVED',
          receivedAt: addMinutes(subDays(new Date(), 7), 70),
          recipientSignature: '/uploads/signatures/sign-001.png',
          gpsLocation: schools[0].coordinates,
          feedback: 'Makanan diterima lengkap dan dalam kondisi baik',
        }
      }))
    }

    console.log(`  ✅ Created ${receipts.length} BeneficiaryReceipt entities`)

    // ========================================================================
    // Summary
    // ========================================================================

    console.log('')
    console.log('  📊 COMPREHENSIVE Distribution Seed Summary:')
    console.log(`     - DistributionSchedule (PHASE 1): ${schedules.length}`)
    console.log(`     - FoodDistribution (PHASE 2): ${distributions.length}`)
    console.log(`     - DistributionDelivery (PHASE 3): ${deliveries.length}`)
    console.log(`     - VehicleAssignment: ${assignments.length}`)
    console.log(`     - DeliveryPhoto: ${photos.length}`)
    console.log(`     - DeliveryTracking (GPS): ${trackingPoints.length}`)
    console.log(`     - DeliveryIssue: ${issues.length}`)
    console.log(`     - BeneficiaryReceipt: ${receipts.length}`)
    console.log(`  ✅ ALL DISTRIBUTION PHASES SEEDED!`)

  } catch (error) {
    console.error('  ❌ Error seeding distribution:', error)
    throw error
  }
}
