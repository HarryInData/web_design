# ÆTHERIS Chronograph — Luxury Scroll-Animated Timepiece Website

A high-end, premium web experience showcase built for the **Ætheris Tourbillon Chronograph**. This project integrates sequence-based scroll animations, interactive schematic vectors, and bespoke configuration tools to deliver a modern luxury feel.

---

## ✨ Features

* **Scroll-Bound Canvas Player**: Sticky-positioned backdrop player that renders 240 high-resolution watch frames sequentially as you scroll down.
* **Linear Interpolation (Lerp) Smoothing**: Uses smooth deceleration logic (`currentFrame += (targetFrame - currentFrame) * 0.08`) inside a `requestAnimationFrame` loop to smooth out rough mouse-wheel notches and gesture scrolling.
* **Calibrating Watch Preloader**: Fully customized dark screen overlay featuring a spinning SVG chronometer dial that tracks image preloading progress dynamically from 0% to 100%.
* **Interactive Vector Schematic**: A technical spec grid overlay synchronizing hover cards with an active SVG clockwork drawing. Hovering details shifts indicator highlights, rotates clock hands, and accelerates gear speeds.
* **Strap Customizer**: Bespoke customization panel allowing collectors to tailor strap materials (Titanium, Crocodile Leather, Obsidian Rubber, Rose Gold Link) and case accents, instantly updating mockup visuals, spec text, estimated price valuations, and form badge integrations.
* **Reservation Acquisition Form**: Full-validation booking system simulating client pre-order requests with submittal states and secure advisor confirmation responses.
* **Custom Cursor**: Lag-interpolated circular cursor tracking system that reacts, expands, and changes colors on hover-eligible interactive triggers.

---

## 📂 Project Structure

```bash
├── index.html        # Main HTML skeleton containing structural areas and forms
├── index.css         # Styling system (Obsidian theme, typography, grids, layout transitions)
├── index.js          # Core engine (Preloader, Scroll Canvas, SVG Schematic, Customizer, Forms)
├── .gitignore        # Excludes heavy local zip files (>100MB) from git staging
└── frames/           # Directory containing sequential animation frame images (frame_00000.png to frame_00239.png)
```

---

## 🚀 How to Run Locally

### Option 1: Direct File
Simply open the **`index.html`** file directly in any modern desktop browser (Double-click or drag into your browser). 
* *Note: Ensure your cursor is over the page to utilize the custom cursor interface.*

### Option 2: Local Server (Recommended)
To prevent potential local CORS or asset caching limitations on select browsers, serve the directory via Python or Node:

**Python 3.x:**
```powershell
python -m http.server 8000
```
Navigate to `http://localhost:8000`.

**Node.js (serve):**
```bash
npx serve
```

---

## ⚙️ Animation Details

The core scroll engine is driven by window scroll tracking mapped against a designated scroll driver height element:
```javascript
const scrollPercent = relativeScroll / maxScroll;
targetFrame = scrollPercent * (frameCount - 1);
currentFrame += (targetFrame - currentFrame) * 0.08;
```
This ensures frame rates match user behavior perfectly while offering a natural, fluid deceleration effect when scrolling stops.
