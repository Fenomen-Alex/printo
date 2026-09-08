# Printo 🎨✨

**Printo** (from Italian *pronto* — quick) is an ultra-lightweight, high-performance 3D merchandise print configurator built entirely with Vanilla TypeScript and Three.js.

Unlike conventional print configurators that slap flat 2D overlays onto fixed textures, Printo uses real-time 3D **Decal Projection** (`DecalGeometry`) and physical normal-map blending. This ensures designs realistically curve, wrap, and conform to tapered mug bodies, cap curves, and fabric folds while preserving real surface textures.

---

## 🏎️ Key Features

* **Physically Accurate Surface Mapping:** Projections conform dynamically to 3D object topology, preventing planar distortion on curved or tapered meshes.
* **Micro-Bundle Architecture:** Zero heavy frameworks (No React, Angular, or Vue). Built on native TypeScript + Three.js via Vite to stay under **180KB gzipped**.
* **Interactive Raycast Placement:** Click or tap anywhere directly on the 3D mesh surface to re-center and place print designs.
* **Custom Text Engine:** Dynamic Google Font selection, style controls, and color pickers rendered via an offscreen high-res canvas compositing pipeline.
* **PBR Surface Blending:** Inherits base surface normal and bump maps, ensuring prints look like actual ink on ceramic, metal, or cloth rather than floating plastic stickers.
* **100% Static / GitHub Pages Ready:** Completely client-side execution with zero backend required.
* **Responsive Mobile First UI:** Clean glassmorphism overlay on desktop with a full-screen drawer menu on mobile devices.
* **Instant Snapshot Export:** Render and download high-resolution PNG previews directly from the WebGL buffer.

---

## 🛠️ Tech Stack

* **Language:** TypeScript
* **3D Engine:** [Three.js](https://threejs.org/) (ESM)
* **Mesh Projection:** `DecalGeometry`
* **Bundler & Dev Server:** [Vite](https://vitejs.dev/)
* **Hosting:** GitHub Pages / Static Hosting

---

## 📂 Project Structure

```text
printo/
├── public/
│   ├── models/            # .glb assets (mug, t-shirt, cap, pen)
│   ├── presets/           # Pre-defined sample graphics
│   └── fonts/             # Local font fallbacks
├── src/
│   ├── components/
│   │   ├── DecalProjector.ts # Raycasting & dynamic decal generation
│   │   ├── OffscreenCanvas.ts# 2D text & vector composite engine
│   │   ├── SceneManager.ts   # Three.js viewport, lighting, and camera
│   │   └── UIOverlay.ts      # Glassmorphism UI & responsive menu
│   ├── styles/
│   │   └── main.css       # Layout, typography, & mobile drawer styles
│   ├── main.ts            # Application bootstrap & state sync
│   └── types.ts           # Type definitions
├── index.html             # Single entrypoint HTML canvas
├── package.json
├── tsconfig.json
└── vite.config.ts

```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18 or higher) installed.

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/printo.git
cd printo

```


2. **Install dependencies:**
```bash
npm install

```


3. **Start local development server:**
```bash
npm run dev

```


4. **Build for production:**
```bash
npm run build

```



---

## 🌐 Deployment (GitHub Pages)

Since Printo relies exclusively on client-side WebGL APIs, it deploys seamlessly to GitHub Pages.

1. **Set the base path in `vite.config.ts` if needed:**
```typescript
export default {
  base: '/printo/',
}

```


2. **Deploy using `gh-pages`:**
```bash
npm run build
npx gh-pages -d dist

```



---

## 📦 Adding Custom 3D Models

To add new product meshes (e.g., hoodies, bottles):

1. Place unwrapped `.glb` / `.gltf` files in `public/models/`.
2. Ensure models have clean UVs and isolated meshes for target printable areas.
3. Register the model in `src/config/products.ts`:
```typescript
export const PRODUCTS = [
  {
    id: 'mug',
    name: 'Ceramic Mug',
    modelPath: '/models/mug.glb',
    targetMeshName: 'Mug_Body'
  }
];

```



---

## 📄 License

MIT License. Free for personal and commercial use.