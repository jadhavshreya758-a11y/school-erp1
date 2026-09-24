# 🧠 SchoolERP — Memory

> Persistent architectural context, patterns, and conventions that must be remembered across development sessions.

---

## Project Identity

| Key             | Value                                                    |
| --------------- | -------------------------------------------------------- |
| **Project**     | SchoolERP — School Management System                     |
| **Architecture**| MERN (MongoDB, Express, React, Node.js)                  |
| **Frontend**    | React 19 + Vite 8 + TypeScript + Tailwind CSS 4         |
| **Backend**     | Express 4 + Mongoose 8 + JWT                             |
| **Database**    | MongoDB (Mongoose ODM)                                   |
| **Monorepo**    | Yes — `frontend/` and `backend/` under single root       |

---

## Folder Conventions

- **Frontend source** lives in `frontend/src/`.
- **Backend source** lives in `backend/src/`.
- Each has its own `package.json`, `node_modules`, and `.env`.
- Root-level files are documentation only — no application code lives at root.

---

## Frontend Architecture (Completed — Phase 0)

### State Management
- **AuthContext** — manages user authentication state, login/logout, token persistence via `localStorage`.
- **ToastContext** — global notification system for success/error/info toasts.

### Routing
- **React Router v7** with `BrowserRouter`.
- `ProtectedRoute` wraps all authenticated routes.
- `AppLayout` provides the sidebar + header shell for dashboard pages.

### Service Layer
- Centralized Axios instance (`services/api.js`) with:
  - JWT token injection via request interceptor.
  - Centralized error mapping via response interceptor.
  - Auto-redirect to `/login` on 401.
- Feature-specific service files (e.g., `studentService.js`, `feeService.js`).

### UI Library
- **Tailwind CSS 4** with custom theme tokens (Material Design 3 inspired).
- **Material Symbols Outlined** for icons.
- **Lucide React** for supplementary icons.
- **Framer Motion** for animations.
- **Fonts:** Inter (body), Plus Jakarta Sans (headings), JetBrains Mono (code).

### Modules Built
1. Dashboard (KPIs, charts overview)
2. Students (CRUD)
3. Attendance (daily tracking)
4. Fees (structure & assignment)
5. Payments (collection history)
6. Classes (section management)
7. Parents (guardian management)
8. Reports (analytics & exports)
9. Settings (school configuration)
10. Auth (login page)

---

## Backend Architecture (Complete — All 12 Phases)

### Pattern: Controller → Service → Repository

```
Request → Route → Controller → Service → Repository → MongoDB
```

- **Controllers** — parse request, call service, send response.
- **Services** — business logic, validation orchestration.
- **Repositories** — pure data-access via Mongoose.
- **Validators** — Joi schemas for request validation.

### Middleware Stack
1. `helmet` — security headers
2. `cors` — cross-origin configuration (CLIENT_URL env var)
3. `morgan` — HTTP request logging
4. `express.json` — body parsing (10mb limit)
5. `express-rate-limit` — 100 req/15 min global; 5 req/15 min on login
6. `auth.js` — JWT verification + role-based authorization
7. `errorHandler` — centralized error response
8. `notFoundHandler` — 404 catch-all

### Collections Built

| Model           | Key Constraints                                       |
| --------------- | ----------------------------------------------------- |
| User            | email unique, password bcrypt-hashed (select:false)   |
| Class           | (name + section + academicYear) compound unique       |
| Parent          | email unique                                          |
| Student         | studentId unique, refs classId + parentId             |
| Attendance      | (studentId + date) compound unique                    |
| Fee             | (classId + academicYear) compound unique              |
| Payment         | receiptNumber unique, auto-generated RCP-YYYYMMDD-XXXX|
| SchoolSettings  | singleton (_singleton key), upsert pattern            |
| AuditLog        | append-only, immutable pre-hooks                      |

### Soft-Delete Pattern
All CRUD models (Class, Parent, Student, Fee) use `deletedAt: null` field.
A pre-find hook automatically filters `deletedAt: null` unless overridden.

### Validation Library
**Joi** (DEC-004). Each module has its own `*.validator.js` file in `src/validators/`.
A shared `validate(schema)` middleware factory is defined per validator file.

### Audit Logging
`audit.service.js` provides a fire-and-forget `audit.log()` function.
Errors are caught silently — audit failure never disrupts the main request.
Modules audited: auth (login, login_failed, logout), student (create, update, delete), payment (create), settings (update).

### Auto-Seeds at Startup
`server.js` calls after DB connect:
1. `authService.seedAdmin()` — creates default admin if no users exist.
2. `settingsRepository.seedDefaults()` — creates default settings doc if missing.

---

## API Route Map

| Module     | Base Path         | Key Endpoints                                         |
| ---------- | ----------------- | ----------------------------------------------------- |
| Auth       | `/api/auth`       | POST /login, GET /me, POST /logout                    |
| Classes    | `/api/classes`    | CRUD + pagination + search                            |
| Parents    | `/api/parents`    | CRUD + GET /:id/students                              |
| Students   | `/api/students`   | CRUD + POST /bulk                                     |
| Attendance | `/api/attendance` | CRUD + GET /class/:classId + POST /bulk               |
| Fees       | `/api/fees`       | CRUD                                                  |
| Payments   | `/api/payments`   | POST (record) + GET /summary/:studentId               |
| Dashboard  | `/api/dashboard`  | GET (KPIs)                                            |
| Reports    | `/api/reports`    | GET /students, /attendance, /fees                     |
| Settings   | `/api/settings`   | GET + PUT                                             |

---

## Environment Variables

### Frontend
| Variable        | Purpose                    |
| --------------- | -------------------------- |
| `VITE_API_URL`  | Backend API base URL       |

### Backend
| Variable          | Purpose                                       |
| ----------------- | --------------------------------------------- |
| `PORT`            | Server port (default 5000)                    |
| `MONGODB_URI`     | MongoDB connection string                     |
| `JWT_SECRET`      | Token signing secret                          |
| `JWT_EXPIRES_IN`  | Token expiry duration (default 7d)            |
| `CLIENT_URL`      | CORS allowed origin                           |
| `NODE_ENV`        | Environment mode                              |
| `ADMIN_NAME`      | Default admin display name (seed only)        |
| `ADMIN_EMAIL`     | Default admin email (seed only)               |
| `ADMIN_PASSWORD`  | Default admin password (seed only)            |

---

## Key Utility Files

| File                        | Purpose                                              |
| --------------------------- | ---------------------------------------------------- |
| `utils/ApiError.js`         | Custom error class with statusCode                   |
| `utils/asyncHandler.js`     | Wraps async controllers, forwards errors to next()   |
| `utils/apiResponse.js`      | `sendSuccess()` / `sendError()` helpers              |
| `utils/logger.js`           | Levelled console logger (debug/info/warn/error)      |
| `utils/pagination.js`       | `parsePagination()` / `buildPaginationMeta()`        |
| `constants/index.js`        | ROLES, PAGINATION, FEE_STATUS, ATTENDANCE_STATUS     |
| `constants/httpStatus.js`   | HTTP status code constants                           |

---

> **Last updated:** September 24, 2026
