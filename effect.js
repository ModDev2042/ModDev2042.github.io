// ─── STATE ───────────────────────────────────────────────────────────────────
const state = {
  sourceImage: null,
  sourceVideo: null,
  isVideo: false,
  isPlaying: false,
  frameIdx: 0,
  animFrame: null,
  params: {
    orange:   75,
    blown:    60,
    lift:     55,
    smear:    45,
    noise:    35,
    genloss:  40,
    blur:     40,
    shake:    25,
    vignette: 35,
  }
};

const PRESETS = {
  gulf:  { orange:75, blown:60, lift:55, smear:45, noise:35, genloss:40, blur:40, shake:25, vignette:35 },
  mild:  { orange:35, blown:25, lift:30, smear:20, noise:15, genloss:15, blur:15, shake:8,  vignette:20 },
  heavy: { orange:90, blown:80, lift:70, smear:75, noise:60, genloss:75, blur:60, shake:50, vignette:55 },
  clean: { orange:20, blown:15, lift:20, smear:10, noise:10, genloss:5,  blur:10, shake:3,  vignette:15 },
};

// ─── DOM ─────────────────────────────────────────────────────────────────────
const dropZone    = document.getElementById('dropZone');
const fileInput   = document.getElementById('fileInput');
const workspace   = document.getElementById('workspace');
const canvas      = document.getElementById('outputCanvas');
const ctx         = canvas.getContext('2d', { willReadFrequently: true });
const videoControls = document.getElementById('videoControls');
const btnPlayPause  = document.getElementById('btnPlayPause');
const vcBar         = document.getElementById('vcBar');
const vcTime        = document.getElementById('vcTime');
const hudTime       = document.getElementById('hudTime');
const exportStatus  = document.getElementById('exportStatus');

// ─── TIMESTAMP ───────────────────────────────────────────────────────────────
let tsSeconds = 0;
const tsStart = new Date(1990, 7, 2, 10, 44, 0);
function formatTS(offset) {
  const d = new Date(tsStart.getTime() + offset * 1000);
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2,'0');
  const mn = String(d.getMinutes()).padStart(2,'0');
  const ss = String(d.getSeconds()).padStart(2,'0');
  return `${dd}. ${mm}. ${yy} &nbsp; ${hh}:${mn}:${ss}`;
}
setInterval(() => {
  tsSeconds++;
  document.getElementById('ts').innerHTML = formatTS(tsSeconds);
  hudTime.innerHTML = formatTS(tsSeconds);
}, 1000);

// ─── SLIDERS ─────────────────────────────────────────────────────────────────
const sliderKeys = ['orange','blown','lift','smear','noise','genloss','blur','shake','vignette'];
sliderKeys.forEach(k => {
  const el = document.getElementById(k);
  el.addEventListener('input', () => {
    state.params[k] = +el.value;
    document.getElementById('sv-'+k).textContent = el.value;
    if (!state.isVideo) renderFrame();
  });
});

function setParams(p) {
  sliderKeys.forEach(k => {
    state.params[k] = p[k];
    document.getElementById(k).value = p[k];
    document.getElementById('sv-'+k).textContent = p[k];
  });
}

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setParams(PRESETS[btn.dataset.preset]);
    if (!state.isVideo) renderFrame();
  });
});

document.getElementById('btnReset').addEventListener('click', () => {
  setParams(PRESETS.gulf);
  if (!state.isVideo) renderFrame();
});

// ─── FILE LOADING ─────────────────────────────────────────────────────────────
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
});
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => { if (fileInput.files[0]) loadFile(fileInput.files[0]); });
document.getElementById('btnNew').addEventListener('click', () => {
  stopVideo();
  workspace.style.display = 'none';
  dropZone.style.display = 'flex';
});

function loadFile(file) {
  const isVideo = file.type.startsWith('video/');
  state.isVideo = isVideo;
  dropZone.style.display = 'none';
  workspace.style.display = 'grid';

  if (isVideo) {
    loadVideo(file);
    videoControls.style.display = 'flex';
  } else {
    loadImage(file);
    videoControls.style.display = 'none';
  }
}

