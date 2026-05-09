# IdeaFrame

## 1. Deskripsi Singkat Mengenai Projek
IdeaFrame adalah ruang kerja (workspace) ideasi dan pengembangan berbasis spesifikasi (spec-driven development) yang ditenagai oleh AI. Platform ini dibangun khusus untuk mempercepat proses dari sekadar ide mentah menjadi rencana spesifikasi perangkat lunak yang berstruktur.

## 2. Target User Dari Projek Ini
Projek ini ditargetkan untuk:
- **Founders & Indie Hackers**: Yang ingin merencanakan dan memvalidasi ide produk mereka secara teknis dengan cepat.
- **Hackathon Participants**: Yang memiliki waktu terbatas dan butuh kerangka kerja terstruktur untuk kolaborasi tim dan eksekusi cepat.
- **Developers & Software Engineers**: Yang ingin memecah ide besar menjadi komponen yang manageable dan terstruktur (Frontend/Backend specs).
- **Product Managers**: Yang perlu menulis spesifikasi teknis (PRD/Technical Specs) dengan bantuan asisten yang mengerti arsitektur pengembangan perangkat lunak.

## 3. Masalah Yang Mau Di-solve Oleh Project Ini
Memulai sebuah projek perangkat lunak seringkali tidak terstruktur. Ide-ide tersebar di berbagai dokumen, desain, dan obrolan, membuat arsitektur teknis menjadi ambigu. Hal ini menimbulkan "guesswork" saat developer mulai coding, yang berujung pada refactoring bertele-tele atau "technical debt". 
IdeaFrame memecahkan masalah tersebut dengan menjembatani proses *brainstorming* melalui AI dan langsung mengkonversinya menjadi *Actionable Blueprint/Specification* (Frontend spec, Backend API spec) dalam satu alur kerja yang menyatu.

## 4. Fitur Utama Yang Ada di Projek Ini
- **AI Ideation Workshop**: Obrolan asisten AI yang dapat mempertajam ide kasar menjadi satu kalimat elevator pitch, roadmap fitur, dan penentuan target pengguna.
- **Structured Blueprints (RAG-powered)**: Generator spesifikasi teknis otomatis yang mengumpulkan riwayat obrolan dan dokumen spec lama menggunakan pencarian Vector Embeddings (RAG) untuk menghasilkan struktur yang konsisten.
- **Project Workspace**: Dashboard manajemen projek tempat pengguna menyimpan semua spec, dokumen, aset gambar, dan tautan repositori (GitHub) projek mereka.
- **Iterative Refinement**: Kemampuan untuk memperbarui spec secara inkremental dan iteratif yang dipandu konsultan AI.

## 5. Direktori File Yang Ada di Projek Ini dan Penjelasan Singkatnya
- `/components`: Kumpulan komponen React UI, dipisah berdasar halaman dan fungsi, seperti `IdeationPage.tsx`, `Workspace.tsx`, dll. Terdapat subfolder `/ui` untuk komponen dasar UI dari shadcn/ui.
- `/server`: Folder berisi logika backend server, mencakup layer architecture: controller (`geminiController.ts`), services (`geminiService.ts`), dan routing (`geminiRoutes.ts`).
- `/lib`: Helper functions & utilities, termasuk utilitas Supabase (`supabase.ts`), integrasi algoritma RAG, dan definisi TypeScript interface model (`types.ts`).
- `/constants`: File konstan seperti prompt instruksi AI (`AI-BRIEF.ts`) dan template spesifikasi.
- `/tests`: File unit test implementasi backend menggunakan framework testing Vitest.
- `/migrations`: Berisi file SQL untuk inisialisasi tabel, indeks, ekstens pgvector, dan Row Level Security (RLS) policy di Supabase.
- `server.ts`: Entry point Node.js/Express.js backend server. Terintegrasi dengan Vite middleware untuk menangani frontend di mode development maupun menyajikan build production static di environment production.
- `App.tsx` & `main.tsx`: File root index dan konfigurasi utama untuk React SPA.

## 6. Skema Table Database Yang Digunakan
Aplikasi ini menggunakan PostgreSQL database dan ekstensi `pgvector` melalui provider Supabase:

**Table: `projects`**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key *auth.users*)
- `title` (Text)
- `description` (Text)
- `mode` (Text)
- `refined_idea_json` (JSONB)
- `created_at` (Timestamp with timezone)

**Table: `specs`**
- `id` (UUID, Primary Key)
- `project_id` (UUID, Foreign Key *projects*, On Delete Cascade)
- `title` (Text)
- `type` (Text)
- `content` (Text)
- `status` (Text, default 'draft')
- `embedding` (Vector 768 dimensi dari model Embeddings Gemini)
- `created_at` (Timestamp with timezone)

*Semua entri dilindungi menggunakan Row Level Security (RLS) policies sehingga user hanya dapat membaca, menambah, mengubah, dan menghapus dokumen dari project mereka sendiri.*

## 7. Tutorial Untuk Menjalankan Projek Ini di Local Secara Mandiri

### Prasyarat:
1. Node.js (v18+ direkomendasikan)
2. Akun Supabase, buat project baru dan eksekusi file SQL di folder `/migrations` pada SQL Editor.
3. Akun Google Gemini API Key.

### Langkah-langkah Menjalankan Projek:
1. **Clone repositori dan masuk ke direktori projek**
   ```bash
   git clone <repo-url>
   cd <project-folder>
   ```

2. **Install Dependensi NPM**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Database & API Keys**
   Salin dari `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```
   Lalu isi variabel tersebut sesuai kredensial Anda, seperti:
   ```env
   VITE_SUPABASE_URL=https://<your-project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   GEMINI_API_KEY=<your-gemini-api-key>
   ```

4. **Jalankan Aplikasi (Development Mode)**
   Aplikasi akan menjalankan frontend client dan backend Node server secara bersamaan.
   ```bash
   npm run dev
   ```
   Setelah jalan, akses `http://localhost:3000` di browser komputer Anda.

5. **Jalankan Unit Test (Opsional)**
   Bila ingin mengeksekusi testing pada servis yang digunakan di projek ini:
   ```bash
   npm run test
   ```

6. **Build for Production (Opsional)**
   Perintah untuk melakukan build static asset frontend dan di-serve dari backend saat production:
   ```bash
   npm run build
   npm run start
   ```