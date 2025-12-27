# System Architecture

**Project:** Timesheet Pro VN
**Version:** 1.0
**Created:** 2025-12-28

---

## Architecture Overview

Timesheet Pro VN is a **distributed, three-tier web application** with a feature-based frontend architecture and Firebase backend. The system emphasizes real-time data synchronization, role-based access control, and AI-powered data import capabilities.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                               │
│                    React 19 + TypeScript                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │    Auth      │  │     HR       │  │  Timesheet   │           │
│  │   Feature    │  │   Feature    │  │   Feature    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Targets    │  │  UI Layer    │  │  Shared      │           │
│  │   Feature    │  │ Components   │  │ Components   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         ↓                ↓                    ↓                    │
│  ┌─────────────────────────────────────────────────┐            │
│  │      React Context API (State Management)       │            │
│  │  - AuthContext    - EmployeesContext           │            │
│  │  - TargetsContext - TimesheetContext           │            │
│  └─────────────────────────────────────────────────┘            │
│         ↓                                                          │
│  ┌─────────────────────────────────────────────────┐            │
│  │         Service Layer (Business Logic)          │            │
│  │  ┌──────────────┐  ┌──────────────┐           │            │
│  │  │  Firebase    │  │  Excel       │           │            │
│  │  │  Services    │  │  Services    │           │            │
│  │  └──────────────┘  └──────────────┘           │            │
│  │  ┌──────────────┐  ┌──────────────┐           │            │
│  │  │  Sheets      │  │  Gemini      │           │            │
│  │  │  Sync        │  │  AI (OCR)    │           │            │
│  │  └──────────────┘  └──────────────┘           │            │
│  │  ┌──────────────┐  ┌──────────────┐           │            │
│  │  │  Backup      │  │  Utilities   │           │            │
│  │  │  Service     │  │  & Helpers   │           │            │
│  │  └──────────────┘  └──────────────┘           │            │
│  └─────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
         ↓                ↓                      ↓
┌─────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ FIREBASE TIER   │ │  EXTERNAL APIS   │ │   STORAGE TIER   │
│                 │ │                  │ │                  │
│ Realtime DB     │ │ Gemini AI API    │ │ Google Sheets    │
│ (asia-southeast │ │ (Image OCR)      │ │ (Data Sync)      │
│ 1 region)       │ │                  │ │                  │
│                 │ │ Google Sheets    │ │ Local Storage    │
│ - /employees    │ │ API              │ │ (localStorage)   │
│ - /targets      │ │                  │ │                  │
│ - /timesheets   │ │                  │ │ Browser Cache    │
└─────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## Technology Stack

### Frontend Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **UI Framework** | React | 19.2.3 | Component rendering |
| **Language** | TypeScript | 5.8.2 | Type safety |
| **Build Tool** | Vite | 6.2.0 | Fast development & bundling |
| **Styling** | Tailwind CSS | Latest | Utility-based styling |
| **Icons** | lucide-react | 0.562.0 | Icon library |
| **State** | React Context API | - | Global state management |
| **Testing** | Vitest | 4.0.16 | Unit & component tests |

### Backend Stack

| Service | Technology | Purpose |
|---------|-----------|---------|
| **Database** | Firebase Realtime DB | Real-time NoSQL data storage |
| **API 1** | Google Sheets API | Two-way data synchronization |
| **API 2** | Gemini AI Vision API | OCR for image-based data import |
| **Deployment** | Vercel | Serverless hosting & CDN |

### Libraries

| Library | Version | Use Case |
|---------|---------|----------|
| `firebase` | 12.7.0 | Database client |
| `@google/genai` | 1.34.0 | AI image processing |
| `xlsx` | 0.18.5 | Excel import/export |

---

## Architectural Patterns

### 1. Feature-Based Architecture

The frontend is organized by features, not by layer. Each feature is self-contained with its own context, components, and hooks.

```
src/features/
├── auth/               # Authentication context & logic
│   ├── auth-context.tsx
│   └── index.ts
├── hr/                 # Employee management context
│   ├── employees-context.tsx
│   └── index.ts
├── targets/            # Shifts & rosters context + components
│   ├── targets-context.tsx
│   ├── components/     # Feature-specific components
│   │   ├── target-management.tsx
│   │   ├── roster-editor.tsx
│   │   └── ...
│   ├── hooks/          # Feature-specific hooks
│   │   └── use-shift-options.ts
│   └── index.ts
└── timesheet/          # Attendance tracking context
    ├── timesheet-context.tsx
    └── index.ts
```

