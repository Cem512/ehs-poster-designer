# EHS Safety Poster Designer — Development Blueprint

**Created:** 2026-03-21
**Purpose:** Long-term development reference for continuing work across sessions

---

## Project Overview

An EHS (Environment, Health & Safety) poster designer web app for creating ISO-compliant safety posters. Built with React 18 + TypeScript + Vite, using Fabric.js v6 for canvas editing, Zustand for state, and Tailwind CSS v4 for styling.

**Dev server:** `npm run dev` → typically runs on `http://localhost:5188`

---

## Architecture & Key Files

### State Management (Zustand stores)
| Store | File | Purpose |
|-------|------|---------|
| `usePosterStore` | `src/store/poster-store.ts` | Poster document (size, theme, border, zones, viewing distance) |
| `useCanvasStore` | `src/store/canvas-store.ts` | Canvas state (zoom, active tool, selected objects, grid/snap) |
| `useUIStore` | `src/store/ui-store.ts` | UI state (panels open/closed, mobile breakpoint, export dialog, save status) |
| `useHistoryStore` | `src/store/history-store.ts` | Undo/redo stack (JSON snapshots of canvas) |

### Core Components
| Component | File | Role |
|-----------|------|------|
| `AppShell` | `src/components/layout/AppShell.tsx` | Main layout, keyboard shortcuts, auto-save/restore, delete confirmation |
| `Toolbar` | `src/components/layout/Toolbar.tsx` | Top toolbar (tools, settings, zoom, view toggles), poster settings dialog |
| `LeftPanel` | `src/components/layout/LeftPanel.tsx` | Tabs: Pictograms, Templates, Borders, Elements, Brand Kit |
| `RightPanel` | `src/components/layout/RightPanel.tsx` | Properties: Text, Poster info, Readability, Contrast, Colors, Auto Layout |
| `StatusBar` | `src/components/layout/StatusBar.tsx` | Bottom bar: zoom, page size, grid/snap status, save status |
| `CanvasWorkspace` | `src/canvas/CanvasWorkspace.tsx` | Fabric.js canvas wrapper with pan/zoom, text tool, drag-drop |
| `FabricCanvas` | `src/canvas/FabricCanvas.tsx` | Low-level Fabric.js canvas initialization, global accessor |

### Feature Modules
| Feature | Directory | Key Files |
|---------|-----------|-----------|
| Poster Setup | `src/features/poster-setup/` | `PosterSetupDialog.tsx` (4-step wizard) |
| Pictograms | `src/features/pictograms/` | `PictogramPanel.tsx`, `PictogramGrid.tsx`, `PictogramSearch.tsx` |
| Templates | `src/features/templates/` | `TemplatePanel.tsx`, template definitions |
| Borders | `src/features/borders/` | `BorderPanel.tsx`, `border-factory.ts` (5 types) |
| Frames/Zones | `src/features/frames/` | `zone-renderer.ts` (header/footer zones) |
| Text | `src/features/text/` | `TextToolbar.tsx`, `ContrastChecker.tsx` |
| Export | `src/features/export/` | `ExportDialog.tsx`, PDF/PNG/SVG exporters |
| Auto Layout | `src/features/auto-layout/` | `AutoLayoutPanel.tsx`, layout rules |
| Colors | `src/features/colors/` | `ColorEditor.tsx` |

### Constants & Types
| File | Contents |
|------|----------|
| `src/constants/paper-sizes.ts` | A0–A4 dimensions, mm↔px conversion |
| `src/constants/safety-colors.ts` | 6 ISO 3864 `SAFETY_THEMES` |
| `src/constants/readability-table.ts` | `checkReadability()`, `getMinFontSizePt()` |
| `src/constants/border-presets.ts` | `getDefaultBorder()` |
| `src/types/poster.ts` | `PosterDocument`, `SafetyTheme`, `BorderConfig`, etc. |
| `src/types/pictogram.ts` | `PictogramEntry`, `PICTOGRAM_CATEGORY_COLORS` |

### UI Components
| Component | File | Notes |
|-----------|------|-------|
| `ToastContainer` / `showToast()` | `src/components/ui/Toast.tsx` | Global toast system (call from anywhere) |
| `OnboardingOverlay` | `src/components/layout/OnboardingOverlay.tsx` | First-use guided overlay |

---

## Key Technical Patterns

### Fabric.js Canvas Access
```typescript
import { getFabricCanvas } from '../canvas/FabricCanvas';
const canvas = getFabricCanvas(); // Returns fabric.Canvas | null
```

