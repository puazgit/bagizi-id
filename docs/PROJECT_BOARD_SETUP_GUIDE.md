# 📋 GitHub Project Board Setup Guide

**Date**: October 21, 2025  
**Project**: SPPG Phase 1 Implementation  
**Duration**: 15-20 minutes

---

## 🎯 Objective

Create GitHub Project Board to track all 8 fixes across 4 weeks with automated workflows.

---

## 📝 Step-by-Step Instructions

### Step 1: Create New Project (2 minutes)

1. **Navigate to Projects** (already opened):
   - URL: https://github.com/yasunstudio/bagizi-id/projects

2. **Click "New project"** button (top right)

3. **Select Template**:
   - Choose: **"Board"** template
   - This gives us Kanban-style columns

4. **Click "Create"**

---

### Step 2: Configure Project Settings (3 minutes)

1. **Project Name**:
   ```
   SPPG Phase 1 Implementation
   ```

2. **Project Description**:
   ```
   Phase 1 implementation to improve SPPG from D+ to B+ grade.
   8 critical fixes over 4 weeks (Oct 22 - Nov 8, 2025).
   Target: 90 hours total effort, 85% test coverage.
   ```

3. **README** (optional):
   ```markdown
   ## 🎯 Phase 1 Goals
   
   - Fix #1-2: Core data relations (Week 1)
   - Fix #3-6: Production & distribution (Week 2-3)
   - Fix #7-8: Data quality & workflow (Week 4)
   
   **Target**: B+ score (8.0/10)
   **Timeline**: Oct 22 - Nov 8, 2025
   ```

4. **Visibility**: 
   - Set to: **Private** (if team only) or **Public**

---

### Step 3: Setup Custom Columns (5 minutes)

**Default columns** to remove:
- ❌ Delete "Todo"
- ❌ Delete "In Progress"
- ❌ Delete "Done"

**Create new columns** (in this order):

#### Column 1: 📋 Backlog
- **Name**: `📋 Backlog`
- **Description**: Issues not yet started
- **Automation**: None

#### Column 2: 📅 Week 1 (Oct 22-25)
- **Name**: `📅 Week 1 (Oct 22-25)`
- **Description**: Fix #1, #2 - Core Relations
- **Automation**: None

#### Column 3: 📅 Week 2-3 (Oct 28-Nov 4)
- **Name**: `📅 Week 2-3 (Oct 28-Nov 4)`
- **Description**: Fix #3, #4-5, #6 - Production & Distribution
- **Automation**: None

#### Column 4: 📅 Week 4 (Nov 7-8)
- **Name**: `📅 Week 4 (Nov 7-8)`
- **Description**: Fix #7, #8 - Data Quality & Workflow
- **Automation**: None

#### Column 5: 🚧 In Progress
- **Name**: `🚧 In Progress`
- **Description**: Currently being worked on
- **Automation**: 
  - ✅ Auto-move here when issue is **assigned**
  - ✅ Auto-move here when PR is **opened**

#### Column 6: 👀 In Review
- **Name**: `👀 In Review`
- **Description**: PR created, waiting for review
- **Automation**:
  - ✅ Auto-move here when PR is marked as **ready for review**

#### Column 7: ✅ Done
- **Name**: `✅ Done`
- **Description**: Completed and merged
- **Automation**:
  - ✅ Auto-move here when issue is **closed**
  - ✅ Auto-move here when PR is **merged**

---

### Step 4: Add Issues to Board (5 minutes)

1. **Click "+ Add items"** button (bottom of any column)

2. **Search for issues**:
   ```
   label:phase1
   ```

3. **Select all 8 issues**:
   - [ ] Issue #2: Fix #1 - MenuIngredient-InventoryItem Link
   - [ ] Issue #3: Fix #2 - ProcurementItem-InventoryItem Link
   - [ ] Issue #4: Fix #3 - FoodProduction Cost Calculation
   - [ ] Issue #5: Fix #4-5 - Distribution Flow Complete
   - [ ] Issue #6: Fix #6 - Procurement Supplier Cleanup
   - [ ] Issue #7: Fix #7 - MenuPlan Approval Workflow
   - [ ] Issue #8: Fix #8 - SchoolBeneficiary Address & GPS

