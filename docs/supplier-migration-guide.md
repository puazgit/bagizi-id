# 🔄 SUPPLIER SYSTEM MIGRATION GUIDE

**Migration Date**: October 13, 2025  
**Version**: 1.0  
**Target**: Production Database Migration  
**Risk Level**: MEDIUM (Data normalization required)

---

## 📋 MIGRATION OVERVIEW

Panduan ini menjelaskan langkah-langkah untuk mengimplementasikan Supplier Management System yang baru pada database production Bagizi-ID. Migration ini akan mentransformasi data supplier yang tersebar menjadi sistem terstruktur dan ternormalisasi.

---

## 🎯 MIGRATION OBJECTIVES

### **Data Normalization**
- ✅ Ekstrak data supplier dari Procurement records
- ✅ Deduplikasi supplier berdasarkan nama dan kontak
- ✅ Normalisasi data supplier ke model Supplier baru
- ✅ Update foreign key relationships

### **System Enhancement**
- ✅ Implementasi supplier performance tracking
- ✅ Setup contract management system
- ✅ Enable supplier evaluation workflow
- ✅ Activate compliance monitoring

---

## 🗂️ PRE-MIGRATION ANALYSIS

### **Current Data Distribution**
```sql
-- Analyze existing supplier data in procurement
SELECT 
  COUNT(*) as total_procurements,
  COUNT(DISTINCT supplier_name) as unique_suppliers,
  COUNT(DISTINCT supplier_contact) as unique_contacts,
  COUNT(DISTINCT supplier_email) as unique_emails
FROM procurements;

-- Check data quality issues
SELECT 
  supplier_name,
  COUNT(*) as procurement_count,
  COUNT(DISTINCT supplier_contact) as contact_variants,
  COUNT(DISTINCT supplier_email) as email_variants
FROM procurements 
GROUP BY supplier_name
HAVING COUNT(DISTINCT supplier_contact) > 1 OR COUNT(DISTINCT supplier_email) > 1;
```

### **Data Quality Assessment**
```sql
-- Identify data cleaning needs
SELECT 
  'Missing Supplier Name' as issue,
  COUNT(*) as count
FROM procurements 
WHERE supplier_name IS NULL OR supplier_name = ''

UNION ALL

SELECT 
  'Missing Contact Info' as issue,
  COUNT(*) as count  
FROM procurements
WHERE supplier_contact IS NULL AND supplier_email IS NULL

UNION ALL

SELECT 
  'Duplicate Suppliers' as issue,
  COUNT(*) - COUNT(DISTINCT supplier_name) as count
FROM procurements;
```

---

## 🚀 MIGRATION STEPS

### **STEP 1: Database Schema Update**

#### **1.1 Run Prisma Migration**
```bash
# Generate migration file
npx prisma db push

# Or create explicit migration
npx prisma migrate dev --name add_supplier_management_system

# Verify schema is applied
npx prisma db pull
```

#### **1.2 Verify New Tables Created**
```sql
-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('suppliers', 'supplier_evaluations', 'supplier_contracts', 'supplier_products');
```

### **STEP 2: Data Migration & Normalization**

#### **2.1 Extract Unique Suppliers**
```sql
-- Create temp table for supplier extraction
CREATE TEMP TABLE temp_suppliers AS
SELECT DISTINCT
  supplier_name,
  supplier_contact,
  supplier_email,
  supplier_type,
  MIN(procurement_date) as first_order_date,
  COUNT(*) as total_orders,
  AVG(total_amount) as avg_order_value,
  sppg_id
FROM procurements 
WHERE supplier_name IS NOT NULL 
AND supplier_name != ''
GROUP BY supplier_name, supplier_contact, supplier_email, supplier_type, sppg_id;
```

