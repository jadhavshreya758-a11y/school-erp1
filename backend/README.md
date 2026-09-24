# ⚙️ SchoolERP — Backend

> Express 4 + MongoDB (Mongoose 8) + JWT Authentication

The backend is a RESTful API server providing authentication, data persistence, and business logic for the SchoolERP platform. It follows a clean **Controller → Service → Repository** layered architecture.

---

## 🏗 Architecture

```
backend/
├── src/
│   ├── config/           # Environment & database configuration
│   │   └── db.js         # Mongoose connection setup
│   │
│   ├── controllers/      # HTTP request handlers
│   │   └── (*.controller.js — one per resource)
│   │
│   ├── middleware/        # Express middleware
│   │   ├── auth.js       # JWT authentication + role authorization
│   │   ├── errorHandler.js   # Global error response handler
│   │   └── notFoundHandler.js # 404 catch-all
│   │
│   ├── models/           # Mongoose schemas & models
│   │   └── (*.js — one per collection)
│   │
│   ├── repositories/     # Data-access layer (Mongoose queries)
│   │   └── (*.repository.js — one per model)
│   │
│   ├── routes/           # Express router definitions
│   │   └── (*.routes.js — one per resource)
│   │
│   ├── services/         # Business logic layer
│   │   └── (*.service.js — one per domain)
│   │
│   ├── validators/       # Joi request validation schemas
│   │   └── (*.validator.js — one per resource)
│   │
│   ├── utils/            # Shared utilities
│   │   ├── ApiError.js   # Custom error class with HTTP status codes
│   │   └── asyncHandler.js # Wraps async handlers for error forwarding
│   │
│   ├── constants/        # Enums & shared constants
│   │   └── index.js      # ROLES, PAGINATION, FEE_STATUS, ATTENDANCE_STATUS
│   │
│   ├── docs/             # API documentation files
│   │
│   └── app.js            # Express application configuration
│
├── server.js             # Server entry point (boots Express + MongoDB)
├── package.json
├── .env.example
└── .gitignore
```

---

## 📁 Folder Responsibilities

| Folder          | Responsibility                                                |
| --------------- | ------------------------------------------------------------- |
| `config/`       | Database connection, environment loading, external service config |
| `controllers/`  | Parse HTTP request → call service → send HTTP response        |
| `middleware/`   | Cross-cutting concerns (auth, errors, logging, rate-limiting) |
| `models/`       | Mongoose schema definitions, indexes, virtual fields          |
| `repositories/` | Pure database operations (CRUD, aggregations, queries)        |
| `routes/`       | URL → controller mapping, middleware attachment               |
| `services/`     | Business logic, validation orchestration, multi-model ops     |
| `validators/`   | Joi schemas for request body, query, and param validation     |
| `utils/`        | Reusable helpers (error classes, async wrappers, formatters)  |
| `constants/`    | Enums, magic strings, default values                          |
| `docs/`         | OpenAPI/Swagger specs, API documentation                      |

---

## 🔄 Request Lifecycle

```
  Client Request
       │
       ▼
  ┌─────────────────────────────────────────┐
  │  Express Middleware Stack                │
  │  1. helmet() — security headers         │
  │  2. cors() — CORS policy                │
  │  3. morgan() — request logging          │
  │  4. express.json() — body parsing       │
  │  5. rateLimit() — API rate limiting      │
  └────────────────┬────────────────────────┘
                   │
                   ▼
  ┌─────────────────────────────────────────┐
  │  Router  →  Validator  →  Auth Guard    │
  │  (routes/)  (validators/)  (middleware/)│
  └────────────────┬────────────────────────┘
                   │
                   ▼
  ┌─────────────────────────────────────────┐
  │  Controller                              │
  │  • Extracts request data                 │
  │  • Calls the appropriate service method  │
  │  • Sends JSON response                   │
  └────────────────┬────────────────────────┘
                   │
                   ▼
  ┌─────────────────────────────────────────┐
  │  Service                                 │
  │  • Business logic & rules                │
  │  • Orchestrates repository calls         │
  │  • Throws ApiError on failure            │
  └────────────────┬────────────────────────┘
                   │
                   ▼
  ┌─────────────────────────────────────────┐
  │  Repository                              │
  │  • Mongoose queries                      │
  │  • Returns raw documents or aggregations │
  └────────────────┬────────────────────────┘
                   │
                   ▼
              MongoDB
```