**Benefits:**
- Self-contained features with clear boundaries
- Easy to test individual features
- Easier to scale: add/remove features independently
- Clear ownership and responsibility

### 2. Layered Service Architecture

Business logic is abstracted into a service layer, separating concerns from UI components.

```
Components (UI)
     ↓
React Context (State)
     ↓
Service Layer (Business Logic)
     ↓
External APIs (Firebase, Google, Gemini)
```

**Service Structure:**
```
src/services/
├── firebase/                    # Firebase operations (modular)
│   ├── employee-service.ts     # Employee CRUD
│   ├── target-service.ts       # Target CRUD
│   ├── timesheet-service.ts    # Attendance CRUD
│   ├── shift-service.ts        # Shift templates
│   └── index.ts                # Barrel export
├── realtime-database-service.ts # Deprecated wrapper
├── sheets-service.ts            # Google Sheets API wrapper
├── sync-service.ts              # Sheets sync orchestration
├── gemini-service.ts            # Gemini AI OCR wrapper
├── backup-service.ts            # JSON backup/restore
└── index.ts                     # Barrel export
```

**Advantages:**
- Dependency injection - services don't know about UI
- Easy to mock for testing
- Reusable across components
- Centralized error handling

### 3. Context + Hooks State Management

Uses React Context API + custom hooks for global state (not Redux).

```typescript
// Context Pattern
const EmployeesContext = createContext<EmployeesContextType | null>(null);

// Provider
export const EmployeesProvider: React.FC<{ children }> = ({ children }) => {
  // State & logic
  return <EmployeesContext.Provider value={{ /* state */ }}>...</EmployeesContext.Provider>;
};

// Consumer Hook
export const useEmployees = () => {
  const context = useContext(EmployeesContext);
  if (!context) throw new Error('Must be within EmployeesProvider');
  return context;
};
```

**Benefits:**
- Simpler than Redux for this scale
- Less boilerplate
- Easier to understand for new developers
- Sufficient for feature-based state

### 4. React Hooks for Side Effects

Handles async operations, data fetching, and external integrations.

```typescript
// Example: useEmployees Hook
export const useEmployees = () => {
  const context = useContext(EmployeesContext);

  // Auto-load on mount
  useEffect(() => {
    refreshEmployees();
  }, []);

  return {
    employees,
    addEmployee,
    updateEmployee,
    removeEmployee,
    refreshEmployees,
  };
};
```

---

## Data Flow Patterns

### 1. CRUD Operation Flow

```
User Action (Click/Submit)
    ↓
React Component Handler
    ↓
useContext Hook (e.g., useEmployees)
    ↓
Context Reducer/Setter
    ↓
Service Layer (e.g., createEmployee)
    ↓
Firebase API Call
    ↓
Firebase Realtime DB
    ↓
Success/Error Response
    ↓
Context State Update
    ↓
Component Re-render (via Context update)
    ↓
UI Reflects Change
```

**Example: Adding Employee**
```typescript
// 1. Component click handler
const handleAddEmployee = async (emp: Employee) => {
  try {
    const newEmp = await addEmployee(emp);  // 2. Context function
    alert('Added successfully');
  } catch (error) {
    setError(error.message);
  }
};

// 2. In EmployeesContext
const addEmployee = async (emp: Employee) => {
  const newId = generateId();
  const newEmp = { ...emp, id: newId };

  // 3. Call service
  await createEmployee(newEmp);

  // 4. Update context state
  setEmployees(prev => [...prev, newEmp]);

  return newEmp;
};

// 3. In employee-service.ts
export const createEmployee = async (emp: Employee): Promise<void> => {
  // 4. Firebase write
  await set(ref(db, `employees/${emp.id}`), emp);
};
```

### 2. Data Sync Flow (Sheets ↔ App)

