---
name: Farmblossom Natural OS
colors:
  surface: '#fff8f5'
  surface-dim: '#e1d8d4'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2ed'
  surface-container: '#f5ece7'
  surface-container-high: '#efe6e2'
  surface-container-highest: '#e9e1dc'
  on-surface: '#1e1b18'
  on-surface-variant: '#434840'
  inverse-surface: '#34302c'
  inverse-on-surface: '#f8efea'
  outline: '#74796f'
  outline-variant: '#c3c8be'
  surface-tint: '#4c6546'
  primary: '#4a6243'
  on-primary: '#ffffff'
  primary-container: '#627b5a'
  on-primary-container: '#f8fff0'
  inverse-primary: '#b2cea8'
  secondary: '#745947'
  on-secondary: '#ffffff'
  secondary-container: '#fed8c2'
  on-secondary-container: '#795d4b'
  tertiary: '#6e5469'
  on-tertiary: '#ffffff'
  tertiary-container: '#886c83'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ceebc3'
  primary-fixed-dim: '#b2cea8'
  on-primary-fixed: '#0a2008'
  on-primary-fixed-variant: '#354d30'
  secondary-fixed: '#ffdcc7'
  secondary-fixed-dim: '#e3bfaa'
  on-secondary-fixed: '#2a170a'
  on-secondary-fixed-variant: '#5a4131'
  tertiary-fixed: '#fbd8f3'
  tertiary-fixed-dim: '#debdd6'
  on-tertiary-fixed: '#291427'
  on-tertiary-fixed-variant: '#583f54'
  background: '#fff8f5'
  on-background: '#1e1b18'
  surface-variant: '#e9e1dc'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 19px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a warm, artisanal, yet operationally rigorous identity for agricultural enterprise and conscious commerce. It bridges the sensory authenticity of the earth with the crisp precision required of modern operational software. The visual language rejects clinical, hyper-efficient corporate templates in favor of an organic harvest aesthetic—calm, tactile, and grounded.

### Personality & Tone
- **Cultivated & Earthbound:** Rooted in botanical and soil-rich tones, conveying craftsmanship, vitality, and seasonality without falling into rustic clutter.
- **Thoughtful & Serene:** Generous negative space, intentional hierarchy, and unhurried visual pacing.
- **Operational Clarity:** High legibility, dignified typographic weights, and uncluttered data visualization that respect the user’s mental bandwidth.

### Design Movement
**Warm Organic Minimalism:** A hybrid of Scandinavian editorial composition and Japanese agricultural packaging. The system relies on soft tactile surfaces, subtle tonal differentiation over aggressive elevation, hairline natural borders, and breathing room.

## Colors

The palette is derived directly from fertile land, foliage, heirloom harvests, and unbleached cotton. High saturation is avoided to reduce ocular fatigue during long inventory and dispatch shifts.

### Palette Architecture
- **Primary (`#718B69` - Sage Foliage):** The principal action color. Used for primary buttons, completed progress states, verified badges, and focused active indicators.
- **Secondary (`#705544` - Loam Brown):** Used for structural contrast, anchors, categorical tags, dark accents, and earthy brand markers.
- **Tertiary (`#92758C` - Heirloom Sweet Potato):** A muted floral-vinous accent reserved for alerts, seasonal highlights, critical stock notices, and subtle micro-engagements.
- **Surface & Background (`#FAF7F0` - Ivory Canvas):** The foundational base canvas across web views and operational consoles.
- **Surface Container (`#EEE4D3` - Cream Beige):** Applied to card backdrops, table headers, drawer sidebars, and elevated structural regions.
- **Neutral Foreground (`#2C2825` - Raw Charcoal):** The high-contrast baseline for headings, primary text, and dense data points. Never pure `#000000`.
- **Muted Foreground (`#68615A` - Weathered Bark):** Secondary metadata, timestamps, units of measure, and inactive states.
- **Structural Border (`#E6DFD5` - Pressed Linen):** Used for low-contrast division and surface containment.

## Typography

The typographic hierarchy prioritizes organic cadence and effortless legibility. When deployed in CJK environments (such as Korean), `Plus Jakarta Sans` pairs seamlessly with Pretendard or Noto Sans KR fallback stacks while preserving matching metrics.

### Typographic Principles
- **Unhurried Line Heights:** Body copy defaults to a generous `1.6` line-height ratio (`26px` on `16px` base) to avoid dense developer-tool clustering.
- **Editorial Headings:** Large display titles take tight letter-spacing (`-0.02em`) to maintain composure and cohesive brand presence.
- **Label Precision:** Operational data, status badges, and column metrics employ `label-sm` and `label-md` with slight letter-spacing for rapid scannability without feeling clinical.

## Layout & Spacing

