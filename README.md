# Vector Portrait Converter

A free, no-login web tool that converts any uploaded photo into a bold black & white vector-style portrait — entirely in the browser, no server, database, or paid API required.

## Why client-side?

The original project spec called for a server (Express + tRPC), MySQL (Drizzle), S3 storage, and a paid AI image-generation API. None of those credentials were provided, so this build does the conversion with canvas-based image processing (grayscale, contrast boost, Sobel edge detection, threshold posterization) directly in the visitor's browser. Nothing is uploaded anywhere — it's fast, free, unlimited, and works offline once loaded.

If you want the original AI-generated version (GPT Image 2, S3, DB), you'll need to supply `DATABASE_URL`, AWS credentials, and an image-gen API key, and I can wire that path back in.

## Features

- ✨ **Real-time preview** — See original and vector versions side-by-side
- 🎨 **3 adjustable parameters**:
  - Edge Detection Sensitivity (Sobel threshold)
  - Color Levels (posterization)
  - Contrast Intensity
- 📸 **Drag-and-drop upload** with file validation
- 📥 **One-click download** with timestamp
- 🚀 **100% client-side** — No server, no tracking, no fees
- 🎭 **Smooth animations** with Framer Motion
- 📱 **Responsive design** with Tailwind CSS
- 🔔 **Toast notifications** with Sonner

## Tech Stack

- **React 19** + TypeScript
- **Vite** (fast dev server & build)
- **Tailwind CSS** (styling)
- **Framer Motion** (animations)
- **Lucide React** (icons)
- **Sonner** (toast notifications)

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build for production

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Deploy

`dist/` is a static site — deploy it to:
- **Vercel** (recommended)
- **Netlify**
- **Cloudflare Pages**
- **GitHub Pages**
- Any static host

No backend needed.

## Project structure

```
client/
  index.html
  public/
  src/
    App.tsx                 # Main app component with Sonner
    main.tsx               # React entry point
    index.css              # Global Tailwind styles
    lib/
      convert.ts           # Canvas image processing engine
    pages/
      Home.tsx             # Full UI: upload, controls, preview, download

package.json
vite.config.ts
tailwind.config.js
tsconfig.json
```

## How it works

1. **Upload** — Select or drag-drop an image
2. **Adjust** — Fine-tune edge detection, colors, and contrast with sliders
3. **Convert** — Canvas-based Sobel edge detection + posterization
4. **Download** — Save your vector portrait as PNG

All processing happens in your browser. Your image never leaves your computer.

## Image Processing Pipeline

1. **Contrast Boost** — Amplify midtones for more dramatic effect
2. **Posterization** — Reduce color palette to distinct bands
3. **Sobel Edge Detection** — Find and emphasize edges
4. **Threshold** — Convert to clean black & white

## License

MIT