### Protected Objects (Border/Zones)
Border and zone framework objects have `_customId` property. **Never delete these:**
```typescript
const deletable = canvas.getActiveObjects().filter(obj => !(obj as any)._customId);
```

### Re-rendering Structure After Changes
```typescript
import { renderBorder } from '../features/borders/border-factory';
import { renderZones } from '../features/frames/zone-renderer';

renderBorder(canvas, posterDoc);
renderZones(canvas, posterDoc);
canvas.requestRenderAll();
```

### Toast Notifications
```typescript
import { showToast } from '../components/ui/Toast';
showToast('Message here', 'success'); // 'success' | 'warning' | 'info'
```

### CSS Variables (Tailwind v4)
```
--color-surface      (panel/dialog backgrounds)
--color-border       (borders)
--color-text-muted   (secondary text)
--color-bg           (page background)
--color-text         (primary text)
```

### Auto-save
- Saves to `localStorage` key `ehs-poster-autosave` every 30 seconds
- Contains `{ document, canvas, savedAt }` JSON
- Restore offered via recovery dialog on app load

### Persistence Keys (localStorage)
| Key | Contents |
|-----|----------|
| `ehs-poster-autosave` | Full poster state for crash recovery |
| `ehs-brand-kit` | Brand colors, logo data, company info |
| `ehs-poster-onboarding-seen` | Boolean flag for first-use overlay |

---

## Completed Work

### Phase 1–5 (Foundation through Polish) — DONE
- Full app shell with responsive layout (mobile overlay panels)
- Fabric.js canvas with pan/zoom/grid/snap/alignment guides
- 4-step poster setup wizard (Purpose → Size → Theme → Review)
- 5 border types via border-factory
- Header/Footer zone system
- 316 ISO 7010 pictograms (drag-and-drop SVG)
- Text tool with font/style controls
- Readability checker (distance-based)
- Contrast checker (WCAG 2.1)
- 6 pre-built templates
- Auto-layout engine (4 patterns)
- Export: PDF (raster/vector), PNG, SVG with DPI/bleed/crop marks
- Save/Load project as JSON
- Undo/Redo (Ctrl+Z / Ctrl+Shift+Z)
- Keyboard shortcuts (V/H/T/G tools, Delete, Escape)
- Brand Kit (logo, colors, fonts) with localStorage persistence

### UX Audit #1 Fixes — DONE
- Brand Kit persistence across refresh
- Unsaved changes warning (beforeunload)
- Settings menu split (Poster Settings vs New Poster)

### UX Audit #2 — P0 Critical Fixes — DONE
1. **Duplicate keyboard handler** — Removed from CanvasWorkspace, centralized in AppShell
2. **Auto-save restore** — Recovery dialog on app load with Restore/Discard
3. **Orientation change** — Now resizes canvas, re-fits zoom, re-renders border/zones
4. **Viewing distance feedback** — Live readability summary in settings dialog

### UX Audit #2 — P1 High Fixes — DONE
5. **Panel close buttons** — Always visible (not mobile-only)
6. **Drop zone feedback** — Visual overlay when dragging pictograms onto canvas
7. **Text tool instructions** — "Click anywhere on the poster to add text" banner
8. **Toast notification system** — Global `showToast()` with success/warning/info types
9. **Brand kit hex labels** — Hex codes shown below color swatches
10. **Readability panel** — Contextual amber tip + minimum size summary row
11. **Layers panel** — SKIPPED (too large for this phase)
12. **Theme color swatches** — Click to apply color / copy hex

---

## Remaining UX Work (from UX-AUDIT-REPORT-2.md)

### P1 — Still Open
| # | Finding | Effort |
|---|---------|--------|
| 11 | Layers panel for z-index management | Large |

### P2 — Medium Priority
| # | Finding | Effort |
|---|---------|--------|
| 13 | Mute disabled Back button on wizard step 1 | Small |
| 14 | Wizard doesn't validate purpose selection (pre-selected default) | Small |
| 15 | Add keyboard nav to settings dropdown | Small |
| 16 | Add export preview thumbnail | Medium |
| 17 | Move "Load Project" out of export dialog → Settings menu | Small |
| ~~18~~ | ~~Make Grid/Snap status bar items clickable toggles~~ | ~~DONE~~ |
| ~~19~~ | ~~Add zoom-to-fit button (or clickable percentage)~~ | ~~DONE~~ |
| 20 | Auto-layout buttons need preview tooltips | Small |
| 21 | Divider width hardcoded relative to border thickness | Small |
| 22 | Arrow shape has no arrowhead (just a line) | Medium |
| 23 | Contrast checker needs clearer state change on selection | Small |
| 24 | "Crop Marks" disabled reason not explained (needs tooltip) | Small |
| 25 | Mobile toolbar hides important features (needs overflow menu) | Medium |
| ~~26~~ | ~~**Copy/Paste/Duplicate shortcuts (Ctrl+C/V/D)**~~ | ~~DONE~~ |

