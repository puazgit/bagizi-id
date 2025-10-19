/**
 * Test API procurement endpoints
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Testing Procurement Data...\n')

  try {
    // Get SPPG Purwakarta
    const sppg = await prisma.sPPG.findFirst({
      where: {
        OR: [
          { name: { contains: 'Purwakarta' } },
          { code: 'SPPG-PWK-001' }
        ]
      }
    })

    if (!sppg) {
      console.log('❌ SPPG Purwakarta not found!')
      return
    }

    console.log(`✅ Testing for SPPG: ${sppg.name}\n`)

    // Test 1: Suppliers
    console.log('📋 Test 1: Suppliers')
    const suppliers = await prisma.supplier.findMany({
      where: { sppgId: sppg.id }
    })
    console.log(`   Found: ${suppliers.length} suppliers`)
    for (const s of suppliers) {
      const productCount = await prisma.supplierProduct.count({ where: { supplierId: s.id } })
      const procurementCount = await prisma.procurement.count({ where: { supplierId: s.id } })
      console.log(`   - ${s.supplierName} (${s.supplierCode})`)
      console.log(`     Products: ${productCount}, Procurements: ${procurementCount}`)
    }

    // Test 2: Supplier Products
    console.log('\n📦 Test 2: Supplier Products')
    const products = await prisma.supplierProduct.findMany({
      where: { sppgId: sppg.id },
      include: {
        supplier: {
          select: { supplierName: true }
        }
      },
      take: 5
    })
    console.log(`   Found: ${products.length} products (showing first 5)`)
    products.forEach(p => {
      console.log(`   - ${p.productName}: Rp ${p.pricePerUnit.toLocaleString()} (${p.supplier.supplierName})`)
    })

    // Test 3: Procurement Plans
    console.log('\n📅 Test 3: Procurement Plans')
    const plans = await prisma.procurementPlan.findMany({
      where: { sppgId: sppg.id },
      include: {
        _count: {
          select: { procurements: true }
        }
      }
    })
    console.log(`   Found: ${plans.length} plans`)
    plans.forEach(p => {
      console.log(`   - ${p.planName}`)
      console.log(`     Budget: Rp ${p.totalBudget.toLocaleString()}`)
      console.log(`     Used: Rp ${p.usedBudget.toLocaleString()} (${((p.usedBudget / p.totalBudget) * 100).toFixed(1)}%)`)
      console.log(`     Procurements: ${p._count.procurements}`)
    })

    // Test 4: Procurements
    console.log('\n🛒 Test 4: Procurements')
    const procurements = await prisma.procurement.findMany({
      where: { sppgId: sppg.id },
      include: {
        supplier: {
          select: { supplierName: true }
        },
        _count: {
          select: { items: true }
        }
      },
      orderBy: { procurementDate: 'desc' }
    })
    console.log(`   Found: ${procurements.length} procurements`)
    procurements.forEach(p => {
      console.log(`   - ${p.procurementCode}`)
      console.log(`     Supplier: ${p.supplier.supplierName}`)
      console.log(`     Status: ${p.status}`)
      console.log(`     Total: Rp ${p.totalAmount.toLocaleString()}`)
      console.log(`     Items: ${p._count.items}`)
    })

    // Test 5: Procurement Items
    console.log('\n📝 Test 5: Procurement Items')
    const items = await prisma.procurementItem.findMany({
      where: {
        procurement: {
          sppgId: sppg.id
        }
      },
      include: {
        procurement: {
          select: {
            procurementCode: true,
            status: true
          }
        }
      },
      take: 5
    })
    console.log(`   Found: ${items.length} items (showing first 5)`)
    items.forEach(i => {
      console.log(`   - ${i.itemName} (${i.category})`)
      console.log(`     Quantity: ${i.orderedQuantity} ${i.unit}`)
      console.log(`     Price: Rp ${i.pricePerUnit.toLocaleString()} × ${i.orderedQuantity} = Rp ${i.totalPrice.toLocaleString()}`)
      console.log(`     Procurement: ${i.procurement.procurementCode} (${i.procurement.status})`)
    })

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 Summary:')
    console.log('='.repeat(60))
    console.log(`Suppliers: ${suppliers.length}`)
    console.log(`Supplier Products: ${await prisma.supplierProduct.count({ where: { sppgId: sppg.id } })}`)
    console.log(`Procurement Plans: ${plans.length}`)
    console.log(`Procurements: ${procurements.length}`)
    console.log(`Procurement Items: ${await prisma.procurementItem.count({ where: { procurement: { sppgId: sppg.id } } })}`)
    console.log('='.repeat(60))

    // Status breakdown
    console.log('\n📈 Procurement Status Breakdown:')
    const statusCounts = await prisma.procurement.groupBy({
      by: ['status'],
      where: { sppgId: sppg.id },
      _count: true
    })
    statusCounts.forEach(s => {
      console.log(`   ${s.status}: ${s._count} procurement(s)`)
    })

    console.log('\n✅ All tests completed successfully!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
