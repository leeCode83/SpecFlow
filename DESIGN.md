---
# Design System Tokens
# Built for a technical, developer-centric workspace with an atmospheric dark mode.

tokens:
  colors:
    background:
      main: "oklch(0.145 0 0)" # Deep black/slate base
      surface: "oklch(0.205 0 0)" # Secondary slate depth
      elevated: "rgba(15, 23, 42, 0.4)" # Translucent glass background
    primary:
      main: "#f97316" # Brand Orange-500
      hover: "#ea580c" # Brand Orange-600
      muted: "rgba(249, 115, 22, 0.1)" # Faint brand highlight
    text:
      primary: "#f8fafc" # High-contrast white/slate-50
      secondary: "#94a3b8" # Accessible slate-400
      muted: "#64748b" # De-emphasized slate-500
    border:
      default: "rgba(255, 255, 255, 0.1)" # Soft hairline border
      subtle: "#1e293b" # Low-contrast slate-800
    accents:
      success: "#10b981" # Emerald-500
      info: "#3b82f6" # Blue-500
      error: "#ef4444" # Red-500

  typography:
    family:
      sans: "'Geist Variable', 'Inter', system-ui, sans-serif"
      mono: "'JetBrains Mono', 'Fira Code', monospace"
    weights:
      normal: 400
      medium: 500
      bold: 700
    leading:
      tight: 1.25
      relaxed: 1.625

  radii:
    base: "0.625rem" # 10px standard
    md: "0.5rem"
    lg: "0.625rem"
    xl: "0.875rem"
    "2xl": "1.125rem"
    "3xl": "1.375rem"

  spacing:
    scale: 4 # Base 4px multiplier
    container:
      padding: "2rem" # standard page padding
      gap: "2rem" # grid/stack gap

  motion:
    duration:
      quick: "150ms"
      standard: "250ms"
    easing:
      out: "cubic-bezier(0, 0, 0.2, 1)"

---

# UI Design Philosophy: The Creator's Workspace

The visual identity of this application is modeled after high-end developer tools and creative studios. It prioritizes **clarity, technical precision, and focused immersion**.

## Aesthetic Pillars

### 1. Atmospheric Depth
The interface avoids flat colors in favor of "layered" dark surfaces. Backgrounds are deep and opaque, while interactive cards and panels use subtle transparency (`bg-slate-900/40`) to create a sense of vertical stacking. Highlights and shadow-inner effects inside icon containers give the UI a tactile, precision-machined feel.

### 2. High-Affordance Accents
In a sea of dark slate, **Orange-500** acts as the primary "light source." It is reserved for high-value actions (New Project, Create Spec, Primary CTAs), guiding the user's eye naturally toward progress. Secondary status indicators use a broad but muted spectrum (Emerald for success, Red for destruction) to communicate state without overwhelming the minimalist palette.

### 3. Precise Geometry
Layouts are built on a strict, predictable grid. Borders are hairline (`1px`) and often use translucent whites to glisten against the dark background. Corner radii are generous but intentional—smaller for nested elements and progressively larger for primary containers (`1.375rem` for logs and file lists), creating a "nesting box" hierarchy that feels organized and structural.

### 4. Technical Typography
The choice of **Geist** provides a clean, modern sans-serif look with exceptional legibility for technical data. Monospaced accents (ID strings, timestamps) use small font sizes (`9px-10px`) and uppercase tracking to reinforce the "pro tool" aesthetic without cluttering the screen.

## Interaction Language
- **Soft Entrances:** Components fade and slide into place using `motion`, preventing jarring layout shifts during data loading.
- **Micro-Feedback:** Hover states are subtle but clear—borders brighten and backgrounds gain 20% more opacity.
- **Visual Rhythm:** Distinctive spacing between sections (`space-y-8`) prevents the dense information architecture from feeling cramped.
