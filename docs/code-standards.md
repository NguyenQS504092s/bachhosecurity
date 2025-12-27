# Code Standards & Best Practices

**Project:** Timesheet Pro VN
**Version:** 1.0
**Last Updated:** 2025-12-28

---

## Overview

This document establishes coding conventions, architectural patterns, and best practices for the Timesheet Pro VN codebase. All developers must follow these standards to maintain consistency, readability, and maintainability.

---

## File & Directory Structure

### Naming Conventions

**Directories (kebab-case):**
```
src/
  ├── core/                    # App shell
  ├── features/                # Feature modules
  │   ├── auth/
  │   ├── hr/
  │   ├── targets/
  │   └── timesheet/
  ├── components/              # Shared & feature components
  ├── services/                # Business logic
  │   └── firebase/            # Firebase service modules
  ├── hooks/                   # Custom hooks
  ├── types/                   # Type definitions
  ├── utils/                   # Utilities
  │   └── excel/               # Excel-related utils
  ├── constants/               # App constants
  ├── lib/                     # Library initialization
  └── test/                    # Test setup
```

**Files:**
- **React Components:** PascalCase with `.tsx` extension
  - Example: `EmployeeDetailModal.tsx`, `TimesheetGrid.tsx`
- **Utility Functions:** kebab-case with `.ts` extension
  - Example: `timesheet-helpers.ts`, `date-helpers.ts`
- **Type Files:** kebab-case with `.ts` extension
  - Example: `employee.ts`, `target.ts`
- **Test Files:** Append `.test.tsx` or `.test.ts`
  - Example: `login.test.tsx`, `timesheet-helpers.test.ts`
- **Config Files:** Root directory, lowercase with hyphens
  - Example: `vite.config.ts`, `firebase.json`
- **Barrel Exports:** Always named `index.ts`
  - Export all public APIs from directory

### Barrel Export Pattern

**Good:**
```typescript
// src/features/auth/index.ts
export { useAuth } from './auth-context';
export { AuthProvider } from './auth-context';
export type { AuthContextType } from './auth-context';
```

**Bad:**
```typescript
// src/features/auth/index.ts
// Empty or missing
```

---

## TypeScript Conventions

### Type Definitions

**Use explicit types (no implicit `any`):**
```typescript
// Good
const handleClick = (id: string): void => {
  // ...
};

// Bad
const handleClick = (id) => {
  // ...
};
```

**Use interfaces for object shapes, types for unions:**
```typescript
// Good - interfaces for objects
interface Employee {
  id: string;
  name: string;
  role: 'admin' | 'staff';
}

// Good - types for unions/primitives
type CellValue = 'Present' | 'Absent' | 'Half-day' | 'Leave';
type Status = 'idle' | 'loading' | 'error' | 'success';

// Bad - mixing patterns inconsistently
type EmployeeObject = {
  id: string;
  name: string;
};
```

**Component Props Interface:**
```typescript
interface EmployeeDetailModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onSave: (employee: Employee) => Promise<void>;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  isOpen,
  employee,
  onClose,
  onSave,
}) => {
  // ...
};
```

**Context Type Pattern:**
```typescript
interface EmployeesContextType {
  employees: Employee[];
  addEmployee: (emp: Employee) => Promise<Employee>;
  updateEmployee: (id: string, emp: Partial<Employee>) => Promise<void>;
  removeEmployee: (id: string) => Promise<void>;
  refreshEmployees: () => Promise<void>;
}

const EmployeesContext = createContext<EmployeesContextType | null>(null);
```

---

## React Component Standards

### Functional Components Only

**Always use functional components with hooks:**
```typescript
// Good
export const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees }) => {
  const [sortBy, setSortBy] = useState<'name' | 'code'>('name');
  // ...
};

// Bad - class components
class EmployeeTable extends React.Component {
  // ...
}
```

### Hook Rules

**Use hooks correctly:**
```typescript
// Good - hooks at top level
const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const [formData, setFormData] = useState<Employee | null>(null);

  useEffect(() => {
    // Load data
  }, []);

  return <div>{/* JSX */}</div>;
};

// Bad - hooks inside conditions
const UserProfile: React.FC = () => {
  if (someCondition) {
    const { user } = useAuth(); // Rule of Hooks violation!
  }
  // ...
};
```

**Custom Hook Pattern:**
```typescript
// src/hooks/use-employees.ts
export const useEmployees = () => {
  const context = useContext(EmployeesContext);
  if (!context) {
    throw new Error('useEmployees must be used within EmployeesProvider');
  }
  return context;
};
```