#### **2.2 Generate Supplier Codes**
```sql
-- Function to generate supplier codes
CREATE OR REPLACE FUNCTION generate_supplier_code(supplier_name TEXT, sppg_id TEXT)
RETURNS TEXT AS $$
DECLARE
  code_base TEXT;
  code_suffix INT;
  final_code TEXT;
BEGIN
  -- Create base code from first 3 chars of name + first 3 chars of sppg
  code_base := UPPER(LEFT(REGEXP_REPLACE(supplier_name, '[^A-Za-z0-9]', '', 'g'), 3)) 
               || UPPER(LEFT(sppg_id, 3));
  
  -- Find next available suffix
  SELECT COALESCE(MAX(CAST(SUBSTRING(supplier_code FROM 7) AS INT)), 0) + 1
  INTO code_suffix
  FROM suppliers 
  WHERE supplier_code LIKE code_base || '%';
  
  -- Combine base + suffix
  final_code := code_base || LPAD(code_suffix::TEXT, 3, '0');
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;
```

#### **2.3 Insert Suppliers**
```sql
-- Insert normalized suppliers
INSERT INTO suppliers (
  id, sppg_id, supplier_code, supplier_name, supplier_type,
  phone, email, address, category,
  total_orders, total_purchase_value, overall_rating,
  is_active, created_at, updated_at
)
SELECT 
  gen_random_uuid() as id,
  ts.sppg_id,
  generate_supplier_code(ts.supplier_name, ts.sppg_id) as supplier_code,
  ts.supplier_name,
  COALESCE(ts.supplier_type, 'LOCAL') as supplier_type,
  ts.supplier_contact as phone,
  ts.supplier_email as email,
  'Address to be updated' as address,
  'GENERAL' as category,
  ts.total_orders,
  ts.avg_order_value * ts.total_orders as total_purchase_value,
  CASE 
    WHEN ts.total_orders >= 10 THEN 4.0
    WHEN ts.total_orders >= 5 THEN 3.5  
    ELSE 3.0
  END as overall_rating,
  true as is_active,
  ts.first_order_date as created_at,
  NOW() as updated_at
FROM temp_suppliers ts;
```

### **STEP 3: Update Foreign Key References**

#### **3.1 Add Supplier IDs to Procurement**
```sql
-- Add supplier_id column (if not exists)
ALTER TABLE procurements ADD COLUMN IF NOT EXISTS supplier_id VARCHAR(50);

-- Update procurement records with supplier IDs
UPDATE procurements p
SET supplier_id = s.id
FROM suppliers s
WHERE p.supplier_name = s.supplier_name
AND p.sppg_id = s.sppg_id
AND (p.supplier_contact = s.phone OR p.supplier_email = s.email OR s.phone IS NULL);
```

#### **3.2 Add Supplier IDs to Inventory Items**
```sql
-- Add preferred_supplier_id column (if not exists)  
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS preferred_supplier_id VARCHAR(50);

-- Update inventory items with preferred suppliers
UPDATE inventory_items ii
SET preferred_supplier_id = s.id  
FROM suppliers s
WHERE ii.preferred_supplier = s.supplier_name
AND ii.sppg_id = s.sppg_id;
```

### **STEP 4: Data Validation & Quality Checks**

#### **4.1 Verify Migration Completeness**
```sql
-- Check procurement migration
SELECT 
  COUNT(*) as total_procurements,
  COUNT(supplier_id) as linked_to_suppliers,
  COUNT(*) - COUNT(supplier_id) as unlinked_records
FROM procurements;

-- Check inventory migration
SELECT 
  COUNT(*) as total_inventory_items,
  COUNT(preferred_supplier_id) as linked_to_suppliers,
  COUNT(*) - COUNT(preferred_supplier_id) as unlinked_records
FROM inventory_items;

-- Verify supplier data quality
SELECT 
  COUNT(*) as total_suppliers,
  COUNT(DISTINCT supplier_code) as unique_codes,
  COUNT(DISTINCT supplier_name) as unique_names,
  AVG(total_orders) as avg_orders_per_supplier,
  AVG(overall_rating) as avg_supplier_rating
FROM suppliers;
```

