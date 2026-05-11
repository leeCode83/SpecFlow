# IdeaFrame Database Schema Guide

Dokumen ini menjelaskan struktur database IdeaFrame yang menggunakan Supabase (PostgreSQL) serta panduan cara mengelola skema melalui Dashboard Supabase.

## 1. Arsitektur Database

IdeaFrame menggunakan PostgreSQL dengan ekstensi `pgvector` untuk mendukung fitur pencarian AI (RAG).

### Tabel Utama

#### 1.1 `projects`
Menyimpan informasi proyek utama.
- `id` (uuid): Primary Key.
- `user_id` (uuid): Pemilik proyek (relasi ke `auth.users`).
- `title` (text): Nama proyek.
- `description` (text): Deskripsi singkat proyek.
- `mode` (text): Mode pengembangan (Learning, Hackathon, Startup).
- `github_url` (text): Link repository GitHub.
- `teammates` (text[]): Array email anggota tim.
- `refined_idea_json` (jsonb): Hasil analisis ide awal oleh AI.
- `created_at` (timestamp): Waktu pembuatan.

#### 1.2 `specs`
Dokumen spesifikasi teknis dalam sebuah proyek.
- `id` (uuid): Primary Key.
- `project_id` (uuid): Relasi ke `projects`.
- `title` (text): Judul spesifikasi.
- `type` (text): Tipe spec (Frontend, Backend, Database, dll).
- `content` (text): Isi konten spec dalam format Markdown.
- `status` (text): Status dokumen (draft, final).
- `embedding` (vector(768)): Representasi vektor untuk pencarian RAG.

#### 1.3 `project_files`
Aset digital yang diunggah ke proyek.
- `id` (uuid): Primary Key.
- `project_id` (uuid): Relasi ke `projects`.
- `user_id` (uuid): Pengunggah file.
- `name` (text): Nama asli file.
- `url` (text): Link publik file di Supabase Storage.
- `size` (int8): Ukuran file dalam bytes.
- `type` (text): MIME type file.

#### 1.4 `project_logs`
Riwayat aktivitas di dalam workspace.
- `id` (uuid): Primary Key.
- `project_id` (uuid): Relasi ke `projects`.
- `user_id` (uuid): Pelaku aksi.
- `action` (text): Nama aksi (misal: "Create Spec").
- `details` (jsonb): Data tambahan terkait aksi.

---

## 2. Fitur AI (Vector Search)

Database mendukung pencarian kemiripan konten menggunakan fungsi RPC `match_specs`. Fungsi ini membandingkan `embedding` yang dikirim dari klien dengan `embedding` yang ada di tabel `specs` menggunakan *cosine similarity*.

---

## 3. Tutorial: Menggunakan SQL Editor di Supabase

Jika Anda ingin menjalankan migrasi manual atau melakukan query langsung, ikuti langkah berikut:

### 3.1 Mengakses SQL Editor
1. Buka [Supabase Dashboard](https://supabase.com/dashboard).
2. Pilih proyek Anda.
3. Pada sidebar sebelah kiri, klik ikon **SQL Editor** (ikon terminal `>_`).

### 3.2 Menjalankan Script Migrasi
1. Klik **New Query**.
2. Salin isi file `.sql` dari folder `migrations/` di repository ini.
3. Tempelkan ke dalam editor.
4. Klik tombol **Run** (atau tekan `Cmd/Ctrl + Enter`).
5. Pastikan muncul pesan `Success. No rows returned` atau pesan konfirmasi lainnya.

### 3.3 Tips SQL Editor
- **AI Assistant:** Gunakan fitur "Supabase AI" di dalam SQL Editor untuk membantu membuat query SQL dengan bahasa manusia.
- **Table Editor:** Jika hanya ingin melihat data tanpa menulis SQL, gunakan menu **Table Editor** (ikon tabel).
- **RLS Debugging:** Jika data tidak muncul di aplikasi, periksa **Policies** pada menu **Authentication -> Policies** untuk memastikan Row Level Security sudah diatur dengan benar.
