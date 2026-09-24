# 🧭 SchoolERP — Decision Log

> Records of key technical decisions, their rationale, and trade-offs considered.

---

## Decision Format

Each decision follows this template:

```
### DEC-XXX — Title
- **Date:** YYYY-MM-DD
- **Status:** Accepted / Superseded / Deprecated
- **Context:** Why this decision was needed
- **Decision:** What was decided
- **Alternatives Considered:** What else was evaluated
- **Consequences:** What this means going forward
```

---

### DEC-001 — Monorepo Structure (frontend + backend)

- **Date:** 2026-09-24
- **Status:** Accepted
- **Context:** The project started as a frontend-only React app. As we move toward a full-stack MERN application, we need a clean separation between client and server code while keeping them in a single repository for developer convenience.
- **Decision:** Adopt a monorepo with `frontend/` and `backend/` subdirectories, each with independent `package.json` and `node_modules`.
- **Alternatives Considered:**
  - **Separate repositories** — rejected; adds deployment complexity and makes cross-referencing harder.
  - **Turborepo / Nx** — rejected; overkill for a two-package project at this stage.
  - **Single package.json** — rejected; mixing frontend and backend dependencies causes conflicts.
- **Consequences:** Developers must run `npm install` in both `frontend/` and `backend/` directories. CI/CD pipelines must handle two separate build steps.

---

### DEC-002 — React Context over Redux for State Management

- **Date:** 2026-09-24
- **Status:** Accepted
- **Context:** We needed global state management for auth and toast notifications.
- **Decision:** Use React's built-in Context API with `useContext` hooks.
- **Alternatives Considered:**
  - **Redux Toolkit** — rejected; the app's state needs are simple (auth + toasts). Redux adds boilerplate without proportional benefit.
  - **Zustand** — viable, but Context is sufficient and has zero additional dependencies.
- **Consequences:** If state complexity grows significantly (e.g., real-time dashboards), re-evaluate and consider Zustand or Redux.

---

### DEC-003 — Controller → Service → Repository Pattern

- **Date:** 2026-09-24
- **Status:** Accepted
- **Context:** The backend needs a clear separation of concerns for maintainability and testability.
- **Decision:** Adopt a three-layer architecture:
  1. **Controllers** — HTTP request/response handling only.
  2. **Services** — business logic and orchestration.
  3. **Repositories** — database queries via Mongoose.
- **Alternatives Considered:**
  - **Fat controllers** — rejected; leads to spaghetti code and makes testing difficult.
  - **Two-layer (controller + model)** — rejected; mixing business logic with data access hurts maintainability.
- **Consequences:** More files per feature, but each layer is independently testable and replaceable.

---

### DEC-004 — Joi for Request Validation

- **Date:** 2026-09-24
- **Status:** Accepted
- **Context:** We need server-side request validation that is expressive and produces clear error messages.
- **Decision:** Use Joi for schema-based validation in the `validators/` directory.
- **Alternatives Considered:**
  - **express-validator** — rejected; less composable for complex nested objects.
  - **Zod** — viable, but Joi is more mature for server-side Express validation.
  - **Manual validation** — rejected; error-prone and verbose.
- **Consequences:** All incoming request bodies, query params, and URL params must pass through Joi schemas before reaching controllers.

---

### DEC-005 — Tailwind CSS 4 with Custom Theme Tokens

- **Date:** 2026-09-24
- **Status:** Accepted
- **Context:** The frontend needs a consistent, maintainable design system.
- **Decision:** Use Tailwind CSS 4 with a custom `@theme` block defining Material Design 3–inspired color tokens, typography, and spacing.
- **Alternatives Considered:**
  - **Plain CSS** — rejected; too slow for rapid UI development.
  - **CSS Modules** — rejected; less utility-first flexibility.
  - **MUI / Ant Design** — rejected; too opinionated and heavy for a custom design.
- **Consequences:** All styling must use Tailwind utility classes referencing theme tokens. No inline styles or ad-hoc hex colors.

---

> **Last updated:** September 24, 2026