4. **Click "Add selected items"**

---

### Step 5: Organize Issues by Week (3 minutes)

**Drag and drop issues** to correct columns:

#### 📅 Week 1 Column:
- Move **Issue #2** (Fix #1) here
- Move **Issue #3** (Fix #2) here

#### 📅 Week 2-3 Column:
- Move **Issue #4** (Fix #3) here
- Move **Issue #5** (Fix #4-5) here
- Move **Issue #6** (Fix #6) here

#### 📅 Week 4 Column:
- Move **Issue #7** (Fix #7) here
- Move **Issue #8** (Fix #8) here

**Result**: All issues distributed across timeline columns ✅

---

### Step 6: Setup Automation Rules (2 minutes)

1. **Click "⋯" menu** (top right of project)

2. **Select "Workflows"**

3. **Enable built-in workflows**:

   #### Auto-add to project:
   ```
   When: Issue is created with label "phase1"
   Then: Add to this project in "Backlog" column
   ```

   #### Item closed:
   ```
   When: Issue is closed
   Then: Move to "Done" column
   ```

   #### Pull request opened:
   ```
   When: PR is opened and linked to issue
   Then: Move issue to "In Progress" column
   ```

   #### Pull request merged:
   ```
   When: PR is merged
   Then: Move issue to "Done" column
   ```

4. **Save workflows**

---

### Step 7: Add Custom Fields (Optional - 3 minutes)

Add custom fields to track progress:

1. **Click "+ New field"**

2. **Add these fields**:

   #### Field 1: Priority
   - **Type**: Single select
   - **Options**: 
     - 🔥🔥🔥 CRITICAL (red)
     - 🔥🔥 HIGH (orange)
     - 🔥 MEDIUM (yellow)
     - ⚪ LOW (gray)

   #### Field 2: Effort
   - **Type**: Number
   - **Suffix**: hours
   - **Example**: `16 hours`

   #### Field 3: Developer
   - **Type**: Single select
   - **Options**:
     - Developer A
     - Developer B
     - Both

   #### Field 4: Status
   - **Type**: Single select
   - **Options**:
     - Not Started
     - In Progress
     - Blocked
     - In Review
     - Done

   #### Field 5: Week
   - **Type**: Single select
   - **Options**:
     - Week 1
     - Week 2-3
     - Week 4

3. **Fill in field values** for each issue:

   | Issue | Priority | Effort | Developer | Week |
   |-------|----------|--------|-----------|------|
   | #2 (Fix #1) | 🔥🔥🔥 CRITICAL | 16 | Developer A | Week 1 |
   | #3 (Fix #2) | 🔥🔥 HIGH | 10 | Developer B | Week 1 |
   | #4 (Fix #3) | 🔥🔥🔥 CRITICAL | 12 | Developer A | Week 2-3 |
   | #5 (Fix #4-5) | 🔥🔥🔥 CRITICAL | 26 | Both | Week 2-3 |
   | #6 (Fix #6) | 🔥 MEDIUM | 6 | Developer B | Week 2-3 |
   | #7 (Fix #7) | 🔥🔥 HIGH | 12 | Developer A | Week 4 |
   | #8 (Fix #8) | 🔥 MEDIUM | 8 | Developer B | Week 4 |

---

### Step 8: Create Saved Views (2 minutes)

Create filtered views for different perspectives:

#### View 1: By Priority
1. **Click "+ New view"**
2. **Name**: `By Priority`
3. **Layout**: Table
4. **Sort by**: Priority (descending)
5. **Save**

#### View 2: By Developer
1. **Click "+ New view"**
2. **Name**: `By Developer`
3. **Layout**: Board
4. **Group by**: Developer
5. **Save**

