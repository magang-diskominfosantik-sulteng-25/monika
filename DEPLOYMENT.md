# Panduan Deployment Monika Ril

Dokumen ini menjelaskan langkah-langkah untuk men-deploy aplikasi Monika Ril ke server production (VPS/Linux).

## Persyaratan Server

Pastikan server Anda memiliki:
- **PHP** >= 8.2
- **Composer**
- **Node.js** & **NPM** (untuk build frontend)
- **Database** (MySQL/MariaDB)
- **Web Server** (Nginx atau Apache)
- **Supervisor** (untuk Queue Worker)

## Langkah-langkah Deployment

### 1. Clone Repository
Clone repository ke folder web server (misalnya `/var/www/monika-ril`).

```bash
cd /var/www
git clone https://github.com/username/monika-ril.git
cd monika-ril
```

### 2. Konfigurasi Environment
Salin file `.env.production.example` ke `.env` dan sesuaikan isinya.

```bash
cp .env.production.example .env
nano .env
```

Pastikan untuk mengatur:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL` (sesuai domain Anda)
- Database credentials (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`)

### 3. Install Dependencies
Install dependensi PHP dan Node.js.

```bash
# Install PHP dependencies (tanpa dev dependencies untuk production)
composer install --optimize-autoloader --no-dev

# Install Node.js dependencies
npm install
```

### 4. Generate App Key
Jika ini adalah instalasi pertama:

```bash
php artisan key:generate
```

### 5. Build Frontend
Compile aset frontend (React/Inertia) untuk production.

```bash
npm run build
```

### 6. Setup Database
Jalankan migrasi database.

```bash
php artisan migrate --force
```
*Opsional: Jika perlu data awal, jalankan seeder:*
```bash
php artisan db:seed --force
```

### 7. Storage Linking
Buat symbolic link untuk storage agar file publik bisa diakses.

```bash
php artisan storage:link
```

### 8. Optimasi
Cache konfigurasi, route, dan view untuk performa yang lebih baik.

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 9. Konfigurasi Web Server (Nginx)
Gunakan contoh konfigurasi di `nginx.conf.example`. Sesuaikan `server_name` dan path `root`.

Pastikan permission folder `storage` dan `bootstrap/cache` dapat ditulis oleh web server (misalnya `www-data`).

```bash
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### 10. Setup Queue Worker (Supervisor)
Aplikasi ini menggunakan Queue untuk proses latar belakang. Install Supervisor dan buat konfigurasi baru di `/etc/supervisor/conf.d/monika-worker.conf`:

```ini
[program:monika-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/monika-ril/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/monika-ril/storage/logs/worker.log
stopwaitsecs=3600
```

Lalu jalankan:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start monika-worker:*
```

### 11. Setup Scheduler (Cron)
Tambahkan entry berikut ke crontab user web server (`crontab -e -u www-data`):

```cron
* * * * * cd /var/www/monika-ril && php artisan schedule:run >> /dev/null 2>&1
```

## Update Aplikasi
Untuk mengupdate aplikasi di kemudian hari:

```bash
cd /var/www/monika-ril
git pull origin main
composer install --optimize-autoloader --no-dev
npm install
npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart
```
