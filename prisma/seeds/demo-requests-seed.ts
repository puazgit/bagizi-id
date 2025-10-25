/**
 * @fileoverview Demo Requests Seed - SPPG Organizations (Purwakarta Area)
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * 
 * Seeds demo requests from SPPG organizations for Makan Bergizi Gratis (MBG) program
 * 
 * BUSINESS MODEL:
 * - SPPG = Customer/Tenant (yang kelola program MBG untuk anak sekolah)
 * - Schools = Beneficiaries (sekolah penerima program MBG)
 * - Students = End users (siswa yang menerima makan bergizi gratis)
 * 
 * FOKUS APLIKASI:
 * - Program Makan Bergizi Gratis (MBG) untuk anak sekolah
 * - Pemenuhan gizi anak sekolah (bukan katering komersial)
 * - Penanggulangan stunting & malnutrisi
 * - Program pemerintah & CSR untuk kesejahteraan anak
 */

import { PrismaClient, type DemoRequest, type User } from '@prisma/client'

/**
 * Seed demo requests from SPPG organizations
 * Creates 6 sample requests in different workflow stages
 */
export async function seedDemoRequests(
  prisma: PrismaClient,
  reviewerUser?: User
): Promise<DemoRequest[]> {
  console.log('  → Creating demo requests from SPPG organizations...')

  // Delete existing demo requests first to avoid unique constraint errors
  await prisma.demoRequest.deleteMany({})

  const demoRequests = await Promise.all([
    // 1. SUBMITTED - SPPG Dinas Pendidikan Kabupaten Purwakarta
    prisma.demoRequest.create({
      data: {
        organizationName: 'SPPG Dinas Pendidikan Kabupaten Purwakarta',
        organizationType: 'PEMERINTAH',
        picName: 'Dr. H. Asep Sunandar, M.Pd',
        picEmail: 'asep.sunandar@disdik.purwakartakab.go.id',
        picPhone: '+62264-200100',
        picWhatsapp: '+62812-2000-1000',
        picPosition: 'Kepala Dinas Pendidikan',
        targetBeneficiaries: 18, // 18 SD penerima program MBG
        operationalArea: 'Kabupaten Purwakarta (17 Kecamatan)',
        currentSystem: 'Program MBG manual dengan koordinasi WhatsApp per sekolah',
        currentChallenges: [
          'Sulit monitor kecukupan gizi 4.500 siswa SD di 18 sekolah',
          'Laporan pemenuhan gizi ke Kemendikbud masih manual',
          'Tidak ada data stunting & status gizi terintegrasi',
          'Budget APBD untuk MBG tidak terpantau per sekolah'
        ],
        expectedGoals: [
          'Platform digital untuk program MBG 18 SD',
          'Monitoring gizi siswa real-time (kalori, protein, dll)',
          'Automated reporting compliance pemerintah',
          'Dashboard stunting prevention & status gizi'
        ],
        demoType: 'STANDARD',
        requestedFeatures: [
          'MENU_PLANNING',
          'NUTRITION_MONITORING',
          'DISTRIBUTION',
          'STUNTING_TRACKING',
          'GOVERNMENT_REPORTING'
        ],
        specialRequirements: 'Demo untuk Kepala Dinas dan Tim Gizi. Fokus pada compliance Permendikbud tentang standar gizi MBG. Butuh fitur laporan stunting.',
        preferredStartDate: new Date('2025-11-18'),
        estimatedDuration: 14,
        status: 'SUBMITTED',
        notes: 'High-priority! Program MBG APBD 2025 sudah approved. Butuh sistem segera untuk implementasi Januari 2026.',
        conversionProbability: 90,
        callsMade: 0,
        emailsSent: 1
      }
    }),

    // 2. UNDER_REVIEW - Yayasan Pendidikan Islam Al-Ma'soem
    prisma.demoRequest.create({
      data: {
        organizationName: 'SPPG Yayasan Pendidikan Islam Al-Ma\'soem',
        organizationType: 'YAYASAN',
        picName: 'Prof. Dr. H. Endang Suhendar, M.Si',
        picEmail: 'endang.suhendar@almasoem.sch.id',
        picPhone: '+62264-200200',
        picWhatsapp: '+62813-2000-2000',
        picPosition: 'Ketua Yayasan',
        targetBeneficiaries: 8, // 8 sekolah (TK, SD, SMP di bawah yayasan)
        operationalArea: 'Kabupaten Bandung dan Purwakarta',
        currentSystem: 'Program makan siang gratis untuk siswa kurang mampu, dikelola manual per sekolah',
        currentChallenges: [
          'Tidak ada standardisasi menu gizi seimbang antar 8 sekolah',
          'Data siswa kurang gizi tidak terintegrasi',
          'Laporan donatur tentang program makan gratis tidak detail',
          'Sulit buktikan impact program ke donatur'
        ],
        expectedGoals: [
          'Sistem terpusat untuk program makan bergizi gratis 8 sekolah',
          'Standar menu gizi seimbang & halal untuk semua siswa',
          'Dashboard impact untuk laporan donatur (status gizi, kehadiran)',
          'Tracking siswa kurang gizi & program intervensi'
        ],
        demoType: 'EXTENDED',
        requestedFeatures: [
          'MENU_PLANNING',
          'NUTRITION_MONITORING',
          'STUDENT_HEALTH_TRACKING',
          'DONOR_REPORTING',
          'HALAL_COMPLIANCE',
          'IMPACT_MEASUREMENT'
        ],
        specialRequirements: 'Demo untuk Board of Trustees & Tim Donatur. Fokus pada impact measurement program makan gratis. Butuh dashboard transparansi untuk donatur.',
        preferredStartDate: new Date('2025-11-12'),
        estimatedDuration: 21,
        status: 'UNDER_REVIEW',
        reviewedBy: reviewerUser?.id,
        reviewedAt: new Date('2025-10-20'),
        notes: 'Yayasan dengan komitmen sosial tinggi. Program makan gratis untuk 800 siswa kurang mampu. Need strong impact reporting.',
        conversionProbability: 75,
        callsMade: 2,
        emailsSent: 3
      }
    }),

    // 3. APPROVED - SPPG PT Indah Kiat Pulp & Paper (Corporate CSR)
    prisma.demoRequest.create({
      data: {
        organizationName: 'SPPG PT Indah Kiat Pulp & Paper (CSR Program MBG)',
        organizationType: 'SWASTA',
        picName: 'Ibu Dr. Siti Nurjanah',
        picEmail: 'siti.nurjanah@app.co.id',
        picPhone: '+62264-200300',
        picWhatsapp: '+62814-2000-3000',
        picPosition: 'Head of Corporate Social Responsibility',
        targetBeneficiaries: 6, // 6 SD di sekitar pabrik Purwakarta
        operationalArea: 'Kabupaten Purwakarta (area pabrik)',
        currentSystem: 'Program CSR makan bergizi gratis untuk anak karyawan & masyarakat sekitar pabrik',
        currentChallenges: [
          'Tidak ada data status gizi anak penerima program',
          'Laporan CSR ke stakeholder tidak menunjukkan impact jelas',
          'Sulit ukur keberhasilan program penanggulangan stunting',
          'Feedback orang tua siswa tidak terstruktur'
        ],
        expectedGoals: [
          'Platform untuk program CSR Makan Bergizi Gratis',
          'Dashboard impact gizi untuk board presentation',
          'Data status gizi & pertumbuhan siswa penerima',
          'Transparansi penuh untuk stakeholder & masyarakat'
        ],
        demoType: 'GUIDED',
        requestedFeatures: [
          'MENU_PLANNING',
          'NUTRITION_MONITORING',
          'GROWTH_TRACKING',
          'CSR_IMPACT_REPORTING',
          'COMMUNITY_FEEDBACK',
          'PHOTO_DOCUMENTATION'
        ],
        specialRequirements: 'Demo untuk CSR team & Corporate Management. Fokus pada social impact measurement program MBG. Butuh sustainability reporting.',
        preferredStartDate: new Date('2025-11-08'),
        estimatedDuration: 14,
        status: 'APPROVED',
        reviewedBy: reviewerUser?.id,
        reviewedAt: new Date('2025-10-18'),
        approvedAt: new Date('2025-10-19'),
        scheduledDate: new Date('2025-11-08'),
        assignedTo: reviewerUser?.id,
        assignedAt: new Date('2025-10-19'),
        notes: 'Corporate CSR dengan commitment jangka panjang. Program MBG untuk 600 siswa. High impact potential.',
        conversionProbability: 90,
        callsMade: 3,
        emailsSent: 5
      }
    }),

    // 4. REJECTED - SPPG Komunitas Ibu PKK Desa Ciganea
    prisma.demoRequest.create({
      data: {
        organizationName: 'SPPG Komunitas Ibu PKK Desa Ciganea',
        organizationType: 'KOMUNITAS',
        picName: 'Ibu Hj. Neneng Sukaesih',
        picEmail: 'neneng.pkk@ciganea-purwakarta.desa.id',
        picPhone: '+62264-200400',
        picWhatsapp: '+62815-2000-4000',
        picPosition: 'Ketua PKK Desa',
        targetBeneficiaries: 2, // 2 TK/PAUD
        operationalArea: 'Desa Ciganea, Purwakarta',
        currentSystem: 'Gotong royong ibu-ibu PKK masak makanan tambahan untuk balita & anak TK',
        currentChallenges: [
          'Tidak ada panduan menu gizi seimbang',
          'Dana ADD (Alokasi Dana Desa) untuk MBG terbatas',
          'Ibu-ibu PKK tidak punya pelatihan gizi'
        ],
        expectedGoals: [
          'Panduan menu bergizi sederhana untuk balita',
          'Sistem tracking pertumbuhan anak',
          'Harga terjangkau atau program CSR'
        ],
        demoType: 'STANDARD',
        requestedFeatures: [
          'MENU_PLANNING',
          'BASIC_NUTRITION_TRACKING'
        ],
        specialRequirements: 'Butuh harga khusus untuk program desa atau partnership CSR. Focus: penanggulangan stunting di tingkat desa.',
        preferredStartDate: new Date('2025-11-01'),
        estimatedDuration: 7,
        status: 'REJECTED',
        reviewedBy: reviewerUser?.id,
        reviewedAt: new Date('2025-10-17'),
        rejectedAt: new Date('2025-10-17'),
        rejectionReason: 'Target beneficiary terlalu kecil (50 anak di 2 PAUD) dan budget ADD tidak mencukupi untuk subscription. Disarankan bergabung dengan program SPPG Dinas Pendidikan atau mencari sponsor CSR perusahaan.',
        notes: 'Komunitas dengan niat baik untuk program stunting. Future: bisa dipertimbangkan untuk program freemium atau CSR partnership.',
        conversionProbability: 5,
        callsMade: 1,
        emailsSent: 2
      }
    }),

    // 5. CONVERTED - SPPG Dinas Kesehatan Kabupaten Subang (Stunting Prevention)
    prisma.demoRequest.create({
      data: {
        organizationName: 'SPPG Dinas Kesehatan Kabupaten Subang (Program Stunting)',
        organizationType: 'PEMERINTAH',
        picName: 'dr. H. Bambang Hermawan, M.Kes',
        picEmail: 'bambang.hermawan@dinkes.subangkab.go.id',
        picPhone: '+62260-200500',
        picWhatsapp: '+62816-2000-5000',
        picPosition: 'Kepala Dinas Kesehatan',
        targetBeneficiaries: 12, // 12 Posyandu untuk program PMT (Pemberian Makanan Tambahan)
        operationalArea: 'Kabupaten Subang (30 Kecamatan)',
        currentSystem: 'Program PMT untuk balita stunting dikelola manual per Posyandu',
        currentChallenges: [
          'Data balita stunting tersebar di 12 Posyandu tidak terintegrasi',
          'Sulit monitor kenaikan berat badan balita stunting',
          'Laporan program PMT ke Kemenkes sering terlambat',
          'Tidak ada tracking efektivitas menu PMT terhadap status gizi'
        ],
        expectedGoals: [
          'Platform terintegrasi untuk program PMT balita stunting',
          'Real-time monitoring pertumbuhan & status gizi balita',
          'Automated reporting ke Kemenkes (e-PPGBM)',
          'Analytics efektivitas program stunting prevention'
        ],
        demoType: 'GUIDED',
        requestedFeatures: [
          'MENU_PLANNING',
          'NUTRITION_MONITORING',
          'GROWTH_TRACKING',
          'STUNTING_PREVENTION',
          'HEALTH_REPORTING',
          'PMT_MANAGEMENT'
        ],
        specialRequirements: 'Special module untuk program stunting & PMT balita. Integrasi dengan e-PPGBM Kemenkes dan e-Posyandu.',
        preferredStartDate: new Date('2025-10-15'),
        estimatedDuration: 14,
        status: 'CONVERTED',
        reviewedBy: reviewerUser?.id,
        reviewedAt: new Date('2025-10-08'),
        approvedAt: new Date('2025-10-09'),
        scheduledDate: new Date('2025-10-15'),
        actualDate: new Date('2025-10-15'),
        assignedTo: reviewerUser?.id,
        assignedAt: new Date('2025-10-09'),
        isConverted: true,
        convertedAt: new Date('2025-10-22'),
        notes: '🎉 SUCCESS! Demo excellent. Signed 1-year contract (Government Plan). Program untuk 1.200 balita stunting. Onboarding Nov 1.',
        followUpRequired: true,
        followUpDate: new Date('2025-11-01'),
        feedback: 'Sistem sangat membantu program stunting prevention. Dashboard pertumbuhan balita sangat informatif untuk tim kami.',
        feedbackScore: 4.9,
        attendanceStatus: 'ATTENDED',
        conversionProbability: 100,
        callsMade: 5,
        emailsSent: 8
      }
    }),

    // 6. DEMO_ACTIVE - Yayasan Bina Insan Kamil (Program Makan Gratis)
    prisma.demoRequest.create({
      data: {
        organizationName: 'SPPG Yayasan Bina Insan Kamil Purwakarta',
        organizationType: 'YAYASAN',
        picName: 'Ustadz Dr. Ahmad Syafii, Lc., M.A.',
        picEmail: 'ahmad.syafii@bik-purwakarta.or.id',
        picPhone: '+62264-200600',
        picWhatsapp: '+62817-2000-6000',
        picPosition: 'Direktur Yayasan',
        targetBeneficiaries: 5, // 5 units (TK, SD, SMP, Ponpes, Panti Asuhan)
        operationalArea: 'Purwakarta dan sekitarnya',
        currentSystem: 'Program makan bergizi gratis untuk anak yatim & dhuafa, dikelola terpisah per unit',
        currentChallenges: [
          'Tidak ada standardisasi menu gizi untuk 450 anak yatim & dhuafa',
          'Data status gizi anak tidak tercatat dengan baik',
          'Laporan ke donatur tentang program makan gratis kurang detail',
          'Sulit buktikan impact donasi terhadap kesehatan anak'
        ],
        expectedGoals: [
          'Sistem terpusat program makan bergizi gratis 5 unit',
          'Standar menu gizi seimbang & halal untuk semua anak',
          'Dashboard transparansi untuk donatur (status gizi, pertumbuhan)',
          'Tracking kesehatan & pertumbuhan anak penerima program'
        ],
        demoType: 'EXTENDED',
        requestedFeatures: [
          'MENU_PLANNING',
          'NUTRITION_MONITORING',
          'CHILD_GROWTH_TRACKING',
          'DONOR_REPORTING',
          'HALAL_COMPLIANCE',
          'IMPACT_DASHBOARD'
        ],
        specialRequirements: 'Demo untuk Board & Tim Donatur. Fokus transparansi program makan gratis untuk anak yatim. Butuh special pricing yayasan sosial.',
        preferredStartDate: new Date('2025-10-23'),
        estimatedDuration: 21,
        status: 'DEMO_ACTIVE',
        reviewedBy: reviewerUser?.id,
        reviewedAt: new Date('2025-10-15'),
        approvedAt: new Date('2025-10-16'),
        scheduledDate: new Date('2025-10-23'),
        actualDate: new Date('2025-10-23'),
        assignedTo: reviewerUser?.id,
        assignedAt: new Date('2025-10-16'),
        notes: '🔥 Demo running! Feedback sangat positif. Donatur love transparency dashboard. Discussing NGO pricing. High conversion probability.',
        followUpRequired: true,
        followUpDate: new Date('2025-11-06'),
        conversionProbability: 85,
        callsMade: 4,
        emailsSent: 6
      }
    })
  ])

  console.log(`  ✓ Created ${demoRequests.length} demo requests from SPPG organizations`)
  console.log('    - 1 SUBMITTED (Dinas Pendidikan Purwakarta - MBG Program)')
  console.log('    - 1 UNDER_REVIEW (Yayasan Al-Ma\'soem - Free Meal Program)')
  console.log('    - 1 APPROVED (PT Indah Kiat CSR - MBG Program)')
  console.log('    - 1 REJECTED (PKK Desa Ciganea - too small)')
  console.log('    - 1 CONVERTED (Dinkes Subang - Stunting Prevention! 🎉)')
  console.log('    - 1 DEMO_ACTIVE (Yayasan Bina Insan Kamil - Free Meal Program)')

  return demoRequests
}
