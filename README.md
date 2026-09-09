# PixShift - Private & Fast Image Extension Converter

A complete, modern, deployable web application that converts image formats (e.g., **JPG to PNG**, **PNG to JPG**, **WEBP**, **AVIF**, **BMP**, **ICO**) with 100% in-browser privacy, batch processing, dimension resizing, quality control, and instant ZIP downloads.

---

## Key Features

- **100% Client-Side Privacy**: All processing runs directly in the user's browser using HTML5 Canvas and Web APIs. Images are **never** uploaded to any external server.
- **Universal Format Conversion**:
  - **Inputs**: JPG, JPEG, PNG, WEBP, AVIF, BMP, GIF, SVG, ICO
  - **Outputs**: PNG, JPG/JPEG, WEBP, AVIF, BMP, ICO (Favicon)
- **Batch Processing**: Convert dozens of files simultaneously with live progress feedback.
- **1-Click ZIP Download**: Export all converted images together in an organized `.zip` file using JSZip.
- **Quality & Compression Sliders**: Adjust lossy compression (10% - 100%) for formats like JPEG and WebP.
- **Smart Resizing**: Scale images to 25%, 50%, 75%, 200% or custom dimensions while preserving aspect ratios.
- **Drag-and-Drop & Clipboard**: Drag files directly into the window or press `Ctrl+V` / `Cmd+V` to paste screenshots instantly.
- **Responsive & Modern UI**: Built with Tailwind CSS, Lucide icons, and dark mode support.

---

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide React
- **Client Processing**: HTML5 Canvas, `createImageBitmap`, JS ArrayBuffer BMP/ICO encoders
- **Packaging**: JSZip + FileSaver

---

## Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node v20/v22)
- npm or pnpm or yarn

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd Vibe

# Install dependencies
npm install

# Start local dev server
npm run dev
```
Open your browser at `http://localhost:3000`.

### Production Build
```bash
npm run build
npm run preview
```

---

## Deployment Options

PixShift can be deployed in multiple ways depending on your hosting preference:

### 1. Deploy with Docker (Recommended for Self-Hosting)
A production multi-stage `Dockerfile` and `docker-compose.yml` are included.

```bash
# Using Docker Compose
docker compose up -d --build

# Or directly with Docker
docker build -t pixshift .
docker run -d -p 8080:80 pixshift
```
The application will be accessible at `http://localhost:8080`.

### 2. Deploy to Vercel (1-Click)
1. Push this repository to GitHub/GitLab.
2. Import the project in the [Vercel Dashboard](https://vercel.com).
3. The included `vercel.json` will automatically configure routing.
4. Deploy!

### 3. Deploy to Netlify
1. Connect your repository to [Netlify](https://netlify.com).
2. Netlify will detect `netlify.toml` and configure `npm run build` with publish directory `dist`.
3. Deploy!

### 4. Deploy to GitHub Pages
1. In `vite.config.ts`, set `base: '/<repo-name>/'`.
2. Run `npm run build`.
3. Push the contents of the `dist/` directory to your `gh-pages` branch.

### 5. Deploy to Any Static Web Server (Nginx, Apache, Caddy, Cloudflare Pages)
Run:
```bash
npm run build
```
Copy the contents of the generated `dist/` directory directly into your web server's root directory (`/var/www/html`).

---

## License
MIT

