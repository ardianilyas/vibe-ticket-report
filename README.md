# 🎫 Vibe Ticket Report System

A modern, full-stack monorepo ticket management system built with **Next.js**, **Express**, **Drizzle ORM**, and **PostgreSQL**. Designed with a premium SaaS aesthetic, featuring animated empty states, interactive timelines, and role-based access control.

## ✨ Features

- **🚀 Performance-First Architecture**: Monorepo structure for seamless shared types and utilities.
- **🛡️ Role-Based Access Control (RBAC)**: Dedicated dashboards and permissions for **Admins** and **Users**.
- **📊 Modern Admin Panel**: 
  - Summary stats with dynamic Lucide icons.
  - Category management with custom color themes.
  - User oversight and ticket deletion with safety confirmation modals.
- **🕒 Interactive Ticket Timeline**: Complete history of every ticket, including status changes, assignee updates, and automated logs.
- **🎨 Premium UI/UX**:
  - Built with **shadcn/ui** and **Tailwind CSS**.
  - **Animated Empty States**: Custom Lucide-animated icons and pulses for a livelier experience.
  - **Pastel Design System**: High-contrast, accessibility-aware pastel badges for statuses, priorities, and roles.
  - Full Dark Mode support.
- **🛠️ Robust Backend**: Express.js with **Drizzle ORM** for type-safe database operations and cascading delete protection.

---

## 🏗️ Project Structure

```text
.
├── apps/
│   ├── web/        # Next.js 14 Frontend (App Router)
│   └── api/        # Express.js Backend with TypeScript
└── packages/
    └── shared/     # Shared types and utility functions
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, Tailwind CSS, Lucide React, Radix UI (shadcn), Sonner.
- **Backend**: Node.js, Express.js, JWT Authentication.
- **ORM**: Drizzle ORM.
- **Database**: PostgreSQL.
- **Tools**: TypeScript, tsx, ESLint, Prettier.

---

## 🚦 Getting Started

### 1. Prerequisites
- Node.js (>= 18.0.0)
- PostgreSQL database (Local or Neon)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/ardianilyas/vibe-ticket-report.git
cd vibe-ticket-report
npm install
```

### 3. Environment Setup
Create a `.env` file in `apps/api/`:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/tickets_db
JWT_SECRET=your_jwt_secret_here
```

### 4. Database Initialization
Push the schema and seed the initial data (Categories, Admin User, etc.):
```bash
# Push schema to DB
npm run db:push --workspace=@repo/api

# Seed the database
npm run db:seed --workspace=@repo/api
```

### 5. Running the Application
Start both the API and Web applications in development mode:
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- API: `http://localhost:3001`

---

## 📜 Scripts

- `npm run dev`: Runs both web and api apps concurrently.
- `npm run build`: Builds all workspaces.
- `npm run db:push`: Synchronizes database schema using Drizzle Kit.
- `npm run db:seed`: Seeds initial users and categories.
- `npm run db:studio`: Opens Drizzle Studio for database management.

---

## 🛡️ License
Distributed under the MIT License.
