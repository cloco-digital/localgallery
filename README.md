# Local Gallery

A dead-simple, fast photo gallery that runs entirely in your browser. No uploads, no servers, no tracking — just point it at a folder and browse.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

## What It Does

- **Select any folder** on your machine with the file picker (including subfolders)
- **Lazy-loaded grid** of thumbnails — fast even with hundreds of photos
- **Click to view fullscreen** with a clean overlay
- **Keyboard navigation**: `← →` to move between images, `Esc` to close
- **Auto-sorts by last modified** so your newest shots appear first
- **Supports**: JPG, PNG, GIF, WebP, SVG, AVIF, HEIC, BMP, TIFF, and more

## Tech

- Pure TypeScript, no frameworks
- Vite for lightning-fast dev & build
- Uses `URL.createObjectURL` for instant local image loading — nothing ever leaves your machine

## Run It

```bash
npm install
npm run dev
```

Then click "Select Folder", pick your photos, and enjoy.

## Build

```bash
npm run build
```

Output lands in `dist/`.

## Why?

Because sometimes you just want to flip through your own photos without signing into anything.
