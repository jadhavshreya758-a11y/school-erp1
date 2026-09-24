# 📝 SchoolERP — Development Log

> Chronological record of development milestones, changes, and progress.

---

## Log Format

```
### YYYY-MM-DD — Summary
- Details of what was done
```

---

### 2026-09-24 — Project Restructuring

**Category:** Architecture / DevOps

**Changes made:**

1. **Moved existing React frontend** into `frontend/` subdirectory.
   - All source files, configuration, and dependencies preserved.
   - No functional changes to UI or routing.
   - Import paths verified — all use relative paths, no breakage.

2. **Initialized Express backend** scaffold in `backend/`.
   - Created layered architecture: `config/`, `controllers/`, `middleware/`, `models/`, `repositories/`, `routes/`, `services/`, `validators/`, `utils/`, `constants/`, `docs/`.
   - Set up `server.js` (entry point) and `src/app.js` (Express configuration).
   - Configured middleware: helmet, cors, morgan, rate-limit, JSON parsing.
   - Created auth middleware (JWT verification + role-based authorization).
   - Added utility classes: `ApiError`, `asyncHandler`.
   - Added shared constants: roles, pagination, fee/attendance statuses.

3. **Created root documentation files:**
   - `README.md` — project overview, architecture, setup instructions.
   - `phases.md` — development roadmap with 7 phases.
   - `memory.md` — persistent architectural context.
   - `rules.md` — coding standards and conventions.
   - `decision.md` — 5 architectural decision records.
   - `log.md` — this file.

4. **Created module-specific documentation:**
   - `frontend/README.md` — frontend architecture guide.
   - `backend/README.md` — backend architecture guide.

5. **Created environment templates:**
   - `frontend/.env.example`
   - `backend/.env.example`

6. **Created `.gitignore` files.**

7. **Created `docs/` directory** with subdirectories for future documentation.

**Outcome:** Project is now cleanly separated into frontend and backend with independent dependency management, ready for backend API development in Phase 1.

---

### 2026-09-24 — Backend Phase 1: Foundation Complete

**Category:** Backend / Infrastructure

**Files Created:**
- `backend/src/utils/logger.js` — levelled console logger
- `backend/src/utils/apiResponse.js` — `sendSuccess` / `sendError` helpers
- `backend/src/utils/pagination.js` — `parsePagination` / `buildPaginationMeta`
- `backend/src/constants/httpStatus.js` — HTTP status code constants
- `backend/src/routes/index.js` — route loader mounting all sub-routers

**Files Modified:**
- `backend/src/app.js` — wired `apiRoutes` at `/api`

**APIs:**
- `GET /api/health` — server status check

**Outcome:** Server scaffold is complete. Routes loader is wired. All utilities available for all phases.

---

### 2026-09-24 — Backend Phase 2: Authentication Module

**Category:** Backend / Auth

**Files Created:**
- `backend/src/models/User.js`
- `backend/src/validators/auth.validator.js`
- `backend/src/repositories/user.repository.js`
- `backend/src/services/auth.service.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/routes/auth.routes.js`

**Files Modified:**
- `backend/server.js` — added `authService.seedAdmin()` on startup
- `backend/.env.example` — added ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD seed vars

**APIs:**
- `POST /api/auth/login` — rate-limited (5/15 min)
- `GET  /api/auth/me`
- `POST /api/auth/logout`

**Business Rules Implemented:**
- Password bcrypt-hashed with salt rounds 12.
- JWT expires per `JWT_EXPIRES_IN` env var.
- Login blocked for inactive accounts.
- Default admin seeded on first startup.

---

### 2026-09-24 — Backend Phase 3: Class Management

**Category:** Backend / CRUD

**Files Created:**
- `backend/src/models/Class.js`
- `backend/src/validators/class.validator.js`
- `backend/src/repositories/class.repository.js`
- `backend/src/services/class.service.js`
- `backend/src/controllers/class.controller.js`
- `backend/src/routes/class.routes.js`

**APIs:** `GET /api/classes`, `GET /api/classes/:id`, `POST`, `PUT`, `DELETE`

**Business Rules:**
- Compound unique index: name + section + academicYear.
- Soft-delete. Cannot delete class with enrolled students.
- Pagination + search + academicYear + isActive filters.

---

### 2026-09-24 — Backend Phase 4: Parent Management

**Category:** Backend / CRUD

**Files Created:**
- `backend/src/models/Parent.js`
- `backend/src/validators/parent.validator.js`
- `backend/src/repositories/parent.repository.js`
- `backend/src/services/parent.service.js`
- `backend/src/controllers/parent.controller.js`
- `backend/src/routes/parent.routes.js`

**APIs:** `GET /api/parents`, `GET /api/parents/:id`, `GET /api/parents/:id/students`, `POST`, `PUT`, `DELETE`

**Business Rules:**
- Email uniqueness guard. Phone regex validation.
- Cannot delete parent with linked students.
- Soft-delete. Pagination + search.

---

### 2026-09-24 — Backend Phase 5: Student Management

**Category:** Backend / CRUD

**Files Created:**
- `backend/src/models/Student.js`
- `backend/src/validators/student.validator.js`
- `backend/src/repositories/student.repository.js`
- `backend/src/services/student.service.js`
- `backend/src/controllers/student.controller.js`
- `backend/src/routes/student.routes.js`

**APIs:** `GET /api/students`, `GET /api/students/:id`, `POST /api/students/bulk`, `POST`, `PUT`, `DELETE`

**Business Rules:**
- Unique `studentId`. classId + parentId existence validated on create/update.
- Soft-delete sets status to `inactive`.
- Pagination + search + classId + status + parentId filters.

---

### 2026-09-24 — Backend Phase 6: Attendance