### P3 — Polish
| # | Finding | Effort |
|---|---------|--------|
| 27 | Wizard step indicators not clickable | Small |
| 28 | No active/pressed state on toolbar buttons | Small |
| 29 | Pictogram count shown when unfiltered (noisy) | Small |
| 30 | Border thickness slider needs min/max labels | Small |
| 31 | Brand Kit fonts section is read-only (confusing) | Small |
| 32 | Status bar DPI is static/non-actionable | Small |
| 33 | Onboarding overlay z-index may conflict with dialogs | Small |
| 34 | Settings dropdown needs enter/exit animation | Small |
| 35 | No right-click context menu on canvas objects | Medium |
| 36 | Template cards don't show theme/purpose badge | Small |
| 37 | Canvas background color hardcoded (#0f1729) | Small |
| 38 | Scale comparison hidden on mobile wizard | Small |
| 39 | Elements panel is sparse (needs more shapes/tools) | Medium |
| 40 | Logo placement always goes to center (should default to footer) | Small |
| 41 | Zoom % duplicated in toolbar and status bar | Small |
| 42 | "Saved/Unsaved" status oscillation is noisy (needs debounce) | Small |

---

## Recommended Next Steps (Priority Order)

### Immediate (High Impact, Low Effort)
1. **#26 Copy/Paste/Duplicate** — Ctrl+C/V/D in AppShell keyboard handler
2. **#19 Zoom-to-fit button** — Add to toolbar, reuse existing fit logic from CanvasWorkspace
3. **#18 Clickable Grid/Snap toggles** — Make status bar items call `toggleGrid()`/`toggleSnap()`
4. **#17 Move Load Project** — From export dialog to settings dropdown menu

### Short-term (Medium Effort)
5. **#11 Layers panel** — Object list in right panel with reorder/visibility/lock
6. **#22 Arrow with arrowhead** — Fabric.js path or polygon arrowhead
7. **#35 Right-click context menu** — Duplicate, Delete, Bring to Front, Send to Back

### Medium-term (Phase 6 from Plan)
8. **i18n** — react-i18next with English + Turkish locales
9. **Brand Kit enhancements** — Font picker, logo placement options
10. **Firebase cloud sync** — Optional auth, Firestore, shared templates

---

## Build & Run

```bash
cd "D:\EHS poster designer"
npm run dev          # Start dev server (Vite)
npm run build        # Production build → outputs to dist/
npm run preview      # Preview production build locally
```

## Deployment (v0.1)

**Architecture:** 100% static site (HTML + CSS + JS + SVG). No backend, no database, no server-side code. Total build size: ~8MB (6.5MB pictogram SVGs + 1.5MB app bundle).

**Recommended host:** Cloudflare Pages (free tier)
- Unlimited bandwidth, global CDN, auto-deploy from GitHub
- Build command: `npm run build`
- Output directory: `dist`
- Environment: `NODE_VERSION=20`

**SPA routing:** `public/_redirects` file ensures all routes fall back to `index.html`.

**No backend needed because:**
- All data stored in user's browser (localStorage)
- All exports generated client-side (PDF/PNG via canvas API)
- All pictogram SVGs served as static files
- No user accounts, no API calls

**When backend becomes needed:**
- User accounts / auth → add Firebase Auth or Supabase
- Cloud save / team sharing → add Firestore or Supabase DB
- AI features (translation, copy suggestions) → add API routes (Cloudflare Workers or separate API)
- Analytics → add Plausible/PostHog (no backend needed, just a script tag)

---

## Important Notes

- **Fabric.js v6** uses ES module imports: `import * as fabric from 'fabric'`
- Canvas works at 72 PPI internally; export upscales via `multiplier` option
- All 316 pictograms are in `public/pictograms/` organized by category
- ISO 3864 safety colors are enforced via `SAFETY_THEMES` array
- The `_customId` pattern on Fabric objects is critical — never delete these objects
- Auto-save interval is 30 seconds; consider reducing for better recovery
- `beforeunload` warning is active when `hasUnsavedChanges` is true

---

*This blueprint is a living document. Update it as features are completed or priorities change.*
