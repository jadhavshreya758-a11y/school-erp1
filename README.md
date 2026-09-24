<div align="center">

# 🏫 SchoolERP

### Modern School Management System

**A full-stack MERN application for managing students, attendance, fees, classes, parents, and reports — purpose-built for small schools, play schools, and coaching academies.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       SchoolERP Root                        │
├─────────────────────────────┬───────────────────────────────┤
│         frontend/           │          backend/             │
│  React 19 + Vite + Tailwind │  Express 4 + MongoDB + JWT   │
│  ─────────────────────────  │  ───────────────────────────  │
│  • Pages & Components       │  • REST API Controllers      │
│  • Context-based State      │  • Mongoose Models           │
│  • Axios Service Layer      │  • Repository Pattern        │
│  • React Router v7          │  • JWT Authentication        │
│  • Material Icons + Lucide  │  • Joi Validation            │
│  • Framer Motion            │  • Rate Limiting & Helmet    │
│                             │                              │
│   Port 5173 (dev)           │   Port 5000 (dev)            │
└─────────────────────────────┴───────────────────────────────┘
```

---

## 📁 Folder Structure

```text
SchoolERP/
│
├── frontend/                 # React + Vite client application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── common/       # KpiCard, StatusBadge, EmptyState, Modals
│   │   │   └── layout/       # AppLayout, Sidebar, Header
│   │   ├── pages/            # Feature pages (dashboard, students, fees…)
│   │   ├── context/          # AuthContext, ToastContext
│   │   ├── routes/           # AppRoutes, ProtectedRoute
│   │   ├── services/         # Axios API service modules
│   │   └── mock/             # Mock data for offline development
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                  # Express.js REST API server
│   ├── src/
│   │   ├── config/           # Database connection
│   │   ├── controllers/      # Route handler logic
│   │   ├── middleware/       # Auth, error handling, rate-limiting
│   │   ├── models/           # Mongoose schemas
│   │   ├── repositories/     # Data-access layer
│   │   ├── routes/           # Express router definitions
│   │   ├── services/         # Business logic layer
│   │   ├── validators/       # Joi request schemas
│   │   ├── utils/            # ApiError, asyncHandler
│   │   ├── constants/        # Enums & shared constants
│   │   ├── docs/             # API documentation
│   │   └── app.js            # Express app configuration
│   ├── server.js             # Server entry point
│   └── package.json
│
├── docs/                     # Project-wide documentation
│   ├── api/
│   ├── architecture/
│   ├── database/
│   └── deployment/
│
├── phases.md                 # Development roadmap
├── memory.md                 # Architecture decisions log
├── rules.md                  # Development rules & conventions
├── decision.md               # Key technical decisions
├── log.md                    # Development changelog
└── README.md                 # ← You are here
```

---

## 🛠 Tech Stack

| Layer       | Technology                                     |
| ----------- | ---------------------------------------------- |
| **Frontend**| React 19, Vite 8, TypeScript, Tailwind CSS 4   |
| **Backend** | Node.js, Express 4, Mongoose 8                 |
| **Database**| MongoDB                                        |
| **Auth**    | JWT (jsonwebtoken), bcryptjs                   |
| **UI**      | Material Symbols, Lucide Icons, Framer Motion  |
| **HTTP**    | Axios (client), cors + helmet (server)         |
| **Fonts**   | Inter, Plus Jakarta Sans, JetBrains Mono       |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (or Bun)
- **MongoDB** (local or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/schoolerp.git
cd schoolerp
```

### 2. Set up the Frontend

```bash
cd frontend
cp .env.example .env        # Edit with your values
npm install
npm run dev                  # → http://localhost:5173
```

### 3. Set up the Backend

```bash
cd backend
cp .env.example .env        # Edit with your MongoDB URI & JWT secret
npm install
npm run dev                  # → http://localhost:5000
```

> **Health check:** Visit `http://localhost:5000/api/health` to verify the backend is running.

---

## 📜 Available Scripts

### Frontend (`frontend/`)

| Command         | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start Vite dev server (HMR)    |
| `npm run build` | Production build to `dist/`    |
| `npm run preview`| Preview production build      |
| `npm run lint`  | TypeScript type checking       |

### Backend (`backend/`)

| Command         | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start with nodemon (auto-reload)|
| `npm start`     | Start production server        |
| `npm run lint`  | ESLint checks                  |
| `npm test`      | Run Jest test suite            |

---

## 🌐 Deployment Overview

```
┌──────────────┐    HTTPS     ┌──────────────┐    TCP     ┌──────────────┐
│   Frontend   │ ──────────── │   Backend    │ ────────── │   MongoDB    │
│  (Vercel /   │   REST API   │  (Railway /  │   27017    │  (Atlas /    │
│   Netlify)   │              │   Render)    │            │   Local)     │
└──────────────┘              └──────────────┘            └──────────────┘
```

- **Frontend** → Deploy as a static site (Vercel, Netlify, or AWS S3 + CloudFront).
- **Backend**  → Deploy as a Node.js service (Railway, Render, AWS EC2, or DigitalOcean).
- **Database** → MongoDB Atlas (free tier available) or self-hosted MongoDB.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

**Built with ❤️ for schools everywhere**

</div>
"# school-erp1" 
