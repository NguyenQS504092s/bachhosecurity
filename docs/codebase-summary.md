# Timesheet Pro VN - Codebase Summary

**Generated:** 2025-12-28
**Total Files:** 108
**Total Tokens:** 81.349K
**Language:** TypeScript + React

---

## Directory Structure Overview

```
timesheet-pro-vn/
├── src/
│   ├── core/                    # App shell & layout
│   ├── features/                # Feature-based modules (auth, hr, targets, timesheet)
│   ├── components/              # Reusable & feature components
│   ├── services/                # Business logic & external integrations
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Utility functions & helpers
│   ├── constants/               # App-wide constants
│   ├── lib/                     # Library initializations (Firebase)
│   ├── test/                    # Test setup & mocks
│   ├── App.tsx                  # Main app component
│   └── index.tsx                # React app entry point
├── public/                      # Static assets
├── scripts/                     # Utility scripts (data import, seeding)
├── docs/                        # Documentation
├── .env.example                 # Environment template
├── vite.config.ts               # Vite build configuration
├── tsconfig.json                # TypeScript configuration
├── firebase.json                # Firebase CLI config
├── vercel.json                  # Vercel deployment config
└── package.json                 # Dependencies & scripts
```

---

## Core Directories

### `/src/core` - App Shell (4 files)

**Purpose:** Application layout, header, and provider setup

| File | Lines | Purpose |
|------|-------|---------|
| `app-header.tsx` | 50+ | App header with nav menu (Timesheet/HR/Targets) |
| `app-layout.tsx` | 100+ | Layout wrapper with header & sidebar |
| `app-providers.tsx` | 30+ | Context providers (Auth, Employees, Targets, Timesheet) |
| `index.ts` | 5 | Barrel export for core modules |

**Key Components:**
- `AppLayout`: Render slot pattern with `currentView` prop
- `AppHeader`: Navigation buttons with active view highlighting
- `AppProviders`: Wraps all React Context providers

---

### `/src/features` - Feature Modules (12 files)

Feature-based architecture with isolated concerns.

#### **Auth Feature** (`/src/features/auth`)
```
auth/
├── auth-context.tsx    # Auth state (currentUser, login, logout)
└── index.ts            # Barrel export
```
- **Context:** `AuthContextType` - manages login/logout, current user
- **Hook:** `useAuth()` - consumer hook
- **State:** User stored in localStorage

#### **HR Feature** (`/src/features/hr`)
```
hr/
├── employees-context.tsx   # Employee CRUD state
└── index.ts                # Barrel export
```
- **Context:** `EmployeesContextType` - CRUD operations
- **Hooks:** `useEmployees()` - provides employees array and actions
- **Sync:** Auto-sync to Firebase on CRUD operations
- **Methods:** `addEmployee()`, `updateEmployee()`, `removeEmployee()`, `refreshEmployees()`

#### **Targets Feature** (`/src/features/targets`)
```
targets/
├── targets-context.tsx                    # Targets (shifts/rosters) state
├── components/
│   ├── target-management.tsx              # Main targets UI
│   ├── target-form.tsx                    # Add/edit target form
│   ├── target-list-item.tsx               # Single target card
│   ├── target-toolbar.tsx                 # Filter/sort toolbar
│   ├── roster-editor.tsx                  # Edit roster employees
│   └── shift-manager.tsx                  # Manage shift times
├── hooks/
│   └── use-shift-options.ts               # Shift template options
└── index.ts                               # Barrel export
```
- **Context:** `TargetsContextType` - targets CRUD + roster management
- **Types:** `Target {id, name, roster: RosterItem[]}`
- **RosterItem:** `{employeeId, shift}` - employee assignment

#### **Timesheet Feature** (`/src/features/timesheet`)
```
timesheet/
├── timesheet-context.tsx       # Monthly attendance state
└── index.ts                    # Barrel export
```
- **Context:** `TimesheetContextType` - attendance grid operations
- **State:** `gridData: Employee[]` with attendance prop
- **Methods:** `setGridData()`, `saveTimesheet()`, `refreshTimesheet()`
- **Storage:** Firebase path `/timesheets/[year]/[month]/[employeeId]/[day]`

---

### `/src/components` - UI Components (35+ files)

Shared and feature-specific React components.

