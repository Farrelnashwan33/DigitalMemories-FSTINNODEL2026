# Struktur Folder Asset Resmi INNODEL 2026

Folder ini disusun agar panitia dapat mengganti logo resmi maupun foto latar venue tanpa perlu mengubah logika program:

## 1. Folder `logos/`
- `innodel-2026.png` : Logo resmi INNODEL 2026 (tampil pada Navbar, Hero, dan Footer).
- `fst-ut-bandung.png` : Logo resmi Fakultas Sains dan Teknologi Universitas Terbuka Bandung.
- `ut-official.png` : *(Opsional)* Simpan file logo resmi Universitas Terbuka dengan nama persis `ut-official.png` di dalam folder `logos/`. Komponen logo di Footer akan mendeteksinya secara otomatis dan menggantikan penanda sementara `[LOGO UT]`.

## 2. Folder `venue/`
- `hero-stage.webp` : Foto latar utama pada Hero Section halaman depan.
- `ballroom-ambient.webp` : Foto latar atmosferik pada section Horizontal Photo Experience.
- `hotel-lobby.webp` : Foto pendukung suasana lobi El Hotel Bandung.

## 3. Foto Dokumentasi Galeri
Seluruh foto dokumentasi kegiatan dikelola secara dinamis melalui **Laravel Admin Dashboard** (`/admin`) dan tersimpan otomatis dalam format WebP teroptimasi di `backend/storage/app/public/photos/`.

