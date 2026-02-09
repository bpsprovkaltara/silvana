# Product Requirements Document (PRD)

## Silvana - Sistem Manajemen Antrian Layanan Statistik Terpadu

**Versi:** 1.0
**Tanggal:** 9 Februari 2026
**Organisasi:** Unit Pelayanan Statistik Terpadu (PST), BPS Provinsi Kalimantan Utara

---

## 1. Ringkasan Produk

Silvana adalah aplikasi web untuk manajemen pengunjung dan antrian layanan statistik di Unit Pelayanan Statistik Terpadu (PST) BPS Provinsi Kalimantan Utara. Aplikasi ini mendigitalkan proses pendaftaran pengunjung, pembuatan tiket layanan, pengelolaan antrian, serta pengumpulan feedback dari pengunjung.

### 1.1 Tujuan

- Mendigitalkan proses antrian dan layanan statistik di PST BPS
- Mempermudah pengunjung dalam mengakses layanan statistik
- Memberikan transparansi status antrian dan layanan kepada pengunjung
- Mengumpulkan data feedback untuk peningkatan kualitas layanan
- Menyediakan dashboard monitoring bagi operator dan admin

### 1.2 Target Pengguna

| Pengguna             | Deskripsi                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Pengunjung**       | Masyarakat umum yang membutuhkan layanan statistik (PNS, karyawan swasta, wirausahawan, peneliti, mahasiswa, dll.) |
| **Operator Layanan** | Petugas PST yang bertugas melayani pengunjung                                                                      |
| **Admin**            | Pengelola sistem yang mengatur pengguna dan operasional layanan                                                    |

---

## 2. Fitur dan Kebutuhan Fungsional

### 2.1 Modul Autentikasi & Pengguna

#### FR-01: Registrasi Pengunjung

- Pengunjung dapat mendaftar melalui formulir registrasi
- Field yang wajib diisi:
  - Email (unik, format valid)
  - Password (minimal 8 karakter)
  - Nama lengkap
  - Tipe profesi (pilihan):
    - Government Official (Aparatur Pemerintah)
    - Private Employee (Karyawan Swasta)
    - Entrepreneur (Wirausahawan)
    - Researcher (Peneliti)
    - Student (Mahasiswa/Pelajar)
    - Others (Lainnya)
- Sistem melakukan validasi apakah email sudah terdaftar sebelum proses registrasi
- Jika sudah terdaftar, sistem mengarahkan pengunjung untuk login

#### FR-02: Login

- Pengunjung yang sudah terdaftar dapat login menggunakan email dan password
- Sistem mengembalikan token autentikasi (JWT) setelah login berhasil
- Redirect berdasarkan role setelah login

#### FR-03: Manajemen Role

Terdapat 3 role dalam sistem:

| Role           | Akses                                               |
| -------------- | --------------------------------------------------- |
| **Pengunjung** | Membuat tiket, melihat antrian, memberikan feedback |
| **Operator**   | Memproses tiket, memulai/mengakhiri layanan         |
| **Admin**      | CRUD pengguna, mengelola operator, mengatur jadwal  |

#### FR-04: Manajemen Pengguna (Admin)

- Admin dapat melihat daftar seluruh pengguna (dengan pagination & search)
- Admin dapat menambah pengguna baru
- Admin dapat mengedit data pengguna
- Admin dapat menghapus/menonaktifkan pengguna
- Admin dapat menambahkan akun operator layanan

#### FR-05: Manajemen Jadwal Operator (Admin)

- Admin dapat membuat jadwal jaga operator di setiap hari kerja (Senin-Jumat)
- Sistem dapat men-generate jadwal secara otomatis berdasarkan daftar operator yang tersedia
- Admin dapat mengedit jadwal yang sudah di-generate
- Jadwal menampilkan nama operator yang bertugas per hari

---

### 2.2 Modul Ticketing & Antrian

#### FR-06: Pembuatan Tiket Layanan

- Pengunjung terdaftar dapat membuat tiket permohonan layanan
- Jenis layanan yang tersedia:
  - **Konsultasi Statistik** - konsultasi terkait data dan metodologi statistik
  - **Penjualan Data Mikro** - pembelian data mikro hasil survei/sensus
  - **Perpustakaan Statistik** - akses koleksi perpustakaan dan publikasi
  - **Rekomendasi Kegiatan Statistik** - rekomendasi untuk pelaksanaan kegiatan statistik sektoral
