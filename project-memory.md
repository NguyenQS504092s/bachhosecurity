# Project Memory - timesheet-pro-vn

**Last Updated:** 2025-12-27 18:50
**Session:** Context Restoration (Ultrathink)

---

## Project Identity

| Field | Value |
|-------|-------|
| Name | timesheet-pro-vn |
| Type | Vietnamese Timesheet/Attendance App |
| Client | Bạch Hổ Security (Bach Ho Security) |
| Stack | React 19 + Vite + Firebase + Gemini AI |
| Status | Development - Security Review Complete |

---

## Current State

### Progress
- **Active Plan:** `plans/251226-2123-codebase-improvement/` (4 phases)
- **Phase Status:** All PENDING (not started)
- **Branch:** main
- **Uncommitted:** Yes (plan files + code mods staged)

### Security Score: 2/10 (CRITICAL)
| Issue | Severity | Location |
|-------|----------|----------|
| Hardcoded API Key | CRITICAL | `geminiService.ts:5`, `ImageCapture.tsx:6` |
| Plaintext Passwords | CRITICAL | `constants.ts` |
| Client-side Auth Only | CRITICAL | `App.tsx:44-55` |
| No Data Persistence | HIGH | localStorage only |

---

## Architecture Quick Ref

### Structure
```
├── components/          # 6 React components
│   ├── Login.tsx
│   ├── Settings.tsx
│   ├── ImageCapture.tsx
│   ├── TimesheetGrid.tsx  # 806 lines - needs split
│   ├── TargetManagement.tsx
│   └── HRManagement.tsx   # 668 lines - needs split
├── services/
│   └── geminiService.ts   # Gemini AI for OCR
├── scripts/
├── plans/                 # Improvement plan
└── App.tsx
```

### Tech Stack
- **Frontend:** React 19, Vite, Lucide React icons
- **Backend:** Firebase (included but unused)
- **AI:** Google Gemini (@google/genai)
- **Types:** TypeScript ~5.8

---

## Active Plans

### 251226-2123-codebase-improvement (P1 - 20-27h)

| Phase | Name | Estimate | Status |
|-------|------|----------|--------|
| 1 | Security Hotfix | 2-3h | PENDING (URGENT) |
| 2 | Firebase Integration | 6-8h | Blocked by P1 |
| 3 | Architecture Refactoring | 8-10h | Blocked by P2 |
| 4 | Polish & Production | 4-6h | Blocked by P3 |

**Phase 1 Priority:**
1. Revoke exposed API key at Google AI Studio
2. Create `.env.local` + `.env.example`
3. Update code to use env vars
4. Add security headers to vercel.json

---

## Session Continuity

### Decisions Made
- 4-phase progressive disclosure plan created
- Security-first approach (Phase 1 must complete before deployment)
- Firebase modular SDK pattern selected

### Unresolved Questions
1. User migration strategy for password reset?
2. Is localStorage backup needed before Firebase migration?
3. Single company or multi-tenant?
4. Error monitoring (Sentry) in Phase 4?

### Next Session Actions
1. **URGENT:** Execute Phase 1 (Security Hotfix)
2. Follow `phases/phase-01-security-hotfix.md`
3. Commit plan files before starting implementation

---

## Reports Generated (2025-12-26)

| # | Report | Purpose |
|---|--------|---------|
| 001 | researcher-security-best-practices | React security patterns 2025 |
| 002 | researcher-firebase-integration | Firebase auth/Firestore patterns |
| 003 | code-review-security-architecture | Security audit (12 issues) |
| 004 | code-review-quality-performance | Quality/performance audit |
| 005 | planner-to-implementation-specialist-plan-report | Implementation handover |
| - | review-251226-2123-final-summary | Executive summary |

---

## Quick Commands

```bash
# Dev server
npm run dev

# Build
npm run build

# Read current plan
cat plans/251226-2123-codebase-improvement/plan.md

# Start Phase 1
cat plans/251226-2123-codebase-improvement/phases/phase-01-security-hotfix.md
```

---

*Memory updated: 2025-12-27 18:50*