```
App Startup / Manual Sync Trigger
    ↓
syncService.syncWithSheets()
    ↓
[UPLOAD] Get latest employees from Context
    ↓
sheetsService.updateEmployeeRows()
    ↓
Google Sheets API Write
    ↓
---
[DOWNLOAD] Query Google Sheet
    ↓
sheetsService.getEmployeeRows()
    ↓
Google Sheets API Read
    ↓
Parse & Transform Data
    ↓
employeeService.createOrUpdate()
    ↓
Firebase Write (only if newer)
    ↓
Context Update (employees)
    ↓
UI Re-render
```

**Conflict Resolution:** Timestamp-based (latest wins)

### 3. Image OCR Import Flow

```
User Action: Capture/Upload Image
    ↓
ImageCapture Component
    ↓
getUserMedia() (camera access)
    ↓
Convert canvas to Image Blob
    ↓
geminiService.extractEmployeeFromImage()
    ↓
Send to Gemini AI Vision API
    ↓
AI Parses Response (JSON)
    ↓
Extract Fields: name, code, department, shift
    ↓
Show Preview Modal
    ↓
User Confirms
    ↓
handleImageDataExtracted()
    ↓
For Each Employee:
  - Check if exists (by code)
  - If new: addEmployee()
  - If exists: updateEmployee()
    ↓
Auto-create Target if department doesn't exist
    ↓
saveTimesheet()
    ↓
Firebase Sync + UI Update
```

### 4. Timesheet Grid Edit Flow

```
User Clicks Cell
    ↓
TimesheetGrid detects click
    ↓
Show cell editor / dropdown
    ↓
User selects value (Present/Absent/etc)
    ↓
handleGridChange(newData)
    ↓
Update local grid state
    ↓
Debounce 2 seconds
    ↓
saveTimesheet()
    ↓
timesheetService.saveTimesheet()
    ↓
Firebase Write to /timesheets/[year]/[month]/[empId]/[day]
    ↓
Context State Update
    ↓
Grid Re-render with new colors
```

---

## Component Hierarchy

```
App
├── AppProviders (context wrappers)
│   ├── AuthProvider
│   ├── EmployeesProvider
│   ├── TargetsProvider
│   └── TimesheetProvider
└── AppContent
    └── AppLayout (header + sidebar)
        ├── AppHeader (nav buttons)
        ├── SideNav (menu)
        └── MainContent
            ├── [IF timesheet view]
            │   ├── ActionBar (sync, backup, export buttons)
            │   ├── ErrorAlert (conditional)
            │   ├── TimesheetGrid
            │   │   ├── EmployeeRows (memoized)
            │   │   └── DateColumns (memoized)
            │   └── ImageCapture (modal)
            │
            ├── [IF HR view]
            │   ├── HRToolbar (search, filter)
            │   ├── EmployeeTable
            │   │   └── EmployeeTableRows
            │   └── EmployeeDetailModal (edit)
            │
            └── [IF targets view]
                ├── TargetToolbar (filter)
                ├── TargetList
                │   └── TargetListItems
                │       ├── TargetForm (edit)
                │       └── RosterEditor
                │           └── ShiftManager
```

---

## State Management Diagram

```
AuthContext
├── currentUser: Employee | null
├── isLoggedIn: boolean
├── login(user)
└── logout()

EmployeesContext
├── employees: Employee[]
├── addEmployee(emp) → Promise<Employee>
├── updateEmployee(id, updates) → Promise<void>
├── removeEmployee(id) → Promise<void>
└── refreshEmployees() → Promise<void>

TargetsContext
├── targets: Target[]
├── addTarget(target) → Promise<Target>
├── updateTarget(id, updates) → Promise<void>
├── removeTarget(id) → Promise<void>
└── refreshTargets() → Promise<void>

TimesheetContext
├── gridData: Employee[] (with attendance)
├── year: number
├── month: number
├── setYear(year)
├── setMonth(month)
├── setGridData(data)
├── saveTimesheet() → Promise<void>
└── refreshTimesheet() → Promise<void>
```

---

## API Integration Points

### 1. Firebase Realtime Database

**Endpoints:**
```
https://bachho-timesheet-2025-default-rtdb.asia-southeast1.firebasedatabase.app

/employees/[id]
/targets/[id]
/timesheets/[year]/[month]/[empId]/[day]
```

**Operations:**
- `ref(db, path)` - Create reference
- `get(ref)` - Read data
- `set(ref, data)` - Write/overwrite
- `update(ref, data)` - Partial update
- `remove(ref)` - Delete

