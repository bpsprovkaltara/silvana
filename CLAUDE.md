# Silvana - Sistem Manajemen Antrian Layanan Statistik Terpadu

## Project Overview

Queue management system for the Integrated Statistics Service Unit (PST) at BPS Provinsi Kalimantan Utara. Manages visitor registration, service ticketing, operator queues, and feedback collection.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL 16 via Prisma ORM v7
- **Auth**: NextAuth.js v5 (Auth.js) with Credentials Provider
- **QR Code**: `qrcode` (generate) + `html5-qrcode` (scan)
- **Package Manager**: pnpm

## Commands

- `pnpm dev` - Start dev server (Turbopack)
- `pnpm build` - Production build
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix lint issues
- `pnpm format` - Format code with Prettier
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run Prisma migrations
- `pnpm db:push` - Push schema to DB (no migration)
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed database with initial data
- `docker compose up -d` - Start PostgreSQL

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/              # Public login page
│   ├── register/           # Public registration page
│   ├── (dashboard)/        # Visitor pages (route group)
│   │   ├── tickets/        # Ticket management
│   │   └── schedule/       # View operator schedule
│   ├── operator/           # Operator pages
│   │   ├── dashboard/
│   │   ├── queue/          # Process tickets
│   │   └── tickets/        # History
│   ├── admin/              # Admin pages
│   │   ├── dashboard/
│   │   ├── users/          # CRUD users
│   │   ├── operators/
│   │   ├── schedules/
│   │   ├── tickets/
│   │   └── feedback/
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Layout components
│   ├── tickets/            # Ticket-related components
│   └── auth/               # Auth-related components
├── lib/                    # Utilities (prisma client, utils)
├── generated/prisma/       # Generated Prisma client (gitignored)
└── types/                  # Shared TypeScript types
prisma/
├── schema.prisma           # Database schema
├── migrations/             # Database migrations
└── seed.ts                 # Seed data
```

## Data Model

- **User**: Visitors, operators, admins (roles: VISITOR, OPERATOR, ADMIN)
- **Ticket**: Service requests with queue numbers, QR codes, status tracking
- **Feedback**: Ratings (1-5) and comments per completed ticket
- **OperatorSchedule**: Daily operator duty assignments

## Conventions

- Use server components by default, add `"use client"` only when needed
- Database field names use snake_case (via @map), TypeScript uses camelCase
- Ticket numbers: `[SERVICE_CODE]-[SEQ]` (e.g., KS-001)
- All API routes use Route Handlers in `app/api/`
- Auth is JWT-based with role-based access control (RBAC)
- Environment variables in `.env` (local) and `.env.example` (template)

## Seed Accounts

- Admin: `admin@silvana.bps.go.id` / `admin123`
- Operator: `operator@silvana.bps.go.id` / `operator123`
