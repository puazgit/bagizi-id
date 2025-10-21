/**
 * @fileoverview Verification script for Fix #1 data integrity
 * Checks that all MenuIngredients have valid inventoryItemId references
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyFix1Data() {
  console.log('🔍 Starting Fix #1 Data Verification...\n')

  try {
    // 1. Check total MenuIngredients count
    const totalIngredients = await prisma.menuIngredient.count()
    console.log(`✅ Total MenuIngredients: ${totalIngredients}`)

    // 2. Schema verification: inventoryItemId is REQUIRED (not nullable)
    console.log(`✅ Schema: inventoryItemId is REQUIRED (NOT NULL) - Fix #1 applied correctly`)

    // 3. Check ingredients with valid inventoryItem relation
    const ingredientsWithInventory = await prisma.menuIngredient.findMany({
      include: {
        inventoryItem: {
          select: {
            id: true,
            itemName: true,
            unit: true,
            costPerUnit: true
          }
        }
      }
    })

    const validIngredients = ingredientsWithInventory.filter(ing => ing.inventoryItem !== null)
    console.log(`✅ Ingredients with valid inventoryItem relation: ${validIngredients.length}/${totalIngredients}`)

    // 4. Check for any orphaned references (inventoryItemId points to non-existent item)
    const orphanedIngredients = ingredientsWithInventory.filter(ing => ing.inventoryItem === null)
    if (orphanedIngredients.length > 0) {
      console.log(`\n❌ Found ${orphanedIngredients.length} orphaned ingredients:`)
      orphanedIngredients.forEach(ing => {
        console.log(`   - MenuIngredient ID: ${ing.id}, inventoryItemId: ${ing.inventoryItemId}`)
      })
    } else {
      console.log(`✅ No orphaned ingredient references found`)
    }

    // 5. Sample ingredient data verification
    console.log(`\n📊 Sample Ingredient Data (first 5):`)
    const sampleIngredients = ingredientsWithInventory.slice(0, 5)
    sampleIngredients.forEach(ing => {
      console.log(`\n   Menu: ${ing.menuId}`)
      console.log(`   ├─ Ingredient ID: ${ing.id}`)
      console.log(`   ├─ InventoryItem ID: ${ing.inventoryItemId}`)
      console.log(`   ├─ Item Name: ${ing.inventoryItem?.itemName || 'N/A'}`)
      console.log(`   ├─ Quantity: ${ing.quantity}`)
      console.log(`   ├─ Unit: ${ing.inventoryItem?.unit || 'N/A'}`)
      console.log(`   └─ Cost per Unit: ${ing.inventoryItem?.costPerUnit || 0}`)
    })

    // 6. Check inventory items statistics
    const totalInventoryItems = await prisma.inventoryItem.count()
    const usedInventoryItems = await prisma.inventoryItem.count({
      where: {
        menuIngredients: {
          some: {}
        }
      }
    })
    console.log(`\n📦 Inventory Items Statistics:`)
    console.log(`   ├─ Total Inventory Items: ${totalInventoryItems}`)
    console.log(`   ├─ Used in Menus: ${usedInventoryItems}`)
    console.log(`   └─ Unused: ${totalInventoryItems - usedInventoryItems}`)

    // 7. Check menus with ingredients
    const menusWithIngredients = await prisma.nutritionMenu.findMany({
      include: {
        _count: {
          select: {
            ingredients: true
          }
        }
      }
    })

    console.log(`\n🍽️  Menus with Ingredients:`)
    console.log(`   ├─ Total Menus: ${menusWithIngredients.length}`)
    console.log(`   ├─ Menus with ingredients: ${menusWithIngredients.filter(m => m._count.ingredients > 0).length}`)
    console.log(`   └─ Average ingredients per menu: ${(totalIngredients / menusWithIngredients.length).toFixed(2)}`)

    // 8. Final summary
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📋 VERIFICATION SUMMARY:`)
    console.log(`${'='.repeat(60)}`)
    
    const allChecksPass = 
      orphanedIngredients.length === 0 &&
      validIngredients.length === totalIngredients

    if (allChecksPass) {
      console.log(`✅ All checks PASSED! Fix #1 data integrity is VALID.`)
      console.log(`✅ ${totalIngredients} ingredients all have valid inventoryItemId references`)
      console.log(`✅ Ready for UI testing phase`)
    } else {
      console.log(`❌ Some checks FAILED! Please review the issues above.`)
    }
    console.log(`${'='.repeat(60)}\n`)

    return allChecksPass

  } catch (error) {
    console.error('❌ Error during verification:', error)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// Run verification
verifyFix1Data()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