**Error Handling:**
```typescript
try {
  const snapshot = await get(ref(db, 'employees'));
  const data = snapshot.val();
} catch (error) {
  console.error('Firebase error:', error);
  // Graceful degradation - app works offline
}
```

### 2. Google Sheets API

**Operations:**
- List rows: `sheets.spreadsheets.values.get()`
- Write rows: `sheets.spreadsheets.values.append()`
- Clear range: `sheets.spreadsheets.values.clear()`

**Sync Process:**
1. Query sheet: Get all employees
2. Compare with app data: Check timestamps
3. Merge conflicts: Keep newer version
4. Write back: Update sheet with app data
5. Update app: Load new sheet data into context

**Rate Limiting:** 300 requests/minute/user

### 3. Gemini AI Vision API

**Endpoint:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
```

**Input:** Base64-encoded image
**Output:** JSON with extracted fields
```json
{
  "name": "John Doe",
  "code": "EMP001",
  "department": "Security Team",
  "shift": "08:00-17:00"
}
```

**Error Cases:**
- Invalid image format → Show error
- No text detected → Prompt user
- Ambiguous data → Show preview for confirmation
- API rate limit → Queue and retry

---

## Database Schema

### Firebase Structure

```
{
  "employees": {
    "emp_001": {
      "id": "emp_001",
      "name": "Nguyễn Văn A",
      "code": "A001",
      "department": "Security",
      "shift": "08:00-17:00",
      "role": "staff",
      "createdAt": 1735345200000
    },
    "emp_002": { ... }
  },
  "targets": {
    "target_001": {
      "id": "target_001",
      "name": "Gate A - Morning Shift",
      "roster": [
        { "employeeId": "emp_001", "shift": "08:00-17:00" },
        { "employeeId": "emp_003", "shift": "08:00-17:00" }
      ],
      "createdAt": 1735345200000
    }
  },
  "timesheets": {
    "2025": {
      "11": {  # Month (0-11, so 11 = December)
        "emp_001": {
          "1": "Present",
          "2": "Absent",
          "3": "Half-day",
          "4": "Leave",
          ...
          "31": "Present"
        },
        "emp_002": { ... }
      },
      "12": { ... }
    }
  }
}
```

### TypeScript Types

```typescript
interface Employee {
  id: string;
  name: string;
  code: string;
  department: string;
  shift: string;
  role: 'admin' | 'staff';
  attendance: Record<string, CellValue>;
  createdAt?: number;
}

interface Target {
  id: string;
  name: string;
  roster: RosterItem[];
  createdAt?: number;
}

interface RosterItem {
  employeeId: string;
  shift: string;
}

type CellValue = 'Present' | 'Absent' | 'Half-day' | 'Leave';

interface DayInfo {
  date: Date;
  dayOfWeek: string;
  isWeekend: boolean;
}

interface AppState {
  employees: Employee[];
  targets: Target[];
  timesheets: Record<string, Record<string, Record<string, CellValue>>>;
  currentUser: Employee | null;
}
```

---

## Performance Optimizations

### Frontend Optimizations

| Technique | Implementation | Benefit |
|-----------|----------------|---------|
| **Code Splitting** | Vite dynamic imports | Faster initial load |
| **Memoization** | React.memo, useMemo | Prevent re-renders |
| **Lazy Loading** | React.lazy + Suspense | Load components on demand |
| **Debouncing** | 2-second auto-save | Reduce Firebase writes |
| **Context Splitting** | Separate contexts per feature | Isolate state updates |
| **Tailwind Purging** | Remove unused CSS | Smaller bundle |

### Backend Optimizations

| Technique | Implementation | Benefit |
|-----------|----------------|---------|
| **Indexes** | Firebase indexes on common queries | Faster reads |
| **Local Caching** | localStorage for user preferences | Reduce API calls |
| **Batch Operations** | Combine multiple writes | Reduce round-trips |
| **Sync Intervals** | 15-min periodic sync | Balance freshness vs load |
| **CDN** | Vercel edge network | Fast static asset delivery |

### Metrics

- **Bundle Size:** 81.34 KB (gzip) ✓
- **Time to Interactive:** <3 seconds ✓
- **Grid Render (50+ employees):** <500ms ✓
- **Sync Latency:** <5 seconds ✓

---

## Security Architecture

### Current State

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                      │
├─────────────────────────────────────────────────────────┤
│ 1. TRANSPORT: HTTPS (Vercel + Firebase default)        │
│                                                         │
│ 2. DATABASE: Firebase Realtime DB                       │
│    - Read: OPEN (all authenticated users)              │
│    - Write: OPEN (all authenticated users)             │
│    - Rules: Development mode (for now)                 │
│                                                         │
│ 3. API KEYS: Hardcoded in lib/firebase.ts              │
│    - Risks: Public keys visible in bundle              │
│    - Mitigation: Firebase quota limits                 │
│                                                         │
│ 4. AUTH: Local email-based (no JWT)                    │
│    - Session: localStorage                             │
│    - Expiry: Never (session-based only)                │
│                                                         │
│ 5. DATA: No encryption at rest                         │
│    - Future: Firebase backup encryption                │
└─────────────────────────────────────────────────────────┘
```