#### **Auth Components** (`/src/components/auth`)
| File | Purpose |
|------|---------|
| `login.tsx` | Email login form & authentication UI |
| `login.test.tsx` | Login component tests |
| `index.ts` | Barrel export |

#### **HR Components** (`/src/components/hr`)
| File | Purpose |
|------|---------|
| `hr-management.tsx` | Main HR module UI |
| `hr-toolbar.tsx` | Search/filter toolbar |
| `employee-table-row.tsx` | Single employee row in table |
| `add-employee-row.tsx` | Quick-add employee form |
| `employee-detail-modal.tsx` | Edit employee details modal |
| `hr-helpers.ts` | HR utilities (validation, formatting) |
| `index.ts` | Barrel export |

#### **Timesheet Components** (`/src/components/timesheet`)
| File | Purpose |
|------|---------|
| `timesheet-grid.tsx` | Monthly attendance grid (large: 3.9K tokens) |
| `timesheet-toolbar.tsx` | Month/year selector toolbar |
| `add-employee-modal.tsx` | Add employees to timesheet |
| `index.ts` | Barrel export |

**Key Grid Features:**
- Rows: Employees, Columns: Days of month
- Cell values: Present/Absent/Half-day/Leave
- Color coding (green/red/yellow/blue)
- Click to edit, auto-save debounced
- Summary stats (total days worked)

#### **Shared Components** (`/src/components/shared`)
| File | Purpose | Size |
|------|---------|------|
| `image-capture.tsx` | Camera modal + OCR integration | 3.1K tokens |
| `backup-button.tsx` | Download/restore JSON backup |
| `sync-button.tsx` | Google Sheets sync trigger |
| `settings.tsx` | App settings modal |
| `index.ts` | Barrel export |

**Image Capture:**
- Camera access via `getUserMedia()`
- Send image to Gemini AI for OCR
- Parse response: extract employee data
- Display preview before save

#### **Targets Components** (via `/src/features/targets/components`)
Same as feature targets section above.

---

### `/src/services` - Business Logic (12 files)

External integrations and data operations.

#### **Firebase Services** (`/src/services/firebase`)
Modular service layer for Firebase operations:

| File | Purpose |
|------|---------|
| `employee-service.ts` | Employee CRUD: `getAllEmployees()`, `createEmployee()`, `updateEmployee()`, `deleteEmployee()` |
| `target-service.ts` | Target CRUD: `getAllTargets()`, `createTarget()`, etc. |
| `timesheet-service.ts` | Timesheet ops: `getTimesheet()`, `saveTimesheet()` |
| `shift-service.ts` | Shift templates management |
| `index.ts` | Barrel export for all services |

**Operations:**
- Read: Query from Firebase Realtime DB
- Write: Create/update/delete with timestamp tracking
- Sync: Auto-sync on create/update
- Error handling: Try-catch with console logging

#### **Core Services** (root `/src/services`)

| File | Purpose |
|------|---------|
| `realtime-database-service.ts` | DEPRECATED - re-exports from `/firebase` for backward compatibility |
| `backup-service.ts` | JSON backup/restore logic |
| `sync-service.ts` | Google Sheets 2-way sync orchestration |
| `sheets-service.ts` | Google Sheets API wrapper (read/write rows) |
| `gemini-service.ts` | Gemini AI vision API for OCR |
| `index.ts` | Barrel export |

**Sync Service:**
- Periodic sync: 15-minute intervals
- Manual sync: Button trigger
- Conflict resolution: Timestamp-based (latest wins)
- Status: Emits 'syncing', 'synced', 'error' events

---

### `/src/hooks` - Custom Hooks (8 files)

Reusable React hooks for common patterns.

| File | Purpose |
|------|---------|
| `use-auth.ts` | Auth state hook (currentUser, login, logout) |
| `use-employees.ts` | Employee context consumer |
| `use-targets.ts` | Targets context consumer |
| `use-sheets-sync.ts` | Google Sheets sync state & trigger |
| `use-autocomplete.ts` | Autocomplete input logic |
| `use-cell-selection.ts` | Timesheet grid cell selection |
| `index.ts` | Barrel export |

---

### `/src/types` - TypeScript Definitions (4 files)

| File | Purpose | Types |
|------|---------|-------|
| `employee.ts` | Employee type definition | `Employee {id, name, code, department, shift, role, attendance}` |
| `target.ts` | Target & roster types | `Target`, `RosterItem` |
| `timesheet.ts` | Timesheet types | `DayInfo`, `CellValue`, `AppState` |
| `index.ts` | Barrel export | - |