---

## 🔐 JWT Authentication Flow

```
  1. LOGIN
     POST /api/auth/login  { email, password }
            │
            ▼
     Validate credentials → bcrypt.compare(password, hash)
            │
            ▼
     Sign JWT → jwt.sign({ id, role }, JWT_SECRET, { expiresIn })
            │
            ▼
     Return { token, user }

  2. AUTHENTICATED REQUEST
     GET /api/students
     Header: Authorization: Bearer <token>
            │
            ▼
     auth.js middleware → jwt.verify(token, JWT_SECRET)
            │
            ▼
     Attach decoded payload to req.user
            │
            ▼
     Controller processes request

  3. ROLE-BASED ACCESS
     authorize('admin', 'teacher') middleware
            │
            ▼
     Check req.user.role ∈ allowed roles
            │
            ▼
     403 Forbidden if not authorized
```

---

## ❌ Error Handling Strategy

### ApiError Class
```javascript
throw new ApiError(404, 'Student not found');
throw new ApiError(400, 'Invalid email format');
throw new ApiError(409, 'Student ID already exists');
```

### Error Handler Middleware
All errors are caught by `errorHandler.js` and returned as:

```json
{
  "success": false,
  "message": "Student not found",
  "stack": "..." // Only in development
}
```

### HTTP Status Code Reference

| Code | Meaning                | When to Use                              |
| ---- | ---------------------- | ---------------------------------------- |
| 200  | OK                     | Successful GET, PUT                      |
| 201  | Created                | Successful POST (resource created)       |
| 204  | No Content             | Successful DELETE                        |
| 400  | Bad Request            | Validation error, malformed input        |
| 401  | Unauthorized           | Missing/invalid/expired token            |
| 403  | Forbidden              | Valid token but insufficient permissions |
| 404  | Not Found              | Resource doesn't exist                   |
| 409  | Conflict               | Duplicate key (e.g., duplicate email)    |
| 422  | Unprocessable Entity   | Valid format but semantic error           |
| 429  | Too Many Requests      | Rate limit exceeded                      |
| 500  | Internal Server Error  | Unexpected server failure                |

---

## 🌍 Environment Variables

| Variable          | Required | Description                      | Default                   |
| ----------------- | -------- | -------------------------------- | ------------------------- |
| `PORT`            | No       | Server port                      | `5000`                    |
| `NODE_ENV`        | No       | Environment mode                 | `development`             |
| `MONGODB_URI`     | **Yes**  | MongoDB connection string        | —                         |
| `JWT_SECRET`      | **Yes**  | Secret for signing JWT tokens    | —                         |
| `JWT_EXPIRES_IN`  | No       | Token expiry duration            | `7d`                      |
| `CLIENT_URL`      | No       | Allowed CORS origin (frontend)   | `http://localhost:5173`   |

Create a `.env` file from the template:

```bash
cp .env.example .env
```

---

## 📐 API Conventions

### Base URL
```
http://localhost:5000/api
```

### Resource Endpoints Pattern
```
GET    /api/<resource>          → List all (paginated)
GET    /api/<resource>/:id      → Get one by ID
POST   /api/<resource>          → Create new
PUT    /api/<resource>/:id      → Update by ID
DELETE /api/<resource>/:id      → Delete by ID
```

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Student created successfully"
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Validation error: email is required"
}
```

---

## 💻 Development Commands

```bash
# Install dependencies
npm install

# Start development server with auto-reload (http://localhost:5000)
npm run dev

# Start production server
npm start

# Run linting
npm run lint

# Run tests
npm test
```

---

## 🏥 Health Check

```bash
curl http://localhost:5000/api/health
```

```json
{
  "success": true,
  "message": "SchoolERP API is running",
  "timestamp": "2026-09-24T01:00:00.000Z",
  "environment": "development"
}
```

---

> **Last updated:** September 24, 2026