### Planned Security Improvements

1. **Firebase Rules:** Implement RBAC
   ```
   rules {
     employees: {
       .read: auth.uid != null && (auth.token.role == 'admin' || $userId == auth.uid)
       .write: auth.token.role == 'admin'
     }
   }
   ```

2. **Environment Variables:** Migrate API keys
   ```env
   VITE_FIREBASE_API_KEY=xxx
   VITE_GEMINI_API_KEY=xxx
   ```

3. **JWT Authentication:** Replace email-based auth
   - Issue JWT on login
   - Verify JWT in service layer
   - Add token expiry (24-48 hours)

4. **Rate Limiting:** Prevent abuse
   - API endpoint rate limits
   - Firebase security rules with rate limiting

5. **Data Encryption:** Protect sensitive data
   - Encryption at rest (Firebase Cloud Storage)
   - Encryption in transit (already HTTPS)
   - Field-level encryption for PII

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DEPLOYMENT STACK                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  GitHub Repository                                      │
│       ↓ (push to main)                                  │
│  GitHub Actions (CI/CD)                                 │
│       ├─ Run tests                                      │
│       ├─ Build (npm run build)                          │
│       └─ Deploy trigger                                 │
│       ↓                                                  │
│  Vercel (Edge Network)                                 │
│       ├─ Static Assets (JS, CSS, HTML)                 │
│       ├─ SPA Routing (all routes → /index.html)        │
│       └─ Environment Variables                         │
│       ↓                                                  │
│  CDN (Vercel Edge)                                      │
│       └─ Global distribution (fast delivery)           │
│                                                         │
│  External Services:                                     │
│  ├─ Firebase Realtime DB (asia-southeast1)             │
│  ├─ Google Sheets API (OAuth)                          │
│  └─ Gemini AI API (vision)                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Deployment Pipeline

```
1. Developer commits to GitHub (main branch)
2. GitHub Actions triggered
   - Run: npm run build
   - Test: npm run test
   - Coverage check
3. If all pass:
   - Build artifact created (dist/)
   - Deploy to Vercel
4. Vercel deploys:
   - Route traffic to edge nodes
   - Serve from nearest region
5. Live at: https://timesheet-pro-vn.vercel.app
```

---

## Scalability Considerations

### Current Limits

| Metric | Current | Limit | Status |
|--------|---------|-------|--------|
| **Employees** | <500 | 10K+ (Firebase) | ✓ Sufficient |
| **Concurrent Users** | <50 | 1000+ (Vercel) | ✓ Sufficient |
| **Daily Requests** | ~10K | 1M+ (Firebase) | ✓ Sufficient |
| **Storage** | ~5 MB | 1 GB free tier | ✓ Sufficient |

### Scale-Out Strategy

**If employee count → 5,000+:**
1. Add database indexes
2. Implement pagination in UI (50/page)
3. Add data archiving for past months
4. Consider Cloud Firestore (better for scale)

**If concurrent users → 200+:**
1. Implement request caching
2. Add CDN caching headers
3. Scale Firebase to dedicated plan
4. Implement WebSocket subscriptions (real-time)

**If data volume → 100 MB+:**
1. Migrate to Cloud Firestore (scales better)
2. Implement data archiving
3. Use Cloud Storage for backups
4. Add ElasticSearch for search

