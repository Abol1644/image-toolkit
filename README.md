# Image Toolkit

A private, client-only image processing web app. Upload, edit and export images entirely in your browser — nothing is ever uploaded to a server.

## Features

- **Multi-image upload** — file picker and drag & drop, thumbnail grid with selection and removal
- **Single-image editor** — resize (width/height or percent, with aspect-ratio lock), rotate 90°, flip horizontally/vertically, precise draggable crop with presets (free, 1:1, 4:3, 16:9), center crop
- **Batch operations** — apply the current resize / rotate / flip / format / quality settings to selected images or all images, with per-image precise crop and a batch center-crop option
- **Export formats** — PNG, JPEG, WebP (quality slider for lossy formats), and PDF
  - Single image → direct download
  - Multiple images → ZIP of processed images, or one multi-page PDF (each page matches the image dimensions)
- **PWA / offline** — installable, the app shell is precached and works offline after the first visit
- **GitHub Pages friendly** — built with a relative base and no server-side routing

## Tech stack

- React + TypeScript (strict) + Vite
- Plain CSS only (no Tailwind, no UI library)
- Canvas API / `createImageBitmap` for all image processing
- Runtime dependencies: `jspdf`, `jszip`, `vite-plugin-pwa`

## Getting started

Requirements: Node.js 18+ (the project is set up with Vite 8 / React 19 / TypeScript 6).

### Install

```sh
npm install
```

### Dev

```sh
npm run dev
```

### Typecheck

```sh
npm run typecheck
```

### Lint

```sh
npm run lint
```

### Build

```sh
npm run build
```

Output goes to `dist/`. The build runs `tsc` first, so TypeScript errors fail the build.

### Preview the production build

```sh
npm run preview
```

## Deploy to GitHub Pages

The app is fully static. `vite.config.ts` sets `base: './'`, so the built app works from a subpath such as `https://<user>.github.io/image-toolkit/` and there is no routing that depends on server rewrites.

Option A — with `gh-pages` (installs on the fly):

```sh
npm run build
npx gh-pages -d dist
```

Then enable Pages in the repo settings and point it at the `gh-pages` branch.

Option B — manually, via a `gh-pages` branch:

```sh
npm run build
git subtree push --prefix dist origin gh-pages
```

Or copy the contents of `dist/` into any branch that Pages serves.

Notes:

- Add an empty `.nojekyll` file to `dist/` if you see Jekyll-related issues (this repo contains no files that trigger them, but it is a safe habit).
- Push a fresh build after every change; the service worker updates on the next visit.

## PWA / offline

- `vite-plugin-pwa` generates the service worker and manifest at build time.
- The app shell (JS, CSS, HTML, icons) is precached — after the first visit the app loads without a server.
- No external requests are made: all fonts and assets are local, so offline mode is fully self-contained.
- Icons live in `public/icons/` and can be regenerated with `scripts/generate-icons.ps1`.

## How it works

- Uploaded files are decoded to `ImageBitmap` (with an `<img>` fallback) and kept in memory; object URLs and bitmaps are released when images are removed or replaced.
- Editing is parameter-based: rotation, flips, crop rectangle and resize settings are applied at export time via the Canvas API, so the original stays untouched until you hit **Apply** or **Export**.
- Batch processing runs sequentially to keep memory pressure low, with progress shown while exporting.
- Formats that the current browser cannot encode (e.g. WebP in some engines) are detected and disabled.

## Notes

- **Apply edits** bakes edits into the working image as lossless PNG so you can keep editing; pick JPEG/WebP at the final export.
- Large images use memory proportional to their pixel count — process a handful at a time.
- PDF pages are sized to each image's pixel dimensions.

## Project structure

```
src/
  components/   App, Dropzone, ImageList, EditorPanel, CropArea, ExportPanel
  hooks/        useImageFiles, useImageEditor
  utils/        imageLoader, imageTransforms, imageCrop, imageExporter, pdfExporter, zipExporter
  styles/       global.css, list.css, editor.css
  types.ts      shared types
  main.tsx
```
