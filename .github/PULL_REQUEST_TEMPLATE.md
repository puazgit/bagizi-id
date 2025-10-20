# SPPG Phase 1 - Fix #[X]: [Fix Name]

## 📋 Fix Information

**Fix Number**: #[X]  
**Priority**: 🔥 [CRITICAL/HIGH/MEDIUM/LOW]  
**Effort**: [X] hours  
**Dependencies**: [List dependencies or "None"]

## 🎯 Changes

### Schema Changes
- [ ] Database migration implemented
- [ ] Migration tested on staging
- [ ] Rollback procedure tested

### Service Layer
- [ ] New services created
- [ ] Existing services updated
- [ ] Business logic tested

### API Routes
- [ ] New API endpoints created
- [ ] Existing endpoints updated
- [ ] API documentation updated

### UI Components
- [ ] New components created
- [ ] Existing components updated
- [ ] shadcn/ui components used

### Testing
- [ ] Unit tests added (target: >85% coverage)
- [ ] Integration tests added
- [ ] E2E tests added (if applicable)
- [ ] All tests passing locally

## ✅ Pre-Merge Checklist

### Code Quality
- [ ] TypeScript compilation successful (no errors)
- [ ] ESLint passing (no errors)
- [ ] Prettier formatting applied
- [ ] No console.log statements in production code
- [ ] All TypeScript strict mode compliant

### Testing
- [ ] All existing tests still passing
- [ ] New tests cover edge cases
- [ ] Test coverage meets target (>85%)
- [ ] Manual testing completed

### Database
- [ ] Migration runs successfully on staging
- [ ] Rollback procedure tested and documented
- [ ] No data loss confirmed
- [ ] Performance impact assessed

### Multi-Tenancy Safety
- [ ] All queries filter by `sppgId` where required
- [ ] No cross-tenant data leakage
- [ ] Ownership verification implemented
- [ ] Audit logging added for sensitive operations

### Performance
- [ ] No N+1 queries introduced
- [ ] Database indexes added where needed
- [ ] API response times within targets
- [ ] Bundle size impact checked

### Security
- [ ] Input validation implemented (Zod schemas)
- [ ] Authorization checks in place
- [ ] No sensitive data in logs
- [ ] CSRF protection maintained

### Documentation
- [ ] Code comments added
- [ ] JSDoc annotations complete
- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)

## 🧪 Testing Evidence

### Verification Queries Run
```sql
-- Paste verification query results here
```

### Test Coverage
```bash
# Paste test coverage report here
```

### Performance Benchmarks
```
# Before:
[Baseline metrics]

# After:
[New metrics]
```

## 📸 Screenshots (if UI changes)

[Add screenshots here]

## 🔄 Rollback Plan

**If deployment fails:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Database rollback:**
```sql
-- Rollback SQL here
```

## 📝 Additional Notes

[Any additional context, warnings, or notes]

## 🔗 Related Issues

Closes #[issue_number]

---

**Reviewer Checklist**
- [ ] Code reviewed for correctness
- [ ] Tests reviewed for completeness
- [ ] Migration reviewed for safety
- [ ] Multi-tenant security verified
- [ ] Performance impact acceptable
- [ ] Documentation adequate

**Approved by**: [Tech Lead Name]  
**Date**: [Date]
