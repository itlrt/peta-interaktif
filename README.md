# Peta Interaktif LRT Jabodebek

Aplikasi web yang menampilkan peta interaktif dari jalur dan stasiun LRT Jabodebek beserta integrasi transportasi lainnya.

## Fitur Utama

- **Peta Interaktif**: Visualisasi stasiun LRT dengan marker dan pop-up informasi
- **Geolokasi**: Deteksi lokasi pengguna dan temukan stasiun terdekat
- **Integrasi Transportasi**: Informasi tentang moda transportasi yang terintegrasi dengan setiap stasiun
- **Pencarian Rute**: Temukan rute dari stasiun ke destinasi dengan berbagai moda transportasi (jalan kaki, motor, mobil)
- **Sidebar Informatif**: Daftar stasiun dan destinasi dengan informasi detail
- **Dashboard Admin**: Pengelolaan data stasiun, destinasi, dan transportasi

## Teknologi yang Digunakan

- **Frontend**: Next.js 14, TailwindCSS, ShadcnUI
- **Peta**: Leaflet, React-Leaflet
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM
- **Routing Engine**: Valhalla

## Cara Memulai

### Prasyarat
- Node.js 18+
- npm atau yarn
- Database (PostgreSQL/MySQL/SQLite)

### Langkah Instalasi

1. Clone repositori ini:
   ```bash
   git clone https://github.com/username/peta-interaktif.git
   cd peta-interaktif
   ```

2. Instal dependensi:
   ```bash
   npm install
   # atau
   yarn install
   ```

3. Siapkan file .env:
   ```
   DATABASE_URL="your-database-connection-string"
   ```

4. Jalankan migrasi database:
   ```bash
   npx prisma migrate dev
   ```

5. Jalankan server pengembangan:
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

6. Buka [http://localhost:3000](http://localhost:3000) di browser Anda

## Struktur Folder

- `app/`: Komponen halaman Next.js dan API routes
- `components/`: Komponen UI yang dapat digunakan kembali
- `lib/`: Utilitas dan kode pembantu
- `prisma/`: Skema database dan migrasi
- `public/`: Aset statis (gambar, ikon)

## Deployment

Proyek ini dapat di-deploy menggunakan [Vercel](https://vercel.com) atau platform hosting lainnya yang mendukung Next.js.
