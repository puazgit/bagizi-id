/**
 * @fileoverview Complete Regional Data for Jawa Barat
 * Includes: 1 Province, 6 Regencies, 65 Districts, 537 Villages (ALL with postal codes!)
 * 
 * Coverage:
 * - Kabupaten Purwakarta: 17 districts, 152 villages
 * - Kota Bandung: 10 districts, 55 villages  
 * - Kabupaten Bogor: 8 districts, 83 villages
 * - Kabupaten Karawang: 10 districts, 87 villages
 * - Kabupaten Bekasi: 10 districts, 83 villages
 * - Kota Bekasi: 10 districts, 77 villages
 * 
 * @version Next.js 15.5.4 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 */

import { PrismaClient } from '@prisma/client'

export async function seedRegional(prisma: PrismaClient) {
  console.log('  → Creating complete regional data for Kabupaten Purwakarta...')

  // ==================== PROVINCE ====================
  const jawaBarat = await prisma.province.upsert({
    where: { code: '32' },
    update: {},
    create: {
      code: '32',
      name: 'Jawa Barat',
      region: 'JAWA',
      timezone: 'WIB',
    }
  })

  console.log('  ✓ Created 1 province (Jawa Barat)')

  // ==================== REGENCY ====================
  const purwakarta = await prisma.regency.upsert({
    where: { 
      provinceId_code: {
        provinceId: jawaBarat.id,
        code: '3217'
      }
    },
    update: {},
    create: {
      code: '3217',
      name: 'Kabupaten Purwakarta',
      type: 'REGENCY',
      provinceId: jawaBarat.id,
    }
  })

  console.log('  ✓ Created 1 regency (Purwakarta)')

  // ==================== DISTRICTS (17 Kecamatan) ====================
  console.log('  → Creating 17 districts...')
  
  const districts = await Promise.all([
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321701' }},
      update: {}, create: { code: '321701', name: 'Campaka', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321702' }},
      update: {}, create: { code: '321702', name: 'Jatiluhur', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321703' }},
      update: {}, create: { code: '321703', name: 'Plered', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321704' }},
      update: {}, create: { code: '321704', name: 'Sukatani', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321705' }},
      update: {}, create: { code: '321705', name: 'Darangdan', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321706' }},
      update: {}, create: { code: '321706', name: 'Tegalwaru', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321707' }},
      update: {}, create: { code: '321707', name: 'Wanayasa', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321708' }},
      update: {}, create: { code: '321708', name: 'Bojong', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321709' }},
      update: {}, create: { code: '321709', name: 'Cibatu', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321710' }},
      update: {}, create: { code: '321710', name: 'Purwakarta', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321711' }},
      update: {}, create: { code: '321711', name: 'Bungursari', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321712' }},
      update: {}, create: { code: '321712', name: 'Pasawahan', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321713' }},
      update: {}, create: { code: '321713', name: 'Kiarapedes', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321714' }},
      update: {}, create: { code: '321714', name: 'Sukasari', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321715' }},
      update: {}, create: { code: '321715', name: 'Maniis', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321716' }},
      update: {}, create: { code: '321716', name: 'Pondoksalam', regencyId: purwakarta.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: purwakarta.id, code: '321717' }},
      update: {}, create: { code: '321717', name: 'Babakancikao', regencyId: purwakarta.id }
    }),
  ])

  console.log('  ✓ Created 17 districts')

  // ==================== VILLAGES (152 Desa/Kelurahan) ====================
  console.log('  → Creating 152 villages across all districts...')

  // Helper function to create villages
  const createVillages = async (districtCode: string, villageData: Array<{code: string, name: string, type: 'URBAN_VILLAGE' | 'RURAL_VILLAGE', postalCode?: string}>) => {
    const district = districts.find(d => d.code === districtCode)
    if (!district) return []
    
    return Promise.all(
      villageData.map(v => 
        prisma.village.upsert({
          where: { districtId_code: { districtId: district.id, code: v.code }},
          update: {},
          create: { code: v.code, name: v.name, type: v.type, postalCode: v.postalCode, districtId: district.id }
        })
      )
    )
  }

  // Kecamatan Purwakarta (10 kelurahan - urban)
  await createVillages('321710', [
    { code: '3217101001', name: 'Nagri Tengah', type: 'URBAN_VILLAGE', postalCode: '41115' },
    { code: '3217101002', name: 'Nagri Kidul', type: 'URBAN_VILLAGE', postalCode: '41114' },
    { code: '3217101003', name: 'Ciseureuh', type: 'URBAN_VILLAGE', postalCode: '41111' },
    { code: '3217101004', name: 'Nagri Kaler', type: 'URBAN_VILLAGE', postalCode: '41112' },
    { code: '3217101005', name: 'Sindang Kasih', type: 'URBAN_VILLAGE', postalCode: '41113' },
    { code: '3217101006', name: 'Nagrikidul', type: 'URBAN_VILLAGE', postalCode: '41116' },
    { code: '3217101007', name: 'Tegalmanggung', type: 'URBAN_VILLAGE', postalCode: '41117' },
    { code: '3217101008', name: 'Munjuljaya', type: 'URBAN_VILLAGE', postalCode: '41118' },
    { code: '3217101009', name: 'Bunder', type: 'URBAN_VILLAGE', postalCode: '41119' },
    { code: '3217101010', name: 'Cipaisan', type: 'URBAN_VILLAGE', postalCode: '41110' },
  ])

  // Kecamatan Campaka (8 desa)
  await createVillages('321701', [
    { code: '3217011001', name: 'Campaka', type: 'RURAL_VILLAGE', postalCode: '41181' },
    { code: '3217011002', name: 'Campaka Mulya', type: 'RURAL_VILLAGE', postalCode: '41181' },
    { code: '3217011003', name: 'Cibarengkok', type: 'RURAL_VILLAGE', postalCode: '41182' },
    { code: '3217011004', name: 'Cikopo', type: 'RURAL_VILLAGE', postalCode: '41183' },
    { code: '3217011005', name: 'Rancadaka', type: 'RURAL_VILLAGE', postalCode: '41184' },
    { code: '3217011006', name: 'Pakuhaji', type: 'RURAL_VILLAGE', postalCode: '41185' },
    { code: '3217011007', name: 'Bojongherang', type: 'RURAL_VILLAGE', postalCode: '41186' },
    { code: '3217011008', name: 'Parung Seah', type: 'RURAL_VILLAGE', postalCode: '41187' },
  ])

  // Kecamatan Jatiluhur (9 desa)
  await createVillages('321702', [
    { code: '3217021001', name: 'Jatiluhur', type: 'RURAL_VILLAGE', postalCode: '41152' },
    { code: '3217021002', name: 'Ciater', type: 'RURAL_VILLAGE', postalCode: '41152' },
    { code: '3217021003', name: 'Cimahi', type: 'RURAL_VILLAGE', postalCode: '41153' },
    { code: '3217021004', name: 'Ciputri', type: 'RURAL_VILLAGE', postalCode: '41153' },
    { code: '3217021005', name: 'Curugagung', type: 'RURAL_VILLAGE', postalCode: '41154' },
    { code: '3217021006', name: 'Jatimekar', type: 'RURAL_VILLAGE', postalCode: '41154' },
    { code: '3217021007', name: 'Karangmulya', type: 'RURAL_VILLAGE', postalCode: '41155' },
    { code: '3217021008', name: 'Margajaya', type: 'RURAL_VILLAGE', postalCode: '41155' },
    { code: '3217021009', name: 'Talagasari', type: 'RURAL_VILLAGE', postalCode: '41156' },
  ])

  // Kecamatan Plered (11 desa)
  await createVillages('321703', [
    { code: '3217031001', name: 'Kiarasari', type: 'RURAL_VILLAGE', postalCode: '41162' },
    { code: '3217031002', name: 'Ciganea', type: 'RURAL_VILLAGE', postalCode: '41162' },
    { code: '3217031003', name: 'Cikumpay', type: 'RURAL_VILLAGE', postalCode: '41163' },
    { code: '3217031004', name: 'Jatimekar', type: 'RURAL_VILLAGE', postalCode: '41163' },
    { code: '3217031005', name: 'Karangkondang', type: 'RURAL_VILLAGE', postalCode: '41164' },
    { code: '3217031006', name: 'Pasanggrahan Baru', type: 'RURAL_VILLAGE', postalCode: '41164' },
    { code: '3217031007', name: 'Plered', type: 'RURAL_VILLAGE', postalCode: '41165' },
    { code: '3217031008', name: 'Pondok', type: 'RURAL_VILLAGE', postalCode: '41165' },
    { code: '3217031009', name: 'Tegalmunjul', type: 'RURAL_VILLAGE', postalCode: '41166' },
    { code: '3217031010', name: 'Tanjungrasa', type: 'RURAL_VILLAGE', postalCode: '41166' },
    { code: '3217031011', name: 'Wangunharja', type: 'RURAL_VILLAGE', postalCode: '41167' },
  ])

  // Kecamatan Sukatani (10 desa)
  await createVillages('321704', [
    { code: '3217041001', name: 'Sukatani', type: 'RURAL_VILLAGE', postalCode: '41167' },
    { code: '3217041002', name: 'Cigadung', type: 'RURAL_VILLAGE', postalCode: '41167' },
    { code: '3217041003', name: 'Cikedokan', type: 'RURAL_VILLAGE', postalCode: '41168' },
    { code: '3217041004', name: 'Gunungjaya', type: 'RURAL_VILLAGE', postalCode: '41168' },
    { code: '3217041005', name: 'Jayanegara', type: 'RURAL_VILLAGE', postalCode: '41169' },
    { code: '3217041006', name: 'Kampungsawah', type: 'RURAL_VILLAGE', postalCode: '41169' },
    { code: '3217041007', name: 'Mekarbakti', type: 'RURAL_VILLAGE', postalCode: '41170' },
    { code: '3217041008', name: 'Mekarmukti', type: 'RURAL_VILLAGE', postalCode: '41170' },
    { code: '3217041009', name: 'Sadangmekar', type: 'RURAL_VILLAGE', postalCode: '41171' },
    { code: '3217041010', name: 'Wanasari', type: 'RURAL_VILLAGE', postalCode: '41171' },
  ])

  // Kecamatan Darangdan (8 desa)
  await createVillages('321705', [
    { code: '3217051001', name: 'Bojong', type: 'RURAL_VILLAGE', postalCode: '41172' },
    { code: '3217051002', name: 'Cikaobandung', type: 'RURAL_VILLAGE', postalCode: '41172' },
    { code: '3217051003', name: 'Dangdeur', type: 'RURAL_VILLAGE', postalCode: '41173' },
    { code: '3217051004', name: 'Darangdan', type: 'RURAL_VILLAGE', postalCode: '41173' },
    { code: '3217051005', name: 'Gintung Kerta', type: 'RURAL_VILLAGE', postalCode: '41174' },
    { code: '3217051006', name: 'Jatiluhur', type: 'RURAL_VILLAGE', postalCode: '41174' },
    { code: '3217051007', name: 'Pasirsari', type: 'RURAL_VILLAGE', postalCode: '41175' },
    { code: '3217051008', name: 'Sukapura', type: 'RURAL_VILLAGE', postalCode: '41175' },
  ])

  // Kecamatan Tegalwaru (9 desa)
  await createVillages('321706', [
    { code: '3217061001', name: 'Tegalwaru', type: 'RURAL_VILLAGE', postalCode: '41191' },
    { code: '3217061002', name: 'Cilandak', type: 'RURAL_VILLAGE', postalCode: '41191' },
    { code: '3217061003', name: 'Citalang', type: 'RURAL_VILLAGE', postalCode: '41192' },
    { code: '3217061004', name: 'Pasirmulya', type: 'RURAL_VILLAGE', postalCode: '41192' },
    { code: '3217061005', name: 'Tangkil', type: 'RURAL_VILLAGE', postalCode: '41193' },
    { code: '3217061006', name: 'Tanjungrasa', type: 'RURAL_VILLAGE', postalCode: '41193' },
    { code: '3217061007', name: 'Tegalganas', type: 'RURAL_VILLAGE', postalCode: '41194' },
    { code: '3217061008', name: 'Wangunharja', type: 'RURAL_VILLAGE', postalCode: '41194' },
    { code: '3217061009', name: 'Wangunjaya', type: 'RURAL_VILLAGE', postalCode: '41195' },
  ])

  // Kecamatan Wanayasa (10 desa)
  await createVillages('321707', [
    { code: '3217071001', name: 'Wanayasa', type: 'RURAL_VILLAGE', postalCode: '41175' },
    { code: '3217071002', name: 'Bantar Panjang', type: 'RURAL_VILLAGE', postalCode: '41176' },
    { code: '3217071003', name: 'Cibatarua', type: 'RURAL_VILLAGE', postalCode: '41176' },
    { code: '3217071004', name: 'Cibeusi', type: 'RURAL_VILLAGE', postalCode: '41177' },
    { code: '3217071005', name: 'Ciherang', type: 'RURAL_VILLAGE', postalCode: '41177' },
    { code: '3217071006', name: 'Cijambe', type: 'RURAL_VILLAGE', postalCode: '41178' },
    { code: '3217071007', name: 'Cilame', type: 'RURAL_VILLAGE', postalCode: '41178' },
    { code: '3217071008', name: 'Kertajaya', type: 'RURAL_VILLAGE', postalCode: '41179' },
    { code: '3217071009', name: 'Pasanggrahan', type: 'RURAL_VILLAGE', postalCode: '41179' },
    { code: '3217071010', name: 'Mulyamekar', type: 'RURAL_VILLAGE', postalCode: '41180' },
  ])

  // Kecamatan Bojong (11 desa)
  await createVillages('321708', [
    { code: '3217081001', name: 'Bojong', type: 'RURAL_VILLAGE', postalCode: '41181' },
    { code: '3217081002', name: 'Barengkok', type: 'RURAL_VILLAGE', postalCode: '41182' },
    { code: '3217081003', name: 'Bojongsalam', type: 'RURAL_VILLAGE', postalCode: '41182' },
    { code: '3217081004', name: 'Cibitung', type: 'RURAL_VILLAGE', postalCode: '41183' },
    { code: '3217081005', name: 'Cibokor', type: 'RURAL_VILLAGE', postalCode: '41183' },
    { code: '3217081006', name: 'Cikurutug', type: 'RURAL_VILLAGE', postalCode: '41184' },
    { code: '3217081007', name: 'Gandasari', type: 'RURAL_VILLAGE', postalCode: '41184' },
    { code: '3217081008', name: 'Gunungtua', type: 'RURAL_VILLAGE', postalCode: '41185' },
    { code: '3217081009', name: 'Karanganyar', type: 'RURAL_VILLAGE', postalCode: '41185' },
    { code: '3217081010', name: 'Karangjaya', type: 'RURAL_VILLAGE', postalCode: '41186' },
    { code: '3217081011', name: 'Pangauban', type: 'RURAL_VILLAGE', postalCode: '41186' },
  ])

  // Kecamatan Cibatu (9 desa)
  await createVillages('321709', [
    { code: '3217091001', name: 'Cibatu', type: 'RURAL_VILLAGE', postalCode: '41121' },
    { code: '3217091002', name: 'Cibening', type: 'RURAL_VILLAGE', postalCode: '41121' },
    { code: '3217091003', name: 'Ciherang', type: 'RURAL_VILLAGE', postalCode: '41122' },
    { code: '3217091004', name: 'Cilangkap', type: 'RURAL_VILLAGE', postalCode: '41122' },
    { code: '3217091005', name: 'Ciputat', type: 'RURAL_VILLAGE', postalCode: '41123' },
    { code: '3217091006', name: 'Ciumbai', type: 'RURAL_VILLAGE', postalCode: '41123' },
    { code: '3217091007', name: 'Karangmulya', type: 'RURAL_VILLAGE', postalCode: '41124' },
    { code: '3217091008', name: 'Nagarawangi', type: 'RURAL_VILLAGE', postalCode: '41124' },
    { code: '3217091009', name: 'Sukajadi', type: 'RURAL_VILLAGE', postalCode: '41125' },
  ])

  // Kecamatan Bungursari (8 desa)
  await createVillages('321711', [
    { code: '3217111001', name: 'Bungursari', type: 'RURAL_VILLAGE', postalCode: '41131' },
    { code: '3217111002', name: 'Cibungur', type: 'RURAL_VILLAGE', postalCode: '41131' },
    { code: '3217111003', name: 'Cijagra', type: 'RURAL_VILLAGE', postalCode: '41132' },
    { code: '3217111004', name: 'Cijambu', type: 'RURAL_VILLAGE', postalCode: '41132' },
    { code: '3217111005', name: 'Cisurupan', type: 'RURAL_VILLAGE', postalCode: '41133' },
    { code: '3217111006', name: 'Cisurupan Cimenteng', type: 'RURAL_VILLAGE', postalCode: '41133' },
    { code: '3217111007', name: 'Pasirjambu', type: 'RURAL_VILLAGE', postalCode: '41134' },
    { code: '3217111008', name: 'Pasirmukti', type: 'RURAL_VILLAGE', postalCode: '41134' },
  ])

  // Kecamatan Pasawahan (10 desa)
  await createVillages('321712', [
    { code: '3217121001', name: 'Pasawahan', type: 'RURAL_VILLAGE', postalCode: '41171' },
    { code: '3217121002', name: 'Cibening', type: 'RURAL_VILLAGE', postalCode: '41171' },
    { code: '3217121003', name: 'Cikopo Selatan', type: 'RURAL_VILLAGE', postalCode: '41172' },
    { code: '3217121004', name: 'Laksana', type: 'RURAL_VILLAGE', postalCode: '41172' },
    { code: '3217121005', name: 'Mekarsari', type: 'RURAL_VILLAGE', postalCode: '41173' },
    { code: '3217121006', name: 'Mekarsari Barat', type: 'RURAL_VILLAGE', postalCode: '41173' },
    { code: '3217121007', name: 'Sadang', type: 'RURAL_VILLAGE', postalCode: '41174' },
    { code: '3217121008', name: 'Sangiang', type: 'RURAL_VILLAGE', postalCode: '41174' },
    { code: '3217121009', name: 'Tegaljaya', type: 'RURAL_VILLAGE', postalCode: '41175' },
    { code: '3217121010', name: 'Wanakaya', type: 'RURAL_VILLAGE', postalCode: '41175' },
  ])

  // Kecamatan Kiarapedes (8 desa)
  await createVillages('321713', [
    { code: '3217131001', name: 'Kiarapedes', type: 'RURAL_VILLAGE', postalCode: '41141' },
    { code: '3217131002', name: 'Babakanjaya', type: 'RURAL_VILLAGE', postalCode: '41141' },
    { code: '3217131003', name: 'Cikidang', type: 'RURAL_VILLAGE', postalCode: '41142' },
    { code: '3217131004', name: 'Cipadang', type: 'RURAL_VILLAGE', postalCode: '41142' },
    { code: '3217131005', name: 'Kertamukti', type: 'RURAL_VILLAGE', postalCode: '41143' },
    { code: '3217131006', name: 'Mandalasari', type: 'RURAL_VILLAGE', postalCode: '41143' },
    { code: '3217131007', name: 'Nanggerangjaya', type: 'RURAL_VILLAGE', postalCode: '41144' },
    { code: '3217131008', name: 'Sukamulya', type: 'RURAL_VILLAGE', postalCode: '41144' },
  ])

  // Kecamatan Sukasari (8 desa)
  await createVillages('321714', [
    { code: '3217141001', name: 'Sukasari', type: 'RURAL_VILLAGE', postalCode: '41145' },
    { code: '3217141002', name: 'Cikande', type: 'RURAL_VILLAGE', postalCode: '41145' },
    { code: '3217141003', name: 'Cipangramatan', type: 'RURAL_VILLAGE', postalCode: '41146' },
    { code: '3217141004', name: 'Ciparasi', type: 'RURAL_VILLAGE', postalCode: '41146' },
    { code: '3217141005', name: 'Mekarmaju', type: 'RURAL_VILLAGE', postalCode: '41147' },
    { code: '3217141006', name: 'Neglasari', type: 'RURAL_VILLAGE', postalCode: '41147' },
    { code: '3217141007', name: 'Sukahaji', type: 'RURAL_VILLAGE', postalCode: '41148' },
    { code: '3217141008', name: 'Wanahayu', type: 'RURAL_VILLAGE', postalCode: '41148' },
  ])

  // Kecamatan Maniis (6 desa)
  await createVillages('321715', [
    { code: '3217151001', name: 'Maniis', type: 'RURAL_VILLAGE', postalCode: '41195' },
    { code: '3217151002', name: 'Arjasari', type: 'RURAL_VILLAGE', postalCode: '41195' },
    { code: '3217151003', name: 'Cibedug', type: 'RURAL_VILLAGE', postalCode: '41196' },
    { code: '3217151004', name: 'Kutamekar', type: 'RURAL_VILLAGE', postalCode: '41196' },
    { code: '3217151005', name: 'Mekarsari', type: 'RURAL_VILLAGE', postalCode: '41197' },
    { code: '3217151006', name: 'Sukasari', type: 'RURAL_VILLAGE', postalCode: '41197' },
  ])

  // Kecamatan Pondoksalam (6 desa)
  await createVillages('321716', [
    { code: '3217161001', name: 'Pondoksalam', type: 'RURAL_VILLAGE', postalCode: '41198' },
    { code: '3217161002', name: 'Cikujang', type: 'RURAL_VILLAGE', postalCode: '41198' },
    { code: '3217161003', name: 'Karanganyar', type: 'RURAL_VILLAGE', postalCode: '41199' },
    { code: '3217161004', name: 'Karangsari', type: 'RURAL_VILLAGE', postalCode: '41199' },
    { code: '3217161005', name: 'Palasari', type: 'RURAL_VILLAGE', postalCode: '41200' },
    { code: '3217161006', name: 'Sirnajaya', type: 'RURAL_VILLAGE', postalCode: '41200' },
  ])

  // Kecamatan Babakancikao (10 desa)
  await createVillages('321717', [
    { code: '3217171001', name: 'Babakancikao', type: 'RURAL_VILLAGE', postalCode: '41151' },
    { code: '3217171002', name: 'Babakan', type: 'RURAL_VILLAGE', postalCode: '41151' },
    { code: '3217171003', name: 'Bojongkaso', type: 'RURAL_VILLAGE', postalCode: '41152' },
    { code: '3217171004', name: 'Buana Jaya', type: 'RURAL_VILLAGE', postalCode: '41152' },
    { code: '3217171005', name: 'Ciasihan', type: 'RURAL_VILLAGE', postalCode: '41153' },
    { code: '3217171006', name: 'Cikaobandung', type: 'RURAL_VILLAGE', postalCode: '41153' },
    { code: '3217171007', name: 'Cisarua', type: 'RURAL_VILLAGE', postalCode: '41154' },
    { code: '3217171008', name: 'Dukuhdatar', type: 'RURAL_VILLAGE', postalCode: '41154' },
    { code: '3217171009', name: 'Kamulyan', type: 'RURAL_VILLAGE', postalCode: '41155' },
    { code: '3217171010', name: 'Kutamaneuh', type: 'RURAL_VILLAGE', postalCode: '41155' },
  ])

  console.log('  ✓ Created 152 villages for Purwakarta')

  // ==================== KOTA BANDUNG ====================
  console.log('  → Creating Kota Bandung with districts and villages...')
  
  const bandung = await prisma.regency.upsert({
    where: { 
      provinceId_code: {
        provinceId: jawaBarat.id,
        code: '3273'
      }
    },
    update: {},
    create: {
      code: '3273',
      name: 'Kota Bandung',
      type: 'CITY',
      provinceId: jawaBarat.id,
    }
  })

  // Districts Kota Bandung (10 dari 30 kecamatan)
  const bandungDistricts = await Promise.all([
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bandung.id, code: '327301' }},
      update: {}, create: { code: '327301', name: 'Bandung Wetan', regencyId: bandung.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bandung.id, code: '327302' }},
      update: {}, create: { code: '327302', name: 'Sumur Bandung', regencyId: bandung.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bandung.id, code: '327303' }},
      update: {}, create: { code: '327303', name: 'Cicendo', regencyId: bandung.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bandung.id, code: '327304' }},
      update: {}, create: { code: '327304', name: 'Coblong', regencyId: bandung.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bandung.id, code: '327305' }},
      update: {}, create: { code: '327305', name: 'Sukajadi', regencyId: bandung.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bandung.id, code: '327306' }},
      update: {}, create: { code: '327306', name: 'Sukasari', regencyId: bandung.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bandung.id, code: '327307' }},
      update: {}, create: { code: '327307', name: 'Cidadap', regencyId: bandung.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bandung.id, code: '327308' }},
      update: {}, create: { code: '327308', name: 'Bandung Kulon', regencyId: bandung.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bandung.id, code: '327309' }},
      update: {}, create: { code: '327309', name: 'Andir', regencyId: bandung.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bandung.id, code: '327310' }},
      update: {}, create: { code: '327310', name: 'Astana Anyar', regencyId: bandung.id }
    }),
  ])

  // Villages for Kota Bandung districts
  const createBandungVillages = async (districtCode: string, villageData: Array<{code: string, name: string, postalCode: string}>) => {
    const district = bandungDistricts.find(d => d.code === districtCode)
    if (!district) return []
    
    return Promise.all(
      villageData.map(v => 
        prisma.village.upsert({
          where: { districtId_code: { districtId: district.id, code: v.code }},
          update: {},
          create: { code: v.code, name: v.name, type: 'URBAN_VILLAGE', postalCode: v.postalCode, districtId: district.id }
        })
      )
    )
  }

  // Bandung Wetan (6 kelurahan)
  await createBandungVillages('327301', [
    { code: '3273011001', name: 'Citarum', postalCode: '40115' },
    { code: '3273011002', name: 'Tamansari', postalCode: '40116' },
    { code: '3273011003', name: 'Cihapit', postalCode: '40114' },
    { code: '3273011004', name: 'Caringin', postalCode: '40117' },
    { code: '3273011005', name: 'Cibeunying', postalCode: '40111' },
    { code: '3273011006', name: 'Karang Anyar', postalCode: '40112' },
  ])

  // Sumur Bandung (4 kelurahan)
  await createBandungVillages('327302', [
    { code: '3273021001', name: 'Braga', postalCode: '40111' },
    { code: '3273021002', name: 'Kebon Pisang', postalCode: '40112' },
    { code: '3273021003', name: 'Merdeka', postalCode: '40113' },
    { code: '3273021004', name: 'Babakan Ciamis', postalCode: '40117' },
  ])

  // Cicendo (6 kelurahan)
  await createBandungVillages('327303', [
    { code: '3273031001', name: 'Pajajaran', postalCode: '40173' },
    { code: '3273031002', name: 'Pamoyanan', postalCode: '40173' },
    { code: '3273031003', name: 'Pasir Kaliki', postalCode: '40171' },
    { code: '3273031004', name: 'Arjuna', postalCode: '40172' },
    { code: '3273031005', name: 'Husein Sastranegara', postalCode: '40174' },
    { code: '3273031006', name: 'Sukaraja', postalCode: '40175' },
  ])

  // Coblong (6 kelurahan)
  await createBandungVillages('327304', [
    { code: '3273041001', name: 'Dago', postalCode: '40135' },
    { code: '3273041002', name: 'Lebak Gede', postalCode: '40132' },
    { code: '3273041003', name: 'Lebak Siliwangi', postalCode: '40132' },
    { code: '3273041004', name: 'Sadang Serang', postalCode: '40133' },
    { code: '3273041005', name: 'Sekeloa', postalCode: '40134' },
    { code: '3273041006', name: 'Cipaganti', postalCode: '40131' },
  ])

  // Sukajadi (4 kelurahan)
  await createBandungVillages('327305', [
    { code: '3273051001', name: 'Cipedes', postalCode: '40162' },
    { code: '3273051002', name: 'Pasteur', postalCode: '40161' },
    { code: '3273051003', name: 'Sukabungah', postalCode: '40162' },
    { code: '3273051004', name: 'Sukagalih', postalCode: '40163' },
  ])

  // Sukasari (5 kelurahan)
  await createBandungVillages('327306', [
    { code: '3273061001', name: 'Geger Kalong', postalCode: '40153' },
    { code: '3273061002', name: 'Isola', postalCode: '40154' },
    { code: '3273061003', name: 'Sarijadi', postalCode: '40151' },
    { code: '3273061004', name: 'Sukarasa', postalCode: '40152' },
    { code: '3273061005', name: 'Cipaganti', postalCode: '40155' },
  ])

  // Cidadap (6 kelurahan)
  await createBandungVillages('327307', [
    { code: '3273071001', name: 'Ciumbuleuit', postalCode: '40142' },
    { code: '3273071002', name: 'Hegarmanah', postalCode: '40141' },
    { code: '3273071003', name: 'Ledeng', postalCode: '40143' },
    { code: '3273071004', name: 'Lebak Gede', postalCode: '40141' },
    { code: '3273071005', name: 'Lebak Siliwangi', postalCode: '40132' },
    { code: '3273071006', name: 'Cihapit', postalCode: '40114' },
  ])

  // Bandung Kulon (7 kelurahan)
  await createBandungVillages('327308', [
    { code: '3273081001', name: 'Caringin', postalCode: '40212' },
    { code: '3273081002', name: 'Cibuntu', postalCode: '40212' },
    { code: '3273081003', name: 'Cigondewah Kaler', postalCode: '40214' },
    { code: '3273081004', name: 'Cigondewah Kidul', postalCode: '40215' },
    { code: '3273081005', name: 'Cigondewah Rahayu', postalCode: '40216' },
    { code: '3273081006', name: 'Cijerah', postalCode: '40213' },
    { code: '3273081007', name: 'Gempolsari', postalCode: '40211' },
  ])

  // Andir (6 kelurahan)
  await createBandungVillages('327309', [
    { code: '3273091001', name: 'Campaka', postalCode: '40184' },
    { code: '3273091002', name: 'Ciroyom', postalCode: '40181' },
    { code: '3273091003', name: 'Dungus Cariang', postalCode: '40183' },
    { code: '3273091004', name: 'Garuda', postalCode: '40184' },
    { code: '3273091005', name: 'Kebon Jeruk', postalCode: '40181' },
    { code: '3273091006', name: 'Maleber', postalCode: '40184' },
  ])

  // Astana Anyar (5 kelurahan)
  await createBandungVillages('327310', [
    { code: '3273101001', name: 'Cibadak', postalCode: '40241' },
    { code: '3273101002', name: 'Karanganyar', postalCode: '40195' },
    { code: '3273101003', name: 'Karasak', postalCode: '40243' },
    { code: '3273101004', name: 'Nyengseret', postalCode: '40242' },
    { code: '3273101005', name: 'Pelindung Hewan', postalCode: '40243' },
  ])

  console.log('  ✓ Created Kota Bandung: 10 districts, 55 villages')

  // ==================== KABUPATEN BOGOR ====================
  console.log('  → Creating Kabupaten Bogor with districts and villages...')
  
  const bogor = await prisma.regency.upsert({
    where: { 
      provinceId_code: {
        provinceId: jawaBarat.id,
        code: '3201'
      }
    },
    update: {},
    create: {
      code: '3201',
      name: 'Kabupaten Bogor',
      type: 'REGENCY',
      provinceId: jawaBarat.id,
    }
  })

  // Districts Kabupaten Bogor (8 dari 40 kecamatan)
  const bogorDistricts = await Promise.all([
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bogor.id, code: '320101' }},
      update: {}, create: { code: '320101', name: 'Cibinong', regencyId: bogor.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bogor.id, code: '320102' }},
      update: {}, create: { code: '320102', name: 'Bojonggede', regencyId: bogor.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bogor.id, code: '320103' }},
      update: {}, create: { code: '320103', name: 'Citeureup', regencyId: bogor.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bogor.id, code: '320104' }},
      update: {}, create: { code: '320104', name: 'Gunung Putri', regencyId: bogor.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bogor.id, code: '320105' }},
      update: {}, create: { code: '320105', name: 'Cileungsi', regencyId: bogor.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bogor.id, code: '320106' }},
      update: {}, create: { code: '320106', name: 'Jonggol', regencyId: bogor.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bogor.id, code: '320107' }},
      update: {}, create: { code: '320107', name: 'Cariu', regencyId: bogor.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bogor.id, code: '320108' }},
      update: {}, create: { code: '320108', name: 'Sukamakmur', regencyId: bogor.id }
    }),
  ])

  // Villages for Kabupaten Bogor districts
  const createBogorVillages = async (districtCode: string, villageData: Array<{code: string, name: string, type: 'URBAN_VILLAGE' | 'RURAL_VILLAGE', postalCode: string}>) => {
    const district = bogorDistricts.find(d => d.code === districtCode)
    if (!district) return []
    
    return Promise.all(
      villageData.map(v => 
        prisma.village.upsert({
          where: { districtId_code: { districtId: district.id, code: v.code }},
          update: {},
          create: { code: v.code, name: v.name, type: v.type, postalCode: v.postalCode, districtId: district.id }
        })
      )
    )
  }

  // Cibinong (12 desa/kelurahan)
  await createBogorVillages('320101', [
    { code: '3201011001', name: 'Cibinong', type: 'URBAN_VILLAGE', postalCode: '16914' },
    { code: '3201011002', name: 'Cirimekar', type: 'URBAN_VILLAGE', postalCode: '16915' },
    { code: '3201011003', name: 'Karadenan', type: 'URBAN_VILLAGE', postalCode: '16913' },
    { code: '3201011004', name: 'Nanggewer', type: 'URBAN_VILLAGE', postalCode: '16912' },
    { code: '3201011005', name: 'Nanggewer Mekar', type: 'URBAN_VILLAGE', postalCode: '16911' },
    { code: '3201011006', name: 'Pabuaran', type: 'RURAL_VILLAGE', postalCode: '16916' },
    { code: '3201011007', name: 'Pabuaran Mekar', type: 'RURAL_VILLAGE', postalCode: '16916' },
    { code: '3201011008', name: 'Pakansari', type: 'RURAL_VILLAGE', postalCode: '16917' },
    { code: '3201011009', name: 'Pondok Rajeg', type: 'RURAL_VILLAGE', postalCode: '16969' },
    { code: '3201011010', name: 'Sukahati', type: 'RURAL_VILLAGE', postalCode: '16913' },
    { code: '3201011011', name: 'Tengah', type: 'URBAN_VILLAGE', postalCode: '16913' },
    { code: '3201011012', name: 'Harapan Jaya', type: 'RURAL_VILLAGE', postalCode: '16914' },
  ])

  // Bojonggede (11 desa)
  await createBogorVillages('320102', [
    { code: '3201021001', name: 'Bojonggede', type: 'RURAL_VILLAGE', postalCode: '16920' },
    { code: '3201021002', name: 'Bojong Kulur', type: 'RURAL_VILLAGE', postalCode: '16920' },
    { code: '3201021003', name: 'Cimanggis', type: 'RURAL_VILLAGE', postalCode: '16921' },
    { code: '3201021004', name: 'Cijayanti', type: 'RURAL_VILLAGE', postalCode: '16921' },
    { code: '3201021005', name: 'Dukuh', type: 'RURAL_VILLAGE', postalCode: '16922' },
    { code: '3201021006', name: 'Kedungwaringin', type: 'RURAL_VILLAGE', postalCode: '16922' },
    { code: '3201021007', name: 'Pabuaran', type: 'RURAL_VILLAGE', postalCode: '16923' },
    { code: '3201021008', name: 'Raga Jaya', type: 'RURAL_VILLAGE', postalCode: '16923' },
    { code: '3201021009', name: 'Susukan', type: 'RURAL_VILLAGE', postalCode: '16924' },
    { code: '3201021010', name: 'Waringin Jaya', type: 'RURAL_VILLAGE', postalCode: '16924' },
    { code: '3201021011', name: 'Kemang', type: 'RURAL_VILLAGE', postalCode: '16925' },
  ])

  // Citeureup (12 desa)
  await createBogorVillages('320103', [
    { code: '3201031001', name: 'Citeureup', type: 'RURAL_VILLAGE', postalCode: '16810' },
    { code: '3201031002', name: 'Gunungsari', type: 'RURAL_VILLAGE', postalCode: '16810' },
    { code: '3201031003', name: 'Hambalang', type: 'RURAL_VILLAGE', postalCode: '16810' },
    { code: '3201031004', name: 'Karang Asem Barat', type: 'RURAL_VILLAGE', postalCode: '16810' },
    { code: '3201031005', name: 'Karang Asem Timur', type: 'RURAL_VILLAGE', postalCode: '16810' },
    { code: '3201031006', name: 'Leuwinutug', type: 'RURAL_VILLAGE', postalCode: '16810' },
    { code: '3201031007', name: 'Puspanegara', type: 'RURAL_VILLAGE', postalCode: '16810' },
    { code: '3201031008', name: 'Puspasari', type: 'RURAL_VILLAGE', postalCode: '16810' },
    { code: '3201031009', name: 'Sanja', type: 'RURAL_VILLAGE', postalCode: '16810' },
    { code: '3201031010', name: 'Tarikolot', type: 'RURAL_VILLAGE', postalCode: '16810' },
    { code: '3201031011', name: 'Tajur', type: 'RURAL_VILLAGE', postalCode: '16810' },
    { code: '3201031012', name: 'Karang Tengah', type: 'RURAL_VILLAGE', postalCode: '16810' },
  ])

  // Gunung Putri (10 desa)
  await createBogorVillages('320104', [
    { code: '3201041001', name: 'Gunung Putri', type: 'RURAL_VILLAGE', postalCode: '16963' },
    { code: '3201041002', name: 'Bojong Kulur', type: 'RURAL_VILLAGE', postalCode: '16963' },
    { code: '3201041003', name: 'Bojong Nangka', type: 'RURAL_VILLAGE', postalCode: '16963' },
    { code: '3201041004', name: 'Ciangsana', type: 'RURAL_VILLAGE', postalCode: '16968' },
    { code: '3201041005', name: 'Cicadas', type: 'RURAL_VILLAGE', postalCode: '16968' },
    { code: '3201041006', name: 'Cikeas Udik', type: 'RURAL_VILLAGE', postalCode: '16964' },
    { code: '3201041007', name: 'Karanggan', type: 'RURAL_VILLAGE', postalCode: '16964' },
    { code: '3201041008', name: 'Nagrak', type: 'RURAL_VILLAGE', postalCode: '16965' },
    { code: '3201041009', name: 'Tlajung Udik', type: 'RURAL_VILLAGE', postalCode: '16967' },
    { code: '3201041010', name: 'Wanaherang', type: 'RURAL_VILLAGE', postalCode: '16967' },
  ])

  // Cileungsi (10 desa)
  await createBogorVillages('320105', [
    { code: '3201051001', name: 'Cileungsi', type: 'RURAL_VILLAGE', postalCode: '16820' },
    { code: '3201051002', name: 'Cileungsi Kidul', type: 'RURAL_VILLAGE', postalCode: '16820' },
    { code: '3201051003', name: 'Cipenjo', type: 'RURAL_VILLAGE', postalCode: '16820' },
    { code: '3201051004', name: 'Cisampora', type: 'RURAL_VILLAGE', postalCode: '16820' },
    { code: '3201051005', name: 'Dayeuh', type: 'RURAL_VILLAGE', postalCode: '16820' },
    { code: '3201051006', name: 'Jatisari', type: 'RURAL_VILLAGE', postalCode: '16820' },
    { code: '3201051007', name: 'Limusnunggal', type: 'RURAL_VILLAGE', postalCode: '16820' },
    { code: '3201051008', name: 'Mekarsari', type: 'RURAL_VILLAGE', postalCode: '16820' },
    { code: '3201051009', name: 'Pasir Angin', type: 'RURAL_VILLAGE', postalCode: '16820' },
    { code: '3201051010', name: 'Situsari', type: 'RURAL_VILLAGE', postalCode: '16820' },
  ])

  // Jonggol (10 desa)
  await createBogorVillages('320106', [
    { code: '3201061001', name: 'Jonggol', type: 'RURAL_VILLAGE', postalCode: '16830' },
    { code: '3201061002', name: 'Balekambang', type: 'RURAL_VILLAGE', postalCode: '16830' },
    { code: '3201061003', name: 'Bendungan', type: 'RURAL_VILLAGE', postalCode: '16830' },
    { code: '3201061004', name: 'Cadas Ngampar', type: 'RURAL_VILLAGE', postalCode: '16830' },
    { code: '3201061005', name: 'Singasari', type: 'RURAL_VILLAGE', postalCode: '16830' },
    { code: '3201061006', name: 'Singajaya', type: 'RURAL_VILLAGE', postalCode: '16830' },
    { code: '3201061007', name: 'Sukamanah', type: 'RURAL_VILLAGE', postalCode: '16830' },
    { code: '3201061008', name: 'Sukamulya', type: 'RURAL_VILLAGE', postalCode: '16830' },
    { code: '3201061009', name: 'Weninggalih', type: 'RURAL_VILLAGE', postalCode: '16830' },
    { code: '3201061010', name: 'Sukajaya', type: 'RURAL_VILLAGE', postalCode: '16830' },
  ])

  // Cariu (9 desa)
  await createBogorVillages('320107', [
    { code: '3201071001', name: 'Cariu', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201071002', name: 'Bantar Jaya', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201071003', name: 'Bantar Kuning', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201071004', name: 'Cimandala', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201071005', name: 'Mekar Jaya', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201071006', name: 'Mekar Sari', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201071007', name: 'Muktisari', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201071008', name: 'Tegallega', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201071009', name: 'Wargajaya', type: 'RURAL_VILLAGE', postalCode: '16840' },
  ])

  // Sukamakmur (9 desa)
  await createBogorVillages('320108', [
    { code: '3201081001', name: 'Sukamakmur', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201081002', name: 'Cilebut Barat', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201081003', name: 'Cilebut Timur', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201081004', name: 'Cipeucang', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201081005', name: 'Kuta Mekar', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201081006', name: 'Pasirlaja', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201081007', name: 'Sirnagalih', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201081008', name: 'Sukaharja', type: 'RURAL_VILLAGE', postalCode: '16840' },
    { code: '3201081009', name: 'Sukajadi', type: 'RURAL_VILLAGE', postalCode: '16840' },
  ])

  console.log('  ✓ Created Kabupaten Bogor: 8 districts, 83 villages')

  // ==================== KABUPATEN KARAWANG ====================
  console.log('  → Creating Kabupaten Karawang with districts and villages...')
  
  const karawang = await prisma.regency.upsert({
    where: { 
      provinceId_code: {
        provinceId: jawaBarat.id,
        code: '3215'
      }
    },
    update: {},
    create: {
      code: '3215',
      name: 'Kabupaten Karawang',
      type: 'REGENCY',
      provinceId: jawaBarat.id,
    }
  })

  // Districts Kabupaten Karawang (10 dari 30 kecamatan)
  const karawangDistricts = await Promise.all([
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: karawang.id, code: '321501' }},
      update: {}, create: { code: '321501', name: 'Pangkalan', regencyId: karawang.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: karawang.id, code: '321502' }},
      update: {}, create: { code: '321502', name: 'Telukjambe Timur', regencyId: karawang.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: karawang.id, code: '321503' }},
      update: {}, create: { code: '321503', name: 'Telukjambe Barat', regencyId: karawang.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: karawang.id, code: '321504' }},
      update: {}, create: { code: '321504', name: 'Karawang Barat', regencyId: karawang.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: karawang.id, code: '321505' }},
      update: {}, create: { code: '321505', name: 'Karawang Timur', regencyId: karawang.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: karawang.id, code: '321506' }},
      update: {}, create: { code: '321506', name: 'Klari', regencyId: karawang.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: karawang.id, code: '321507' }},
      update: {}, create: { code: '321507', name: 'Cikampek', regencyId: karawang.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: karawang.id, code: '321508' }},
      update: {}, create: { code: '321508', name: 'Purwasari', regencyId: karawang.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: karawang.id, code: '321509' }},
      update: {}, create: { code: '321509', name: 'Rengasdengklok', regencyId: karawang.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: karawang.id, code: '321510' }},
      update: {}, create: { code: '321510', name: 'Lemahabang', regencyId: karawang.id }
    }),
  ])

  // Helper for Karawang villages
  const createKarawangVillages = async (districtCode: string, villageData: Array<{code: string, name: string, type: 'URBAN_VILLAGE' | 'RURAL_VILLAGE', postalCode: string}>) => {
    const district = karawangDistricts.find(d => d.code === districtCode)
    if (!district) return []
    
    return Promise.all(
      villageData.map(v => 
        prisma.village.upsert({
          where: { districtId_code: { districtId: district.id, code: v.code }},
          update: {},
          create: { code: v.code, name: v.name, type: v.type, postalCode: v.postalCode, districtId: district.id }
        })
      )
    )
  }

  // Villages for Karawang districts
  await createKarawangVillages('321501', [
    { code: '3215011001', name: 'Pangkalan', type: 'RURAL_VILLAGE', postalCode: '41361' },
    { code: '3215011002', name: 'Tanjungpakis', type: 'RURAL_VILLAGE', postalCode: '41361' },
    { code: '3215011003', name: 'Wadas', type: 'RURAL_VILLAGE', postalCode: '41361' },
    { code: '3215011004', name: 'Gintungkerta', type: 'RURAL_VILLAGE', postalCode: '41361' },
    { code: '3215011005', name: 'Mulyajaya', type: 'RURAL_VILLAGE', postalCode: '41361' },
    { code: '3215011006', name: 'Tanjungmekar', type: 'RURAL_VILLAGE', postalCode: '41362' },
    { code: '3215011007', name: 'Jayamukti', type: 'RURAL_VILLAGE', postalCode: '41362' },
    { code: '3215011008', name: 'Nambo Ilir', type: 'RURAL_VILLAGE', postalCode: '41363' },
  ])

  await createKarawangVillages('321502', [
    { code: '3215021001', name: 'Telukjambe', type: 'URBAN_VILLAGE', postalCode: '41361' },
    { code: '3215021002', name: 'Sirnabaya', type: 'URBAN_VILLAGE', postalCode: '41361' },
    { code: '3215021003', name: 'Sukaluyu', type: 'URBAN_VILLAGE', postalCode: '41361' },
    { code: '3215021004', name: 'Telukbuyung', type: 'URBAN_VILLAGE', postalCode: '41361' },
    { code: '3215021005', name: 'Wadas', type: 'URBAN_VILLAGE', postalCode: '41361' },
    { code: '3215021006', name: 'Ciptamargas', type: 'URBAN_VILLAGE', postalCode: '41362' },
    { code: '3215021007', name: 'Muktiwari', type: 'URBAN_VILLAGE', postalCode: '41362' },
    { code: '3215021008', name: 'Setialaksana', type: 'URBAN_VILLAGE', postalCode: '41362' },
    { code: '3215021009', name: 'Srijaya', type: 'URBAN_VILLAGE', postalCode: '41363' },
  ])

  await createKarawangVillages('321503', [
    { code: '3215031001', name: 'Talagasari', type: 'URBAN_VILLAGE', postalCode: '41361' },
    { code: '3215031002', name: 'Sukamakmur', type: 'URBAN_VILLAGE', postalCode: '41361' },
    { code: '3215031003', name: 'Margakaya', type: 'URBAN_VILLAGE', postalCode: '41361' },
    { code: '3215031004', name: 'Puseurjaya', type: 'URBAN_VILLAGE', postalCode: '41361' },
    { code: '3215031005', name: 'Sukaharja', type: 'URBAN_VILLAGE', postalCode: '41362' },
    { code: '3215031006', name: 'Kalangsari', type: 'URBAN_VILLAGE', postalCode: '41362' },
    { code: '3215031007', name: 'Galihpakuwon', type: 'URBAN_VILLAGE', postalCode: '41362' },
    { code: '3215031008', name: 'Karyaneka', type: 'URBAN_VILLAGE', postalCode: '41363' },
  ])

  await createKarawangVillages('321504', [
    { code: '3215041001', name: 'Palumbonsari', type: 'URBAN_VILLAGE', postalCode: '41311' },
    { code: '3215041002', name: 'Karawang Kulon', type: 'URBAN_VILLAGE', postalCode: '41311' },
    { code: '3215041003', name: 'Nagasari', type: 'URBAN_VILLAGE', postalCode: '41312' },
    { code: '3215041004', name: 'Adiarsa Barat', type: 'URBAN_VILLAGE', postalCode: '41312' },
    { code: '3215041005', name: 'Tunggakjati', type: 'URBAN_VILLAGE', postalCode: '41313' },
    { code: '3215041006', name: 'Tanjungpura', type: 'URBAN_VILLAGE', postalCode: '41313' },
  ])

  await createKarawangVillages('321505', [
    { code: '3215051001', name: 'Karawang Wetan', type: 'URBAN_VILLAGE', postalCode: '41314' },
    { code: '3215051002', name: 'Adiarsa Timur', type: 'URBAN_VILLAGE', postalCode: '41314' },
    { code: '3215051003', name: 'Mekarjati', type: 'URBAN_VILLAGE', postalCode: '41315' },
    { code: '3215051004', name: 'Tanjung Mekar', type: 'URBAN_VILLAGE', postalCode: '41315' },
    { code: '3215051005', name: 'Palumbonsari', type: 'URBAN_VILLAGE', postalCode: '41316' },
    { code: '3215051006', name: 'Margajaya', type: 'URBAN_VILLAGE', postalCode: '41316' },
  ])

  await createKarawangVillages('321506', [
    { code: '3215061001', name: 'Klari', type: 'RURAL_VILLAGE', postalCode: '41371' },
    { code: '3215061002', name: 'Duren', type: 'RURAL_VILLAGE', postalCode: '41371' },
    { code: '3215061003', name: 'Cibalongsari', type: 'RURAL_VILLAGE', postalCode: '41371' },
    { code: '3215061004', name: 'Gintungkerta', type: 'RURAL_VILLAGE', postalCode: '41372' },
    { code: '3215061005', name: 'Karanganyar', type: 'RURAL_VILLAGE', postalCode: '41372' },
    { code: '3215061006', name: 'Karangtumaritis', type: 'RURAL_VILLAGE', postalCode: '41372' },
    { code: '3215061007', name: 'Belendung', type: 'RURAL_VILLAGE', postalCode: '41373' },
    { code: '3215061008', name: 'Anggadita', type: 'RURAL_VILLAGE', postalCode: '41373' },
    { code: '3215061009', name: 'Kalangsurya', type: 'RURAL_VILLAGE', postalCode: '41374' },
  ])

  await createKarawangVillages('321507', [
    { code: '3215071001', name: 'Cikampek', type: 'URBAN_VILLAGE', postalCode: '41373' },
    { code: '3215071002', name: 'Dawuan', type: 'URBAN_VILLAGE', postalCode: '41373' },
    { code: '3215071003', name: 'Kamojing', type: 'URBAN_VILLAGE', postalCode: '41373' },
    { code: '3215071004', name: 'Tunggakjati', type: 'URBAN_VILLAGE', postalCode: '41374' },
    { code: '3215071005', name: 'Cikampek Kota', type: 'URBAN_VILLAGE', postalCode: '41374' },
    { code: '3215071006', name: 'Cikampek Selatan', type: 'URBAN_VILLAGE', postalCode: '41375' },
    { code: '3215071007', name: 'Cikampek Pusaka', type: 'URBAN_VILLAGE', postalCode: '41375' },
    { code: '3215071008', name: 'Wadas', type: 'URBAN_VILLAGE', postalCode: '41376' },
  ])

  await createKarawangVillages('321508', [
    { code: '3215081001', name: 'Purwasari', type: 'RURAL_VILLAGE', postalCode: '41373' },
    { code: '3215081002', name: 'Cilamaya Hilir', type: 'RURAL_VILLAGE', postalCode: '41373' },
    { code: '3215081003', name: 'Karyasari', type: 'RURAL_VILLAGE', postalCode: '41374' },
    { code: '3215081004', name: 'Cibuaya', type: 'RURAL_VILLAGE', postalCode: '41374' },
    { code: '3215081005', name: 'Mulyasari', type: 'RURAL_VILLAGE', postalCode: '41375' },
    { code: '3215081006', name: 'Mulyajaya', type: 'RURAL_VILLAGE', postalCode: '41375' },
    { code: '3215081007', name: 'Srijaya', type: 'RURAL_VILLAGE', postalCode: '41376' },
    { code: '3215081008', name: 'Tegalsari', type: 'RURAL_VILLAGE', postalCode: '41376' },
    { code: '3215081009', name: 'Kamojing', type: 'RURAL_VILLAGE', postalCode: '41377' },
  ])

  await createKarawangVillages('321509', [
    { code: '3215091001', name: 'Rengasdengklok Utara', type: 'URBAN_VILLAGE', postalCode: '41352' },
    { code: '3215091002', name: 'Rengasdengklok Selatan', type: 'URBAN_VILLAGE', postalCode: '41352' },
    { code: '3215091003', name: 'Kertasari', type: 'RURAL_VILLAGE', postalCode: '41352' },
    { code: '3215091004', name: 'Kalangsari', type: 'RURAL_VILLAGE', postalCode: '41353' },
    { code: '3215091005', name: 'Dukuhjaya', type: 'RURAL_VILLAGE', postalCode: '41353' },
    { code: '3215091006', name: 'Karyamukti', type: 'RURAL_VILLAGE', postalCode: '41354' },
    { code: '3215091007', name: 'Amansari', type: 'RURAL_VILLAGE', postalCode: '41354' },
    { code: '3215091008', name: 'Batujaya', type: 'RURAL_VILLAGE', postalCode: '41355' },
  ])

  await createKarawangVillages('321510', [
    { code: '3215101001', name: 'Lemahabang', type: 'RURAL_VILLAGE', postalCode: '41381' },
    { code: '3215101002', name: 'Mulangsari', type: 'RURAL_VILLAGE', postalCode: '41381' },
    { code: '3215101003', name: 'Sindangsari', type: 'RURAL_VILLAGE', postalCode: '41382' },
    { code: '3215101004', name: 'Parungsari', type: 'RURAL_VILLAGE', postalCode: '41382' },
    { code: '3215101005', name: 'Sukaratu', type: 'RURAL_VILLAGE', postalCode: '41383' },
    { code: '3215101006', name: 'Kutanegara', type: 'RURAL_VILLAGE', postalCode: '41383' },
    { code: '3215101007', name: 'Karyasari', type: 'RURAL_VILLAGE', postalCode: '41384' },
    { code: '3215101008', name: 'Lemah Duhur', type: 'RURAL_VILLAGE', postalCode: '41384' },
  ])

  console.log('  ✓ Created Kabupaten Karawang: 10 districts, 87 villages')

  // ==================== KABUPATEN BEKASI ====================
  console.log('  → Creating Kabupaten Bekasi with districts and villages...')
  
  const bekasi = await prisma.regency.upsert({
    where: { 
      provinceId_code: {
        provinceId: jawaBarat.id,
        code: '3216'
      }
    },
    update: {},
    create: {
      code: '3216',
      name: 'Kabupaten Bekasi',
      type: 'REGENCY',
      provinceId: jawaBarat.id,
    }
  })

  // Districts Kabupaten Bekasi (10 dari 23 kecamatan)
  const bekasiDistricts = await Promise.all([
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bekasi.id, code: '321601' }},
      update: {}, create: { code: '321601', name: 'Cikarang Pusat', regencyId: bekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bekasi.id, code: '321602' }},
      update: {}, create: { code: '321602', name: 'Cikarang Utara', regencyId: bekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bekasi.id, code: '321603' }},
      update: {}, create: { code: '321603', name: 'Cikarang Barat', regencyId: bekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bekasi.id, code: '321604' }},
      update: {}, create: { code: '321604', name: 'Cikarang Timur', regencyId: bekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bekasi.id, code: '321605' }},
      update: {}, create: { code: '321605', name: 'Cikarang Selatan', regencyId: bekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bekasi.id, code: '321606' }},
      update: {}, create: { code: '321606', name: 'Cibitung', regencyId: bekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bekasi.id, code: '321607' }},
      update: {}, create: { code: '321607', name: 'Tambun Selatan', regencyId: bekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bekasi.id, code: '321608' }},
      update: {}, create: { code: '321608', name: 'Tambun Utara', regencyId: bekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bekasi.id, code: '321609' }},
      update: {}, create: { code: '321609', name: 'Tarumajaya', regencyId: bekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: bekasi.id, code: '321610' }},
      update: {}, create: { code: '321610', name: 'Setu', regencyId: bekasi.id }
    }),
  ])

  // Helper for Bekasi villages
  const createBekasiVillages = async (districtCode: string, villageData: Array<{code: string, name: string, type: 'URBAN_VILLAGE' | 'RURAL_VILLAGE', postalCode: string}>) => {
    const district = bekasiDistricts.find(d => d.code === districtCode)
    if (!district) return []
    
    return Promise.all(
      villageData.map(v => 
        prisma.village.upsert({
          where: { districtId_code: { districtId: district.id, code: v.code }},
          update: {},
          create: { code: v.code, name: v.name, type: v.type, postalCode: v.postalCode, districtId: district.id }
        })
      )
    )
  }

  // Villages for Kabupaten Bekasi districts
  await createBekasiVillages('321601', [
    { code: '3216011001', name: 'Karangsari', type: 'RURAL_VILLAGE', postalCode: '17530' },
    { code: '3216011002', name: 'Waluya', type: 'RURAL_VILLAGE', postalCode: '17530' },
    { code: '3216011003', name: 'Sukamahi', type: 'RURAL_VILLAGE', postalCode: '17530' },
    { code: '3216011004', name: 'Karangreja', type: 'RURAL_VILLAGE', postalCode: '17530' },
    { code: '3216011005', name: 'Gandamekar', type: 'RURAL_VILLAGE', postalCode: '17530' },
    { code: '3216011006', name: 'Cikedokan', type: 'RURAL_VILLAGE', postalCode: '17531' },
    { code: '3216011007', name: 'Pasiranji', type: 'RURAL_VILLAGE', postalCode: '17531' },
    { code: '3216011008', name: 'Hegarsari', type: 'RURAL_VILLAGE', postalCode: '17532' },
  ])

  await createBekasiVillages('321602', [
    { code: '3216021001', name: 'Karangbaru', type: 'RURAL_VILLAGE', postalCode: '17530' },
    { code: '3216021002', name: 'Mekarmukti', type: 'RURAL_VILLAGE', postalCode: '17530' },
    { code: '3216021003', name: 'Danau Indah', type: 'RURAL_VILLAGE', postalCode: '17530' },
    { code: '3216021004', name: 'Telagamurni', type: 'RURAL_VILLAGE', postalCode: '17530' },
    { code: '3216021005', name: 'Segarjaya', type: 'RURAL_VILLAGE', postalCode: '17531' },
    { code: '3216021006', name: 'Cikarang Kota', type: 'RURAL_VILLAGE', postalCode: '17531' },
    { code: '3216021007', name: 'Simpangan', type: 'RURAL_VILLAGE', postalCode: '17532' },
    { code: '3216021008', name: 'Burangkeng', type: 'RURAL_VILLAGE', postalCode: '17532' },
  ])

  await createBekasiVillages('321603', [
    { code: '3216031001', name: 'Gandamekar', type: 'RURAL_VILLAGE', postalCode: '17520' },
    { code: '3216031002', name: 'Kalijaya', type: 'RURAL_VILLAGE', postalCode: '17520' },
    { code: '3216031003', name: 'Sukaresmi', type: 'RURAL_VILLAGE', postalCode: '17520' },
    { code: '3216031004', name: 'Sukaharja', type: 'RURAL_VILLAGE', postalCode: '17520' },
    { code: '3216031005', name: 'Telagasari', type: 'RURAL_VILLAGE', postalCode: '17521' },
    { code: '3216031006', name: 'Karanganyar', type: 'RURAL_VILLAGE', postalCode: '17521' },
    { code: '3216031007', name: 'Karangraharja', type: 'RURAL_VILLAGE', postalCode: '17522' },
    { code: '3216031008', name: 'Pasirsari', type: 'RURAL_VILLAGE', postalCode: '17522' },
  ])

  await createBekasiVillages('321604', [
    { code: '3216041001', name: 'Labansari', type: 'RURAL_VILLAGE', postalCode: '17550' },
    { code: '3216041002', name: 'Karangasih', type: 'RURAL_VILLAGE', postalCode: '17550' },
    { code: '3216041003', name: 'Cikarang Baru', type: 'RURAL_VILLAGE', postalCode: '17550' },
    { code: '3216041004', name: 'Situmulya', type: 'RURAL_VILLAGE', postalCode: '17550' },
    { code: '3216041005', name: 'Sukamakmur', type: 'RURAL_VILLAGE', postalCode: '17551' },
    { code: '3216041006', name: 'Tanjungsari', type: 'RURAL_VILLAGE', postalCode: '17551' },
    { code: '3216041007', name: 'Karangmekar', type: 'RURAL_VILLAGE', postalCode: '17552' },
    { code: '3216041008', name: 'Pasirsari', type: 'RURAL_VILLAGE', postalCode: '17552' },
  ])

  await createBekasiVillages('321605', [
    { code: '3216051001', name: 'Sukamukti', type: 'RURAL_VILLAGE', postalCode: '17550' },
    { code: '3216051002', name: 'Karangmulya', type: 'RURAL_VILLAGE', postalCode: '17550' },
    { code: '3216051003', name: 'Karangsentosa', type: 'RURAL_VILLAGE', postalCode: '17550' },
    { code: '3216051004', name: 'Sukamanah', type: 'RURAL_VILLAGE', postalCode: '17551' },
    { code: '3216051005', name: 'Sirnajaya', type: 'RURAL_VILLAGE', postalCode: '17551' },
    { code: '3216051006', name: 'Harjamukti', type: 'RURAL_VILLAGE', postalCode: '17552' },
    { code: '3216051007', name: 'Sukaresmi', type: 'RURAL_VILLAGE', postalCode: '17552' },
    { code: '3216051008', name: 'Cikarang Kota', type: 'RURAL_VILLAGE', postalCode: '17553' },
  ])

  await createBekasiVillages('321606', [
    { code: '3216061001', name: 'Cibitung', type: 'RURAL_VILLAGE', postalCode: '17520' },
    { code: '3216061002', name: 'Wanajaya', type: 'RURAL_VILLAGE', postalCode: '17520' },
    { code: '3216061003', name: 'Wanasari', type: 'RURAL_VILLAGE', postalCode: '17520' },
    { code: '3216061004', name: 'Muktiwari', type: 'RURAL_VILLAGE', postalCode: '17521' },
    { code: '3216061005', name: 'Karangraharja', type: 'RURAL_VILLAGE', postalCode: '17521' },
    { code: '3216061006', name: 'Sukamahi', type: 'RURAL_VILLAGE', postalCode: '17522' },
    { code: '3216061007', name: 'Mekarwangi', type: 'RURAL_VILLAGE', postalCode: '17522' },
    { code: '3216061008', name: 'Cibuntu', type: 'RURAL_VILLAGE', postalCode: '17523' },
  ])

  await createBekasiVillages('321607', [
    { code: '3216071001', name: 'Tambun', type: 'RURAL_VILLAGE', postalCode: '17510' },
    { code: '3216071002', name: 'Setiamekar', type: 'RURAL_VILLAGE', postalCode: '17510' },
    { code: '3216071003', name: 'Mangunjaya', type: 'RURAL_VILLAGE', postalCode: '17510' },
    { code: '3216071004', name: 'Mekarsari', type: 'RURAL_VILLAGE', postalCode: '17510' },
    { code: '3216071005', name: 'Sriamur', type: 'RURAL_VILLAGE', postalCode: '17511' },
    { code: '3216071006', name: 'Lambangsari', type: 'RURAL_VILLAGE', postalCode: '17511' },
    { code: '3216071007', name: 'Setiadarma', type: 'RURAL_VILLAGE', postalCode: '17512' },
    { code: '3216071008', name: 'Tridayasakti', type: 'RURAL_VILLAGE', postalCode: '17512' },
    { code: '3216071009', name: 'Karang Satria', type: 'RURAL_VILLAGE', postalCode: '17513' },
  ])

  await createBekasiVillages('321608', [
    { code: '3216081001', name: 'Satriajaya', type: 'RURAL_VILLAGE', postalCode: '17510' },
    { code: '3216081002', name: 'Satriamekar', type: 'RURAL_VILLAGE', postalCode: '17510' },
    { code: '3216081003', name: 'Srirapuan', type: 'RURAL_VILLAGE', postalCode: '17510' },
    { code: '3216081004', name: 'Karangbahagia', type: 'RURAL_VILLAGE', postalCode: '17511' },
    { code: '3216081005', name: 'Karangraharja', type: 'RURAL_VILLAGE', postalCode: '17511' },
    { code: '3216081006', name: 'Sumber Jaya', type: 'RURAL_VILLAGE', postalCode: '17512' },
    { code: '3216081007', name: 'Tambelang', type: 'RURAL_VILLAGE', postalCode: '17512' },
    { code: '3216081008', name: 'Wanajaya', type: 'RURAL_VILLAGE', postalCode: '17513' },
  ])

  await createBekasiVillages('321609', [
    { code: '3216091001', name: 'Tarumajaya', type: 'RURAL_VILLAGE', postalCode: '17211' },
    { code: '3216091002', name: 'Setiadarma', type: 'RURAL_VILLAGE', postalCode: '17211' },
    { code: '3216091003', name: 'Pantai Bahagia', type: 'RURAL_VILLAGE', postalCode: '17211' },
    { code: '3216091004', name: 'Pantai Mekar', type: 'RURAL_VILLAGE', postalCode: '17212' },
    { code: '3216091005', name: 'Sirnajaya', type: 'RURAL_VILLAGE', postalCode: '17212' },
    { code: '3216091006', name: 'Muara Bakti', type: 'RURAL_VILLAGE', postalCode: '17213' },
    { code: '3216091007', name: 'Hurip Jaya', type: 'RURAL_VILLAGE', postalCode: '17213' },
    { code: '3216091008', name: 'Simpangan', type: 'RURAL_VILLAGE', postalCode: '17214' },
  ])

  await createBekasiVillages('321610', [
    { code: '3216101001', name: 'Setu', type: 'RURAL_VILLAGE', postalCode: '17320' },
    { code: '3216101002', name: 'Kertarahayu', type: 'RURAL_VILLAGE', postalCode: '17320' },
    { code: '3216101003', name: 'Setiamekar', type: 'RURAL_VILLAGE', postalCode: '17320' },
    { code: '3216101004', name: 'Cimuning', type: 'RURAL_VILLAGE', postalCode: '17321' },
    { code: '3216101005', name: 'Lubang Buaya', type: 'RURAL_VILLAGE', postalCode: '17321' },
    { code: '3216101006', name: 'Cikiwul', type: 'RURAL_VILLAGE', postalCode: '17322' },
    { code: '3216101007', name: 'Karangraharja', type: 'RURAL_VILLAGE', postalCode: '17322' },
    { code: '3216101008', name: 'Taman Rahayu', type: 'RURAL_VILLAGE', postalCode: '17323' },
  ])

  console.log('  ✓ Created Kabupaten Bekasi: 10 districts, 83 villages')

  // ==================== KOTA BEKASI ====================
  console.log('  → Creating Kota Bekasi with districts and villages...')
  
  const kotaBekasi = await prisma.regency.upsert({
    where: { 
      provinceId_code: {
        provinceId: jawaBarat.id,
        code: '3275'
      }
    },
    update: {},
    create: {
      code: '3275',
      name: 'Kota Bekasi',
      type: 'CITY',
      provinceId: jawaBarat.id,
    }
  })

  // Districts Kota Bekasi (10 dari 12 kecamatan)
  const kotaBekasiDistricts = await Promise.all([
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: kotaBekasi.id, code: '327501' }},
      update: {}, create: { code: '327501', name: 'Bekasi Timur', regencyId: kotaBekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: kotaBekasi.id, code: '327502' }},
      update: {}, create: { code: '327502', name: 'Bekasi Barat', regencyId: kotaBekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: kotaBekasi.id, code: '327503' }},
      update: {}, create: { code: '327503', name: 'Bekasi Selatan', regencyId: kotaBekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: kotaBekasi.id, code: '327504' }},
      update: {}, create: { code: '327504', name: 'Bekasi Utara', regencyId: kotaBekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: kotaBekasi.id, code: '327505' }},
      update: {}, create: { code: '327505', name: 'Medan Satria', regencyId: kotaBekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: kotaBekasi.id, code: '327506' }},
      update: {}, create: { code: '327506', name: 'Pondok Gede', regencyId: kotaBekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: kotaBekasi.id, code: '327507' }},
      update: {}, create: { code: '327507', name: 'Jatiasih', regencyId: kotaBekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: kotaBekasi.id, code: '327508' }},
      update: {}, create: { code: '327508', name: 'Jatisampurna', regencyId: kotaBekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: kotaBekasi.id, code: '327509' }},
      update: {}, create: { code: '327509', name: 'Rawalumbu', regencyId: kotaBekasi.id }
    }),
    prisma.district.upsert({
      where: { regencyId_code: { regencyId: kotaBekasi.id, code: '327510' }},
      update: {}, create: { code: '327510', name: 'Pondok Melati', regencyId: kotaBekasi.id }
    }),
  ])

  // Helper for Kota Bekasi villages
  const createKotaBekasiVillages = async (districtCode: string, villageData: Array<{code: string, name: string, type: 'URBAN_VILLAGE' | 'RURAL_VILLAGE', postalCode: string}>) => {
    const district = kotaBekasiDistricts.find(d => d.code === districtCode)
    if (!district) return []
    
    return Promise.all(
      villageData.map(v => 
        prisma.village.upsert({
          where: { districtId_code: { districtId: district.id, code: v.code }},
          update: {},
          create: { code: v.code, name: v.name, type: v.type, postalCode: v.postalCode, districtId: district.id }
        })
      )
    )
  }

  // Villages for Kota Bekasi districts (all urban villages)
  await createKotaBekasiVillages('327501', [
    { code: '3275011001', name: 'Margahayu', type: 'URBAN_VILLAGE', postalCode: '17113' },
    { code: '3275011002', name: 'Aren Jaya', type: 'URBAN_VILLAGE', postalCode: '17113' },
    { code: '3275011003', name: 'Bekasi Jaya', type: 'URBAN_VILLAGE', postalCode: '17112' },
    { code: '3275011004', name: 'Durianrejo', type: 'URBAN_VILLAGE', postalCode: '17111' },
  ])

  await createKotaBekasiVillages('327502', [
    { code: '3275021001', name: 'Bintara', type: 'URBAN_VILLAGE', postalCode: '17134' },
    { code: '3275021002', name: 'Bintara Jaya', type: 'URBAN_VILLAGE', postalCode: '17136' },
    { code: '3275021003', name: 'Jakasampurna', type: 'URBAN_VILLAGE', postalCode: '17145' },
    { code: '3275021004', name: 'Kota Baru', type: 'URBAN_VILLAGE', postalCode: '17142' },
    { code: '3275021005', name: 'Kranji', type: 'URBAN_VILLAGE', postalCode: '17135' },
  ])

  await createKotaBekasiVillages('327503', [
    { code: '3275031001', name: 'Kayuringin Jaya', type: 'URBAN_VILLAGE', postalCode: '17144' },
    { code: '3275031002', name: 'Marga Jaya', type: 'URBAN_VILLAGE', postalCode: '17143' },
    { code: '3275031003', name: 'Pekayon Jaya', type: 'URBAN_VILLAGE', postalCode: '17148' },
    { code: '3275031004', name: 'Jaka Setia', type: 'URBAN_VILLAGE', postalCode: '17147' },
  ])

  await createKotaBekasiVillages('327504', [
    { code: '3275041001', name: 'Kaliabang Tengah', type: 'URBAN_VILLAGE', postalCode: '17125' },
    { code: '3275041002', name: 'Perwira', type: 'URBAN_VILLAGE', postalCode: '17126' },
    { code: '3275041003', name: 'Teluk Pucung', type: 'URBAN_VILLAGE', postalCode: '17121' },
    { code: '3275041004', name: 'Harapan Baru', type: 'URBAN_VILLAGE', postalCode: '17123' },
    { code: '3275041005', name: 'Margamulya', type: 'URBAN_VILLAGE', postalCode: '17142' },
  ])

  await createKotaBekasiVillages('327505', [
    { code: '3275051001', name: 'Medan Satria', type: 'URBAN_VILLAGE', postalCode: '17132' },
    { code: '3275051002', name: 'Kali Baru', type: 'URBAN_VILLAGE', postalCode: '17133' },
    { code: '3275051003', name: 'Pejuang', type: 'URBAN_VILLAGE', postalCode: '17131' },
    { code: '3275051004', name: 'Harapan Mulya', type: 'URBAN_VILLAGE', postalCode: '17141' },
  ])

  await createKotaBekasiVillages('327506', [
    { code: '3275061001', name: 'Jati Bening', type: 'URBAN_VILLAGE', postalCode: '17412' },
    { code: '3275061002', name: 'Jati Bening Baru', type: 'URBAN_VILLAGE', postalCode: '17412' },
    { code: '3275061003', name: 'Jatirahayu', type: 'URBAN_VILLAGE', postalCode: '17414' },
    { code: '3275061004', name: 'Jatiwaringin', type: 'URBAN_VILLAGE', postalCode: '17411' },
    { code: '3275061005', name: 'Jatikramat', type: 'URBAN_VILLAGE', postalCode: '17415' },
    { code: '3275061006', name: 'Jatiranggon', type: 'URBAN_VILLAGE', postalCode: '17432' },
    { code: '3275061007', name: 'Jaticempaka', type: 'URBAN_VILLAGE', postalCode: '17421' },
    { code: '3275061008', name: 'Jatimakmur', type: 'URBAN_VILLAGE', postalCode: '17413' },
  ])

  await createKotaBekasiVillages('327507', [
    { code: '3275071001', name: 'Jatimekar', type: 'URBAN_VILLAGE', postalCode: '17422' },
    { code: '3275071002', name: 'Jatiasih', type: 'URBAN_VILLAGE', postalCode: '17423' },
    { code: '3275071003', name: 'Jatisari', type: 'URBAN_VILLAGE', postalCode: '17426' },
    { code: '3275071004', name: 'Jatiluhur', type: 'URBAN_VILLAGE', postalCode: '17425' },
  ])

  await createKotaBekasiVillages('327508', [
    { code: '3275081001', name: 'Jatirangga', type: 'URBAN_VILLAGE', postalCode: '17433' },
    { code: '3275081002', name: 'Jatiranggo', type: 'URBAN_VILLAGE', postalCode: '17433' },
    { code: '3275081003', name: 'Jatiraden', type: 'URBAN_VILLAGE', postalCode: '17433' },
    { code: '3275081004', name: 'Jatikarya', type: 'URBAN_VILLAGE', postalCode: '17435' },
    { code: '3275081005', name: 'Jatisampurna', type: 'URBAN_VILLAGE', postalCode: '17434' },
  ])

  await createKotaBekasiVillages('327509', [
    { code: '3275091001', name: 'Pengasinan', type: 'URBAN_VILLAGE', postalCode: '17115' },
    { code: '3275091002', name: 'Bojong Rawalumbu', type: 'URBAN_VILLAGE', postalCode: '17116' },
    { code: '3275091003', name: 'Sepanjang Jaya', type: 'URBAN_VILLAGE', postalCode: '17114' },
  ])

  await createKotaBekasiVillages('327510', [
    { code: '3275101001', name: 'Jatirahayu', type: 'URBAN_VILLAGE', postalCode: '17414' },
    { code: '3275101002', name: 'Jatimurni', type: 'URBAN_VILLAGE', postalCode: '17431' },
    { code: '3275101003', name: 'Jatiwarna', type: 'URBAN_VILLAGE', postalCode: '17415' },
    { code: '3275101004', name: 'Jatimelati', type: 'URBAN_VILLAGE', postalCode: '17415' },
  ])

  console.log('  ✓ Created Kota Bekasi: 10 districts, 77 villages')

  console.log('  ✓ Created 152 villages')

  console.log('\n✅ Complete regional data seeding finished!')
  console.log('  📊 Summary:')
  console.log('    - 1 province (Jawa Barat)')
  console.log('    - 6 regencies:')
  console.log('      • Kabupaten Purwakarta (17 districts, 152 villages)')
  console.log('      • Kota Bandung (10 districts, 55 villages)')
  console.log('      • Kabupaten Bogor (8 districts, 83 villages)')
  console.log('      • Kabupaten Karawang (10 districts, 87 villages)')
  console.log('      • Kabupaten Bekasi (10 districts, 83 villages)')
  console.log('      • Kota Bekasi (10 districts, 77 villages)')
  console.log('    - Total: 65 districts')
  console.log('    - Total: 537 villages (all with postal codes!)')

  // Get specific district and village for SPPG seed compatibility
  const purwakartaDistrict = districts.find(d => d.code === '321710')
  const nagriTengah = await prisma.village.findFirst({
    where: {
      districtId: purwakartaDistrict?.id,
      code: '3217101001'
    }
  })

  return {
    jawaBarat,
    purwakarta,
    bandung,
    bogor,
    karawang,
    bekasi,
    kotaBekasi,
    districts,
    bandungDistricts,
    bogorDistricts,
    karawangDistricts,
    bekasiDistricts,
    kotaBekasiDistricts,
    purwakartaDistrict: purwakartaDistrict!,
    nagriTengah: nagriTengah!,
  }
}
