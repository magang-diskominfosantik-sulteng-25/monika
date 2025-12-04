# Monika - Sistem Monitoring Indikator Kinerja

**Monika** adalah aplikasi web berbasis Laravel-React yang dirancang untuk memfasilitasi monitoring dan evaluasi pencapaian indikator kinerja di lingkup Organisas Perangkat Daerah Provinsi Sulawesi Tengah. Sistem ini menyediakan dashboard analytics yang komprehensif, manajemen data yang user-friendly, dan fitur pelaporan yang detail.

## Fitur Utama

### 1. Dashboard Analytics
- **Statistik Ringkasan** - Total target, capaian, dan rata-rata persentase
- **Komposisi Indikator** - Distribusi jenis indikator dengan chart
- **Kontribusi OPD** - Ranking 6 OPD dengan kontribusi tertinggi
- **Capaian Terbaru** - Timeline data kinerja yang baru diinput
- **Progress Tracking** - Visual monitoring pencapaian target

### 2. Manajemen Data
- **CRUD Indikator** - Kelola indikator berdasarkan jenis dan kategori
- **Input Capaian** - Interface intuitif untuk input realisasi kinerja
- **Manajemen OPD** - Administrasi data Organisasi Perangkat Daerah
- **Periode Fleksibel** - Pengaturan periode pelaporan yang adaptif
- **Validation System** - Validasi data input yang komprehensif

### 3. Reporting & Export
- **Export Excel** - Download laporan summary dalam format .xlsx
- **Filter Advanced** - Filter berdasarkan periode, OPD, dan jenis indikator
- **Achievement Summary** - Laporan ringkasan pencapaian per periode
- **Detailed Reports** - Analisis mendalam per indikator dan OPD

### 4. User Management
- **Role-based Access** - Kontrol akses berdasarkan peran (Admin, Operator)
- **Authentication** - Login sistem yang aman
- **User Profiles** - Manajemen profil pengguna

## 5. Teknologi & Arsitektur

### 5. Backend Stack
- **Laravel 12.38.1** - PHP framework dengan Eloquent ORM
- **PHP 8.4.12** - Server-side scripting language
- **MySQL** - Relational database management
- **Redis** - Caching dan session storage
- **Queue System** - Background job processing

### 7. Frontend Stack  
- **React 18** - JavaScript library untuk user interface
- **TypeScript** - Type-safe JavaScript development
- **Inertia.js** - Modern monolith SPA framework
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool dan development server

### 8. Additional Tools
- **Composer** - PHP dependency management
- **NPM** - Node.js package management
- **PhpSpreadsheet** - Excel export functionality
- **Laravel Pail** - Real-time log monitoring

## Installation & Setup
### System Requirements
```bash
✅ PHP >= 8.1 with extensions: zip, gd, pdo_mysql
✅ Composer >= 2.0
✅ Node.js >= 16 & NPM
✅ MySQL >= 5.7 atau MariaDB >= 10.3
✅ Git