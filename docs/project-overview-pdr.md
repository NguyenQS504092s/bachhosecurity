# Timesheet Pro VN - Project Overview & Product Development Requirements

**Client:** Bạch Hổ Security (Bạch Hổ)
**Project:** Vietnamese Timesheet Management System
**Version:** 0.0.0
**Status:** Active Development
**Created:** 2025-12-28

---

## Executive Summary

Timesheet Pro VN is a modern web-based timesheet and HR management system designed for "Bạch Hổ Security" company. The application streamlines employee attendance tracking, payroll management, and organizational structure maintenance through an intuitive interface backed by Firebase real-time synchronization.

### Key Features
- Role-based authentication (Admin/Staff)
- Employee CRUD with role management
- Monthly attendance grid tracking
- Work location/shift management with roster assignments
- AI-powered OCR for bulk data import from images
- Excel import/export for timesheet and payroll
- Google Sheets synchronization
- JSON backup/restore functionality
- Real-time Firebase Realtime Database sync

---

## Product Definition

### Target Users
1. **HR Administrators** - Manage employee data, define shifts, create rosters
2. **Shift Managers** - Allocate employees to shifts and work locations
3. **Staff/Employees** - Submit/view attendance records
4. **Executives** - Generate payroll reports and analytics

### Core Objectives
1. Eliminate manual timesheet collection and paper-based tracking
2. Enable real-time attendance synchronization across devices
3. Automate payroll calculations and reporting
4. Integrate with Google Sheets for existing workflows
5. Provide OCR-based data import for faster data entry
6. Maintain data integrity with automatic backups

---

## Feature Specifications

### 1. Authentication System

**Requirements:**
- Email-based login (temporary - future: OAuth)
- Role-based access control (RBAC): Admin, Staff
- Session persistence via localStorage
- Logout with session termination

**Acceptance Criteria:**
- Users can login with email credentials
- Role determines available features and menu options
- Session persists across page reloads
- Logout clears all user data and state

**Technical Constraints:**
- No external OAuth provider currently integrated
- Authentication state managed via React Context API
- Security: Future implementation should use JWT tokens

---

### 2. Employee Management (HR Module)

**Requirements:**
- Add/edit/delete employee records
- Employee fields: ID, name, code, department, shift, role
- Search and filter by name/code/department
- Bulk import via Excel or image OCR
- Department auto-creation from employee data
- Employee list export to Excel

**Acceptance Criteria:**
- CRUD operations work without errors
- Excel import handles duplicate detection
- Image OCR extracts employee data with 85%+ accuracy
- Departments auto-created when referenced
- Changes sync to Firebase in <5 seconds

**Technical Constraints:**
- Firebase Realtime DB path: `/employees/[employeeId]`
- Gemini AI used for OCR (requires API key)
- Excel import uses XLSX library
- No SQL dependencies - JSON structure only

---

### 3. Timesheet Grid (Attendance Tracking)

**Requirements:**
- Month/year selector for viewing different periods
- Daily attendance grid: rows = employees, columns = dates
- Cell values: Present/Absent/Half-day/Leave
- Edit attendance directly in grid
- Auto-save with debounce (2-second delay)
- Color coding: Present (green), Absent (red), Half-day (yellow)
- Monthly summary statistics (total present/absent days)

**Acceptance Criteria:**
- Grid renders 30+ employees without performance degradation
- Cell edits trigger auto-save within 2 seconds
- Month/year changes reload appropriate data
- Color coding displays correctly for all cell states
- Summary statistics update in real-time

**Technical Constraints:**
- Grid data stored in FirebaseContext
- Cell values use standardized enum: Present/Absent/Half-day/Leave
- UI uses Tailwind CSS with custom color utilities
- Performance: Memoized components prevent unnecessary re-renders

---

### 4. Target Management (Shifts & Rosters)

**Requirements:**
- Create/edit/delete work locations (called "Targets")
- Each target has:
  - Name (location/shift name)
  - Roster: List of assigned employees with shift times
  - Shift time slots (e.g., 08:00-17:00, 17:00-22:00)
- Bulk roster editing with drag-and-drop (future enhancement)
- Shift option templates for quick assignment

**Acceptance Criteria:**
- Users can CRUD targets without errors
- Roster employees display shift assignments
- Shift templates reduce data entry time by 50%
- Changes sync to Firebase in <3 seconds
- Roster editing prevents duplicate assignments

