# Silvana

Sistem Manajemen Antrian Layanan Statistik Terpadu untuk Pelayanan Statistik Terpadu (PST) BPS Provinsi Kalimantan Utara.

Silvana mengelola registrasi pengunjung, pembuatan tiket layanan, antrian operator, dan pengumpulan feedback dalam satu platform digital.

## Tech Stack

| Kategori        | Teknologi                                       |
| --------------- | ----------------------------------------------- |
| Framework       | Next.js 16 (App Router) + TypeScript            |
| Styling         | Tailwind CSS v4 + shadcn/ui                     |
| Database        | PostgreSQL 16 via Prisma ORM v7                 |
| Auth            | NextAuth.js v5 (Auth.js) + Credentials Provider |
| QR Code         | `qrcode` (generate) + `html5-qrcode` (scan)     |
| Package Manager | pnpm                                            |

## Fitur

- **Pengunjung** — Registrasi akun, buat tiket layanan, pilih jadwal, dapatkan QR code, pantau status antrian, berikan feedback
- **Operator** — Lihat antrian hari ini, proses tiket (mulai/selesaikan layanan), riwayat layanan
- **Admin** — Kelola pengguna, operator, jadwal, tiket, dan feedback

### Jenis Layanan

| Kode | Layanan                        |
| ---- | ------------------------------ |
| KS   | Konsultasi Statistik           |
| DM   | Penjualan Data Mikro           |
| PS   | Perpustakaan Statistik         |
| RK   | Rekomendasi Kegiatan Statistik |

## Getting Started

### Prasyarat

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v9+
- [Docker](https://www.docker.com/) (untuk PostgreSQL)

### Instalasi

1. **Clone repository**

```bash
git clone <repo-url>
cd silvana
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Setup environment variables**

```bash
cp .env.example .env
```

Edit `.env` dan isi `AUTH_SECRET` dengan:

```bash
openssl rand -base64 32
```

4. **Jalankan PostgreSQL**

```bash
docker compose up -d
```

5. **Setup database**

```bash
pnpm db:push
pnpm db:seed
```

6. **Jalankan dev server**

```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Akun Demo

| Role       | Email                          | Password        |
| ---------- | ------------------------------ | --------------- |
| Admin      | `admin@silvana.bps.go.id`      | `admin123`      |
| Operator   | `operator@silvana.bps.go.id`   | `operator123`   |
| Pengunjung | `pengunjung@silvana.bps.go.id` | `pengunjung123` |

## Scripts

| Command            | Deskripsi                       |
| ------------------ | ------------------------------- |
| `pnpm dev`         | Jalankan dev server (Turbopack) |
| `pnpm build`       | Production build                |
| `pnpm start`       | Jalankan production server      |
| `pnpm lint`        | Jalankan ESLint                 |
| `pnpm lint:fix`    | Fix lint issues                 |
| `pnpm format`      | Format kode dengan Prettier     |
| `pnpm db:generate` | Generate Prisma client          |
| `pnpm db:migrate`  | Jalankan Prisma migrations      |
| `pnpm db:push`     | Push schema ke database         |
| `pnpm db:studio`   | Buka Prisma Studio              |
| `pnpm db:seed`     | Seed database dengan data awal  |

## Struktur Proyek

```
src/
├── app/                        # Next.js App Router
│   ├── login/                  # Halaman login
│   ├── register/               # Halaman registrasi
│   ├── (dashboard)/            # Halaman pengunjung (route group)
│   │   ├── tickets/            # Kelola tiket
│   │   │   ├── new/            # Buat tiket baru
│   │   │   └── [id]/           # Detail tiket + feedback
│   │   └── schedule/           # Lihat jadwal operator
│   ├── operator/               # Halaman operator
│   │   ├── dashboard/          # Dashboard operator
│   │   ├── queue/              # Proses antrian
│   │   └── tickets/            # Riwayat layanan
│   ├── admin/                  # Halaman admin
│   └── api/                    # API routes
│       ├── auth/               # Auth endpoints
│       └── tickets/            # Ticket CRUD & actions
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── layout/                 # Layout components
├── lib/                        # Utilities (prisma, auth, utils)
├── generated/prisma/           # Generated Prisma client
└── types/                      # Shared TypeScript types
prisma/
├── schema.prisma               # Database schema
└── seed.ts                     # Seed data
```

## Data Model

- **User** — Pengunjung, operator, dan admin (roles: VISITOR, OPERATOR, ADMIN)
- **Ticket** — Tiket layanan dengan nomor antrian, QR code, dan status tracking (PENDING → ON_PROCESS → DONE)
- **Feedback** — Rating (1-5) dan komentar per tiket yang selesai
- **OperatorSchedule** — Jadwal tugas operator harian

## API Routes

| Method | Endpoint                     | Deskripsi                   |
| ------ | ---------------------------- | --------------------------- |
| POST   | `/api/auth/register`         | Registrasi akun baru        |
| POST   | `/api/tickets`               | Buat tiket layanan          |
| PATCH  | `/api/tickets/[id]/start`    | Operator mulai proses tiket |
| PATCH  | `/api/tickets/[id]/complete` | Operator selesaikan tiket   |

## Alur Penggunaan

1. **Pengunjung** mendaftar atau login
2. **Pengunjung** membuat tiket layanan — pilih jenis layanan, tanggal, dan jam kunjungan
3. Sistem generate nomor tiket (contoh: `KS-20260210-001`) dan QR code
4. **Operator** melihat daftar antrian hari ini di halaman Antrian Layanan
5. **Operator** klik "Mulai Layani" untuk memproses tiket
6. **Operator** klik "Selesaikan Layanan" setelah selesai
7. **Pengunjung** dapat memberikan feedback dan rating

## License

&copy; 2026 BPS Provinsi Kalimantan Utara. All rights reserved.
