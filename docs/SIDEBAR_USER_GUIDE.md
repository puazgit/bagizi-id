# 🎯 Sidebar Usage Guide - Icon Collapse Mode

**Date**: 14 Oktober 2025  
**Status**: ✅ Active  
**Latest Update**: Header & Footer Enhancement (Logout + Avatar)

---

## 🎨 How to Use Collapsible Sidebar

### Desktop View

#### 1️⃣ **Expanded Mode (Default)**
```
┌────────────────────────────────┐
│  [🏢] SPPG Dashboard    ← Click to Dashboard
│      user@sppg.id               │
├────────────────────────────────┤
│                                │
│  Overview                      │
│  📊 Dashboard                  │
│  ──────────────────────────    │
│  Operations                    │
│  👨‍🍳 Menu Management            │
│  🛒 Procurement           [3]  │ ← Badge shows count
│  🏭 Production                 │
│  🚚 Distribution               │
│  ──────────────────────────    │
│  Management                    │
│  📦 Inventory                  │
│  👥 HRD                        │
│  📄 Reports                    │
│                                │
├────────────────────────────────┤
│  [U] User Name          ▲      │ ← Click for user menu
│      user@sppg.id              │
│                                │
│  Dropdown opens:               │
│  ┌──────────────────────────┐ │
│  │ 👤 Profile Settings      │ │
│  │ ──────────────────────── │ │
│  │ 🚪 Log out               │ │
│  └──────────────────────────┘ │
└────────────────────────────────┘
     Width: 256px (16rem)
```

#### 2️⃣ **Collapsed Mode (Icon Only)**
```
┌───┐
│[🏢]│  ← Click to Dashboard (Hover: tooltip)
│   │
├───┤
│   │
│   │
│ 📊│  ← Hover to see "Dashboard"
│───│
│   │
│ 👨‍🍳│  ← Hover to see "Menu Management"
│ 🛒│  ← Hover to see "Procurement (3 pending)"
│ 🏭│
│ 🚚│
│───│
│   │
│ 📦│
│ 👥│
│ 📄│
│   │
├───┤
│[U]│  ← Click for user menu (Avatar only)
└───┘
     Dropdown opens upward:
     ┌────────────────┐
     │ 👤 Profile     │
     │ ───────────── │
     │ 🚪 Log out     │
     └────────────────┘

Width: 48px (3rem)
```

---

## 🖱️ How to Toggle Sidebar

### Method 1: Click Trigger Button
```
Header:
┌──────────────────────────────────────┐
│ [≡] Dashboard › SPPG                 │  ← Click [≡] button
└──────────────────────────────────────┘
```

**Action**: Click the menu icon (`≡`) in the header

### Method 2: Keyboard Shortcut
```
⌘+B  (Mac)    or    Ctrl+B  (Windows/Linux)
```

**Action**: Press the keyboard shortcut to toggle instantly

### Method 3: Hover on Edge (with SidebarRail)
```
│←  Hover here (edge of sidebar)
└───┘
```

**Action**: Hover on the right edge of collapsed sidebar for smooth toggle hint

---

## ✨ Interactive Features

### 1. **Tooltip on Hover** (Collapsed Mode)
```
When hovering over icon:

   ┌─────────────────────┐
   │ Menu Management     │ ← Tooltip appears
   └─────────────────────┘
      ↑
    ┌───┐
    │ 👨‍🍳│ ← Icon
    └───┘
```

**Benefit**: See full label without expanding sidebar

### 2. **Active State Highlighting**
```
Normal item:     📊  Dashboard
Active item:     📊  Dashboard  ← Highlighted background
```

**Applies to**: Both expanded and collapsed modes

### 3. **Badge Visibility**
```
Expanded:      🛒 Procurement        [3]  ← Badge visible
Collapsed:     🛒                         ← Badge hidden
               ↑
            (tooltip shows: "Procurement (3 pending)")
```

---

## 📱 Mobile Behavior