---

## Error Handling Strategy

### Error Boundaries

```
Try-Catch at Service Layer
    ↓
  Error Logged (console.error)
    ↓
  Error Message Created (user-friendly)
    ↓
  Context Setter (error state)
    ↓
  Component Displays (alert/banner)
    ↓
  User Can Retry or Proceed Offline
```

### Error Types

| Type | Handling | User Experience |
|------|----------|-----------------|
| **Network Error** | Offline mode, retry button | "Connection lost. Trying again..." |
| **Firebase Error** | Retry with backoff | "Server error. Retrying..." |
| **Validation Error** | Show field errors | Red border + error message |
| **Permission Error** | Log & prevent action | "You don't have permission" |
| **Unexpected Error** | Log full error | "Something went wrong" |

---

## Monitoring & Observability

### What We Monitor

1. **Application Errors**
   - Console errors logged to Sentry (future)
   - User-reported issues

2. **Performance**
   - Vercel analytics
   - Web Vitals (LCP, FID, CLS)
   - Firebase latency

3. **Usage**
   - Daily active users
   - Feature usage (which views used most)
   - Device/browser breakdown

### Logging Strategy

```typescript
// Info: Important operations
console.log('Firebase initialized');

// Warn: Potential issues
console.warn('Large dataset, performance may degrade');

// Error: Failures that need action
console.error('Failed to sync with Sheets:', error);

// Debug: Development only
if (process.env.DEBUG) console.log('Grid rendered');
```

---

## Disaster Recovery

### Data Backup Strategy

1. **Automatic Firebase Backups**
   - Firebase auto-backup (daily)
   - Retention: 35 days

2. **User-Initiated Backups**
   - Export to JSON via UI
   - User downloads & stores locally

3. **Recovery Process**
   - Restore from Firebase backup (if Firebase down)
   - Restore from user's local JSON backup
   - Manual re-entry as last resort

### RTO & RPO

| Scenario | RTO | RPO | Action |
|----------|-----|-----|--------|
| **Firebase down** | 1 hour | 1 day | Use local data |
| **App bugs** | 30 min | Rollback | Redeploy previous version |
| **Data corruption** | 1 day | 1 day | Restore from backup |
| **Total data loss** | 2-3 days | Varies | Recover from backup |

---

## Technology Decision Records

### Why React Context + Hooks (not Redux)?

**Chosen:** React Context API
**Why:**
- Simpler learning curve
- Less boilerplate for feature-based state
- Sufficient for current app scale
- Easier to test and debug

**Alternative:** Redux
**Rejected because:**
- Overkill for 4 contexts
- More boilerplate
- Harder to understand for junior devs

### Why Firebase Realtime DB (not Cloud Firestore)?

**Chosen:** Firebase Realtime Database
**Why:**
- Simpler JSON structure
- Perfect for hierarchical data (timesheet by year/month)
- Lower cost for this data volume
- Sufficient query capabilities

**Alternative:** Cloud Firestore
**For future:** Consider migration if:
- Employee count > 10,000
- Complex queries needed
- Better offline support required

### Why Tailwind CSS (not styled-components)?

**Chosen:** Tailwind CSS
**Why:**
- Faster development
- Smaller bundle size
- No runtime overhead
- Component reusability

**Alternative:** Styled-components
**Rejected because:**
- Runtime CSS-in-JS overhead
- Larger bundle
- Slower development for this project

---

## System Constraints & Assumptions

### Constraints

1. **Browser Compatibility:** Modern browsers only (Chrome 90+, Firefox 88+, Safari 14+)
2. **Network:** Assumes internet connectivity (offline mode limited)
3. **Storage:** localStorage limited to 5-10 MB per domain
4. **Concurrency:** Single user per login (no multi-device sync)
5. **Real-time:** Not true real-time (15-min sync intervals)

### Assumptions

1. **Data Volume:** <500 employees, <10K timesheet records
2. **Concurrent Users:** <50 simultaneous
3. **Data Quality:** User-provided data is accurate
4. **Network Speed:** Reasonable broadband (>2 Mbps)
5. **Browser Support:** No IE11 support

---

**Document Version:** 1.0
**Last Updated:** 2025-12-28
**Architecture Review:** Quarterly
