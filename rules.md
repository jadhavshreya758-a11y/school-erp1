# 📏 SchoolERP — Development Rules

> Coding standards, conventions, and guardrails that every contributor must follow.

---

## General Rules

1. **Never modify the existing frontend UI** without explicit approval.
2. **Frontend and backend are independent** — each has its own `package.json` and `node_modules`.
3. **All application code goes inside `frontend/src/` or `backend/src/`** — never at the project root.
4. **Root-level files** are for documentation, configuration, and `.gitignore` only.
5. **No cross-imports** between frontend and backend codebases.

---

## Git Conventions

### Commit Messages (Conventional Commits)

```
<type>(<scope>): <short description>

Examples:
  feat(backend): add student CRUD endpoints
  fix(frontend): resolve sidebar collapse on mobile
  docs(root): update deployment instructions
  refactor(backend): extract pagination utility
  chore(frontend): update Vite to v8.4
```

### Branch Naming

```
feature/<module>-<description>    → feature/backend-auth-jwt
fix/<module>-<description>        → fix/frontend-sidebar-scroll
docs/<description>                → docs/api-endpoints
```

---

## Frontend Rules

1. **TypeScript** is the default language for all new files (`.tsx`, `.ts`).
2. **Components** go in `src/components/` — organized by domain or type (`common/`, `layout/`).
3. **Pages** go in `src/pages/<feature>/` — one directory per feature module.
4. **Services** must always go through the centralized Axios instance (`services/api.js`).
5. **State management** uses React Context — do not introduce Redux or Zustand without team discussion.
6. **Styling** uses Tailwind CSS utility classes — no inline styles, no CSS modules.
7. **All routes** must be registered in `src/routes/AppRoutes.jsx`.
8. **Protected routes** must be wrapped with `<ProtectedRoute>`.
9. **Environment variables** must be prefixed with `VITE_` to be exposed to the client.

---

## Backend Rules

1. **ES Modules** (`"type": "module"`) — use `import/export`, not `require()`.
2. **Follow the Controller → Service → Repository** layered pattern.
3. **Controllers** must not contain business logic — delegate to services.
4. **Repositories** must not contain validation — delegate to validators.
5. **All async route handlers** must be wrapped with `asyncHandler()`.
6. **Custom errors** must use the `ApiError` class with an appropriate HTTP status code.
7. **Request validation** uses Joi schemas in `validators/`.
8. **Mongoose models** live in `models/` — one file per collection.
9. **Routes** are defined in `routes/` — one file per resource.
10. **Sensitive data** (passwords, secrets) must never be logged or returned in API responses.
11. **Environment variables** must be loaded from `.env` via `dotenv` — never hardcoded.

---

## API Conventions

| Convention        | Standard                                          |
| ----------------- | ------------------------------------------------- |
| Base path         | `/api`                                            |
| Versioning        | `/api/v1` (when needed)                           |
| Resource naming   | Plural nouns (`/api/students`, `/api/classes`)    |
| HTTP methods      | `GET` (read), `POST` (create), `PUT` (update), `DELETE` (remove) |
| Response format   | `{ success: boolean, data?: any, message?: string }` |
| Error format      | `{ success: false, message: string }`             |
| Pagination        | `?page=1&limit=20`                                |
| Auth header       | `Authorization: Bearer <token>`                   |

---

## File Naming Conventions

| Type           | Convention               | Example                    |
| -------------- | ------------------------ | -------------------------- |
| React component| PascalCase `.jsx`/`.tsx` | `StudentList.jsx`          |
| Service file   | camelCase `.js`          | `studentService.js`        |
| Model          | PascalCase `.js`         | `Student.js`               |
| Route          | kebab-case `.routes.js`  | `student.routes.js`        |
| Controller     | kebab-case `.controller.js` | `student.controller.js` |
| Validator      | kebab-case `.validator.js`  | `student.validator.js`  |
| Middleware     | camelCase `.js`          | `errorHandler.js`          |
| Constants      | camelCase `.js`          | `index.js`                 |

---

> **Last updated:** September 24, 2026