### Mobile View (< 1024px)
```
Closed (Default):
┌──────────────────────────────┐
│  [≡] Dashboard               │  ← Click [≡] to open
│                              │
│  Main Content                │
│                              │
└──────────────────────────────┘

Open (Overlay):
┌──────────────────────────────┐
│  [×]  SPPG Dashboard         │
│       user@sppg.id           │
├──────────────────────────────┤
│                              │
│  Overview                    │
│  📊 Dashboard                │
│                              │
│  Operations                  │
│  👨‍🍳 Menu Management          │
│  🛒 Procurement         [3]  │
│                              │
│  [Dark Backdrop]             │ ← Click to close
└──────────────────────────────┘
```

**Features**:
- Full sidebar overlay
- Dark backdrop behind
- Swipe to close
- Click outside to close
- Click [×] to close

---

## 👤 User Menu & Logout (NEW!)

### Accessing User Menu

#### Expanded Mode:
```
┌────────────────────────────────┐
│  [U] User Name          ▲      │ ← Click anywhere on this area
│      user@sppg.id              │
└────────────────────────────────┘
```

#### Collapsed Mode:
```
┌───┐
│[U]│ ← Click avatar
└───┘
```

### User Menu Options

When clicked, a dropdown menu opens **upward** from footer:

```
     ┌────────────────────────────┐
     │ 👤 Profile Settings        │ ← View/edit profile
     │ ──────────────────────────│
     │ 🚪 Log out                 │ ← Sign out
     └────────────────────────────┘
     ↑
┌────────────────────────────────┐
│  [U] User Name          ▲      │ ← Footer
│      user@sppg.id              │
└────────────────────────────────┘
```

### Logout Process

**Step-by-Step**:

1. **Click user menu** (footer avatar/name area)
2. **Select "Log out"** from dropdown
3. **Confirmation**: Session cleared
4. **Redirect**: Automatically redirected to login page
5. **Toast notification**: "Successfully logged out" message

**Flow Diagram**:
```
User clicks footer
      ↓
Dropdown opens
      ↓
Click "Log out"
      ↓
handleLogout() called
      ↓
useAuth().logout() executed
      ↓
Session cleared
      ↓
Redirect to /login
      ↓
Toast: "Logged out successfully"
```

### Avatar Display

The avatar shows:

1. **Profile Image** (if uploaded)
2. **Fallback Initial** (first letter of name/email)
   - Example: "User Name" → Shows "U"
   - Example: "user@sppg.id" → Shows "U"
3. **Background**: Primary color theme

```
Avatar Examples:

With Image:          Without Image (Fallback):
┌────────┐          ┌────────┐
│ [📷]   │          │   U    │ ← First letter
└────────┘          └────────┘
```

---

## 🎯 Quick Reference

### Visual States

| State | Width | Icon | Label | Badge | Tooltip | User Menu |
|-------|-------|------|-------|-------|---------|-----------|
| **Expanded** | 256px | ✅ | ✅ | ✅ | ❌ | Full |
| **Collapsed** | 48px | ✅ | ❌ | ❌ | ✅ | Avatar only |
| **Mobile Closed** | 0px | ❌ | ❌ | ❌ | ❌ | Hidden |
| **Mobile Open** | 288px | ✅ | ✅ | ✅ | ❌ | Full |

### Toggle Actions

| Action | Desktop | Mobile |
|--------|---------|--------|
| **Click Trigger** | Collapse ↔ Expand | Close ↔ Open |
| **Keyboard (⌘/Ctrl+B)** | Collapse ↔ Expand | Close ↔ Open |
| **Click Outside** | No effect | Close |
| **Hover Edge** | Visual hint | N/A |

---

## 🎨 Visual Examples

### Example 1: Navigating While Collapsed
```
Step 1: Sidebar collapsed to icon mode
┌───┐
│ 🛒│  ← See Procurement icon
└───┘

Step 2: Hover to see details
┌───┐  ┌─────────────────────┐
│ 🛒│  │ Procurement (3)     │ ← Tooltip
└───┘  └─────────────────────┘

Step 3: Click icon to navigate
[Navigate to /procurement page]

✅ No need to expand sidebar!
```

### Example 2: Working with Collapsed Sidebar
```
Workspace Layout:

┌───┬──────────────────────────────────┐
│ 📊│  Dashboard                       │
│───│  ────────────────────────────    │
│ 👨‍🍳│  📊 Quick Stats                 │
│ 🛒│  ┌──────────┬──────────┐        │
│ 🏭│  │ Revenue  │ Orders   │        │
│ 🚚│  └──────────┴──────────┘        │
│───│                                   │
│ 📦│  📈 Recent Activity              │
│ 👥│  ┌────────────────────┐          │
│ 📄│  │ Activity List      │          │
│   │  └────────────────────┘          │
└───┴──────────────────────────────────┘
 48px    More screen space!
 
✅ More room for content
✅ Quick access to navigation
```

