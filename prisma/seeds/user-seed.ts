/**
 * @fileoverview Demo Users 2025 - Complete role coverage for testing
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @description Comprehensive demo accounts for all roles and permissions
 */

import { PrismaClient, User, SPPG } from '@prisma/client'
import { hash } from 'bcryptjs'

export async function seedDemoUsers2025(prisma: PrismaClient, sppgs: SPPG[]): Promise<User[]> {
  console.log('  → Creating comprehensive demo users (2025)...')

  const demoSppg = sppgs.find(s => s.code === 'DEMO-2025')
  
  if (!demoSppg) {
    throw new Error('Demo SPPG not found. Please run seedSppg first.')
  }

  // Default password untuk semua demo accounts
  const demoPassword = await hash('demo2025', 10)

  const users = await Promise.all([
    // ========================================
    // PLATFORM LEVEL USERS (No SPPG Assignment)
    // ========================================
    
    prisma.user.upsert({
      where: { email: 'superadmin@bagizi.id' },
      update: {},
      create: {
        email: 'superadmin@bagizi.id',
        name: 'Super Administrator',
        password: demoPassword,
        userRole: 'PLATFORM_SUPERADMIN',
        userType: 'SUPERADMIN',
        isActive: true,
        emailVerified: new Date(),
        sppgId: null, // Platform admin tidak terikat SPPG
        phone: '081-SUPERADMIN',
        timezone: 'WIB'
      }
    }),

    prisma.user.upsert({
      where: { email: 'support@bagizi.id' },
      update: {},
      create: {
        email: 'support@bagizi.id',
        name: 'Platform Support',
        password: demoPassword,
        userRole: 'PLATFORM_SUPPORT',
        userType: 'SUPERADMIN',
        isActive: true,
        emailVerified: new Date(),
        sppgId: null,
        phone: '081-SUPPORT',
        timezone: 'WIB'
      }
    }),

    prisma.user.upsert({
      where: { email: 'analyst@bagizi.id' },
      update: {},
      create: {
        email: 'analyst@bagizi.id',
        name: 'Platform Analyst',
        password: demoPassword,
        userRole: 'PLATFORM_ANALYST',
        userType: 'SUPERADMIN',
        isActive: true,
        emailVerified: new Date(),
        sppgId: null,
        phone: '081-ANALYST',
        timezone: 'WIB'
      }
    }),

    // ========================================
    // SPPG MANAGEMENT LEVEL
    // ========================================
    
    prisma.user.upsert({
      where: { email: 'kepala@demo.sppg.id' },
      update: {},
      create: {
        email: 'kepala@demo.sppg.id',
        name: 'Dr. Budi Santoso, S.Gz., M.Si',
        password: demoPassword,
        userRole: 'SPPG_KEPALA',
        userType: 'SPPG_USER',
        isActive: true,
        emailVerified: new Date(),
        sppgId: demoSppg.id,
        phone: '081-KEPALA',
        timezone: 'WIB'
      }
    }),

    prisma.user.upsert({
      where: { email: 'admin@demo.sppg.id' },
      update: {},
      create: {
        email: 'admin@demo.sppg.id',
        name: 'Siti Rahayu, S.Kom',
        password: demoPassword,
        userRole: 'SPPG_ADMIN',
        userType: 'SPPG_ADMIN',
        isActive: true,
        emailVerified: new Date(),
        sppgId: demoSppg.id,
        phone: '081-ADMIN',
        timezone: 'WIB'
      }
    }),

    // ========================================
    // SPPG OPERATIONAL STAFF
    // ========================================
    
    prisma.user.upsert({
      where: { email: 'ahligizi@demo.sppg.id' },
      update: {},
      create: {
        email: 'ahligizi@demo.sppg.id',
        name: 'Dr. Maya Sari, S.Gz., RD',
        password: demoPassword,
        userRole: 'SPPG_AHLI_GIZI',
        userType: 'SPPG_USER',
        isActive: true,
        emailVerified: new Date(),
        sppgId: demoSppg.id,
        phone: '081-AHLIGIZI',
        timezone: 'WIB'
      }
    }),

    prisma.user.upsert({
      where: { email: 'akuntan@demo.sppg.id' },
      update: {},
      create: {
        email: 'akuntan@demo.sppg.id',
        name: 'Rina Wijaya, S.E., Ak',
        password: demoPassword,
        userRole: 'SPPG_AKUNTAN',
        userType: 'SPPG_USER',
        isActive: true,
        emailVerified: new Date(),
        sppgId: demoSppg.id,
        phone: '081-AKUNTAN',
        timezone: 'WIB'
      }
    }),

    prisma.user.upsert({
      where: { email: 'produksi@demo.sppg.id' },
      update: {},
      create: {
        email: 'produksi@demo.sppg.id',
        name: 'Agus Setiawan',
        password: demoPassword,
        userRole: 'SPPG_PRODUKSI_MANAGER',
        userType: 'SPPG_USER',
        isActive: true,
        emailVerified: new Date(),
        sppgId: demoSppg.id,
        phone: '081-PRODUKSI',
        timezone: 'WIB'
      }
    }),

    prisma.user.upsert({
      where: { email: 'distribusi@demo.sppg.id' },
      update: {},
      create: {
        email: 'distribusi@demo.sppg.id',
        name: 'Dedi Kurniawan',
        password: demoPassword,
        userRole: 'SPPG_DISTRIBUSI_MANAGER',
        userType: 'SPPG_USER',
        isActive: true,
        emailVerified: new Date(),
        sppgId: demoSppg.id,
        phone: '081-DISTRIBUSI',
        timezone: 'WIB'
      }
    }),

    prisma.user.upsert({
      where: { email: 'hrd@demo.sppg.id' },
      update: {},
      create: {
        email: 'hrd@demo.sppg.id',
        name: 'Lina Kusuma, S.Psi',
        password: demoPassword,
        userRole: 'SPPG_HRD_MANAGER',
        userType: 'SPPG_USER',
        isActive: true,
        emailVerified: new Date(),
        sppgId: demoSppg.id,
        phone: '081-HRD',
        timezone: 'WIB'
      }
    }),

    // ========================================
    // SPPG STAFF LEVEL
    // ========================================
    
    prisma.user.upsert({
      where: { email: 'dapur@demo.sppg.id' },
      update: {},
      create: {
        email: 'dapur@demo.sppg.id',
        name: 'Pak Joko - Staff Dapur',
        password: demoPassword,
        userRole: 'SPPG_STAFF_DAPUR',
        userType: 'SPPG_USER',
        isActive: true,
        emailVerified: new Date(),
        sppgId: demoSppg.id,
        phone: '081-DAPUR',
        timezone: 'WIB'
      }
    }),

    prisma.user.upsert({
      where: { email: 'kurir@demo.sppg.id' },
      update: {},
      create: {
        email: 'kurir@demo.sppg.id',
        name: 'Pak Andi - Staff Distribusi',
        password: demoPassword,
        userRole: 'SPPG_STAFF_DISTRIBUSI',
        userType: 'SPPG_USER',
        isActive: true,
        emailVerified: new Date(),
        sppgId: demoSppg.id,
        phone: '081-KURIR',
        timezone: 'WIB'
      }
    }),

    prisma.user.upsert({
      where: { email: 'kurir2@demo.sppg.id' },
      update: {},
      create: {
        email: 'kurir2@demo.sppg.id',
        name: 'Pak Budi - Staff Distribusi',
        password: demoPassword,
        userRole: 'SPPG_STAFF_DISTRIBUSI',
        userType: 'SPPG_USER',
        isActive: true,
        emailVerified: new Date(),
        sppgId: demoSppg.id,
        phone: '081-KURIR2',
        timezone: 'WIB'
      }
    }),

    prisma.user.upsert({
      where: { email: 'adminstaff@demo.sppg.id' },
      update: {},
      create: {
        email: 'adminstaff@demo.sppg.id',
        name: 'Bu Ani - Staff Admin',
        password: demoPassword,
        userRole: 'SPPG_STAFF_ADMIN',
        userType: 'SPPG_USER',
        isActive: true,
        emailVerified: new Date(),
        sppgId: demoSppg.id,
        phone: '081-STAFFADMIN',
        timezone: 'WIB'
      }
    }),

    prisma.user.upsert({
      where: { email: 'qc@demo.sppg.id' },
      update: {},
      create: {
        email: 'qc@demo.sppg.id',
        name: 'Ibu Ratna - Quality Control',
        password: demoPassword,
        userRole: 'SPPG_STAFF_QC',
        userType: 'SPPG_USER',
        isActive: true,
        emailVerified: new Date(),
        sppgId: demoSppg.id,
        phone: '081-QC',
        timezone: 'WIB'
      }
    }),

    // ========================================
    // LIMITED ACCESS
    // ========================================
    
    prisma.user.upsert({
      where: { email: 'viewer@demo.sppg.id' },
      update: {},
      create: {
        email: 'viewer@demo.sppg.id',
        name: 'Guest Viewer - Read Only',
        password: demoPassword,
        userRole: 'SPPG_VIEWER',
        userType: 'SPPG_USER',
        isActive: true,
        emailVerified: new Date(),
        sppgId: demoSppg.id,
        phone: '081-VIEWER',
        timezone: 'WIB'
      }
    }),

    prisma.user.upsert({
      where: { email: 'demo@demo.sppg.id' },
      update: {},
      create: {
        email: 'demo@demo.sppg.id',
        name: 'Demo User - Trial Account',
        password: demoPassword,
        userRole: 'DEMO_USER',
        userType: 'DEMO_REQUEST',
        isActive: true,
        emailVerified: new Date(),
        sppgId: demoSppg.id,
        phone: '081-DEMO',
        timezone: 'WIB'
      }
    })
  ])

  console.log(`  ✓ Created ${users.length} comprehensive demo users for 2025`)
  console.log(`\n  📋 Demo Accounts Summary:`)
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`  🔐 Password untuk semua akun: demo2025`)
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`  \n  🌐 PLATFORM LEVEL:`)
  console.log(`     • superadmin@bagizi.id     - PLATFORM_SUPERADMIN`)
  console.log(`     • support@bagizi.id        - PLATFORM_SUPPORT`)
  console.log(`     • analyst@bagizi.id        - PLATFORM_ANALYST`)
  console.log(`  \n  👑 SPPG MANAGEMENT:`)
  console.log(`     • kepala@demo.sppg.id      - SPPG_KEPALA (Full Access)`)
  console.log(`     • admin@demo.sppg.id       - SPPG_ADMIN`)
  console.log(`  \n  💼 SPPG OPERATIONAL:`)
  console.log(`     • ahligizi@demo.sppg.id    - SPPG_AHLI_GIZI`)
  console.log(`     • akuntan@demo.sppg.id     - SPPG_AKUNTAN`)
  console.log(`     • produksi@demo.sppg.id    - SPPG_PRODUKSI_MANAGER`)
  console.log(`     • distribusi@demo.sppg.id  - SPPG_DISTRIBUSI_MANAGER`)
  console.log(`     • hrd@demo.sppg.id         - SPPG_HRD_MANAGER`)
  console.log(`  \n  👷 SPPG STAFF:`)
  console.log(`     • dapur@demo.sppg.id       - SPPG_STAFF_DAPUR`)
  console.log(`     • kurir@demo.sppg.id       - SPPG_STAFF_DISTRIBUSI`)
  console.log(`     • kurir2@demo.sppg.id      - SPPG_STAFF_DISTRIBUSI`)
  console.log(`     • adminstaff@demo.sppg.id  - SPPG_STAFF_ADMIN`)
  console.log(`     • qc@demo.sppg.id          - SPPG_STAFF_QC`)
  console.log(`  \n  👁️  LIMITED ACCESS:`)
  console.log(`     • viewer@demo.sppg.id      - SPPG_VIEWER (Read Only)`)
  console.log(`     • demo@demo.sppg.id        - DEMO_USER (Trial)`)
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  return users
}