function loadImage(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    state.sourceImage = img;
    canvas.width  = img.width;
    canvas.height = img.height;
    renderFrame();
  };
  img.src = url;
}

function loadVideo(file) {
  stopVideo();
  const url = URL.createObjectURL(file);
  const vid = document.createElement('video');
  vid.src = url;
  vid.loop = true;
  vid.muted = true;
  vid.playsInline = true;
  vid.onloadedmetadata = () => {
    state.sourceVideo = vid;
    canvas.width  = vid.videoWidth;
    canvas.height = vid.videoHeight;
    startVideoLoop();
    vid.play();
    state.isPlaying = true;
    btnPlayPause.textContent = '⏸ PAUSE';
  };
}

// ─── VIDEO CONTROLS ───────────────────────────────────────────────────────────
btnPlayPause.addEventListener('click', () => {
  if (!state.sourceVideo) return;
  if (state.isPlaying) {
    state.sourceVideo.pause();
    state.isPlaying = false;
    btnPlayPause.textContent = '▶ PLAY';
  } else {
    state.sourceVideo.play();
    state.isPlaying = true;
    btnPlayPause.textContent = '⏸ PAUSE';
  }
});

document.querySelector('.vc-progress').addEventListener('click', e => {
  if (!state.sourceVideo) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  state.sourceVideo.currentTime = ratio * state.sourceVideo.duration;
});

function stopVideo() {
  if (state.animFrame) { cancelAnimationFrame(state.animFrame); state.animFrame = null; }
  if (state.sourceVideo) { state.sourceVideo.pause(); state.sourceVideo.src = ''; }
  state.sourceVideo = null;
  state.isPlaying = false;
  state.frameIdx = 0;
}

function startVideoLoop() {
  function loop() {
    const vid = state.sourceVideo;
    if (!vid) return;
    if (vid.readyState >= 2) {
      renderVideoFrame(vid);
      const dur = vid.duration || 1;
      const pct = (vid.currentTime / dur) * 100;
      vcBar.style.width = pct.toFixed(1) + '%';
      const m = Math.floor(vid.currentTime / 60);
      const s = Math.floor(vid.currentTime % 60).toString().padStart(2,'0');
      vcTime.textContent = `${m}:${s}`;
    }
    state.animFrame = requestAnimationFrame(loop);
  }
  loop();
}

// ─── EFFECT ENGINE ────────────────────────────────────────────────────────────

function renderFrame() {
  if (!state.sourceImage) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(state.sourceImage, 0, 0);
  applyEffects(state.frameIdx++);
}

function renderVideoFrame(vid) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
  applyEffects(state.frameIdx++);
}