### Example 3: Expanded for Detailed View
```
When you need to see all options:

Click [≡] to expand →

┌────────────────────────┬──────────┐
│  Overview              │          │
│  📊 Dashboard          │ Content  │
│  ──────────────────    │          │
│  Operations            │          │
│  👨‍🍳 Menu Management    │          │
│  🛒 Procurement    [3] │          │
│  🏭 Production         │          │
│  🚚 Distribution       │          │
│  ──────────────────    │          │
│  Management            │          │
│  📦 Inventory          │          │
│  👥 HRD                │          │
│  📄 Reports            │          │
└────────────────────────┴──────────┘
      256px

✅ See all section labels
✅ See notification badges
✅ Better overview
```

---

## 💡 Pro Tips

### Tip 1: **Use Keyboard Shortcut**
```
⌘+B (Mac) or Ctrl+B (Windows/Linux)

✅ Fastest way to toggle
✅ Works from anywhere
✅ Both hands stay on keyboard
```

### Tip 2: **Keep Collapsed for Focus**
```
┌───┬──────────────────────┐
│ 📊│  [More screen space] │
│ 🛒│  [for your content]  │
│ 🏭│                      │
└───┴──────────────────────┘

✅ More focus on content
✅ Less distraction
✅ Quick icon access when needed
```

### Tip 3: **Hover for Quick Check**
```
Wonder what this icon is?

    ┌────────────┐
    │ Production │ ← Just hover!
    └────────────┘
       ↑
    ┌───┐
    │ 🏭│
    └───┘

✅ No need to expand
✅ Instant information
```

### Tip 4: **Use Badge Indicators**
```
Expanded view shows counts:

🛒 Procurement           [3]

Collapsed view (hover):
┌─────────────────────┐
│ Procurement (3)     │ ← Count in tooltip
└─────────────────────┘

✅ Always aware of pending items
```

---

## 🎓 Best Practices

### For Daily Work:
1. **Start Collapsed**: More screen space for content
2. **Expand When Needed**: Planning, overview, exploring
3. **Use Keyboard**: Faster than mouse clicks
4. **Trust the Icons**: You'll memorize them quickly

### For Mobile Users:
1. **Keep Closed**: Maximizes screen space
2. **Open to Navigate**: Full sidebar experience
3. **Close After Selection**: Auto-closes after click (planned)

---

## 🔧 Troubleshooting

### Issue: "Sidebar disappeared completely"
**Solution**: Make sure you're on desktop (>1024px). On mobile it's hidden by default - click [≡] to open.

### Issue: "Can't see labels"
**Solution**: 
- Hover over icons to see tooltips
- OR click [≡] to expand sidebar

### Issue: "Icons are too small"
**Solution**: Icons are 16x16px (standard size). This is optimal for clarity and consistency.

### Issue: "Tooltip not showing"
**Solution**: 
- Make sure sidebar is in collapsed mode
- Hover directly over the icon
- Wait a moment (no delay set)

---

## ✅ Summary

### Sidebar Features:
- ✅ **Collapsible**: Toggle between 256px and 48px
- ✅ **Icon Mode**: Icons remain visible when collapsed
- ✅ **Tooltips**: Hover to see full labels
- ✅ **Badges**: Notification counts when expanded
- ✅ **Keyboard**: ⌘+B / Ctrl+B shortcut
- ✅ **Responsive**: Mobile overlay mode
- ✅ **Accessible**: Screen reader support
- ✅ **Smooth**: 200ms transitions

### User Benefits:
- ✅ **More Screen Space**: 208px gained when collapsed
- ✅ **Quick Navigation**: No need to expand for familiar icons
- ✅ **Context on Demand**: Tooltips show details
- ✅ **Flexible Workflow**: Adapt to your needs
- ✅ **Professional**: Industry-standard pattern

---

**Guide Version**: 1.0  
**Last Updated**: 14 Oktober 2025  
**Feature Status**: ✅ Active & Production Ready
