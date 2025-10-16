# Phase 2 Visual Demo Guide

## 🎬 Quick Demo

**URL**: http://localhost:3000/menu-planning/menu-plan-draft-pwk-nov-2025

---

## 👁️ What You'll See

### 1. Description Section (Always Visible)
```
┌──────────────────────────────────────────────────────┐
│ ℹ️  Rencana menu untuk Program Waktu Kerjasama       │
│    bulan November 2025 dengan fokus pada...          │
└──────────────────────────────────────────────────────┘
```
- **Alert component** with Info icon
- Primary-themed border (border-primary/20)
- Subtle background (bg-primary/5)
- Always visible, not collapsible

### 2. Detail Rencana (Collapsible - Expanded by default)
```
┌──────────────────────────────────────────────────────┐
│ 📄 Detail Rencana                           🔼       │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Informasi Program        Status & Timeline          │
│  ├ Program: PWK           ├ Status: Draft            │
│  ├ Kode: PWK-2025-11      ├ Dibuat: John Doe         │
│  ├ Target: 500 siswa      ├ Tanggal: 15 Jan 2025    │
│  ├ Total Hari: 30         └ Disetujui: -             │
│  └ Total Menu: 60                                    │
│                                                       │
└──────────────────────────────────────────────────────┘
```
- **FileText icon** (📄)
- **Expanded by default**
- Two-column grid (Informasi Program | Status & Timeline)
- Click header to collapse
- **ChevronUp icon** (🔼) shows it's expanded

**When collapsed**:
```
┌──────────────────────────────────────────────────────┐
│ 📄 Detail Rencana                           🔽       │
└──────────────────────────────────────────────────────┘
```
- **ChevronDown icon** (🔽) shows it's collapsed
- Content hidden
- Hover shows background effect

### 3. Metrik Kualitas & Analisis (Collapsible - Expanded by default)
```
┌──────────────────────────────────────────────────────┐
│ 🏆 Metrik Kualitas & Analisis               🔼       │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Skor Kualitas                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ Nutrisi  │ │ Variasi  │ │ Efisiensi│             │
│  │   85     │ │   78     │ │   92     │             │
│  │  /100    │ │  /100    │ │  /100    │             │
│  └──────────┘ └──────────┘ └──────────┘             │
│                                                       │
│  ──────────────────────────────────────────          │
│                                                       │
│  Analisis Biaya & Cakupan                            │
│  ┌──────────────────────┐ ┌─────────────────────┐   │
│  │ Total Estimasi Biaya │ │ Hari dgn Assignment │   │
│  │ Rp 45.000.000        │ │ 28 / 30             │   │
│  │ Rata-rata per Porsi  │ │ Persentase Cakupan  │   │
│  │ Rp 7.500             │ │ 93.3%               │   │
│  │ Total Porsi          │ │ Total Assignment    │   │
│  │ 6.000                │ │ 60                  │   │
│  └──────────────────────┘ └─────────────────────┘   │
│                                                       │
└──────────────────────────────────────────────────────┘
```
- **Award icon** (🏆)
- **Expanded by default**
- Two sections:
  1. Skor Kualitas (3-column grid)
  2. Analisis Biaya & Cakupan (2-column grid)
- Separator between sections
- Nested cards with border-muted

**When collapsed**:
```
┌──────────────────────────────────────────────────────┐
│ 🏆 Metrik Kualitas & Analisis               🔽       │
└──────────────────────────────────────────────────────┘
```

### 4. Assignment Terkini (Collapsible - Collapsed by default)
```
┌──────────────────────────────────────────────────────┐
│ 📅 Assignment Terkini          [5]          🔽       │
└──────────────────────────────────────────────────────┘
```
- **CalendarDays icon** (📅)
- **Badge showing count** ([5])
- **Collapsed by default** (reduces initial load)
- Click to expand

**When expanded with assignments**:
```
┌──────────────────────────────────────────────────────┐
│ 📅 Assignment Terkini          [5]          🔼       │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌───────────────────────────────────────────────┐   │
│  │ Nasi Gudeg Ayam                      200 porsi│   │
│  │ SNACK • 20 Januari 2025                       │   │
│  └───────────────────────────────────────────────┘   │
│                                                       │
│  ┌───────────────────────────────────────────────┐   │
│  │ Soto Ayam Kuning                     180 porsi│   │
│  │ LUNCH • 21 Januari 2025                       │   │
│  └───────────────────────────────────────────────┘   │
│                                                       │
│  ┌───────────────────────────────────────────────┐   │
│  │ Pepes Ikan Kembung                   150 porsi│   │
│  │ LUNCH • 22 Januari 2025                       │   │
│  └───────────────────────────────────────────────┘   │
│                                                       │
│  ... 2 more assignments                              │
│                                                       │
│         ┌──────────────────────────────┐             │
│         │ 📅 Lihat Semua 5 Assignment  │             │
│         └──────────────────────────────┘             │
│                                                       │
└──────────────────────────────────────────────────────┘
```
- Shows max 5 assignments
- Each in nested card (hover:border-primary/50)
- "Lihat Semua" button if more than 5
- Click button navigates to Calendar tab

