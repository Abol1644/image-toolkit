# Image Toolkit

A private, client-only image processing web app for personal graphic design tasks.

All processing happens locally in the browser. No images are uploaded to a server.

## Features

- Upload multiple images
- Batch image list with selection
- Resize images
  - Width/height mode
  - Percentage mode
  - Aspect ratio lock
- Crop images
  - Freeform crop
  - Presets: `1:1`, `4:3`, `16:9`
- Rotate images
  - Rotate left
  - Rotate right
- Flip images
  - Horizontal
  - Vertical
- Export formats
  - PNG
  - JPEG
  - WebP
  - PDF
- Batch export
  - Download selected images as ZIP
  - Export selected images as one multi-page PDF
- Offline support
  - PWA with service worker
- GitHub Pages friendly
  - Static build
  - Relative base path

## Tech Stack

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- Canvas API
- [jsPDF](https://github.com/parallax/jsPDF)
- [JSZip](https://github.com/Stuk/jszip)
- [vite-plugin-pwa](https://github.com/vite-pwa/vite)

## Getting Started

### Requirements

- Node.js 18+ recommended
- npm or pnpm

### Install

```bash
npm install