**Technical Constraints:**
- Firebase Realtime DB path: `/targets/[targetId]`
- Shift times formatted as HH:MM-HH:MM
- Roster stored as array of objects: {employeeId, shift}
- No cascading deletes - orphaned rosters handled gracefully

---

### 5. Excel Import/Export

**Requirements:**
- Export timesheet to Excel with formatting (colors, borders)
- Export payroll data with calculated fields (days worked, salary)
- Import timesheet from Excel with validation
- Download Excel templates for bulk entry
- Support .xlsx format only
- Preserve formatting across exports/imports

**Acceptance Criteria:**
- Exported Excel files open without errors
- Import validates required columns and data types
- Template downloads provide clear column headers
- Payroll exports show correct calculations
- Color coding in exports matches grid display

**Technical Constraints:**
- XLSX library for all Excel operations (v0.18.5+)
- No VBA macros or custom Excel features
- Template structure hardcoded in excel-export.ts
- Max file size: 10MB for import

---

### 6. Image Capture & OCR

**Requirements:**
- Camera access for photo capture
- Send images to Gemini AI for OCR processing
- Extract employee data from ID cards/documents
- Auto-detect multiple employees from single image
- Parse fields: Name, Code, Department, Shift
- Display extracted data before save confirmation

**Acceptance Criteria:**
- Camera access request handled gracefully
- OCR accuracy: 80%+ for clear images
- Extracted data shown in preview before import
- Users can edit OCR results before saving
- Unsupported image formats handled with error message

**Technical Constraints:**
- Gemini API key required (vision model)
- Image upload size limit: 5MB
- Supported formats: JPEG, PNG, WebP
- Processing time: 2-5 seconds per image

---

### 7. Google Sheets Sync

**Requirements:**
- Two-way sync: App → Sheets and Sheets → App
- Designated Google Sheet for employee roster
- Auto-sync on app startup and periodic (15-min intervals)
- Manual sync button in UI
- Sync status indicator (online/syncing/error)
- Conflict resolution: Timestamp-based (latest wins)

**Acceptance Criteria:**
- Employees added in app appear in Sheets within 30 seconds
- Changes in Sheets update in app on next sync
- Sync errors display user-friendly messages
- Sync doesn't block UI operations
- Conflict resolution handles simultaneous edits

**Technical Constraints:**
- Google Sheets API requires OAuth authentication
- Hardcoded spreadsheet ID: Must be set in constants
- Sync service uses timestamp comparison for conflicts
- Network errors trigger automatic retry (3x exponential backoff)

---

### 8. Data Backup & Restore

**Requirements:**
- Export all app data to JSON backup file
- Download backup with timestamp in filename
- Restore data from previously saved backup
- Backup includes: employees, targets, timesheets
- One-click backup button in settings
- One-click restore button with confirmation dialog

**Acceptance Criteria:**
- Backup file contains valid JSON format
- Restore overwrites existing data (with confirmation)
- Backup/restore completes in <2 seconds
- File naming follows pattern: backup-YYYY-MM-DD-HH:mm.json
- Corrupted backup files show error message

**Technical Constraints:**
- Backup stored as single JSON file in browser
- User downloads via browser's download mechanism
- Restore requires manual file selection
- Max restore file size: 50MB

---

## Technical Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | 18+ |
| **Frontend Framework** | React | 19.2.3 |
| **Language** | TypeScript | ~5.8.2 |
| **Build Tool** | Vite | 6.2.0 |
| **Styling** | Tailwind CSS | Latest |
| **Icons** | lucide-react | 0.562.0 |
| **State Management** | React Context API | - |
| **Database** | Firebase Realtime DB | - |
| **APIs** | Google Sheets API, Gemini AI API | - |
| **Excel** | XLSX | 0.18.5 |
| **Testing** | Vitest | 4.0.16 |
| **Testing Library** | @testing-library/react | 16.3.1 |
| **Deployment** | Vercel | - |

---

## Firebase Configuration

**Project ID:** `bachho-timesheet-2025`
**Database Region:** `asia-southeast1`
**Database URL:** `https://bachho-timesheet-2025-default-rtdb.asia-southeast1.firebasedatabase.app`

### Database Schema