#### View 3: Timeline
1. **Click "+ New view"**
2. **Name**: `Timeline`
3. **Layout**: Table
4. **Sort by**: Week, then Priority
5. **Save**

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Project created with name "SPPG Phase 1 Implementation"
- [ ] 7 columns configured (Backlog, Week 1, Week 2-3, Week 4, In Progress, In Review, Done)
- [ ] All 8 issues added to project
- [ ] Issues distributed across week columns correctly
- [ ] Automation workflows enabled (4 workflows)
- [ ] Custom fields added (Priority, Effort, Developer, Status, Week)
- [ ] Field values filled for all issues
- [ ] 3 saved views created (By Priority, By Developer, Timeline)

---

## 📊 Expected Result

Your project board should look like this:

```
┌─────────────┬──────────────┬──────────────┬──────────────┬─────────────┬─────────────┬──────────┐
│  Backlog    │  Week 1      │  Week 2-3    │  Week 4      │ In Progress │ In Review   │   Done   │
│             │  (Oct 22-25) │  (Oct 28-    │  (Nov 7-8)   │             │             │          │
│             │              │   Nov 4)     │              │             │             │          │
├─────────────┼──────────────┼──────────────┼──────────────┼─────────────┼─────────────┼──────────┤
│             │ #2 Fix #1    │ #4 Fix #3    │ #7 Fix #7    │             │             │          │
│             │ MenuIngredient│ Production   │ MenuPlan     │             │             │          │
│             │ 🔥🔥🔥 16h    │ 🔥🔥🔥 12h    │ 🔥🔥 12h      │             │             │          │
│             │ Dev A        │ Dev A        │ Dev A        │             │             │          │
│             │              │              │              │             │             │          │
│             │ #3 Fix #2    │ #5 Fix #4-5  │ #8 Fix #8    │             │             │          │
│             │ Procurement  │ Distribution │ School GPS   │             │             │          │
│             │ 🔥🔥 10h      │ 🔥🔥🔥 26h    │ 🔥 8h        │             │             │          │
│             │ Dev B        │ Both         │ Dev B        │             │             │          │
│             │              │              │              │             │             │          │
│             │              │ #6 Fix #6    │              │             │             │          │
│             │              │ Supplier     │              │             │             │          │
│             │              │ 🔥 6h        │              │             │             │          │
│             │              │ Dev B        │              │             │             │          │
└─────────────┴──────────────┴──────────────┴──────────────┴─────────────┴─────────────┴──────────┘

Total: 0 issues     2 issues        3 issues        2 issues        0 issues      0 issues     0 issues
       0 hours      26 hours        44 hours        20 hours        0 hours       0 hours      0 hours
```

---

## 🎯 Quick Stats

After setup, your board will show:

- **Total Issues**: 8
- **Total Effort**: 90 hours
- **Week 1**: 2 issues, 26 hours
- **Week 2-3**: 3 issues, 44 hours
- **Week 4**: 2 issues, 20 hours
- **Developers**: Developer A (40h), Developer B (24h), Both (26h)

---

## 📱 Mobile Access

Project board is accessible via:
- **Web**: https://github.com/yasunstudio/bagizi-id/projects/[number]
- **GitHub Mobile App**: iOS/Android
- **Notifications**: Email/Slack integration

---

## 🔄 Daily Workflow

Once setup, team members will:

1. **Morning standup**: Review "In Progress" column
2. **Start work**: Self-assign issue → Auto-moves to "In Progress"
3. **Create PR**: Link to issue → Stays in "In Progress"
4. **Request review**: Mark PR ready → Auto-moves to "In Review"
5. **Merge PR**: Merged → Auto-moves to "Done"

**All automatic!** ✨

---

## 📞 Next Steps After Setup

1. **Share project link** with team
2. **Schedule kickoff meeting** for tomorrow 9 AM
3. **Assign issues** to developers:
   - Developer A: #2, #4, #7
   - Developer B: #3, #6, #8
   - Both: #5
4. **Send calendar invites** for daily standups
5. **Setup Slack channel**: #sppg-phase1-implementation

---

## ⏱️ Estimated Time: 15-20 minutes

You should be able to complete this setup in **15-20 minutes**.

**Good luck!** 🚀

---

**Created**: October 21, 2025  
**Last Updated**: October 21, 2025  
**Status**: Ready to use
