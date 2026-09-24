# 🎨 SchoolERP — Frontend

> React 19 + Vite 8 + TypeScript + Tailwind CSS 4

The frontend is a single-page application (SPA) providing a complete school management interface with dashboard analytics, student management, attendance tracking, fee management, and more.

---

## 🏗 Architecture

```
src/
├── components/           # Reusable UI components
│   ├── common/           # Shared components used across pages
│   │   ├── ConfirmationModal.jsx   # Reusable delete/action confirmation dialog
│   │   ├── EmptyState.jsx          # Empty list placeholder with icon & message
│   │   ├── KpiCard.jsx             # Dashboard KPI metric card with icon
│   │   └── StatusBadge.jsx         # Colored status pill (paid, pending, etc.)
│   └── layout/           # App shell components
│       ├── AppLayout.jsx           # Main layout wrapper (sidebar + header + outlet)
│       ├── Header.jsx              # Top navigation bar with search & profile
│       └── Sidebar.jsx             # Left navigation sidebar with icons & links
│
├── pages/                # Feature pages (one directory per module)
│   ├── auth/             # Login page
│   ├── dashboard/        # Dashboard with KPI cards & overview
│   ├── students/         # Student list, add/edit forms
│   ├── attendance/       # Daily attendance marking & history
│   ├── fees/             # Fee structure management
│   ├── payments/         # Payment collection & history
│   ├── classes/          # Class & section management
│   ├── parents/          # Parent/guardian management
│   ├── reports/          # Analytics & export reports
│   └── settings/         # School configuration & preferences
│
├── context/              # React Context providers
│   ├── AuthContext.jsx   # Authentication state (user, token, login/logout)
│   └── ToastContext.jsx  # Global toast notification system
│
├── routes/               # Routing configuration
│   ├── AppRoutes.jsx     # All route definitions
│   └── ProtectedRoute.jsx # Auth guard HOC (redirects to /login if unauthenticated)
│
├── services/             # API communication layer
│   ├── api.js            # Centralized Axios instance with interceptors
│   ├── authService.js    # Login, register, token management
│   ├── studentService.js # Student CRUD operations
│   ├── attendanceService.js
│   ├── classService.js
│   ├── feeService.js
│   ├── parentService.js
│   ├── paymentService.js
│   ├── reportService.js
│   └── settingsService.js
│
├── mock/                 # Mock data for offline/demo development
│   └── mockData.js       # Complete mock dataset for all modules
│
├── App.tsx               # Root component (BrowserRouter + providers)
├── main.tsx              # React DOM entry point
└── index.css             # Global styles + Tailwind theme configuration
```

---

## 🧩 State Management Strategy

### AuthContext
- Stores the current user object and JWT token.
- Token is persisted in `localStorage` under `schoolerp_token`.
- User data is persisted under `schoolerp_user`.
- Provides `login()`, `logout()`, and `isAuthenticated` to all child components.

### ToastContext
- Provides a `showToast(type, message)` function.
- Supports `success`, `error`, `info`, and `warning` types.
- Auto-dismisses after a configurable duration.
- Renders toast notifications at the top-right of the viewport.

> **No external state library is used.** React Context is sufficient for the current feature set. If the app grows significantly, consider migrating to Zustand or Redux Toolkit.

---

## 🔌 API Service Layer

### Centralized Client (`services/api.js`)

All HTTP requests go through a single Axios instance with:

1. **Base URL** — `VITE_API_URL` environment variable (defaults to `/api`).
2. **Request interceptor** — automatically attaches the JWT token from `localStorage`.
3. **Response interceptor** — maps HTTP errors to user-friendly messages:
   - `400` → "Invalid data submitted"
   - `401` → Auto-logout + redirect to `/login`
   - `403` → "Permission denied"
   - `404` → "Resource not found"
   - `409` → "Duplicate record"
   - `5xx` → "Server error"
   - Network failure → "Operating in offline/mock mode"

### Service Files
Each feature module has a dedicated service file that exports async functions:

```javascript
// Example: studentService.js
export const getStudents = (params) => api.get('/students', { params });
export const getStudent  = (id)     => api.get(`/students/${id}`);
export const addStudent  = (data)   => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id)   => api.delete(`/students/${id}`);
```

---

## 🛤 Route Structure

| Path           | Page              | Auth Required | Description                    |
| -------------- | ----------------- | ------------- | ------------------------------ |
| `/login`       | Login             | No            | Authentication page            |
| `/`            | → `/dashboard`    | Yes           | Auto-redirect                  |
| `/dashboard`   | Dashboard         | Yes           | KPIs and overview              |
| `/students`    | Students          | Yes           | Student management             |
| `/attendance`  | Attendance        | Yes           | Daily attendance tracking      |
| `/fees`        | Fees              | Yes           | Fee structure management       |
| `/payments`    | PaymentHistory    | Yes           | Payment collection history     |
| `/classes`     | Classes           | Yes           | Class & section management     |
| `/parents`     | Parents           | Yes           | Parent/guardian management     |
| `/reports`     | Reports           | Yes           | Analytics & data exports       |
| `/settings`    | Settings          | Yes           | School configuration           |
| `*`            | → `/dashboard`    | —             | Fallback redirect              |

---

## 🌍 Environment Variables

| Variable             | Required | Description                          | Default     |
| -------------------- | -------- | ------------------------------------ | ----------- |
| `VITE_API_URL`       | No       | Backend API base URL                 | `/api`      |

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

> **Note:** All frontend environment variables must be prefixed with `VITE_` to be exposed to the client bundle.

---

## 💻 Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type-check with TypeScript
npm run lint

# Clean build artifacts
npm run clean
```

---

## 🎨 Design System

The app uses a **Material Design 3–inspired** custom theme with Tailwind CSS 4:

### Color Tokens
- `primary` / `primary-container` — deep navy blues
- `secondary` / `secondary-container` — vibrant blues
- `tertiary` — success/accent greens
- `surface` / `surface-container` — layered light backgrounds
- `error` / `error-container` — reds for destructive actions

### Typography
- **Headlines:** Plus Jakarta Sans (600–800 weight)
- **Body text:** Inter (400–600 weight)
- **Monospace:** JetBrains Mono (code/data)

### Icons
- **Material Symbols Outlined** — primary icon set
- **Lucide React** — supplementary icons

---

> **Last updated:** September 24, 2026