**When expanded with NO assignments (Empty State)**:
```
┌──────────────────────────────────────────────────────┐
│ 📅 Assignment Terkini          [0]          🔼       │
├──────────────────────────────────────────────────────┤
│                                                       │
│                      📅                              │
│                                                       │
│            Belum Ada Assignment                      │
│                                                       │
│      Mulai atur menu harian dengan membuka           │
│      kalender dan menugaskan menu untuk              │
│      tanggal tertentu                                │
│                                                       │
│         ┌────────────────────┐                       │
│         │ 📅 Buka Kalender   │                       │
│         └────────────────────┘                       │
│                                                       │
└──────────────────────────────────────────────────────┘
```
- Large CalendarDays icon
- Clear message
- Helpful guidance text
- CTA button to open Calendar tab

---

## 🖱️ Interactions to Test

### 1. Click to Expand/Collapse
**Action**: Click on any section header  
**Result**: Section toggles open/closed

**Visual feedback**:
- Icon changes: 🔼 ↔️ 🔽
- Content shows/hides
- Smooth color transition on hover

### 2. Hover Effects
**Action**: Hover over collapsed section header  
**Result**: Background changes to muted (hover:bg-muted/50)

### 3. Navigation
**Action**: Click "Lihat Semua Assignment" or "Buka Kalender"  
**Result**: Switches to Calendar tab

### 4. Multiple Sections
**Test**: Expand all sections  
**Result**: All can be open simultaneously (independent state)

**Test**: Collapse all sections  
**Result**: Only Description remains visible

---

## 📱 Responsive Testing

### Mobile View (< 640px)
**Open in DevTools**: Toggle device toolbar (Cmd+Shift+M)  
**Select**: iPhone 12 Pro (390px)

**What to check**:
- ✅ Single column layout
- ✅ Full-width cards
- ✅ Touch targets ≥ 44px
- ✅ Text readable (no tiny fonts)
- ✅ Buttons full-width
- ✅ No horizontal scroll

**Expected behavior**:
```
┌─────────────────────┐
│ ℹ️  Description     │
└─────────────────────┘
┌─────────────────────┐
│ 📄 Detail   🔽      │
└─────────────────────┘
┌─────────────────────┐
│ 🏆 Metrik   🔽      │
└─────────────────────┘
┌─────────────────────┐
│ 📅 Assignment  🔽   │
└─────────────────────┘
```

### Tablet View (640px - 1024px)
**Select**: iPad (768px)

**What to check**:
- ✅ Two-column grids (Details section)
- ✅ Proper spacing
- ✅ Cards not cramped

**Expected behavior**:
```
┌────────────────────────────────────┐
│ ℹ️  Description                    │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│ 📄 Detail Rencana            🔼    │
├────────────────────────────────────┤
│ Informasi Program | Status         │
└────────────────────────────────────┘
```

### Desktop View (> 1024px)
**Browser width**: 1280px or wider

**What to check**:
- ✅ Three-column metrics grid
- ✅ Optimal spacing
- ✅ Hover effects working
- ✅ Everything well-proportioned

**Expected behavior**:
```
┌────────────────────────────────────────────────────────┐
│ ℹ️  Description                                        │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│ 📄 Detail Rencana                              🔼      │
├────────────────────────────────────────────────────────┤
│ Informasi Program        |        Status & Timeline    │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│ 🏆 Metrik Kualitas & Analisis                  🔼      │
├────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│ │ Nutrisi │ │ Variasi │ │Efisiensi│                   │
│ └─────────┘ └─────────┘ └─────────┘                   │
└────────────────────────────────────────────────────────┘
```

---

## ⌨️ Keyboard Navigation Testing

### Test Steps:

1. **Tab Navigation**
   - Press `Tab` repeatedly
   - Focus should move through:
     1. Action dropdown button (top right)
     2. Tab buttons (Ringkasan, Kalender, Analitik)
     3. Detail Rencana collapse button
     4. Metrik Kualitas collapse button
     5. Assignment Terkini collapse button
     6. Any CTA buttons within sections

2. **Enter to Activate**
   - Focus on collapse button
   - Press `Enter`
   - Section should toggle

3. **Visual Focus**
   - Blue ring should be visible around focused element
   - Focus order should be logical (top to bottom)

---

