# 🚀 Menu Domain Seed - Quick Start Guide

## ⚡ Quick Commands

```bash
# 1. Reset & Seed Database
npm run db:reset

# 2. Seed Only (no reset)
npm run db:seed

# 3. View Data in Prisma Studio
npm run db:studio

# 4. Start Dev Server
npm run dev
```

---

## 🔐 Login Credentials

```
Email:    admin@sppg-purwakarta.com
Password: password123
Role:     SPPG_ADMIN
SPPG:     SPPG Purwakarta Utara
```

---

## 📊 Data Created

| Entity | Count | Description |
|--------|-------|-------------|
| **Programs** | 2 | School Lunch + Snack Program |
| **Menus** | 10 | 5 Lunch + 5 Snack menus |
| **Ingredients** | 50+ | Complete ingredient lists |
| **Recipe Steps** | 60+ | Detailed cooking instructions |
| **Nutrition Calculations** | 10 | Complete nutrition data |
| **Cost Calculations** | 10 | Complete cost breakdown |

---

## 🍽️ Sample Menus

### Lunch Menus (Rp 8,500 - 11,000)
1. Nasi Gudeg Ayam Purwakarta
2. Nasi Ayam Goreng Lalapan
3. Nasi Ikan Pepes Sunda
4. Nasi Sop Buntut Sapi
5. Nasi Rendang Daging Sapi

### Snack Menus (Rp 4,000 - 6,000)
1. Roti Pisang Cokelat
2. Bubur Kacang Hijau
3. Nagasari Pisang
4. Pisang Goreng Keju
5. Susu Kedelai Cokelat

---

## 🧪 Quick Test

1. **Login**: http://localhost:3000/login
2. **Menu List**: http://localhost:3000/menu
3. **Menu Detail**: Click any menu → See 5 tabs
4. **CRUD Operations**: Add/Edit/Delete menu items
5. **Calculations**: Test nutrition & cost calculations
6. **Duplication**: Try duplicate menu feature

---

## 📚 Documentation

| File | Description |
|------|-------------|
| `docs/menu-seed-summary.md` | Complete implementation summary |
| `docs/menu-seed-documentation.md` | Detailed data documentation |
| `docs/menu-domain-implementation-checklist.md` | Feature checklist |

---

## ✅ Success Checklist

- [x] Seed runs successfully
- [x] 10 menus visible in `/menu` page
- [x] Menu detail shows 5 tabs
- [x] Ingredients, recipe steps, nutrition, cost all populated
- [x] CRUD operations work
- [x] Menu duplication works
- [x] Multi-tenant filter by SPPG Purwakarta

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Foreign key error | `npm run db:reset` |
| Data not showing | Check login credentials |
| Type errors | `npm run db:generate` |
| API errors | Check browser console |

---

**🎯 Status**: ✅ **PRODUCTION READY**

**Next**: Run `npm run db:reset` dan mulai testing! 🚀
