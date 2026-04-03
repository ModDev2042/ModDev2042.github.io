# DESERT STORM — Hi8 Camcorder Effect

A browser-based Gulf War era Hi8 camcorder effect processor. Drop in any image or video and get the authentic early 90s tape look — heavy orange cast, chroma smear, blown highlights, lifted blacks, tape noise, and camera shake.

**[Live Demo →](https://yourusername.github.io/desert-storm-effect)**

---

## Features

- Works on **images** (JPG, PNG, WebP, BMP) and **video** (MP4, MOV, WebM)
- Real-time effect rendering in the browser — no server, no upload
- 9 adjustable parameters
- 4 presets (Gulf War, Mild Tape, Heavy Dub, Clean Hi8)
- Export current frame as JPEG
- Authentic 1990 timestamp overlay

## Effect Stack

| Parameter | What it does |
|-----------|-------------|
| Orange Cast | Luminance-dependent warm push — bright areas go orange-pink |
| Blown Highlights | Maps bright zones to orange-pink instead of white |
| Lifted Blacks | Raises shadow floor to muddy brown (no true black) |
| Chroma Smear | Horizontal color bleed — Hi8's low chroma bandwidth |
| Tape Noise | Per-channel organic grain, regenerated every frame |
| Generation Loss | Chroma compression and color banding from tape dubbing |
| Lens Blur | Cheap CCD lens softness |
| Camera Shake | Slow oscillating handheld drift |
| Vignette | Edge darkening |

---

## Deploy to GitHub Pages

### Option 1 — Drag and drop (easiest)

1. Go to [github.com](https://github.com) and create a new repository named `desert-storm-effect`
2. Upload all three files: `index.html`, `style.css`, `effect.js`
3. Go to **Settings → Pages**
4. Under **Source**, select `Deploy from a branch` → `main` → `/ (root)`
5. Hit **Save** — your site will be live at `https://yourusername.github.io/desert-storm-effect`

### Option 2 — Git CLI

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/desert-storm-effect.git
git push -u origin main
```

Then enable GitHub Pages in the repo settings as above.

---

## Run Locally

No build step needed. Just open `index.html` in any modern browser.

If you hit CORS issues loading local files, run a simple server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

---

## Files

```
index.html   — page structure and layout
style.css    — military/camcorder aesthetic
effect.js    — all effect processing (Canvas 2D API)
README.md    — this file
```

All processing happens client-side in the browser using the Canvas 2D API. No data is ever uploaded anywhere.

---

*Based on footage characteristics from Gulf War coverage 1990–1991, shot on Hi8, Betacam SP, and S-VHS with multi-generation composite dubbing.*