#### **4.2 Data Integrity Checks**
```sql
-- Check for orphaned records
SELECT 'Procurement without supplier' as issue, COUNT(*) as count
FROM procurements WHERE supplier_id IS NULL

UNION ALL

SELECT 'Supplier without SPPG' as issue, COUNT(*) as count  
FROM suppliers s LEFT JOIN sppg sp ON s.sppg_id = sp.id WHERE sp.id IS NULL

UNION ALL

SELECT 'Duplicate supplier codes' as issue, COUNT(*) as count
FROM (
  SELECT supplier_code, COUNT(*) as cnt 
  FROM suppliers 
  GROUP BY supplier_code 
  HAVING COUNT(*) > 1
) duplicates;
```

---

## 🔧 POST-MIGRATION TASKS

### **STEP 5: Application Code Updates**

#### **5.1 Update Procurement Queries**
```typescript
// OLD: Direct supplier fields
const procurement = await prisma.procurement.findMany({
  where: {
    supplierName: 'ABC Supplier',
    sppgId: sppgId
  }
});

// NEW: Use supplier relationship
const procurement = await prisma.procurement.findMany({
  where: {
    supplier: {
      supplierName: 'ABC Supplier'
    },
    sppgId: sppgId
  },
  include: {
    supplier: true
  }
});
```

#### **5.2 Update Inventory Queries**
```typescript
// OLD: Direct supplier reference
const inventoryItems = await prisma.inventoryItem.findMany({
  where: {
    preferredSupplier: 'ABC Supplier',
    sppgId: sppgId
  }
});

// NEW: Use supplier relationship
const inventoryItems = await prisma.inventoryItem.findMany({
  where: {
    preferredSupplier: {
      supplierName: 'ABC Supplier'  
    },
    sppgId: sppgId
  },
  include: {
    preferredSupplier: true
  }
});
```

### **STEP 6: Performance Optimization**

#### **6.1 Create Additional Indexes**
```sql
-- Add performance indexes for new queries
CREATE INDEX CONCURRENTLY idx_procurements_supplier_date 
ON procurements(supplier_id, procurement_date);

CREATE INDEX CONCURRENTLY idx_inventory_preferred_supplier 
ON inventory_items(preferred_supplier_id, sppg_id);

CREATE INDEX CONCURRENTLY idx_suppliers_name_type_active
ON suppliers(supplier_name, supplier_type, is_active);
```

#### **6.2 Update Statistics**
```sql
-- Update table statistics for query optimizer
ANALYZE suppliers;
ANALYZE procurements; 
ANALYZE inventory_items;
ANALYZE supplier_evaluations;
ANALYZE supplier_contracts;
ANALYZE supplier_products;
```

---

## 🧪 TESTING & VALIDATION

### **Functional Testing Checklist**

#### **✅ Data Integrity Tests**
- [ ] All procurement records linked to suppliers
- [ ] No orphaned supplier records
- [ ] Supplier codes are unique  
- [ ] Performance ratings calculated correctly
- [ ] Contact information preserved

#### **✅ Performance Tests**
- [ ] Supplier search < 50ms
- [ ] Procurement queries < 100ms
- [ ] Inventory lookups < 50ms
- [ ] Performance reports < 200ms

#### **✅ Application Tests**
- [ ] Supplier creation workflow
- [ ] Performance evaluation process
- [ ] Contract management features
- [ ] Compliance monitoring alerts

### **Rollback Plan**

#### **Emergency Rollback Procedure**
```sql
-- 1. Restore supplier info in procurement (if needed)
UPDATE procurements p
SET 
  supplier_name = s.supplier_name,
  supplier_contact = s.phone,
  supplier_email = s.email
FROM suppliers s
WHERE p.supplier_id = s.id;

-- 2. Restore supplier info in inventory (if needed)
UPDATE inventory_items ii
SET preferred_supplier = s.supplier_name
FROM suppliers s  
WHERE ii.preferred_supplier_id = s.id;

-- 3. Remove foreign key columns (if critical issues)
ALTER TABLE procurements DROP COLUMN IF EXISTS supplier_id;
ALTER TABLE inventory_items DROP COLUMN IF EXISTS preferred_supplier_id;
```

