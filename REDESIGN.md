# REDESIGN: IdeaFrame Webapp — Design System Overhaul

## Overview
Redesign bertahap dari aplikasi IdeaFrame: memperbaiki konsistensi desain, sistem token, animasi, komponen, dan arsitektur layout. Dibagi 3 Tier yang bisa dieksekusi independen.

---

## Tier 1 — Foundation: Design Token Layer

### Goal
Membangun fondasi sistem desain dengan semantic CSS variables, theme provider, dan migrasi dari hardcoded Tailwind utilities ke token semantic.

### Scope
| Item | Detail |
|------|--------|
| **File Utama** | `src/index.css`, `src/App.tsx`, `src/components/ThemeProvider.tsx` |
| **Output** | Semua CSS vars shadcn fix value ke brand, custom token baru (brand, surface, glass, success, warning), ThemeProvider inject `.dark`, App.tsx pakai `bg-background text-foreground` |
| **Hardcoded Refactor** | ±188 matches `slate-*`/`orange-*` diganti token |
| **Constraint** | Zero sentuh logic bisnis. Hanya edit className string literal. |

### Phase
| # | Phase | File | Metrik |
|---|-------|------|--------|
| 1 | Fix CSS vars + custom tokens di `@theme inline` | `src/index.css` | `tsc --noEmit` pass |
| 2 | ThemeProvider + dark class wrapper | `ThemeProvider.tsx`, `App.tsx` | `tsc --noEmit` pass |
| 3 | Batch 1: Card & surface (bg/border/text slate) | 6-8 `.tsx` | `tsc` pass |
| 4 | Batch 2: Brand accents (orange/blue/emerald/purple) | 4-5 `.tsx` | `tsc` pass |
| 5 | Batch 3: Remaining hardcoded colors | all `.tsx` | `tsc` pass |
| 6 | Verification | build + visual smoke test | build pass |

### Acceptance Criteria
- `npx tsc --noEmit` zero errors
- `npm run build` zero errors
- Semua halaman render tanpa color mismatch
- Zero behavioral change

---

## Tier 2 — Polish: Animation & State Consistency

### Goal
Menyempurnakan konsistensi animasi, loading states, dan empty states di seluruh halaman.

### Scope
| Item | Detail |
|------|--------|
| **Halaman** | Dashboard, AllProjects, Workspace, Auth, LandingPage, IdeationPage |
| **Output** | Page entrance animation (stagger fade-up) di tiap halaman, skeleton loading component khusus (brand-aware, glassmorphism), empty states engaging dengan ilustrasi/ikon, micro-interactions konsisten (hover scale, spring) |

### Tasks

#### A. Page Entrance Animation
- Buat reusable `PageTransition` wrapper (`motion.div` dengan fade-up + spring)
- Bungkus konten utama tiap halaman (`Dashboard`, `AllProjects`, `Workspace`, etc.)
- Pakai `pageVariants` dari pattern yang sudah ada di `CreateProject`

#### B. Loading States
- Buat reusable `PageSkeleton` component (glassmorphism `bg-surface` + `animate-pulse` mix)
- Ganti semua `bg-slate-800` hardcoded skeleton dengan `PageSkeleton`
- Konsisten: skeleton mirror ukuran + layout card asli

#### C. Empty States
- Audit `AllProjects` (ProjectEmptyState), `Workspace` (tabs tanpa data), `Dashboard` (belum ada project)
- Buat reusable `EmptyState` component: icon container `bg-brand/10 text-brand`, title, description, optional CTA button
- Animasi masuk: scale + fade

### Acceptance Criteria
- Tiap halaman punya entrance animation (kecuali landing section hero)
- Loading skeleton konsisten secara visual
- Empty state punya ikon + tombol aksi
- `tsc --noEmit` pass

---

## Tier 3 — Advanced: Shell Layout & A11y

### Goal
Menambahkan top navigation / breadcrumb, scroll reveals, custom illustrations, dan accessibility audit.

### Scope
| Item | Detail |
|------|--------|
| **Layout** | Shell pattern (top nav + breadcrumb + sidebar), inspired by Cal.com |
| **Scroll** | Scroll-triggered reveals pada LandingPage sections |
| **Visual** | Custom SVG illustrations (hero, empty states, auth) |
| **A11y** | Contrast audit terutama glassmorphism, keyboard navigation, ARIA labels |

### Tasks

#### A. Shell Layout (Top Nav + Breadcrumb)
- Buat `TopNav` component: brand logo kiri, breadcrumb tengah, action buttons/user avatar kanan
- `ProtectedLayout` jadi dua baris: TopNav + Sidebar
- Breadcrumb otomatis berdasarkan route (`/projects/{id}` → "Projects > Project Name")

#### B. Scroll Reveals
- LandingPage: section demi section fade-up saat scroll ke viewport
- Pakai `useInView` dari `motion/react` + `whileInView`
- Animasi cascade dengan `staggerChildren`

#### C. Custom Illustrations
- Hero section: ilustrasi spesifik (abstract shapes, node graph, atau theme-relevant)
- Empty states: ilustrasi per konteks (no project, no spec, no team)
- Auth page: ilustrasi samping (decorative)

#### D. Accessibility Audit
- Contrast ratio: glassmorphism surfaces dengan white text — minimal 4.5:1
- Keyboard: semua interactive element reachable via Tab
- ARIA: landmark roles, labels untuk icon-only buttons
- Focus ring: visible focus indicator (brand orange)

### Acceptance Criteria
- Top nav + breadcrumb navigable, breadcrumb reflect current route
- Landing sections reveal on scroll
- Illustrations improve visual tanpa degrade performance
- WCAG 2.1 AA minimum (contrast, keyboard, focus)
- `tsc --noEmit` pass

---

## Estimasi Total

| Tier | Fase | Estimasi |
|------|------|----------|
| **Tier 1** | 6 fase | ~110 menit |
| **Tier 2** | 3 tugas | ~90 menit |
| **Tier 3** | 4 tugas | ~120 menit |
| **Total** | | **~320 menit (~5 jam)** |

## Prinsip Pengerjaan
1. **Zero behavioral change** — hanya styling, animasi, dan aksesibilitas
2. **Typecheck wajib** — `npx tsc --noEmit` harus pass tiap fase
3. **Push hanya jika user request**
4. **Executable oleh model murah** — tiap fase self-contained dengan instruksi spesifik