function applyEffects(frameIdx) {
  const p = state.params;
  const W = canvas.width, H = canvas.height;

  // --- lens blur first (CSS filter trick — fast) ---
  if (p.blur > 5) {
    const blurPx = (p.blur / 100) * 3;
    const snap = document.createElement('canvas');
    snap.width = W; snap.height = H;
    const sc = snap.getContext('2d');
    sc.filter = `blur(${blurPx.toFixed(1)}px)`;
    sc.drawImage(canvas, 0, 0);
    // lighten blend
    ctx.globalCompositeOperation = 'lighten';
    ctx.globalAlpha = 0.35;
    ctx.drawImage(snap, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  // --- pixel-level effects ---
  let imgd = ctx.getImageData(0, 0, W, H);
  let d = imgd.data;

  const orangeStr = p.orange / 100;
  const blownThr  = 255 - (p.blown / 100) * 120;
  const liftAmt   = (p.lift / 100) * 50;
  const noiseAmt  = (p.noise / 100) * 40;
  const genlossSteps = Math.max(8, Math.round(32 - (p.genloss / 100) * 24));

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i+1], b = d[i+2];

    // --- generation loss: posterize color ---
    g = Math.round(g / genlossSteps) * genlossSteps;
    b = Math.round(b / genlossSteps) * genlossSteps;

    // --- lifted blacks ---
    r = r + liftAmt * (1 - r/255);
    g = g + liftAmt * 0.7 * (1 - g/255);
    b = b + liftAmt * 0.5 * (1 - b/255);

    // --- orange cast ---
    const lum = (r*0.299 + g*0.587 + b*0.114) / 255;
    r = r + orangeStr * (180*lum + 40);
    g = g + orangeStr * (60*lum  + 10);
    b = b - orangeStr * 40;

    // --- blown highlights → orange-pink ---
    const lumNow = r*0.299 + g*0.587 + b*0.114;
    if (lumNow > blownThr) {
      const blend = Math.min(1, (lumNow - blownThr) / (255 - blownThr + 1));
      r = r + blend * (255 - r) * 0.9;
      g = g + blend * (180 - g) * 0.5;
      b = b + blend * (80  - b) * 0.3;
    }

    // --- tape noise ---
    const n = (Math.random() - 0.5) * noiseAmt;
    r += n;
    g += n * 0.85;
    b += n * 0.65;

    d[i]   = Math.max(0, Math.min(255, r));
    d[i+1] = Math.max(0, Math.min(255, g));
    d[i+2] = Math.max(0, Math.min(255, b));
  }

  // --- chroma smear (horizontal) ---
  if (p.smear > 2) {
    const smearDecay = (p.smear / 100) * 0.45;
    for (let y = 0; y < H; y++) {
      let pr = 0, pg = 0, pb = 0;
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        pr = pr * smearDecay + d[i]   * (1 - smearDecay);
        pg = pg * smearDecay + d[i+1] * (1 - smearDecay * 0.85);
        pb = pb * smearDecay + d[i+2] * (1 - smearDecay * 0.7);
        d[i]   = Math.min(255, pr);
        d[i+1] = Math.min(255, pg);
        d[i+2] = Math.min(255, pb);
      }
    }
  }

  ctx.putImageData(imgd, 0, 0);

  // --- vignette ---
  if (p.vignette > 2) {
    const vStr = (p.vignette / 100) * 0.85;
    const vg = ctx.createRadialGradient(W/2, H/2, H*0.25, W/2, H/2, H*0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, `rgba(0,0,0,${vStr.toFixed(2)})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  // --- camera shake ---
  if (p.shake > 1) {
    const shakeMax = (p.shake / 100) * 8;
    const t = frameIdx * 0.08;
    const dx = Math.round(shakeMax * (Math.sin(t*1.3)*0.6 + Math.sin(t*2.7+1.1)*0.4) + (Math.random()-0.5)*1.5);
    const dy = Math.round(shakeMax * (Math.sin(t*0.9+0.5)*0.5 + Math.sin(t*3.1)*0.3)   + (Math.random()-0.5)*1.5);
    if (dx !== 0 || dy !== 0) {
      const snap = document.createElement('canvas');
      snap.width = W; snap.height = H;
      snap.getContext('2d').drawImage(canvas, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(snap, dx, dy);
    }
  }

  // --- HUD timestamp overlay ---
  ctx.font = `bold ${Math.max(14, W*0.025)}px 'Share Tech Mono', monospace`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.shadowBlur = 0;
  const ts = formatTSPlain(tsSeconds);
  const line1 = ts.line1;
  const line2 = ts.line2;
  const fSize = Math.max(14, W*0.025);
  const margin = fSize * 0.8;
  ctx.fillText(line1, W - ctx.measureText(line1).width - margin, H - fSize*2 - margin);
  ctx.fillText(line2, W - ctx.measureText(line2).width - margin, H - margin);
  ctx.shadowColor = 'transparent';
}

function formatTSPlain(offset) {
  const d = new Date(tsStart.getTime() + offset * 1000);
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const yy = String(d.getFullYear()).slice(-2);
  const hh = String(d.getHours()).padStart(2,'0');
  const mn = String(d.getMinutes()).padStart(2,'0');
  const ss = String(d.getSeconds()).padStart(2,'0');
  return { line1: `${dd}. ${mm}. ${yy}`, line2: `${hh}:${mn}:${ss}` };
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
document.getElementById('btnExport').addEventListener('click', () => {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gulf_war_${Date.now()}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
    exportStatus.textContent = '✓ FRAME EXPORTED';
    setTimeout(() => exportStatus.textContent = '', 3000);
  }, 'image/jpeg', 0.92);
});
