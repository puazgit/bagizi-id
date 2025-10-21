/**
 * @fileoverview Vehicle Seed Data
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * Seeds vehicles for SPPG operations including:
 * - Distribution vehicles (trucks, vans, motorcycles)
 * - Vehicle specifications and capacity
 * - Ownership and registration details
 */

import { PrismaClient } from '@prisma/client'

export async function seedVehicles(
  prisma: PrismaClient,
  sppgs: { id: string; name: string; code: string }[]
): Promise<void> {
  console.log('  → Creating vehicles for SPPG operations...')

  try {
    const sppg = sppgs.find(s => s.code === 'DEMO-SPPG-001')
    if (!sppg) {
      console.log('  ⚠️  SPPG Purwakarta not found, skipping vehicle seed')
      return
    }

    // Clear existing vehicles for this SPPG first
    await prisma.vehicle.deleteMany({
      where: { sppgId: sppg.id }
    })

    const vehicles = []

    // Vehicle 1: Isuzu Elf - Main Distribution Truck
    vehicles.push(await prisma.vehicle.create({
      data: {
        sppgId: sppg.id,
        vehicleName: 'Isuzu Elf - Distribusi Utama',
        vehicleType: 'TRUCK',
        vehicleBrand: 'Isuzu',
        vehicleModel: 'Elf NMR 71',
        vehicleYear: 2020,
        vehicleColor: 'Putih',
        licensePlate: 'D-1234-ABC',
        registrationNo: 'REG-2020-001',
        registeredDate: new Date('2020-01-15'),
        expirationDate: new Date('2025-01-15'),
        taxExpiryDate: new Date('2025-06-30'),
        ownership: 'OWNED',
        purchaseDate: new Date('2020-01-10'),
        purchasePrice: 350000000,
        capacity: 500,
        cargoCapacity: 3000,
        status: 'AVAILABLE',
        fuelType: 'SOLAR',
        fuelTankSize: 100,
        fuelEfficiency: 8.5,
        currentMileage: 45000,
        currentLocation: 'Depot SPPG Purwakarta',
        lastServiceDate: new Date('2024-09-01'),
        nextServiceDate: new Date('2025-03-01'),
        lastServiceMileage: 45000,
        serviceIntervalKm: 5000,
        serviceIntervalDays: 180,
        insuranceProvider: 'Asuransi Astra',
        insurancePolicyNo: 'AST-2024-VEH-001',
        insuranceExpiry: new Date('2025-01-15'),
        insuranceCost: 15000000,
        notes: 'Kendaraan utama untuk distribusi makanan ke sekolah-sekolah',
        isActive: true,
      },
    }))

    // Vehicle 2: Toyota Hiace - Medium Van for Secondary Distribution
    vehicles.push(await prisma.vehicle.create({
      data: {
        sppgId: sppg.id,
        vehicleName: 'Toyota Hiace - Distribusi Sekunder',
        vehicleType: 'VAN',
        vehicleBrand: 'Toyota',
        vehicleModel: 'Hiace Commuter',
        vehicleYear: 2019,
        vehicleColor: 'Silver',
        licensePlate: 'D-5678-XYZ',
        registrationNo: 'REG-2019-002',
        registeredDate: new Date('2019-08-20'),
        expirationDate: new Date('2025-09-30'),
        taxExpiryDate: new Date('2025-02-28'),
        ownership: 'OWNED',
        purchaseDate: new Date('2019-08-15'),
        purchasePrice: 285000000,
        capacity: 300,
        cargoCapacity: 1200,
        passengerSeats: 15,
        status: 'AVAILABLE',
        fuelType: 'BENSIN',
        fuelTankSize: 70,
        fuelEfficiency: 10.2,
        currentMileage: 58000,
        currentLocation: 'Depot SPPG Purwakarta',
        lastServiceDate: new Date('2024-09-15'),
        nextServiceDate: new Date('2025-03-15'),
        lastServiceMileage: 58000,
        serviceIntervalKm: 5000,
        serviceIntervalDays: 180,
        insuranceProvider: 'Asuransi ACA',
        insurancePolicyNo: 'ACA-2024-VEH-002',
        insuranceExpiry: new Date('2025-10-31'),
        insuranceCost: 12000000,
        notes: 'Kendaraan untuk distribusi menengah ke sekolah-sekolah terdekat',
        isActive: true,
      }
    }))

    // Vehicle 3: Daihatsu Gran Max - Pickup for Local Distribution
    vehicles.push(await prisma.vehicle.create({
      data: {
        sppgId: sppg.id,
        vehicleName: 'Daihatsu Gran Max - Distribusi Lokal',
        vehicleType: 'PICKUP',
        vehicleBrand: 'Daihatsu',
        vehicleModel: 'Gran Max PU',
        vehicleYear: 2021,
        vehicleColor: 'Biru',
        licensePlate: 'D-3456-HIJ',
        registrationNo: 'REG-2021-003',
        registeredDate: new Date('2021-03-10'),
        expirationDate: new Date('2025-08-31'),
        taxExpiryDate: new Date('2025-01-31'),
        ownership: 'OWNED',
        purchaseDate: new Date('2021-03-05'),
        purchasePrice: 165000000,
        capacity: 200,
        cargoCapacity: 900,
        status: 'AVAILABLE',
        fuelType: 'BENSIN',
        fuelTankSize: 43,
        fuelEfficiency: 12.5,
        currentMileage: 32000,
        currentLocation: 'Depot SPPG Purwakarta',
        lastServiceDate: new Date('2024-08-20'),
        nextServiceDate: new Date('2025-02-20'),
        lastServiceMileage: 32000,
        serviceIntervalKm: 5000,
        serviceIntervalDays: 180,
        insuranceProvider: 'Asuransi Jasindo',
        insurancePolicyNo: 'JAS-2024-VEH-003',
        insuranceExpiry: new Date('2025-09-30'),
        insuranceCost: 8000000,
        notes: 'Pickup untuk distribusi lokal area Purwakarta',
        isActive: true,
      }
    }))

    // Vehicle 4: Honda Supra - Motorcycle for Express Delivery
    vehicles.push(await prisma.vehicle.create({
      data: {
        sppgId: sppg.id,
        vehicleName: 'Honda Supra - Pengiriman Cepat',
        vehicleType: 'MOTOR',
        vehicleBrand: 'Honda',
        vehicleModel: 'Supra X 125',
        vehicleYear: 2022,
        vehicleColor: 'Merah',
        licensePlate: 'D-9012-EFG',
        registrationNo: 'REG-2022-004',
        registeredDate: new Date('2022-05-15'),
        expirationDate: new Date('2025-07-31'),
        taxExpiryDate: new Date('2024-12-31'),
        ownership: 'RENTED',
        rentalCost: 1500000,
        capacity: 50,
        status: 'AVAILABLE',
        fuelType: 'BENSIN',
        fuelTankSize: 4.2,
        fuelEfficiency: 45.0,
        currentMileage: 15000,
        currentLocation: 'Depot SPPG Purwakarta',
        lastServiceDate: new Date('2024-07-10'),
        nextServiceDate: new Date('2025-01-10'),
        lastServiceMileage: 15000,
        serviceIntervalKm: 3000,
        serviceIntervalDays: 180,
        insuranceProvider: 'Asuransi Astra',
        insurancePolicyNo: 'AST-2024-VEH-004',
        insuranceExpiry: new Date('2025-08-31'),
        insuranceCost: 3000000,
        notes: 'Motor untuk pengiriman cepat dan darurat dalam kota',
        isActive: true,
      }
    }))

    // Vehicle 5: Mitsubishi Colt - Backup Truck
    vehicles.push(await prisma.vehicle.create({
      data: {
        sppgId: sppg.id,
        vehicleName: 'Mitsubishi Colt - Cadangan',
        vehicleType: 'TRUCK',
        vehicleBrand: 'Mitsubishi',
        vehicleModel: 'Colt Diesel FE 74',
        vehicleYear: 2018,
        vehicleColor: 'Kuning',
        licensePlate: 'D-7890-KLM',
        registrationNo: 'REG-2018-005',
        registeredDate: new Date('2018-06-20'),
        expirationDate: new Date('2025-06-30'),
        taxExpiryDate: new Date('2024-11-30'),
        ownership: 'OWNED',
        purchaseDate: new Date('2018-06-15'),
        purchasePrice: 280000000,
        capacity: 400,
        cargoCapacity: 1800,
        status: 'MAINTENANCE',
        fuelType: 'SOLAR',
        fuelTankSize: 75,
        fuelEfficiency: 9.0,
        currentMileage: 78000,
        currentLocation: 'Workshop - Maintenance Rutin',
        lastServiceDate: new Date('2024-06-15'),
        nextServiceDate: new Date('2024-12-15'),
        lastServiceMileage: 78000,
        serviceIntervalKm: 5000,
        serviceIntervalDays: 180,
        insuranceProvider: 'Asuransi Mega',
        insurancePolicyNo: 'MEG-2024-VEH-005',
        insuranceExpiry: new Date('2025-07-31'),
        insuranceCost: 14000000,
        notes: 'Kendaraan cadangan, sedang maintenance rutin',
        isActive: true,
      }
    }))

    console.log(`  ✅ Created ${vehicles.length} vehicles for ${sppg.name}`)
    console.log(`     - AVAILABLE: ${vehicles.filter(v => v.status === 'AVAILABLE').length}`)
    console.log(`     - MAINTENANCE: ${vehicles.filter(v => v.status === 'MAINTENANCE').length}`)
    console.log(`     - Total capacity: ${vehicles.reduce((sum, v) => sum + (v.capacity || 0), 0)} portions`)

  } catch (error) {
    console.error('  ❌ Error seeding vehicles:', error)
    throw error
  }
}