---

## 📊 MIGRATION MONITORING

### **Key Metrics to Monitor**

#### **During Migration**
- Migration execution time
- Records processed vs. expected
- Error count and types
- Database performance impact

#### **Post Migration**  
- Application response times
- Error rates in supplier-related features
- Data consistency checks
- User experience feedback

### **Monitoring Queries**
```sql
-- Monitor migration progress
SELECT 
  'Suppliers Created' as metric,
  COUNT(*) as value 
FROM suppliers
WHERE created_at >= '2025-10-13'

UNION ALL

SELECT 
  'Procurements Linked' as metric,
  COUNT(*) as value
FROM procurements  
WHERE supplier_id IS NOT NULL

UNION ALL

SELECT 
  'Average Response Time' as metric,
  AVG(response_time_ms) as value
FROM performance_metrics 
WHERE metric_name = 'supplier_search'
AND timestamp >= '2025-10-13';
```

---

## ✅ MIGRATION CHECKLIST

### **Pre-Migration (Day -1)**
- [ ] **Database Backup**: Full production backup completed
- [ ] **Code Review**: All application changes reviewed
- [ ] **Testing**: Migration tested on staging environment  
- [ ] **Monitoring**: Performance monitoring tools ready
- [ ] **Team Notification**: All stakeholders informed

### **During Migration (Day 0)**
- [ ] **Schema Update**: Prisma migration executed successfully
- [ ] **Data Migration**: All supplier records created
- [ ] **FK Updates**: Foreign key relationships established
- [ ] **Validation**: Data integrity checks passed
- [ ] **Performance**: Query performance verified

### **Post-Migration (Day +1)**
- [ ] **Application Deploy**: Updated code deployed
- [ ] **Feature Testing**: All supplier features working
- [ ] **Performance Monitoring**: Response times within SLA  
- [ ] **User Feedback**: No critical user issues reported
- [ ] **Documentation**: Migration documented and filed

---

## 🎉 EXPECTED OUTCOMES

### **Immediate Benefits**
- ✅ **Normalized Data Structure**: Clean, consistent supplier data
- ✅ **Improved Performance**: 50%+ faster supplier queries
- ✅ **Better Data Quality**: Eliminated duplicate supplier records
- ✅ **Enhanced Reporting**: Comprehensive supplier analytics

### **Long-term Benefits**  
- 🚀 **Scalability**: Ready for enterprise-scale operations
- 📊 **Analytics**: Data-driven supplier performance insights
- 🤝 **Relationships**: Structured supplier partnership management
- ⚖️ **Compliance**: Automated certification and audit tracking

---

## 🆘 SUPPORT & ESCALATION

### **Migration Support Team**
- **Technical Lead**: Database migration & schema changes
- **Application Lead**: Code updates & testing
- **DevOps Lead**: Infrastructure & monitoring
- **Product Lead**: Business validation & user acceptance

### **Escalation Process**
1. **Level 1**: Technical issues → Technical Lead
2. **Level 2**: Performance issues → DevOps Lead  
3. **Level 3**: Business impact → Product Lead
4. **Level 4**: Critical system issues → Full team escalation

---

## ✅ CONCLUSION

Migration ke Supplier Management System akan mentransformasi Bagizi-ID menjadi platform enterprise-grade dengan supplier management yang komprehensif. Dengan perencanaan yang matang dan execution yang hati-hati, migration ini akan memberikan foundation yang solid untuk pertumbuhan dan skalabilitas jangka panjang.

**Success Criteria**:
- 🎯 Zero data loss during migration
- ⚡ Performance maintained or improved  
- ✅ All supplier features functional
- 📊 Enhanced analytics capabilities ready

**The supplier management transformation is ready for execution!** 🚀