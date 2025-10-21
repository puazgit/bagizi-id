/**
 * @fileoverview User seeding dengan data regional Purwakarta
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 */

import { PrismaClient, User, SPPG } from '@prisma/client'
import { hash } from 'bcryptjs'

export async function seedUsers(prisma: PrismaClient, sppgs: SPPG[]): Promise<User[]> {
  console.log('  → Creating users...')

  const purwakartaSppg = sppgs.find(s => s.code === 'DEMO-SPPG-001')
  const demoPurwakartaSppg = sppgs.find(s => s.code === 'DEMO-PWK-001')

  const users = await Promise.all([
    // Platform Admin Users
    prisma.user.upsert({
      where: { email: 'admin@bagizi.id' },
      update: {},
      create: {
        email: 'admin@bagizi.id',
        name: 'Platform Administrator',
        password: await hash('admin123', 10),
        userRole: 'PLATFORM_SUPERADMIN',
        userType: 'SUPERADMIN',
        isActive: true,
        emailVerified: new Date(),
        sppgId: null, // Platform admin tidak terikat SPPG
      }
    }),

    prisma.user.upsert({
      where: { email: 'support@bagizi.id' },
      update: {},
      create: {
        email: 'support@bagizi.id',
        name: 'Platform Support',
        password: await hash('support123', 10),
        userRole: 'PLATFORM_SUPPORT',
        userType: 'SUPERADMIN',
        isActive: true,
        emailVerified: new Date(),
        sppgId: null,
      }
    }),

    // SPPG Purwakarta Users
    ...(purwakartaSppg ? [
      prisma.user.upsert({
        where: { email: 'kepala@sppg-purwakarta.com' },
        update: {},
        create: {
          email: 'kepala@sppg-purwakarta.com',
          name: 'Dra. Siti Nurjanah, M.M.',
          password: await hash('password123', 10),
          userRole: 'SPPG_KEPALA',
          userType: 'SPPG_ADMIN',
          isActive: true,
          emailVerified: new Date(),
          sppgId: purwakartaSppg.id,
          firstName: 'Siti',
          lastName: 'Nurjanah',
          jobTitle: 'Kepala SPPG',
          department: 'Manajemen SPPG',
          phone: '0264-200101',
          workPhone: '0264-200101',
          personalPhone: '08112345678',
          address: 'Jl. Kartini No. 15, Nagri Tengah, Purwakarta',
          timezone: 'Asia/Jakarta',
          language: 'id',
        }
      }),

      prisma.user.upsert({
        where: { email: 'admin@sppg-purwakarta.com' },
        update: {},
        create: {
          email: 'admin@sppg-purwakarta.com',
          name: 'Ahmad Fauzi, S.Gz.',
          password: await hash('password123', 10),
          userRole: 'SPPG_ADMIN',
          userType: 'SPPG_ADMIN',
          isActive: true,
          emailVerified: new Date(),
          sppgId: purwakartaSppg.id,
          firstName: 'Ahmad',
          lastName: 'Fauzi',
          jobTitle: 'Administrator SPPG',
          department: 'Administrasi dan Koordinasi',
          phone: '0264-200102',
          workPhone: '0264-200102',
          personalPhone: '08119876543',
          address: 'Jl. Veteran No. 30, Purwakarta',
          timezone: 'Asia/Jakarta',
          language: 'id',
        }
      }),

      prisma.user.upsert({
        where: { email: 'gizi@sppg-purwakarta.com' },
        update: {},
        create: {
          email: 'gizi@sppg-purwakarta.com',
          name: 'Dr. Maya Sari Dewi, S.Gz., M.Gizi',
          password: await hash('password123', 10),
          userRole: 'SPPG_AHLI_GIZI',
          userType: 'SPPG_USER',
          isActive: true,
          emailVerified: new Date(),
          sppgId: purwakartaSppg.id,
          firstName: 'Maya Sari',
          lastName: 'Dewi',
          jobTitle: 'Ahli Gizi',
          department: 'Perencanaan Menu dan Gizi',
          phone: '0264-200103',
          workPhone: '0264-200103',
          personalPhone: '08123456789',
          address: 'Jl. Ir. H. Juanda No. 45, Purwakarta',
          timezone: 'Asia/Jakarta',
          language: 'id',
        }
      }),

      prisma.user.upsert({
        where: { email: 'akuntan@sppg-purwakarta.com' },
        update: {},
        create: {
          email: 'akuntan@sppg-purwakarta.com',
          name: 'Rina Wulandari, S.E., Ak.',
          password: await hash('password123', 10),
          userRole: 'SPPG_AKUNTAN',
          userType: 'SPPG_USER',
          isActive: true,
          emailVerified: new Date(),
          sppgId: purwakartaSppg.id,
          firstName: 'Rina',
          lastName: 'Wulandari',
          jobTitle: 'Akuntan SPPG',
          department: 'Keuangan dan Procurement',
          phone: '0264-200104',
          workPhone: '0264-200104',
          personalPhone: '08134567890',
          address: 'Jl. Raya Purwakarta No. 88, Purwakarta',
          timezone: 'Asia/Jakarta',
          language: 'id',
        }
      }),

      prisma.user.upsert({
        where: { email: 'produksi@sppg-purwakarta.com' },
        update: {},
        create: {
          email: 'produksi@sppg-purwakarta.com',
          name: 'Budi Santoso',
          password: await hash('password123', 10),
          userRole: 'SPPG_PRODUKSI_MANAGER',
          userType: 'SPPG_USER',
          isActive: true,
          emailVerified: new Date(),
          sppgId: purwakartaSppg.id,
          firstName: 'Budi',
          lastName: 'Santoso',
          jobTitle: 'Manajer Produksi',
          department: 'Produksi Makanan',
          phone: '0264-200105',
          workPhone: '0264-200105',
          personalPhone: '08145678901',
          address: 'Jl. Siliwangi No. 12, Purwakarta',
          timezone: 'Asia/Jakarta',
          language: 'id',
        }
      }),

      // Distribution Staff - Manager
      prisma.user.upsert({
        where: { email: 'distribusi@sppg-purwakarta.com' },
        update: {},
        create: {
          email: 'distribusi@sppg-purwakarta.com',
          name: 'Ahmad Fauzi',
          password: await hash('password123', 10),
          userRole: 'SPPG_DISTRIBUSI_MANAGER',
          userType: 'SPPG_USER',
          isActive: true,
          emailVerified: new Date(),
          sppgId: purwakartaSppg.id,
          firstName: 'Ahmad',
          lastName: 'Fauzi',
          jobTitle: 'Manajer Distribusi',
          department: 'Distribusi dan Logistik',
          phone: '0264-200106',
          workPhone: '0264-200106',
          personalPhone: '08156789012',
          address: 'Jl. Veteran No. 56, Purwakarta',
          timezone: 'Asia/Jakarta',
          language: 'id',
        }
      }),

      // Distribution Staff - Driver 1
      prisma.user.upsert({
        where: { email: 'driver1@sppg-purwakarta.com' },
        update: {},
        create: {
          email: 'driver1@sppg-purwakarta.com',
          name: 'Joko Widodo',
          password: await hash('password123', 10),
          userRole: 'SPPG_STAFF_DISTRIBUSI',
          userType: 'SPPG_USER',
          isActive: true,
          emailVerified: new Date(),
          sppgId: purwakartaSppg.id,
          firstName: 'Joko',
          lastName: 'Widodo',
          jobTitle: 'Pengemudi Distribusi',
          department: 'Distribusi dan Logistik',
          phone: '0264-200107',
          workPhone: '0264-200107',
          personalPhone: '08167890123',
          address: 'Jl. Merdeka No. 78, Purwakarta',
          timezone: 'Asia/Jakarta',
          language: 'id',
        }
      }),

      // Distribution Staff - Driver 2
      prisma.user.upsert({
        where: { email: 'driver2@sppg-purwakarta.com' },
        update: {},
        create: {
          email: 'driver2@sppg-purwakarta.com',
          name: 'Bambang Sutrisno',
          password: await hash('password123', 10),
          userRole: 'SPPG_STAFF_DISTRIBUSI',
          userType: 'SPPG_USER',
          isActive: true,
          emailVerified: new Date(),
          sppgId: purwakartaSppg.id,
          firstName: 'Bambang',
          lastName: 'Sutrisno',
          jobTitle: 'Pengemudi Distribusi',
          department: 'Distribusi dan Logistik',
          phone: '0264-200108',
          workPhone: '0264-200108',
          personalPhone: '08178901234',
          address: 'Jl. Kartini No. 90, Purwakarta',
          timezone: 'Asia/Jakarta',
          language: 'id',
        }
      }),

      // Distribution Staff - Driver 3
      prisma.user.upsert({
        where: { email: 'driver3@sppg-purwakarta.com' },
        update: {},
        create: {
          email: 'driver3@sppg-purwakarta.com',
          name: 'Slamet Riyadi',
          password: await hash('password123', 10),
          userRole: 'SPPG_STAFF_DISTRIBUSI',
          userType: 'SPPG_USER',
          isActive: true,
          emailVerified: new Date(),
          sppgId: purwakartaSppg.id,
          firstName: 'Slamet',
          lastName: 'Riyadi',
          jobTitle: 'Pengemudi Distribusi',
          department: 'Distribusi dan Logistik',
          phone: '0264-200109',
          workPhone: '0264-200109',
          personalPhone: '08189012345',
          address: 'Jl. Raya Sadang No. 102, Purwakarta',
          timezone: 'Asia/Jakarta',
          language: 'id',
        }
      }),
    ] : []),

    // Demo SPPG Users
    ...(demoPurwakartaSppg ? [
      prisma.user.upsert({
        where: { email: 'demo@sppg-purwakarta.com' },
        update: {},
        create: {
          email: 'demo@sppg-purwakarta.com',
          name: 'Demo Admin Purwakarta',
          password: await hash('demo123', 10),
          userRole: 'SPPG_ADMIN',
          userType: 'SPPG_ADMIN',
          isActive: true,
          emailVerified: new Date(),
          sppgId: demoPurwakartaSppg.id,
          firstName: 'Demo',
          lastName: 'Admin',
          jobTitle: 'Demo Administrator',
          department: 'Demo dan Training',
          phone: '0264-200200',
          workPhone: '0264-200200',
          personalPhone: '08100000000',
          address: 'Jl. Veteran No. 25, Nagri Kidul, Purwakarta',
          timezone: 'Asia/Jakarta',
          language: 'id',
        }
      }),
    ] : [])
  ])

  console.log(`  ✓ Created ${users.length} users`)
  console.log('')
  console.log('🔐 Login Credentials (Regional Purwakarta):')
  console.log('')
  console.log('👑 Platform Admin:')
  console.log('   Email: admin@bagizi.id')
  console.log('   Password: admin123')
  console.log('   Redirect: /admin')
  console.log('')
  console.log('🏢 SPPG Purwakarta Users:')
  console.log('   Kepala SPPG:')
  console.log('     Email: kepala@sppg-purwakarta.com')
  console.log('     Password: password123')
  console.log('     Redirect: /dashboard')
  console.log('')
  console.log('   Admin SPPG:')
  console.log('     Email: admin@sppg-purwakarta.com')
  console.log('     Password: password123')
  console.log('     Redirect: /dashboard')
  console.log('')
  console.log('   Ahli Gizi:')
  console.log('     Email: gizi@sppg-purwakarta.com')
  console.log('     Password: password123')
  console.log('     Redirect: /dashboard')
  console.log('')
  console.log('   Manajer Distribusi:')
  console.log('     Email: distribusi@sppg-purwakarta.com')
  console.log('     Password: password123')
  console.log('     Redirect: /dashboard')
  console.log('')
  console.log('   Staff Distribusi (Drivers):')
  console.log('     Email: driver1@sppg-purwakarta.com')
  console.log('     Email: driver2@sppg-purwakarta.com')
  console.log('     Email: driver3@sppg-purwakarta.com')
  console.log('     Password: password123 (semua)')
  console.log('     Redirect: /dashboard')
  console.log('')
  console.log('🎭 Demo Account:')
  console.log('   Email: demo@sppg-purwakarta.com')
  console.log('   Password: demo123')
  console.log('   Redirect: /dashboard')
  console.log('')
  
  return users
}