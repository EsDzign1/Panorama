/**
 * Procedural Equirectangular 360° Panorama Generator
 * Generates seamless 2:1 architectural panoramas directly on HTML5 canvas.
 * Ensures instant 0ms latency, zero CORS issues, and crisp modern interior visuals.
 */

export function generateEquirectangularPanorama(
  theme: 'living' | 'kitchen' | 'bedroom' | 'terrace',
  width = 2048,
  height = 1024
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const horizonY = height * 0.5;

  if (theme === 'living') {
    renderLivingRoom(ctx, width, height, horizonY);
  } else if (theme === 'kitchen') {
    renderKitchen(ctx, width, height, horizonY);
  } else if (theme === 'bedroom') {
    renderBedroom(ctx, width, height, horizonY);
  } else {
    renderTerrace(ctx, width, height, horizonY);
  }

  return canvas.toDataURL('image/jpeg', 0.92);
}

function renderLivingRoom(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  horizonY: number
) {
  // 1. Base Walls & Ceiling
  // Ceiling gradient (soft warm white to subtle architectural gray)
  const ceilGrad = ctx.createLinearGradient(0, 0, 0, horizonY - 40);
  ceilGrad.addColorStop(0, '#f8fafc');
  ceilGrad.addColorStop(0.5, '#e2e8f0');
  ceilGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = ceilGrad;
  ctx.fillRect(0, 0, w, horizonY);

  // Ceiling architectural cove lighting channels
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 14;
  ctx.shadowColor = '#fdba74';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.2, w * 0.25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0; // reset

  // Recessed spot lights on ceiling
  for (let i = 0; i < 12; i++) {
    const spotX = (w / 12) * i + 40;
    const spotY = h * 0.18 + Math.sin(i * 1.2) * 20;
    const rad = ctx.createRadialGradient(spotX, spotY, 2, spotX, spotY, 28);
    rad.addColorStop(0, '#ffffff');
    rad.addColorStop(0.3, '#fef08a');
    rad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = rad;
    ctx.beginPath();
    ctx.arc(spotX, spotY, 28, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Floor: Warm Natural Herringbone / Oak Parquet
  const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h);
  floorGrad.addColorStop(0, '#b45309');
  floorGrad.addColorStop(0.4, '#92400e');
  floorGrad.addColorStop(1, '#78350f');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, horizonY, w, h - horizonY);

  // Perspective floor plank lines radiating from nadir
  ctx.strokeStyle = 'rgba(67, 20, 7, 0.35)';
  ctx.lineWidth = 2;
  const numPlanks = 48;
  for (let i = 0; i <= numPlanks; i++) {
    const x = (w / numPlanks) * i;
    ctx.beginPath();
    ctx.moveTo(x, horizonY);
    // Radiate down to bottom edge with curvature
    ctx.lineTo((x - w * 0.5) * 1.5 + w * 0.5, h);
    ctx.stroke();
  }
  // Horizontal plank joints
  for (let y = horizonY + 20; y < h; y += 32) {
    const plankY = y;
    ctx.strokeStyle = 'rgba(67, 20, 7, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, plankY);
    ctx.lineTo(w, plankY);
    ctx.stroke();
  }

  // Large Luxury Textured Area Rug in the center
  const rugGrad = ctx.createRadialGradient(w * 0.48, h * 0.72, 20, w * 0.48, h * 0.72, 380);
  rugGrad.addColorStop(0, '#f1f5f9');
  rugGrad.addColorStop(0.8, '#cbd5e1');
  rugGrad.addColorStop(1, 'rgba(203, 213, 225, 0.4)');
  ctx.fillStyle = rugGrad;
  ctx.beginPath();
  ctx.ellipse(w * 0.48, h * 0.75, 420, 160, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Middle Walls & Architecture:
  // A) Wall with floor-to-ceiling glass windows overlooking city skyline (Yaw ~0° to 120°)
  const windowLeft = w * 0.08;
  const windowWidth = w * 0.42;
  const skyGrad = ctx.createLinearGradient(0, horizonY - 180, 0, horizonY);
  skyGrad.addColorStop(0, '#38bdf8');
  skyGrad.addColorStop(0.6, '#bae6fd');
  skyGrad.addColorStop(1, '#fef08a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(windowLeft, horizonY - 180, windowWidth, 240);

  // Skyline towers in window
  ctx.fillStyle = '#64748b';
  for (let i = 0; i < 18; i++) {
    const towerX = windowLeft + 20 + i * (windowWidth / 19);
    const towerW = 20 + (i % 3) * 12;
    const towerH = 40 + (Math.sin(i * 3) * 0.5 + 0.5) * 90;
    ctx.fillRect(towerX, horizonY - towerH, towerW, towerH);

    // Tower windows
    ctx.fillStyle = '#fef08a';
    for (let r = 0; r < 5; r++) {
      ctx.fillRect(towerX + 4, horizonY - towerH + 10 + r * 14, 3, 4);
    }
    ctx.fillStyle = '#64748b';
  }

  // Window Mullions & Frames
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 6;
  ctx.strokeRect(windowLeft, horizonY - 180, windowWidth, 240);
  for (let col = 1; col < 5; col++) {
    const x = windowLeft + (windowWidth / 5) * col;
    ctx.beginPath();
    ctx.moveTo(x, horizonY - 180);
    ctx.lineTo(x, horizonY + 60);
    ctx.stroke();
  }

  // B) Feature Wall: Dark Oak Acoustic Slats (Yaw ~140° to 220°)
  const slatLeft = w * 0.55;
  const slatWidth = w * 0.28;
  ctx.fillStyle = '#1e1b18';
  ctx.fillRect(slatLeft, horizonY - 200, slatWidth, 260);
  ctx.strokeStyle = '#854d0e';
  ctx.lineWidth = 3;
  for (let s = 0; s < slatWidth; s += 8) {
    ctx.beginPath();
    ctx.moveTo(slatLeft + s, horizonY - 200);
    ctx.lineTo(slatLeft + s, horizonY + 60);
    ctx.stroke();
  }

  // Floating Low-board Media Console & Modern Minimalist Art on Slat Wall
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(slatLeft + 40, horizonY - 10, slatWidth - 80, 45);

  // Modern abstract canvas art
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(slatLeft + 70, horizonY - 150, 180, 110);
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(slatLeft + 140, horizonY - 100, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(slatLeft + 160, horizonY - 120, 60, 60);

  // C) Dining & Kitchen Portal Doorway (Seamless right/left wrap)
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(w * 0.88, horizonY - 190, w * 0.12, 250);
  ctx.fillRect(0, horizonY - 190, w * 0.05, 250); // wrap to left edge

  // Ambient lighting glow above baseboards
  const glowGrad = ctx.createLinearGradient(0, horizonY - 5, 0, horizonY + 5);
  glowGrad.addColorStop(0, 'rgba(253, 186, 116, 0)');
  glowGrad.addColorStop(0.5, 'rgba(253, 186, 116, 0.6)');
  glowGrad.addColorStop(1, 'rgba(253, 186, 116, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, horizonY - 5, w, 10);
}

function renderKitchen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  horizonY: number
) {
  // Ceiling
  const ceilGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  ceilGrad.addColorStop(0, '#ffffff');
  ceilGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = ceilGrad;
  ctx.fillRect(0, 0, w, horizonY);

  // Recessed circular LED panels
  for (let i = 0; i < 8; i++) {
    const cx = (w / 8) * i + 80;
    const cy = h * 0.15;
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Terrazzo Polished Tile Flooring
  const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h);
  floorGrad.addColorStop(0, '#cbd5e1');
  floorGrad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, horizonY, w, h - horizonY);

  // Grid tile lines with perspective
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 30; i++) {
    const x = (w / 30) * i;
    ctx.beginPath();
    ctx.moveTo(x, horizonY);
    ctx.lineTo((x - w * 0.5) * 1.6 + w * 0.5, h);
    ctx.stroke();
  }

  // Marble Waterfall Kitchen Island in Center
  const islandX = w * 0.35;
  const islandW = w * 0.32;
  const islandY = horizonY - 20;
  const islandH = 140;

  // Island front face: Calacatta Gold marble pattern
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(islandX, islandY, islandW, islandH);
  // Marble veins
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(islandX + 20, islandY + 10);
  ctx.bezierCurveTo(islandX + 120, islandY + 40, islandX + 200, islandY + 20, islandX + islandW - 20, islandY + 110);
  ctx.stroke();
  ctx.strokeStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(islandX + 60, islandY + 120);
  ctx.bezierCurveTo(islandX + 180, islandY + 70, islandX + 300, islandY + 100, islandX + islandW - 10, islandY + 30);
  ctx.stroke();

  // Island countertop thickness
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(islandX - 10, islandY - 14, islandW + 20, 16);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(islandX - 10, islandY - 14, islandW + 20, 16);

  // Designer Pendant Lights above island
  for (let p = 0; p < 3; p++) {
    const px = islandX + 80 + p * ((islandW - 160) / 2);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, h * 0.12);
    ctx.lineTo(px, horizonY - 80);
    ctx.stroke();

    // Amber glass orb
    const bulbGrad = ctx.createRadialGradient(px, horizonY - 80, 2, px, horizonY - 80, 20);
    bulbGrad.addColorStop(0, '#ffffff');
    bulbGrad.addColorStop(0.5, '#f59e0b');
    bulbGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = bulbGrad;
    ctx.beginPath();
    ctx.arc(px, horizonY - 80, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  // Back wall cabinetry: matte charcoal cabinets with LED strip
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(w * 0.05, horizonY - 180, w * 0.25, 230);
  // Cabinet seam lines
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  for (let c = 1; c < 4; c++) {
    const cx = w * 0.05 + (w * 0.25 / 4) * c;
    ctx.beginPath();
    ctx.moveTo(cx, horizonY - 180);
    ctx.lineTo(cx, horizonY + 50);
    ctx.stroke();
  }

  // Right Side: Garden Terrace Patio Glass Doors (Yaw ~260° to 340°)
  const patioX = w * 0.72;
  const patioW = w * 0.24;
  ctx.fillStyle = '#86efac';
  ctx.fillRect(patioX, horizonY - 170, patioW, 230);
  // Garden greenery
  for (let g = 0; g < 15; g++) {
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(patioX + 20 + g * 22, horizonY + 10 + (g % 3) * 15, 28, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderBedroom(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  horizonY: number
) {
  // Soft Evening Dusk Ambience
  const ceilGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  ceilGrad.addColorStop(0, '#0f172a');
  ceilGrad.addColorStop(0.7, '#1e1b4b');
  ceilGrad.addColorStop(1, '#312e81');
  ctx.fillStyle = ceilGrad;
  ctx.fillRect(0, 0, w, horizonY);

  // Carpet floor
  const floorGrad = ctx.createLinearGradient(0, horizonY, 0, h);
  floorGrad.addColorStop(0, '#334155');
  floorGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, horizonY, w, h - horizonY);

  // Large Sunset Panoramic Bay Window (Yaw ~20° to 130°)
  const winX = w * 0.08;
  const winW = w * 0.38;
  const sunset = ctx.createLinearGradient(0, horizonY - 200, 0, horizonY);
  sunset.addColorStop(0, '#4338ca');
  sunset.addColorStop(0.4, '#ec4899');
  sunset.addColorStop(0.8, '#f97316');
  sunset.addColorStop(1, '#fef08a');
  ctx.fillStyle = sunset;
  ctx.fillRect(winX, horizonY - 190, winW, 250);

  // City night light twinkles
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#fef08a';
    const lx = winX + Math.random() * winW;
    const ly = horizonY - 30 + Math.random() * 40;
    ctx.fillRect(lx, ly, 2, 2);
  }

  // Floating King Bed in center (Yaw ~180°)
  const bedX = w * 0.52;
  const bedW = w * 0.28;
  const bedY = horizonY;

  // Upholstered Velvet Headboard
  ctx.fillStyle = '#475569';
  ctx.fillRect(bedX, bedY - 110, bedW, 110);
  ctx.strokeStyle = '#64748b';
  ctx.strokeRect(bedX, bedY - 110, bedW, 110);

  // Warm Bedside Pendant Sconces
  for (const sx of [bedX - 30, bedX + bedW + 30]) {
    const sconceGlow = ctx.createRadialGradient(sx, bedY - 60, 2, sx, bedY - 60, 45);
    sconceGlow.addColorStop(0, '#ffffff');
    sconceGlow.addColorStop(0.4, '#fed7aa');
    sconceGlow.addColorStop(1, 'rgba(254, 215, 170, 0)');
    ctx.fillStyle = sconceGlow;
    ctx.beginPath();
    ctx.arc(sx, bedY - 60, 45, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bed platform & White Linen duvet
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(bedX - 15, bedY + 110);
  ctx.lineTo(bedX + bedW + 15, bedY + 110);
  ctx.lineTo(bedX + bedW - 10, bedY - 20);
  ctx.lineTo(bedX + 10, bedY - 20);
  ctx.closePath();
  ctx.fill();

  // Pillows
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(bedX + 30, bedY - 25, 70, 30);
  ctx.fillRect(bedX + bedW - 100, bedY - 25, 70, 30);
}

function renderTerrace(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  horizonY: number
) {
  // Clear Daylight Sky & Ocean Horizon
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  skyGrad.addColorStop(0, '#0284c7');
  skyGrad.addColorStop(0.6, '#38bdf8');
  skyGrad.addColorStop(1, '#bae6fd');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, horizonY);

  // Gentle cirrus clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  for (let c = 0; c < 8; c++) {
    const cx = (w / 8) * c + 60;
    ctx.beginPath();
    ctx.ellipse(cx, h * 0.18, 140, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Distant Mountain & Coastline
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  for (let x = 0; x <= w; x += 40) {
    const mh = Math.sin(x * 0.01) * 35 + Math.cos(x * 0.02) * 15;
    ctx.lineTo(x, horizonY - 15 - Math.max(0, mh));
  }
  ctx.lineTo(w, horizonY);
  ctx.closePath();
  ctx.fill();

  // Ocean Water at Horizon
  const oceanGrad = ctx.createLinearGradient(0, horizonY - 10, 0, horizonY + 30);
  oceanGrad.addColorStop(0, '#0369a1');
  oceanGrad.addColorStop(1, '#0284c7');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, horizonY - 5, w, 35);

  // Teak Wood Decking on Terrace
  const deckGrad = ctx.createLinearGradient(0, horizonY + 30, 0, h);
  deckGrad.addColorStop(0, '#d97706');
  deckGrad.addColorStop(0.5, '#b45309');
  deckGrad.addColorStop(1, '#78350f');
  ctx.fillStyle = deckGrad;
  ctx.fillRect(0, horizonY + 30, w, h - horizonY - 30);

  // Teak plank lines
  ctx.strokeStyle = 'rgba(69, 26, 3, 0.4)';
  ctx.lineWidth = 2;
  for (let p = 0; p < 40; p++) {
    const x = (w / 40) * p;
    ctx.beginPath();
    ctx.moveTo(x, horizonY + 30);
    ctx.lineTo((x - w * 0.5) * 1.8 + w * 0.5, h);
    ctx.stroke();
  }

  // Frameless Glass Balustrade & Handrail
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, horizonY + 28);
  ctx.lineTo(w, horizonY + 28);
  ctx.stroke();
}