**Employee Type:**
```typescript
interface Employee {
  id: string;
  name: string;
  code: string;
  department: string;
  shift: string;
  role: 'admin' | 'staff';
  attendance: Record<string, CellValue>; // {YYYY-MM-DD: 'Present'|'Absent'|...}
}
```

**CellValue Enum:**
`'Present' | 'Absent' | 'Half-day' | 'Leave'`

---

### `/src/utils` - Utility Functions (9 files)

| File | Purpose |
|------|---------|
| `excel-export.ts` | Main export/import orchestrator (1.5K tokens) |
| `excel/*.ts` | Modular Excel operations (4 files) |
| `timesheet-helpers.ts` | Grid calculations (totals, averages) |
| `date-helpers.ts` | Date formatting & calculations |
| `auth.ts` | Auth utilities (validation, storage) |
| `index.ts` | Barrel export |

**Excel Utilities:**
- `timesheet-excel.ts`: Attendance export with color coding
- `payroll-excel.ts`: Salary calculations export
- `employee-excel.ts`: Employee list export
- `target-excel.ts`: Target/roster export
- `common.ts`: Shared Excel formatting functions

**Timesheet Helpers:**
- `calculateTotalDays()` - sum attendance days
- `formatGridData()` - prepare for export
- `validateAttendance()` - data validation

---

### `/src/lib` - Library Initialization (1 file)

| File | Purpose |
|------|---------|
| `firebase.ts` | Firebase init with hardcoded config + fallbacks (56 lines) |

**Features:**
- Config loads from env variables with hardcoded fallbacks
- Graceful degradation if Firebase unavailable
- Exports: `app`, `db`, `isFirebaseAvailable()`, `getFirebaseError()`

---

### `/src/constants` - App Constants (2 files)

| File | Purpose |
|------|---------|
| `date.ts` | Month names, date formats |
| `index.ts` | Barrel export |

---

### `/src/test` - Testing Setup (3 files)

| File | Purpose |
|------|---------|
| `setup.ts` | Vitest + MSW configuration |
| `mocks/handlers.ts` | Mock API handlers |
| `mocks/server.ts` | MSW server setup |

---

## Entry Points

### App Entry (`App.tsx` - 208 lines)

**Main orchestrator component:**
- Renders feature views: Timesheet/HR/Targets
- Coordinates cross-feature state
- Handles:
  - Image OCR → Employee creation
  - Excel import → Timesheet update
  - Sync completion → Data refresh
  - Month/year selection

**Key Callbacks:**
- `handleImageDataExtracted()` - OCR result processing
- `handleGridChange()` - Attendance grid edits
- `handleImportExcel()` - Excel file processing
- `handleSyncComplete()` - Refresh after Sheets sync

### React Entry (`index.tsx`)

Renders `App` into DOM with `AppProviders` wrapper.

---

## Data Flow Patterns

### 1. **Authentication Flow**
```
Login.tsx → AuthContext.login() → currentUser stored
         → Redirect to App → useAuth() hook reads state
```

### 2. **Employee CRUD Flow**
```
HR Component → useEmployees() → EmployeesContext
           → EmployeeService.createEmployee() → Firebase
           → Context updates → UI re-renders
           → Auto-syncs to Google Sheets
```

### 3. **Timesheet Edit Flow**
```
TimesheetGrid click → useTimesheet().setGridData()
                   → Debounce 2 seconds
                   → TimesheetService.saveTimesheet()
                   → Firebase `/timesheets/[year]/[month]/...`
                   → UI updates via Context
```

### 4. **Excel Import Flow**
```
File input → handleImportExcel() → excel-export.importTimesheetFromExcel()
         → Parse XLSX → Map to Employee objects
         → updateEmployee() for existing, addEmployee() for new
         → Auto-save to Firebase
```

### 5. **Image OCR Flow**
```
Camera → Image capture → Gemini API OCR
      → Parse JSON response → Extract employee data
      → Preview in modal → User confirms
      → createEmployee() → Firebase sync
```

---

## File Size Distribution