The layout model favors expansive framing, rejecting high-density dashboard paradigms. Information is chunked into logical, well-padded clusters to honor the natural, grounded theme.

### Grid & Canvas Structure
- **Desktop (1280px+):** 12-column fluid grid inside a 1440px maximum content shell. Outer margins set to `margin` (`3rem` / 48px), column gutters set to `gutter` (`1.5rem` / 24px).
- **Tablet (768px - 1279px):** 8-column fluid grid with `2rem` margins and `1rem` gutters.
- **Mobile (< 768px):** 4-column responsive grid with `1.25rem` outer margins and `1rem` gutters.

### Reflow & Spacing Rhythm
- **Breathing Enclosures:** Section containers utilize `space-xl` (`2.5rem`) vertical stacking.
- **Admin Views:** Professional operational tools preserve white space by leveraging multi-pane views with distinct panels rather than shrinking font sizes and table row heights.

## Elevation & Depth

Visual hierarchy is built primarily through tonal layering and organic warmth rather than synthetic grey drop shadows.

### Elevation Levels
- **Level 0 (Flat Base):** Canvas background `#FAF7F0`.
- **Level 1 (Subtle Inset / Base Container):** `#EEE4D3` surface tint with a 1px border of `#E6DFD5`. No box shadow. Used for table backgrounds, filter bars, and card containers.
- **Level 2 (Lifted Card / Interactive Element):** Background `#FAF7F0` or `#FFFFFF` resting over a `#EEE4D3` container. Box shadow: `0 4px 16px -2px rgba(112, 85, 68, 0.06), 0 2px 6px -1px rgba(112, 85, 68, 0.04)`.
- **Level 3 (Modal / Floating Sheet):** Background `#FAF7F0` with border `#E6DFD5`. Box shadow: `0 16px 36px -4px rgba(44, 40, 37, 0.10), 0 6px 14px -2px rgba(112, 85, 68, 0.06)`.

Shadows are exclusively cast with a low-opacity warm tint (`rgba(112, 85, 68, ...)`), mimicking natural sunlight hitting loam and organic surfaces.

## Shapes

The shape system employs an organic curve geometry (`roundedness: 2`), delivering soft corners that reflect organic produce and smoothed river stones without adopting childish bubble forms.

### Corner Token Rules
- **Standard Controls (Inputs, Buttons, Badges):** 0.5rem (8px).
- **Surface Cards & Modular Panels (`rounded-lg`):** 1.0rem (16px).
- **Hero Containers, Modals & Floating Trays (`rounded-xl`):** 1.5rem (24px).
- **Pills:** Full rounded caps (`9999px`) are applied exclusively to status chips, category pills, and tag counters.

## Components

### Buttons
- **Primary:** Solid `#718B69` background with `#FAF7F0` text. Border radius `8px`. Padding: `12px 24px`. Hover state shifts to `#5F7658`. Focus ring: 2px offset with `#718B69`.
- **Secondary / Earth:** `#705544` fill with `#FAF7F0` text for foundational transactional flows (e.g., "Confirm Harvest Batch").
- **Outline / Subtle:** Background `#FAF7F0` with 1px border in `#E6DFD5` and `#2C2825` text. Hover shifts background to `#EEE4D3`.

### Chips & Badges
- **Status (In Stock / Optimal):** Soft `#718B69` at 15% opacity with solid `#718B69` text.
- **Accent (Special Batch / Reserved):** Soft `#92758C` at 15% opacity with solid `#92758C` text.
- **Harvest Metadata Chip:** Height 28px, background `#EEE4D3`, text `#705544`, radius `9999px`, font `label-sm`.

### Input Fields & Controls
- **Inputs:** Background `#FAF7F0`, border 1px solid `#E6DFD5`, radius 8px, text `#2C2825`. Placeholder `#68615A`. Focus border shifts to `#718B69` with an ambient glow of `rgba(113, 139, 105, 0.20)`.
- **Checkboxes & Radios:** 20px custom indicators. Unchecked has border 1.5px solid `#E6DFD5` over `#FAF7F0`. Checked states use `#718B69` fill with crisp ivory check marks.

### Cards & Panels
- **Editorial Card:** `#FAF7F0` surface with 1px `#E6DFD5` border, Level 2 warm shadow, 24px internal padding (`space-lg`), header using `title-lg`.
- **Operational Admin Data Cell:** Grouped inside a `#EEE4D3` container. Row height 52px minimum, border-bottom 1px solid `#E6DFD5`, text `#2C2825`, alternating hover state using `#FAF7F0`.

### Operational Dashboard Additions
- **Yield Progress Indicator:** Track uses `#EEE4D3`, filled indicator uses `#718B69` with 8px radius.
- **Metric Tiles:** Minimalist KPIs featuring large numeric displays (`headline-lg`) paired with `#68615A` sub-labels and generous 20px padding.