**Category:** Backend / Business Logic

**Files Created:**
- `backend/src/models/Attendance.js`
- `backend/src/validators/attendance.validator.js`
- `backend/src/repositories/attendance.repository.js`
- `backend/src/services/attendance.service.js`
- `backend/src/controllers/attendance.controller.js`
- `backend/src/routes/attendance.routes.js`

**APIs:** `GET /api/attendance`, `GET /api/attendance/class/:classId`, `GET /api/attendance/:id`, `POST`, `POST /bulk`, `PUT /:id`

**Business Rules:**
- Compound unique index (studentId + date) — enforces one record per student per day.
- Service-level duplicate guard before insert.
- Bulk mark: skips students already marked, reports skipped count.
- Dates normalised to UTC midnight for consistent querying.

---

### 2026-09-24 — Backend Phase 7: Fee Structure

**Category:** Backend / CRUD

**Files Created:**
- `backend/src/models/Fee.js`
- `backend/src/validators/fee.validator.js`
- `backend/src/repositories/fee.repository.js`
- `backend/src/services/fee.service.js`
- `backend/src/controllers/fee.controller.js`
- `backend/src/routes/fee.routes.js`

**APIs:** `GET /api/fees`, `GET /api/fees/:id`, `POST`, `PUT`, `DELETE`

**Business Rules:**
- Compound unique index (classId + academicYear).
- Class existence validated on create.
- Cannot delete fee structure with linked payments.
- Breakdown sub-doc: tuition, transport, library, laboratory, sports, miscellaneous.

---

### 2026-09-24 — Backend Phase 8: Payment Module

**Category:** Backend / Business Logic

**Files Created:**
- `backend/src/models/Payment.js`
- `backend/src/validators/payment.validator.js`
- `backend/src/repositories/payment.repository.js`
- `backend/src/services/payment.service.js`
- `backend/src/controllers/payment.controller.js`
- `backend/src/routes/payment.routes.js`

**APIs:** `GET /api/payments`, `GET /api/payments/summary/:studentId`, `GET /api/payments/:id`, `POST`

**Business Rules:**
- Auto-generated receipt number: `RCP-YYYYMMDD-XXXX`.
- Overpayment prevented: `amountPaid ≤ (totalFee − alreadyPaid)`.
- Fee summary endpoint returns: totalFee, totalPaid, pendingAmount, status (paid/partial/pending).

---

### 2026-09-24 — Backend Phase 9: Dashboard Module

**Category:** Backend / Aggregation

**Files Created:**
- `backend/src/services/dashboard.service.js`
- `backend/src/controllers/dashboard.controller.js`
- `backend/src/routes/dashboard.routes.js`

**APIs:** `GET /api/dashboard`

**KPIs:** totalStudents, activeStudents, totalClasses, totalParents, todayAttendance (present/total/%), collectedFees, pendingFees, collectionRate%, recentPayments[5]. All queried in parallel via `Promise.all`. Academic year auto-derived (July 1 cutoff).

---

### 2026-09-24 — Backend Phase 10: Reports Module

**Category:** Backend / Aggregation

**Files Created:**
- `backend/src/services/report.service.js`
- `backend/src/controllers/report.controller.js`
- `backend/src/routes/report.routes.js`

**APIs:**
- `GET /api/reports/students` — enrollment summary by class
- `GET /api/reports/attendance` — present/absent/late/excused % (startDate + endDate required)
- `GET /api/reports/fees` — collected/pending/collectionRate% per class (academicYear required)

All reports use MongoDB aggregation pipelines with grand-total summaries.

---

### 2026-09-24 — Backend Phase 11: Settings Module

**Category:** Backend / Singleton

**Files Created:**
- `backend/src/models/SchoolSettings.js`
- `backend/src/validators/settings.validator.js`
- `backend/src/repositories/settings.repository.js`
- `backend/src/services/settings.service.js`
- `backend/src/controllers/settings.controller.js`
- `backend/src/routes/settings.routes.js`

**Files Modified:**
- `backend/server.js` — added `settingsRepository.seedDefaults()` on startup

**APIs:** `GET /api/settings`, `PUT /api/settings`

**Business Rules:**
- Single document enforced via `_singleton: 'school_settings'` unique key + upsert.
- Auto-seeds defaults on first GET if document missing.
- Immutable `_singleton` key protected in service.

---

### 2026-09-24 — Backend Phase 12: Audit Logging

**Category:** Backend / Cross-Cutting

**Files Created:**
- `backend/src/models/AuditLog.js`
- `backend/src/services/audit.service.js`

**Files Modified:**
- `backend/src/services/auth.service.js` — login + login_failed audit
- `backend/src/controllers/auth.controller.js` — logout audit
- `backend/src/services/student.service.js` — create/update/delete audit; userId/userEmail params added
- `backend/src/services/payment.service.js` — create audit
- `backend/src/services/settings.service.js` — update audit; userId/userEmail params added
- `backend/src/controllers/student.controller.js` — passes req.user context
- `backend/src/controllers/settings.controller.js` — passes req.user context

**Business Rules:**
- AuditLog records are immutable — pre-hooks block `updateOne`, `updateMany`, `findOneAndUpdate`.
- `audit.log()` is fire-and-forget — errors caught silently, never crash the calling service.

---

### 2026-09-24 — Backend Dependencies Installed

**Category:** DevOps

- Ran `npm install` in `backend/` — 466 packages installed, 0 vulnerabilities.
- `node --check` on all 30+ source files: ALL_PASSED.
- `.env` created from `.env.example` (placeholder values, ready for developer to fill MongoDB URI + JWT secret).

**All 12 backend phases are complete and syntax-verified.**

---

> **Last updated:** September 24, 2026
