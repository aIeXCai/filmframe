# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Do not operate the browser to run interactive product tests. After each implementation, report the automated build/test result and give the user explicit manual test steps; the user will perform visual and interaction acceptance testing.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## FilmFrame product decisions

- The product has an introduction-led home page before the editing workspace.
- Every photo owns its own A, B, C, or D template choice; changing one photo must not change the others.
- Frame numbers are derived from the current photo order and are never editable. They remain continuous (`01`, `02`, `03`...) after add, delete, or reorder operations.
- Film stock, edge code, roll number, location, and date belong to each photo independently; changing the current photo must not modify any other photo's metadata.
- The photo editor may change crop, zoom, position, and 90-degree rotation only. It must not expose color or filter controls.
- Film stock, edge code, roll number, location, date, and automatic frame number are live metadata. They must update both the visible canvas and export render through the same `FilmSurface` component; baked template text is never the source of truth.
- Film stock is selected from a curated set of common 135 films. Selecting a stock supplies a default edge code, while the edge code remains user editable.
- Dynamic frame numbers must visually replace the template's sample number inside its native mechanical type slot. Do not add a detached rectangular badge over the film artwork.
- Editing and export must use the `style-*-clean.png` text-free template assets. Keep the original `style-*.png` files for marketing and thumbnail previews only; never conceal baked text with flat CSS color blocks or masking rectangles.
- The home page uses a bundled premium editorial type system: Noto Serif SC Variable for display headings and Noto Sans SC Variable for navigation and body copy. In the hero, both headline sentences should remain on one line at common desktop widths; the amber sentence `它只需要一个好画框。` is slightly smaller than the white sentence.
- Template D is the cool-toned slide-lightbox treatment: a white mounted 35mm slide on an illuminated cyan inspection table with editable metadata printed into the mount.