- Pengunjung memilih jadwal kunjungan offline (tanggal dan jam) ke ruang PST BPS
- Sistem menghasilkan nomor antrian secara otomatis (format: `[KODE_LAYANAN]-[NOMOR_URUT]`, contoh: `KS-001`)
- Sistem mencatat waktu pembuatan tiket

#### FR-07: Tiket & QR Code

- Setiap tiket yang dibuat menghasilkan QR Code/barcode unik
- QR Code digunakan operator untuk memulai proses layanan (scan)
- Pengunjung dapat melihat dan menyimpan QR Code tiket

#### FR-08: Status Tiket

Alur status tiket:

```
[Pending] --operator mulai--> [On Process] --operator selesai--> [Done]
[Pending] --pengunjung batal--> [Cancelled]
```

| Status         | Deskripsi                             |
| -------------- | ------------------------------------- |
| **Pending**    | Tiket sudah dibuat, menunggu dilayani |
| **On Process** | Layanan sedang berlangsung            |
| **Done**       | Layanan selesai                       |
| **Cancelled**  | Tiket dibatalkan oleh pengunjung      |

#### FR-09: Informasi Antrian Pengunjung

- Pengunjung dapat melihat:
  - Nomor antrian sendiri
  - Waktu pembuatan tiket
  - Status tiket saat ini
  - Estimasi posisi antrian (jumlah antrian di depan)
  - Operator yang sedang bertugas hari ini

#### FR-10: Pembatalan Tiket

- Pengunjung dapat membatalkan tiket yang berstatus **Pending**
- Tiket yang sudah **On Process** atau **Done** tidak dapat dibatalkan

#### FR-11: Proses Layanan oleh Operator

- Operator dapat melihat daftar tiket yang masuk (queue)
- Operator dapat memulai layanan dengan dua cara:
  - Klik tombol **"Mulai"** pada tiket di daftar antrian
  - **Scan QR Code/barcode** tiket pengunjung (direkomendasikan untuk kunjungan offline)
- Operator dapat mengakhiri layanan dengan klik tombol **"Selesai"**
- Sistem mencatat waktu mulai dan waktu selesai layanan

#### FR-12: Rating & Feedback

- Setelah tiket berstatus **Done**, pengunjung dapat memberikan:
  - Rating (skala 1-5)
  - Komentar/feedback (opsional, teks bebas)
- Rating hanya dapat diberikan satu kali per tiket
- Data feedback digunakan untuk evaluasi kualitas layanan

#### FR-13: Daftar Tiket (Operator & Admin)

- Halaman yang menampilkan seluruh daftar tiket
- Filter berdasarkan: status, jenis layanan, tanggal
- Pencarian berdasarkan nama pengunjung atau nomor tiket
- Sorting berdasarkan waktu pembuatan atau nomor antrian

---

## 3. Kebutuhan Non-Fungsional

### 3.1 Performa

- Halaman harus dimuat dalam waktu < 3 detik
- Sistem mampu menangani minimal 100 pengguna secara bersamaan

### 3.2 Keamanan

- Password di-hash menggunakan bcrypt
- Autentikasi menggunakan JWT dengan expiry time
- Role-based access control (RBAC) pada setiap endpoint
- Validasi input pada sisi client dan server
- Proteksi terhadap SQL Injection, XSS, dan CSRF

### 3.3 Responsivitas

- Aplikasi responsif untuk desktop dan mobile
- Pengunjung kemungkinan besar mengakses via smartphone

### 3.4 Ketersediaan

- Sistem beroperasi pada jam kerja BPS (Senin-Jumat, 08:00-16:00 WITA)
- Target uptime 99% pada jam operasional

---

## 4. Data Model

### 4.1 Entity Utama

```
User
├── id (PK)
├── email (unique)
├── password (hashed)
├── name
├── profession_type (enum)
├── role (enum: visitor, operator, admin)
├── is_active (boolean)
├── created_at
└── updated_at

Ticket
├── id (PK)
├── ticket_number (unique, generated)
├── user_id (FK -> User)
├── operator_id (FK -> User, nullable)
├── service_type (enum)
├── status (enum: pending, on_process, done, cancelled)
├── scheduled_date (date)
├── scheduled_time (time)
├── qr_code (string)
├── queue_number (integer)
├── started_at (timestamp, nullable)
├── completed_at (timestamp, nullable)
├── created_at
└── updated_at

Feedback
├── id (PK)
├── ticket_id (FK -> Ticket, unique)
├── user_id (FK -> User)
├── rating (integer, 1-5)
├── comment (text, nullable)
├── created_at
└── updated_at

OperatorSchedule
├── id (PK)
├── operator_id (FK -> User)
├── schedule_date (date)
├── created_at
└── updated_at
```