## 🎨 Visual Polish Checklist

### Colors
- [ ] Primary icons are blue (`text-primary`)
- [ ] Section headers are gray (`text-muted-foreground`)
- [ ] Hover backgrounds are subtle (`hover:bg-muted/50`)
- [ ] Alert has primary tint (`bg-primary/5`, `border-primary/20`)

### Spacing
- [ ] Cards have consistent gaps (`space-y-4`)
- [ ] Within sections spacing clear (`space-y-6`)
- [ ] Grid gaps appropriate (`gap-4`, `gap-6`)
- [ ] Padding consistent (`p-4`, `p-6`)

### Typography
- [ ] Section titles stand out (`text-lg font-semibold`)
- [ ] Sub-headers clear (`text-sm uppercase tracking-wide`)
- [ ] Body text readable (`text-sm`)
- [ ] Hierarchy obvious

### Icons
- [ ] All icons properly aligned
- [ ] Icon sizes consistent (h-5 w-5 for headers, h-4 w-4 for indicators)
- [ ] Colors appropriate (primary for sections, default for indicators)

---

## 🐛 Common Issues & Fixes

### Issue 1: Section Won't Expand
**Symptom**: Clicking header does nothing  
**Check**:
- Console for JavaScript errors
- React DevTools for state changes
- onClick handler attached to CardHeader

### Issue 2: Icons Not Showing
**Symptom**: Missing icons  
**Check**:
- Import statement includes all icons
- Icon component names correct
- className includes size (h-4 w-4 or h-5 w-5)

### Issue 3: Hover Not Working
**Symptom**: No background change on hover  
**Check**:
- className includes `hover:bg-muted/50`
- className includes `transition-colors`
- Not on mobile (hover doesn't work on touch)

### Issue 4: Layout Broken on Mobile
**Symptom**: Content cramped or cut off  
**Check**:
- Responsive classes (grid-cols-1, sm:grid-cols-2)
- No fixed widths
- Proper container padding
- No horizontal scroll

---

## 📊 Performance Check

### Lighthouse Audit
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select:
   - [x] Performance
   - [x] Accessibility
   - [x] Best Practices
4. Click "Analyze page load"

**Expected scores**:
- Performance: 95+ ✅
- Accessibility: 95+ ✅
- Best Practices: 90+ ✅

### React DevTools Profiler
1. Install React DevTools extension
2. Open DevTools → Profiler tab
3. Start recording
4. Expand/collapse sections multiple times
5. Stop recording

**What to check**:
- ✅ Fast render times (< 16ms)
- ✅ No unnecessary re-renders
- ✅ Only changed sections re-render

---

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] All sections can expand/collapse
- [ ] Default sections expanded on load
- [ ] Icons change with state
- [ ] Empty states show correctly
- [ ] Navigation buttons work
- [ ] State independent per section

### Visual Requirements
- [ ] Hover effects on desktop
- [ ] Smooth transitions
- [ ] Icons aligned properly
- [ ] Spacing consistent
- [ ] Colors match design system
- [ ] Typography hierarchy clear

### Responsive Requirements
- [ ] Mobile layout working (< 640px)
- [ ] Tablet layout working (640-1024px)
- [ ] Desktop layout working (> 1024px)
- [ ] Touch targets adequate (≥ 44px)
- [ ] No horizontal scroll

### Accessibility Requirements
- [ ] Keyboard navigation working
- [ ] Focus visible on all elements
- [ ] Color contrast sufficient (4.5:1)
- [ ] Screen reader compatible
- [ ] No accessibility errors in Lighthouse

### Performance Requirements
- [ ] Fast expand/collapse (< 50ms)
- [ ] No layout shift
- [ ] Build successful (0 errors)
- [ ] No console errors
- [ ] Lighthouse Performance 95+

---

## 🎉 Success!

If all checkboxes are ticked, **Phase 2 is successfully implemented** and ready for production! 🚀

**Next Steps**:
1. User testing with real SPPG users
2. Gather feedback
3. Plan Phase 3 (target: 95/100)

---

## 📞 Need Help?

### Documentation
- Full Implementation: `MENU_PLANNING_DETAIL_PAGE_PHASE2_IMPLEMENTATION.md`
- Quick Reference: `MENU_PLANNING_DETAIL_PAGE_PHASE2_QUICK_REFERENCE.md`
- Summary: `MENU_PLANNING_DETAIL_PAGE_PHASE2_SUMMARY.md`

### Commands
```bash
# Dev server
npm run dev

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

### Troubleshooting
1. Clear cache: `rm -rf .next`
2. Reinstall: `rm -rf node_modules && npm install`
3. Check logs in terminal
4. Check browser console

---

**Happy Testing! 🎊**