**Top 5 Largest Files (by tokens):**
1. `timesheet-grid.tsx` - 3.943K tokens (4.8%)
2. `firebase-import-helper.html` - 3.367K tokens (4.1%)
3. `utils/excel/timesheet-excel.ts` - 3.289K tokens (4%)
4. `components/shared/image-capture.tsx` - 3.105K tokens (3.8%)
5. `components/hr/employee-detail-modal.tsx` - 3.087K tokens (3.8%)

**Total codebase:** 81.349K tokens (well-balanced distribution)

---

## Naming Conventions

### Files & Directories
- **Files:** kebab-case (e.g., `employee-detail-modal.tsx`, `hr-helpers.ts`)
- **Directories:** kebab-case (e.g., `/src/features/targets`, `/src/utils/excel`)
- **Barrel exports:** `index.ts` in every directory

### React Components
- **Functional components:** PascalCase (e.g., `TimesheetGrid`, `EmployeeDetailModal`)
- **Props interfaces:** `[ComponentName]Props` (e.g., `TimesheetGridProps`)
- **Context types:** `[ContextName]ContextType` (e.g., `AuthContextType`)

### Functions & Variables
- **Functions:** camelCase (e.g., `handleImageDataExtracted`, `calculateTotalDays`)
- **Variables:** camelCase (e.g., `currentUser`, `gridData`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`, `SYNC_INTERVAL`)
- **Booleans:** `is`/`has` prefix (e.g., `isLoggedIn`, `hasError`)

### Types & Interfaces
- **Types:** PascalCase (e.g., `Employee`, `Target`, `RosterItem`)
- **Enums:** PascalCase (e.g., `CellValue`)
- **Union types:** Lowercase values (e.g., `'Present' | 'Absent'`)

---

## Dependencies Summary

**Direct Dependencies (7):**
- `react` (19.2.3) - UI framework
- `react-dom` (19.2.3) - React DOM
- `firebase` (12.7.0) - Realtime DB
- `@google/genai` (1.34.0) - Gemini AI OCR
- `lucide-react` (0.562.0) - Icon library
- `xlsx` (0.18.5) - Excel import/export
- `typescript` (5.8.2) - Language support

**Dev Dependencies (13):**
- Vite (6.2.0) - Build tool
- Vitest (4.0.16) - Test runner
- Testing Library (for React)
- TypeScript (5.8.2)
- Tailwind CSS (via plugins)
- Others: MSW, ESLint, Prettier configs

---

## Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Build config (React plugin, test setup) |
| `tsconfig.json` | TypeScript compiler options |
| `firebase.json` | Firebase CLI config |
| `.firebaserc` | Firebase project ID |
| `vercel.json` | Vercel deployment config |
| `.env.example` | Environment variables template |
| `package.json` | Dependencies & scripts |

---

## Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start local dev server (port 3005) |
| `build` | `vite build` | Production build to `dist/` |
| `preview` | `vite preview` | Preview production build locally |
| `test` | `vitest` | Run tests in watch mode |
| `test:ui` | `vitest --ui` | Web UI for tests |
| `test:run` | `vitest run` | Run tests once |
| `test:coverage` | `vitest run --coverage` | Coverage report |
| `import-firebase` | Node script | Import data to Firebase |
| `seed-attendance` | Node script | Generate seed attendance data |

---

## Security Notes

### Current Vulnerabilities
1. Firebase config hardcoded in `lib/firebase.ts`
2. Gemini API key in localStorage (user-provided)
3. No authentication (local email-based only)
4. Database rules allow read/write to all (dev mode)

### Recommendations
1. Migrate to environment variables
2. Implement JWT-based auth
3. Lock down Firebase rules per role
4. Add request signing for API calls
5. Implement rate limiting on services

---

## Performance Optimizations

1. **React Optimization:**
   - Memoized context to prevent unnecessary re-renders
   - Debounced auto-save in timesheet (2 sec)
   - Lazy loading for modals

2. **Build Optimization:**
   - Vite tree-shaking (unused code removal)
   - Code splitting per route
   - Asset minification
   - CSS purging with Tailwind

3. **Runtime Optimization:**
   - Firebase indexes on commonly queried fields
   - Local caching with localStorage
   - Periodic sync (not real-time polling)

---

## Testing Coverage

**Target:** 60% coverage (current via Vitest config)
**Test Files:** `**/*.test.{ts,tsx}`
**Setup:** MSW for API mocking, jsdom for DOM

---

**Document Version:** 1.0
**Generated:** 2025-12-28
**Last Updated:** 2025-12-28
