# FilmFrame Handoff

## 1. Product
FilmFrame is a browser-based 135 film frame editor for photographers. It adds authentic physical film structures and edge metadata to digital photographs.
The product never redraws the original, uses no AI or filters, and processes photos only in the current browser (`src/App.jsx`, `AGENTS.md`).

## 2. Technology
| Layer | Choice | Purpose |
|---|---|---|
| Frontend | React 19, Vite 6, JavaScript | Single-page home and editing workspace; see `package.json`. |
| UI and export | Phosphor Icons, html-to-image, JSZip, Noto Sans/Serif | Icons, PNG/ZIP export, and bundled editorial fonts. |

## 3. Structure
`filmframe/` contains `src/` for the UI and editor, `public/assets/` for templates, `worker/` for hosting, `scripts/` for build preparation, and `tests/` for automated checks.
Product constraints live in `AGENTS.md`; the main home/editor implementation is in `src/App.jsx`; visual styling is in `src/styles.css`.

## 4. Data Model
A project session contains one or more photo items. Every photo independently owns its template, zoom, position, rotation, roll number, location, date, film stock, and edge code through `makeItem` and `updateSelected` in `src/App.jsx`.
State lives only in React memory; there is no database or persistence layer.

## 5. Key Decisions
- Each photo independently selects A/B/C/D; D is the cool-toned mounted-slide lightbox structure.
- The visible canvas and export render share `FilmSurface` so their results remain identical.
- Frame numbers are derived from photo order and cannot be edited, keeping them continuous after deletion or reordering.
- Editing and export use text-free template assets, while live metadata is rendered dynamically.

## 6. Run and Verify
Start with `npm run dev -- --host 0.0.0.0 --port 4173 --strictPort`.
Build with `npm run build`; verify hosting with `npm run test:sites`.
The successful path is upload, metadata editing, and image export.
Local URL: `http://127.0.0.1:4173/`.

## 7. Pitfalls
- Never use `style-*.png` for editing or export because those files contain baked text; use `style-*-clean.png`.
- Keep frame numbers read-only and derived from photo order.
- Do not add color or filter controls; the editor is limited to crop, zoom, position, and 90° rotation.
- Do not assume state survives refresh; the project has no persistence layer.

## Manual Notes (never overwritten automatically)
<!-- handoff:manual-zone -->
<!-- /handoff:manual-zone -->