```
/
├── employees/
│   ├── [employeeId]/
│   │   ├── id: string
│   │   ├── name: string
│   │   ├── code: string
│   │   ├── department: string
│   │   ├── shift: string
│   │   ├── role: 'admin' | 'staff'
│   │   └── createdAt: timestamp
│   └── ...
├── targets/
│   ├── [targetId]/
│   │   ├── id: string
│   │   ├── name: string
│   │   ├── roster: [{employeeId, shift}]
│   │   └── createdAt: timestamp
│   └── ...
└── timesheets/
    ├── [year]/
    │   ├── [month]/
    │   │   └── [employeeId]/
    │   │       ├── [day]: 'Present' | 'Absent' | 'Half-day' | 'Leave'
    │   │       └── ...
    │   └── ...
    └── ...
```

---

## Deployment

**Production URL:** https://timesheet-pro-vn.vercel.app
**Deployment Platform:** Vercel
**Build Command:** `npm run build`
**Output Directory:** `dist/`
**Node Version:** 18+ (auto-managed by Vercel)

### Environment Variables
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GEMINI_API_KEY=
```

Currently, Firebase config is hardcoded with fallback values for seamless production deployment.

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| **Bundle Size** | <500 KB (gzip) | 81.34 KB ✓ |
| **First Contentful Paint (FCP)** | <2 seconds | Excellent |
| **Time to Interactive (TTI)** | <3 seconds | Excellent |
| **Grid Render (50+ employees)** | <500ms | Optimized |
| **Sync Latency** | <5 seconds | <3 seconds ✓ |
| **API Response** | <1 second | Excellent |

---

## Security & Compliance

### Current State
- Firebase Realtime DB: Open read/write (development mode)
- No encrypted data at rest
- Client-side API keys in code (hardcoded)
- No rate limiting

### Planned Improvements
1. Implement Firebase Security Rules (RBAC-based)
2. Migrate API keys to environment variables
3. Add rate limiting and throttling
4. Implement audit logging for sensitive operations
5. Enable data encryption at rest

---

## Known Limitations & Technical Debt

### Current Limitations
1. No user authentication (email-based local auth only)
2. Image OCR requires manual Gemini API key setup
3. Google Sheets sync requires manual spreadsheet linking
4. Single shift per employee (future: multiple shifts)
5. No attendance approval workflow
6. No advanced reporting/analytics

### Technical Debt
1. Legacy `realtime-database-service.ts` (deprecated, use `/firebase` directory)
2. Hardcoded Firebase config in `lib/firebase.ts`
3. Limited error handling in service layer
4. No request/response validation schemas
5. Test coverage: 60% (target: 80%+)

---

## Roadmap

### Phase 1: MVP (Current)
- Core timesheet grid functionality
- Basic employee CRUD
- Excel import/export
- Firebase sync

### Phase 2: Enhancement
- Image OCR improvements (higher accuracy)
- Advanced roster scheduling
- Attendance approval workflow
- Custom shift templates

### Phase 3: Analytics & Reporting
- Dashboard with KPIs
- Attendance trends
- Payroll analytics
- Export to payroll systems

### Phase 4: Mobile & PWA
- Progressive Web App (PWA) support
- Mobile-first responsive design
- Offline-first architecture
- Push notifications

---

## Success Metrics

1. **Adoption:** 100% of staff use within 3 months
2. **Accuracy:** 99%+ attendance data accuracy
3. **Performance:** 95%+ uptime SLA
4. **User Satisfaction:** NPS score >50
5. **Time Savings:** 10+ hours/month saved in manual entry
6. **Cost Reduction:** 30% reduction in admin overhead

---

## Support & Maintenance

**Deployment:** Automated via GitHub (CI/CD) to Vercel
**Monitoring:** Vercel analytics and error reporting
**Backup:** Daily Firebase snapshots (auto-managed)
**Support Team:** Backend developer + QA specialist

---

## Glossary

| Term | Definition |
|------|-----------|
| **Target** | A work location or shift assignment group |
| **Roster** | List of employees assigned to a target with shift times |
| **Shift** | Time slot (e.g., 08:00-17:00) for work |
| **Attendance** | Daily record of employee presence (Present/Absent/etc.) |
| **RBAC** | Role-Based Access Control - feature access based on user role |
| **OCR** | Optical Character Recognition - AI-powered text extraction from images |

---

**Document Version:** 1.0
**Last Updated:** 2025-12-28
**Next Review:** 2025-03-28