### JSX & Rendering

**Use semantic HTML:**
```typescript
// Good
<div className="flex gap-4">
  <button className="btn-primary" onClick={handleSave}>
    Save
  </button>
  <button className="btn-secondary" onClick={handleCancel}>
    Cancel
  </button>
</div>

// Bad - divs as buttons
<div className="flex gap-4">
  <div onClick={handleSave}>Save</div>
  <div onClick={handleCancel}>Cancel</div>
</div>
```

**Fragment usage:**
```typescript
// Good - returns multiple elements
return (
  <>
    <Header />
    <MainContent />
    <Footer />
  </>
);

// Acceptable - explicit for readability
return (
  <React.Fragment>
    <Header />
    <MainContent />
  </React.Fragment>
);
```

### Event Handlers

**Naming convention: `handle[Event][Target]`**
```typescript
const handleImageDataExtracted = (employees: Employee[]) => {
  // Process extracted data
};

const handleGridChange = (newData: Employee[]) => {
  // Update grid
};

const handleSyncComplete = () => {
  // Refresh data
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  // ...
};
```

---

## State Management Patterns

### React Context API Usage

**Provider Pattern:**
```typescript
// src/features/auth/auth-context.tsx
interface AuthContextType {
  currentUser: Employee | null;
  isLoggedIn: boolean;
  login: (user: Employee) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);

  const login = useCallback((user: Employee) => {
    setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, isLoggedIn: !!currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Consumer Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

**Consumer Hook Pattern:**
```typescript
// In any component
export const EmployeeProfile: React.FC = () => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return <div>Not logged in</div>;

  return (
    <div>
      <p>{currentUser.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Local State vs Context

**Use `useState` for:**
- UI state (modals, dropdowns, form inputs)
- Temporary user input
- Component-specific toggles

**Use Context for:**
- Global app state (auth, theme)
- Feature-level state (employees, targets)
- Data that multiple components access

```typescript
// Good - local UI state
const EmployeeForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ...
};

// Good - global context state
const EmployeeList: React.FC = () => {
  const { employees, removeEmployee } = useEmployees();

  // ...
};
```

---

## Service Layer Standards

### Firebase Service Pattern

**File structure:**
```typescript
// src/services/firebase/employee-service.ts

import { db } from '../../lib/firebase';
import { ref, child, get, set } from 'firebase/database';
import type { Employee } from '../../types';

export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    const snapshot = await get(child(ref(db), 'employees'));
    if (snapshot.exists()) {
      return Object.values(snapshot.val());
    }
    return [];
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

export const createEmployee = async (employee: Employee): Promise<void> => {
  try {
    const path = `employees/${employee.id}`;
    await set(ref(db, path), employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};
```

**Error Handling:**
```typescript
// Good - explicit error handling
try {
  await updateEmployee(id, updates);
} catch (error) {
  if (error instanceof Error) {
    console.error('Update failed:', error.message);
    setErrorMsg(error.message);
  } else {
    console.error('Unknown error occurred');
    setErrorMsg('An unknown error occurred');
  }
}

// Bad - silent failures
try {
  await updateEmployee(id, updates);
} catch {
  // Silently fail
}
```

---

## Async/Await & Promise Handling

**Use async/await over `.then()`:**
```typescript
// Good
const handleSave = async () => {
  try {
    await saveTimesheet();
    alert('Saved successfully');
  } catch (error) {
    console.error('Save failed:', error);
  }
};

// Bad - callback hell
const handleSave = () => {
  saveTimesheet()
    .then(() => alert('Saved'))
    .catch(err => console.error(err));
};
```

**Debouncing async operations:**
```typescript
// Good - debounce auto-save
const debouncedSave = useCallback(
  debounce(async (data: Employee[]) => {
    await saveTimesheet(data);
  }, 2000),
  []
);

const handleGridChange = (newData: Employee[]) => {
  setGridData(newData);
  debouncedSave(newData);
};
```

---

## Styling Standards

### Tailwind CSS Usage

**Use Tailwind utility classes:**
```typescript
// Good
<div className="flex justify-between items-center gap-4 p-4 bg-gray-50 rounded border border-gray-200">
  <span className="font-semibold text-gray-900">{title}</span>
  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
    Save
  </button>
</div>

// Bad - inline styles
<div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
  {/* ... */}
</div>

// Acceptable - CSS classes (for complex styles)
<div className={styles.container}>
  {/* ... */}
</div>
```

**Color System:**
- Primary: Blue (`bg-blue-600`, `hover:bg-blue-700`)
- Success: Green (`bg-green-600`)
- Warning: Yellow (`bg-yellow-600`)
- Error: Red (`bg-red-600`)
- Neutral: Gray (`bg-gray-100` to `bg-gray-900`)

**Responsive Design:**
```typescript
// Good - mobile-first with breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
</div>

// Good - hidden on mobile
<div className="hidden lg:flex items-center space-x-2">
  {/* Only visible on large screens */}
</div>
```

---

## Error Handling

### Try-Catch Pattern

```typescript
// Good - explicit error handling
const loadEmployees = async () => {
  setLoading(true);
  setError(null);
  try {
    const employees = await getAllEmployees();
    setEmployees(employees);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    setError(message);
    console.error('Failed to load employees:', error);
  } finally {
    setLoading(false);
  }
};
```

### User-Facing Errors

```typescript
// Good - show user-friendly messages
<div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
  <div className="flex items-center mb-2">
    <AlertCircle size={18} className="mr-2" />
    <span className="font-semibold">Error</span>
  </div>
  <div className="text-sm">{errorMsg}</div>
</div>

// Bad - show raw error to user
<div className="text-red-600">
  {JSON.stringify(error)}
</div>
```

---

## Data Validation

### Input Validation

```typescript
// Good - validate before processing
const validateEmployee = (emp: any): emp is Employee => {
  return (
    typeof emp.id === 'string' &&
    typeof emp.name === 'string' &&
    typeof emp.code === 'string' &&
    emp.name.trim().length > 0
  );
};

// Usage
if (validateEmployee(data)) {
  await createEmployee(data);
} else {
  setError('Invalid employee data');
}
```

### Form Validation

```typescript
// Good - validate form submission
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const errors: Record<string, string> = {};

  if (!formData.name.trim()) errors.name = 'Name is required';
  if (!formData.code.trim()) errors.code = 'Code is required';
  if (!formData.department) errors.department = 'Department is required';

  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    return;
  }

  // Save valid data
  saveEmployee(formData);
};
```

---

## Comment & Documentation

### Code Comments

**Use comments to explain WHY, not WHAT:**
```typescript
// Good - explains reasoning
// Debounce save to avoid excessive Firebase writes (max 1/second)
const debouncedSave = useMemo(
  () => debounce(async () => { /* ... */ }, 2000),
  []
);

// Bad - restates code
// Set loading to true
setLoading(true);
```

**JSDoc for public functions:**
```typescript
/**
 * Calculate total working days for employee in a month
 * @param employeeId - The employee's unique ID
 * @param year - Year (YYYY format)
 * @param month - Month (0-11, 0=January)
 * @returns Total working days (0-31)
 */
export const calculateTotalDays = (
  employeeId: string,
  year: number,
  month: number
): number => {
  // Implementation
};
```

### Section Comments

```typescript
// ==================== Event Handlers ====================

const handleImageDataExtracted = (employees: Employee[]) => {
  // ...
};

const handleGridChange = (newData: Employee[]) => {
  // ...
};

// ==================== Rendering ====================

return (
  <div>
    {/* Timesheet grid */}
  </div>
);
```

---

## Git & Commit Standards

### Commit Messages

**Use Conventional Commits format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting (no code change)
- `refactor:` Code restructure
- `test:` Test additions/changes
- `chore:` Build, deps, config

**Examples:**
```bash
# Good
git commit -m "feat(hr): add bulk employee import via Excel"
git commit -m "fix(timesheet): correct attendance grid color display"
git commit -m "docs(readme): update deployment instructions"

# Bad
git commit -m "Update stuff"
git commit -m "WIP: work in progress"
```

---

## Testing Standards

### Test File Location

```
src/
  ├── components/
  │   ├── timesheet/
  │   │   ├── timesheet-grid.tsx
  │   │   └── timesheet-grid.test.tsx  ← Colocated
  │   └── ...
  ├── services/
  │   ├── firebase/
  │   │   ├── employee-service.ts
  │   │   └── employee-service.test.ts  ← Colocated
  │   └── ...
```

### Test Pattern

```typescript
// src/components/hr/employee-detail-modal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { EmployeeDetailModal } from './employee-detail-modal';

describe('EmployeeDetailModal', () => {
  const mockEmployee = {
    id: '1',
    name: 'John Doe',
    code: 'EMP001',
    department: 'Security',
    shift: '08:00-17:00',
    role: 'staff' as const,
  };

  it('renders employee details when open', () => {
    const mockOnClose = jest.fn();

    render(
      <EmployeeDetailModal
        isOpen={true}
        employee={mockEmployee}
        onClose={mockOnClose}
        onSave={jest.fn()}
      />
    );

    expect(screen.getByDisplayValue(mockEmployee.name)).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    const mockOnClose = jest.fn();

    render(
      <EmployeeDetailModal
        isOpen={true}
        employee={mockEmployee}
        onClose={mockOnClose}
        onSave={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
```

---

## Performance Guidelines

### Memoization

```typescript
// Good - memoize expensive components
export const EmployeeTable = memo(function EmployeeTable({ employees }: Props) {
  return (
    // Complex rendering
  );
}, (prev, next) => prev.employees === next.employees);

// Good - memoize callbacks
const handleSave = useCallback(async (data) => {
  await saveData(data);
}, []);

// Good - memoize values
const sortedEmployees = useMemo(() => {
  return [...employees].sort((a, b) => a.name.localeCompare(b.name));
}, [employees]);
```

### Avoiding Unnecessary Re-renders

```typescript
// Good - split contexts to avoid cascading updates
<AuthProvider>
  <EmployeesProvider>
    <TimesheetProvider>
      <App />
    </TimesheetProvider>
  </EmployeesProvider>
</AuthProvider>

// Bad - monolithic context causes all children to re-render
<GlobalStateProvider>
  <App />
</GlobalStateProvider>
```

---

## Logging Standards

### Console Logging

**Appropriate logging:**
```typescript
// Good - log important operations
console.log('Firebase initialized successfully');
console.error('Failed to sync with Google Sheets:', error);
console.warn('Large dataset detected, performance may degrade');

// Bad - excessive logging
console.log('Button clicked');
console.log(employee); // Full object dump
```

**Log levels:**
- `console.log()` - Info, success messages
- `console.warn()` - Warnings, deprecated features
- `console.error()` - Errors, failures

---

## Accessibility (A11y)

### Semantic HTML

```typescript
// Good - semantic elements
<button onClick={handleClick}>Save</button>
<input type="email" aria-label="Email address" />
<label htmlFor="department">Department</label>
<select id="department">
  {/* Options */}
</select>

// Bad - divs as buttons (no keyboard support)
<div onClick={handleClick} role="button">Save</div>
```

### ARIA Labels

```typescript
// Good - ARIA labels for interactive elements
<button aria-label="Close modal" onClick={handleClose}>
  <X size={24} />
</button>

// Good - form labels
<label htmlFor="employee-name">Employee Name</label>
<input id="employee-name" type="text" />
```

---

## Build & Deployment

### Environment Variables

**File: `.env.example`**
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

**Usage:**
```typescript
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

**Never commit `.env.local` or `.env`**

---

## Code Review Checklist

Before submitting code for review, verify:

- [ ] Follows naming conventions (kebab-case for files, camelCase for functions)
- [ ] All TypeScript types are explicit (no implicit `any`)
- [ ] Components are functional with hooks (no class components)
- [ ] Error handling implemented (try-catch, user messages)
- [ ] No console errors or warnings
- [ ] Tailwind classes used for styling (no inline styles)
- [ ] Comments explain WHY, not WHAT
- [ ] Tests written and passing
- [ ] No hardcoded secrets or API keys
- [ ] Accessibility standards followed (semantic HTML, ARIA labels)
- [ ] Performance optimizations applied (memoization, debouncing)
- [ ] Commit messages follow Conventional Commits format

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Using `any` type** | Type safety is lost | Use explicit types or `unknown` |
| **Props drilling** | Hard to maintain, confusing flow | Use Context API for global state |
| **Logic in JSX** | Hard to read and test | Extract to functions/hooks |
| **Large components** | Difficult to understand and test | Split into smaller components |
| **Direct DOM manipulation** | React state gets out of sync | Use React state and refs |
| **Hardcoded values** | Magic numbers, no flexibility | Move to constants file |
| **Silent error catches** | Bugs hidden, hard to debug | Always log and handle errors |
| **Missing dependency arrays** | Bugs in useEffect/useCallback | Always include all dependencies |
| **Inline anonymous functions** | New function created every render | Use useCallback for stable refs |
| **Deeply nested ternaries** | Unreadable conditional logic | Use helper functions or switch |

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Firebase Realtime DB](https://firebase.google.com/docs/database)
- [Conventional Commits](https://www.conventionalcommits.org)

---

**Document Version:** 1.0
**Last Updated:** 2025-12-28
**Maintained By:** Development Team