### 4.2 Enum Values

```
ProfessionType: government_official, private_employee, entrepreneur,
                researcher, student, others

ServiceType: konsultasi_statistik, penjualan_data_mikro,
             perpustakaan_statistik, rekomendasi_kegiatan_statistik

TicketStatus: pending, on_process, done, cancelled

UserRole: visitor, operator, admin
```

---

## 5. Halaman & User Flow

### 5.1 Halaman Publik

| Halaman     | Deskripsi                          |
| ----------- | ---------------------------------- |
| `/login`    | Halaman login                      |
| `/register` | Halaman registrasi pengunjung baru |

### 5.2 Halaman Pengunjung

| Halaman                 | Deskripsi                                    |
| ----------------------- | -------------------------------------------- |
| `/dashboard`            | Dashboard pengunjung - ringkasan tiket aktif |
| `/tickets/new`          | Form pembuatan tiket baru                    |
| `/tickets`              | Daftar tiket milik pengunjung                |
| `/tickets/:id`          | Detail tiket (status, QR code, info antrian) |
| `/tickets/:id/feedback` | Form rating & feedback                       |
| `/schedule`             | Lihat jadwal operator yang bertugas          |

### 5.3 Halaman Operator

| Halaman               | Deskripsi                                            |
| --------------------- | ---------------------------------------------------- |
| `/operator/dashboard` | Dashboard operator - antrian hari ini                |
| `/operator/queue`     | Daftar antrian tiket (dengan tombol Mulai & scan QR) |
| `/operator/tickets`   | Riwayat tiket yang sudah dilayani                    |

### 5.4 Halaman Admin

| Halaman            | Deskripsi                           |
| ------------------ | ----------------------------------- |
| `/admin/dashboard` | Dashboard admin - statistik layanan |
| `/admin/users`     | Manajemen pengguna (CRUD)           |
| `/admin/operators` | Manajemen operator                  |
| `/admin/schedules` | Manajemen jadwal operator           |
| `/admin/tickets`   | Daftar seluruh tiket (semua status) |
| `/admin/feedback`  | Rekapitulasi rating & feedback      |

---

## 6. Tech Stack (Rekomendasi)

| Layer           | Teknologi                                           |
| --------------- | --------------------------------------------------- |
| **Frontend**    | Next.js (App Router) + TypeScript                   |
| **Styling**     | Tailwind CSS + shadcn/ui                            |
| **Backend**     | Next.js API Routes (Route Handlers)                 |
| **Database**    | PostgreSQL                                          |
| **ORM**         | Prisma                                              |
| **Autentikasi** | NextAuth.js (Auth.js) dengan Credentials Provider   |
| **QR Code**     | `qrcode` library (generate) + `html5-qrcode` (scan) |
| **Deployment**  | Vercel / VPS                                        |

---

## 7. Milestone & Prioritas

### Phase 1 - Foundation (MVP)

- [x] Setup project & database
- [ ] Modul autentikasi (registrasi, login, role management)
- [ ] CRUD pengguna oleh admin
- [ ] Pembuatan tiket layanan dasar
- [ ] Daftar antrian & status tiket

### Phase 2 - Core Features

- [ ] QR Code pada tiket
- [ ] Scan QR Code oleh operator
- [ ] Proses layanan (mulai & selesai)
- [ ] Manajemen jadwal operator
- [ ] Pembatalan tiket

### Phase 3 - Enhancement

- [ ] Rating & feedback
- [ ] Dashboard statistik admin
- [ ] Notifikasi (email/push) untuk update status tiket
- [ ] Export data laporan layanan

---

## 8. Acceptance Criteria (Ringkasan)

1. Pengunjung dapat registrasi, login, dan membuat tiket layanan
2. Setiap tiket memiliki nomor antrian unik dan QR Code
3. Operator dapat memproses tiket via tombol atau scan QR Code
4. Status tiket berubah sesuai alur: Pending -> On Process -> Done
5. Pengunjung dapat melihat posisi antrian dan status tiket secara real-time
6. Pengunjung dapat memberikan rating setelah layanan selesai
7. Admin dapat mengelola pengguna dan jadwal operator
8. Semua endpoint dilindungi dengan autentikasi dan otorisasi berbasis role
