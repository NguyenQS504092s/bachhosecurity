# Timesheet Pro VN - Documentation Index

**Project:** Vietnamese Timesheet Management System for Bạch Hổ Security
**Created:** 2025-12-28
**Version:** 1.0

---

## Quick Start

Welcome to the Timesheet Pro VN documentation! This directory contains comprehensive technical documentation for developers, architects, and stakeholders.

### First Time Here?

1. **For Project Overview:** Start with [`project-overview-pdr.md`](#project-overview--pdr)
2. **For Code Exploration:** Read [`codebase-summary.md`](#codebase-summary)
3. **For Development:** Reference [`code-standards.md`](#code-standards)
4. **For Architecture:** Study [`system-architecture.md`](#system-architecture)

---

## Documentation Files

### Project Overview & PDR
**File:** `project-overview-pdr.md` (441 lines)

Comprehensive product requirements document covering:
- Executive summary & key features
- Target users & core objectives
- 8 major feature specifications with acceptance criteria
- Technical stack breakdown
- Firebase configuration details
- Performance targets & metrics
- Security & compliance requirements
- Known limitations & technical debt
- 4-phase product roadmap
- Success metrics & KPIs

**Use this for:**
- Understanding what the app does
- Feature specifications & requirements
- Performance targets
- Security considerations
- Deployment details
- Business-level discussions

**Quick links:**
- [Product Definition](project-overview-pdr.md#product-definition)
- [Feature Specifications](project-overview-pdr.md#feature-specifications)
- [Technical Stack](project-overview-pdr.md#technical-stack)
- [Firebase Configuration](project-overview-pdr.md#firebase-configuration)
- [Roadmap](project-overview-pdr.md#roadmap)

---

### Codebase Summary
**File:** `codebase-summary.md` (518 lines)

Complete reference guide to the codebase structure:
- Directory organization & file purposes
- Feature modules breakdown (Auth, HR, Targets, Timesheet)
- Component documentation (35+ files)
- Service layer reference (12 files)
- Custom hooks documentation (8 files)
- Type definitions reference
- Utility functions overview
- Naming conventions (kebab-case, camelCase, PascalCase)
- Data flow patterns (CRUD, Excel, OCR, Grid edit)
- Dependencies summary (7 direct, 13 dev)
- Configuration files reference
- NPM scripts documentation

**Use this for:**
- Exploring the codebase structure
- Finding where things are located
- Understanding naming conventions
- Learning data flow patterns
- Checking dependencies
- Understanding file purposes

**Quick links:**
- [Directory Structure](codebase-summary.md#directory-structure-overview)
- [Core Directories](codebase-summary.md#core-directories)
- [Feature Modules](codebase-summary.md#features---feature-modules-12-files)
- [Data Flow Patterns](codebase-summary.md#data-flow-patterns)
- [Naming Conventions](codebase-summary.md#naming-conventions)

---

### Code Standards
**File:** `code-standards.md` (929 lines)

Comprehensive coding conventions & best practices:
- File & directory naming standards
- TypeScript conventions (types, interfaces, generics)
- React component patterns (functional only)
- Hook rules & patterns
- State management patterns (Context API, hooks)
- Service layer standards (Firebase patterns, error handling)
- Async/await conventions
- Tailwind CSS styling patterns
- Error handling approaches
- Data validation patterns
- Comment & documentation guidelines
- Git commit message format (Conventional Commits)
- Testing standards & patterns
- Performance guidelines (memoization)
- Accessibility (A11y) standards
- Build & deployment practices
- 15-point code review checklist
- 10 anti-patterns to avoid
- Resource links

**Use this for:**
- Writing code that fits the project
- Understanding naming conventions
- Learning React patterns used
- Styling with Tailwind CSS
- Error handling approaches
- Preparing code for review
- Testing your changes
- Understanding project conventions

**Quick links:**
- [File & Directory Structure](code-standards.md#file--directory-structure)
- [TypeScript Conventions](code-standards.md#typescript-conventions)
- [React Component Standards](code-standards.md#react-component-standards)
- [State Management Patterns](code-standards.md#state-management-patterns)
- [Code Review Checklist](code-standards.md#code-review-checklist)
- [Anti-Patterns](code-standards.md#anti-patterns-to-avoid)

---

### System Architecture
**File:** `system-architecture.md` (964 lines)

Deep technical architecture documentation:
- Architecture overview with ASCII diagram
- Technology stack table
- Feature-based architecture explanation
- Layered service architecture
- Context + hooks state management
- Component hierarchy tree
- 4 major data flow patterns (CRUD, Sheets sync, OCR, Grid edit)
- 3 API integration points (Firebase, Google Sheets, Gemini)
- Complete database schema with TypeScript types
- Performance optimizations (frontend & backend)
- Security architecture (current + planned improvements)
- Deployment pipeline & CI/CD
- Scalability considerations & scale-out strategy
- Error handling & monitoring
- Disaster recovery & RTO/RPO
- Technology decision records (why Context vs Redux, etc.)
- System constraints & assumptions

**Use this for:**
- Understanding system design
- Learning data flow patterns
- Understanding API integrations
- Database schema reference
- Deployment pipeline details
- Security architecture
- Performance optimization strategies
- Scaling the system
- Technical decisions & trade-offs

**Quick links:**
- [Architecture Overview](system-architecture.md#architecture-overview)
- [Data Flow Patterns](system-architecture.md#data-flow-patterns)
- [API Integration Points](system-architecture.md#api-integration-points)
- [Database Schema](system-architecture.md#database-schema)
- [Performance Optimizations](system-architecture.md#performance-optimizations)
- [Security Architecture](system-architecture.md#security-architecture)
- [Deployment Architecture](system-architecture.md#deployment-architecture)

---

## Documentation by Role

### For New Developers
1. **Start here:** [`project-overview-pdr.md`](project-overview-pdr.md) - Understand the app
2. **Then read:** [`codebase-summary.md`](codebase-summary.md) - Learn the structure
3. **Code guide:** [`code-standards.md`](code-standards.md) - Learn conventions
4. **When stuck:** [`system-architecture.md`](system-architecture.md) - Deep dive

### For Architects
1. **System design:** [`system-architecture.md`](system-architecture.md)
2. **Requirements:** [`project-overview-pdr.md`](project-overview-pdr.md#feature-specifications)
3. **Technology decisions:** [`system-architecture.md`](system-architecture.md#technology-decision-records)
4. **Scaling:** [`system-architecture.md`](system-architecture.md#scalability-considerations)

### For QA / Testers
1. **Feature specs:** [`project-overview-pdr.md`](project-overview-pdr.md#feature-specifications)
2. **Acceptance criteria:** [`project-overview-pdr.md`](project-overview-pdr.md) - Each feature section
3. **Test patterns:** [`code-standards.md`](code-standards.md#testing-standards)
4. **Error handling:** [`system-architecture.md`](system-architecture.md#error-handling-strategy)

### For DevOps / DevTools
1. **Deployment:** [`system-architecture.md`](system-architecture.md#deployment-architecture)
2. **Configuration:** [`project-overview-pdr.md`](project-overview-pdr.md#firebase-configuration)
3. **Environment:** [`code-standards.md`](code-standards.md#build--deployment)
4. **Monitoring:** [`system-architecture.md`](system-architecture.md#monitoring--observability)

### For Product Managers
1. **Overview:** [`project-overview-pdr.md`](project-overview-pdr.md)
2. **Features:** [`project-overview-pdr.md`](project-overview-pdr.md#feature-specifications)
3. **Roadmap:** [`project-overview-pdr.md`](project-overview-pdr.md#roadmap)
4. **Success metrics:** [`project-overview-pdr.md`](project-overview-pdr.md#success-metrics)

---

## Quick Reference

### Technology Stack
- **Frontend:** React 19, TypeScript 5.8, Vite 6.2
- **Styling:** Tailwind CSS
- **State:** React Context API + Hooks
- **Database:** Firebase Realtime DB
- **APIs:** Google Sheets, Gemini AI (OCR)
- **Excel:** XLSX library
- **Testing:** Vitest, Testing Library
- **Deployment:** Vercel

### Key Features
1. Employee management (CRUD)
2. Monthly attendance tracking (grid)
3. Shift & roster management
4. Excel import/export
5. Image OCR (AI-powered)
6. Google Sheets sync (2-way)
7. JSON backup/restore
8. Role-based access (admin/staff)

### Project URLs
- **Production:** https://timesheet-pro-vn.vercel.app
- **Firebase Project:** `bachho-timesheet-2025`
- **Repository:** (GitHub - as configured)

### Performance Metrics
- Bundle size: 81.34 KB (gzip) ✓
- FCP: <2 seconds ✓
- TTI: <3 seconds ✓
- Grid render (50+ employees): <500ms ✓
- Sync latency: <5 seconds ✓

---

## Common Tasks

### I want to...

#### Understand what the app does
→ Read [`project-overview-pdr.md`](project-overview-pdr.md)

#### Find a specific component or service
→ Use [`codebase-summary.md`](codebase-summary.md) directory structure

#### Write new code following conventions
→ Reference [`code-standards.md`](code-standards.md)

#### Understand data flow
→ See [`system-architecture.md#data-flow-patterns`](system-architecture.md#data-flow-patterns)

#### Add a new feature
→ Follow patterns in [`code-standards.md`](code-standards.md) and reference [`codebase-summary.md`](codebase-summary.md)

#### Understand API integration
→ Read [`system-architecture.md#api-integration-points`](system-architecture.md#api-integration-points)

#### Optimize performance
→ Check [`system-architecture.md#performance-optimizations`](system-architecture.md#performance-optimizations)

#### Improve security
→ Review [`system-architecture.md#security-architecture`](system-architecture.md#security-architecture)

#### Prepare code for review
→ Use [`code-standards.md#code-review-checklist`](code-standards.md#code-review-checklist)

#### Understand testing
→ See [`code-standards.md#testing-standards`](code-standards.md#testing-standards)

---

## Key Concepts

### Feature-Based Architecture
Code organized by features (auth, hr, targets, timesheet), not by layers. Each feature is self-contained with its context, components, and hooks.

### Service Layer
Business logic abstracted away from UI components. Services handle Firebase operations, Excel processing, Google Sheets sync, and Gemini AI.

### React Context API
Global state managed via React Context (not Redux). Separate contexts for each feature: Auth, Employees, Targets, Timesheet.

### Data Sync
Two-way sync with Google Sheets (15-min intervals or manual). Conflict resolution uses timestamp-based approach (latest wins).

### Error Handling
Try-catch at service layer. User-friendly error messages displayed in alerts/banners. Network errors trigger auto-retry.

### Code Organization
- Files: kebab-case (e.g., `employee-table.tsx`)
- Functions: camelCase (e.g., `handleSaveEmployee`)
- Components: PascalCase (e.g., `EmployeeTable`)
- Types: PascalCase (e.g., `Employee`)

---

## Maintenance & Updates

**Documentation Version:** 1.0
**Last Updated:** 2025-12-28
**Next Review:** 2025-03-28 (Quarterly)

### How to Update Docs

When code changes, update corresponding documentation:

1. **New Feature?** → Update [`project-overview-pdr.md`](project-overview-pdr.md#feature-specifications)
2. **New File/Directory?** → Update [`codebase-summary.md`](codebase-summary.md#directory-structure-overview)
3. **New Pattern?** → Update [`code-standards.md`](code-standards.md)
4. **Architecture Change?** → Update [`system-architecture.md`](system-architecture.md)

**Important:** Keep docs in sync with code. Outdated docs hurt productivity.

---

## Resources

### Official Docs
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Firebase Realtime DB](https://firebase.google.com/docs/database)
- [Vite Guide](https://vitejs.dev/guide)

### Standards & Best Practices
- [Conventional Commits](https://www.conventionalcommits.org)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref)
- [RESTful API Design](https://restfulapi.net)

### Project-Specific
- See footer of each documentation file for additional references

---

## Contact & Support

For questions about:
- **Code standards:** See [`code-standards.md`](code-standards.md)
- **Architecture:** See [`system-architecture.md`](system-architecture.md)
- **Features:** See [`project-overview-pdr.md`](project-overview-pdr.md)
- **Codebase:** See [`codebase-summary.md`](codebase-summary.md)

For technical issues, refer to the relevant documentation section or consult the development team.

---

## Document Structure

```
docs/
├── README.md                      ← You are here
├── project-overview-pdr.md        ← Product & Requirements
├── codebase-summary.md            ← Code Structure
├── code-standards.md              ← Conventions & Patterns
└── system-architecture.md         ← Technical Design
```

**All files in Markdown format. No generated files should be edited manually.**

---

**Happy documenting! 📚**

---

*Last updated: 2025-12-28*
*Documentation version: 1.0*
