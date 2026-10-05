import { Chicken, Zombie, Gravestone, Particle, Sunflower } from '../types/game';

// Canvas drawing utilities for Chicken vs Zombies

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cameraX: number,
  gravestones: Gravestone[],
  sunflowers: Sunflower[]
) {
  // 1. Night Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#050b1a');
  skyGrad.addColorStop(0.35, '#0b193d');
  skyGrad.addColorStop(0.65, '#122b5c');
  skyGrad.addColorStop(1, '#081730');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Full Moon & Glow
  const moonX = width * 0.75;
  const moonY = height * 0.22;
  const moonRadius = 38;

  // Outer moonlight halo
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 120);
  moonGlow.addColorStop(0, 'rgba(255, 255, 230, 0.45)');
  moonGlow.addColorStop(0.5, 'rgba(165, 205, 255, 0.15)');
  moonGlow.addColorStop(1, 'rgba(165, 205, 255, 0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 120, 0, Math.PI * 2);
  ctx.fill();

  // Moon surface
  ctx.fillStyle = '#fffbe8';
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
  ctx.fill();

  // Subtle craters
  ctx.fillStyle = 'rgba(220, 220, 190, 0.35)';
  ctx.beginPath();
  ctx.arc(moonX - 10, moonY - 8, 8, 0, Math.PI * 2);
  ctx.arc(moonX + 12, moonY - 4, 11, 0, Math.PI * 2);
  ctx.arc(moonX - 5, moonY + 14, 9, 0, Math.PI * 2);
  ctx.fill();

  // 3. Spooky Distant Tree Silhouettes (Parallax factor 0.1)
  const treeParallax = (cameraX * 0.1) % 400;
  ctx.fillStyle = '#061329';
  ctx.beginPath();
  for (let x = -400; x < width + 400; x += 130) {
    const rx = x - treeParallax;
    const treeH = 140;
    const baseY = height * 0.58;
    ctx.moveTo(rx, baseY);
    ctx.quadraticCurveTo(rx + 25, baseY - treeH * 0.6, rx + 45, baseY - treeH);
    ctx.quadraticCurveTo(rx + 75, baseY - treeH * 0.5, rx + 95, baseY);
  }
  ctx.fill();

  // 4. Wooden Graveyard Fence with Skulls (Parallax factor 0.3)
  const fenceParallax = (cameraX * 0.3) % 180;
  const fenceY = height * 0.53;
  ctx.fillStyle = '#1c2940';
  ctx.strokeStyle = '#0e1828';
  ctx.lineWidth = 3;

  for (let x = -200; x < width + 200; x += 60) {
    const postX = x - fenceParallax;
    // Picket post
    ctx.fillRect(postX, fenceY - 40, 14, 65);
    ctx.strokeRect(postX, fenceY - 40, 14, 65);

    // Pointed top
    ctx.beginPath();
    ctx.moveTo(postX, fenceY - 40);
    ctx.lineTo(postX + 7, fenceY - 55);
    ctx.lineTo(postX + 14, fenceY - 40);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Occasional skull on post
    if (Math.abs(Math.floor((x) / 60)) % 5 === 0) {
      drawFenceSkull(ctx, postX + 7, fenceY - 60);
    }
  }

  // Cross horizontal fence beams
  ctx.fillRect(0, fenceY - 24, width, 10);
  ctx.strokeRect(0, fenceY - 24, width, 10);
  ctx.fillRect(0, fenceY + 6, width, 10);
  ctx.strokeRect(0, fenceY + 6, width, 10);

  // 5. Lawn / Turf Layer
  const groundY = height * 0.58;
  const turfGrad = ctx.createLinearGradient(0, groundY, 0, height);
  turfGrad.addColorStop(0, '#103947');
  turfGrad.addColorStop(0.3, '#0c2d3a');
  turfGrad.addColorStop(1, '#06161d');
  ctx.fillStyle = turfGrad;
  ctx.fillRect(0, groundY, width, height - groundY);

  // 6. Cracked Dirt Lane / Runway (Matches Image 3)
  const pathY = height * 0.68;
  const pathHeight = height * 0.22;
  const dirtGrad = ctx.createLinearGradient(0, pathY, 0, pathY + pathHeight);
  dirtGrad.addColorStop(0, '#534533');
  dirtGrad.addColorStop(0.2, '#6d5a44');
  dirtGrad.addColorStop(0.8, '#584837');
  dirtGrad.addColorStop(1, '#3b2f23');

  ctx.fillStyle = dirtGrad;
  ctx.fillRect(0, pathY, width, pathHeight);

  // Path borders & cracks
  ctx.strokeStyle = '#2d2218';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, pathY);
  ctx.lineTo(width, pathY);
  ctx.moveTo(0, pathY + pathHeight);
  ctx.lineTo(width, pathY + pathHeight);
  ctx.stroke();

  // Fissure cracks on dirt path
  ctx.strokeStyle = '#291d14';
  ctx.lineWidth = 2.5;
  const pathParallax = cameraX % 300;
  for (let x = -300; x < width + 300; x += 150) {
    const cx = x - pathParallax;
    ctx.beginPath();
    ctx.moveTo(cx, pathY + 30);
    ctx.lineTo(cx + 25, pathY + 50);
    ctx.lineTo(cx + 15, pathY + 70);
    ctx.lineTo(cx + 40, pathY + 90);
    ctx.stroke();
  }

  // 7. Sunflowers on the Left (Stationary / Farm Anchor, matches Image 3 & 4)
  sunflowers.forEach((sf) => {
    const screenX = sf.x - cameraX;
    if (screenX > -150 && screenX < width + 150) {
      drawCheeringSunflower(ctx, screenX, sf.y, sf.glowPhase, sf.readySun);
    }
  });

  // 8. Gravestones along the path with MULTIPLIER TEXT (Matches Image 3 & 4)
  gravestones.forEach((g) => {
    const screenX = g.x - cameraX;
    if (screenX > -100 && screenX < width + 100) {
      drawMultiplierGravestone(ctx, screenX, groundY + 35, g.multiplier, g.passed, g.glowTimer);
    }
  });

  // 9. Floating ground mist
  ctx.fillStyle = 'rgba(70, 120, 180, 0.08)';
  ctx.beginPath();
  ctx.ellipse(width * 0.4, groundY + 20, width * 0.5, 25, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFenceSkull(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.fillStyle = '#e5e7eb';
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eye sockets
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(x - 2.5, y - 0.5, 1.5, 0, Math.PI * 2);
  ctx.arc(x + 2.5, y - 0.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Spooky smiling sunflower with golden radiating glow (Matching 1791199709991.jpg)
export function drawCheeringSunflower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  glowPhase: number,
  readySun: boolean
) {
  ctx.save();

  // Mound of earth at bottom
  ctx.fillStyle = '#3a2b1f';
  ctx.beginPath();
  ctx.ellipse(x, y + 40, 24, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Stem
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + 38);
  ctx.quadraticCurveTo(x - 6, y + 15, x, y);
  ctx.stroke();

  // Leaves
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.ellipse(x - 14, y + 20, 12, 5, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 14, y + 23, 12, 5, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Golden Sun Halo / Pulsing Glow
  const pulse = Math.sin(glowPhase) * 6;
  const sunGlow = ctx.createRadialGradient(x, y, 16, x, y, 48 + pulse);
  sunGlow.addColorStop(0, 'rgba(251, 191, 36, 0.7)');
  sunGlow.addColorStop(0.6, 'rgba(245, 158, 11, 0.25)');
  sunGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(x, y, 48 + pulse, 0, Math.PI * 2);
  ctx.fill();

  // Flower Petals
  const petalCount = 14;
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1.5;

  for (let i = 0; i < petalCount; i++) {
    const angle = (i * Math.PI * 2) / petalCount + glowPhase * 0.1;
    const px = x + Math.cos(angle) * 25;
    const py = y + Math.sin(angle) * 25;

    ctx.beginPath();
    ctx.ellipse(px, py, 10, 6, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Dark Center Face (Jack-o-Lantern style)
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cute/Spooky Stitched Eyes & Mouth
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(x - 6, y - 3, 3, 0, Math.PI * 2);
  ctx.arc(x + 6, y - 3, 3, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y + 3, 7, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Ready Sun Coin Bubble
  if (readySun) {
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 20, y - 30, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', x + 20, y - 30);
  }

  ctx.restore();
}

// Weathered Tombstone with Multiplier (Matching 1791199709991.jpg & Ad)
export function drawMultiplierGravestone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  multiplier: number,
  passed: boolean,
  glowTimer: number
) {
  ctx.save();
  const width = 64;
  const height = 90;

  // Dirt mound
  ctx.fillStyle = '#261c14';
  ctx.beginPath();
  ctx.ellipse(x, y + 42, 36, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Gravestone Body
  ctx.fillStyle = passed ? '#334155' : '#475569';
  ctx.strokeStyle = passed ? '#22c55e' : '#1e293b';
  ctx.lineWidth = passed ? 3 : 2;

  ctx.beginPath();
  ctx.moveTo(x - width / 2, y + 40);
  ctx.lineTo(x - width / 2, y - 10);
  ctx.arc(x, y - 10, width / 2, Math.PI, 0); // Rounded arch top
  ctx.lineTo(x + width / 2, y + 40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cracks on gravestone
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 10, y - 30);
  ctx.lineTo(x - 2, y - 18);
  ctx.lineTo(x - 8, y - 6);
  ctx.stroke();

  // Golden glow if recently passed
  if (glowTimer > 0) {
    ctx.fillStyle = `rgba(250, 204, 21, ${Math.min(1, glowTimer * 0.8)})`;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 20;
  }

  // Multiplier Label (e.g. "2.47x", "2.70x")
  ctx.font = 'bold 16px "Fredoka", "Luckiest Guy", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Text shadow / outline
  ctx.fillStyle = passed ? '#4ade80' : '#f8fafc';
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 3;
  const multText = `${multiplier.toFixed(2)}x`;
  ctx.strokeText(multText, x, y + 5);
  ctx.fillText(multText, x, y + 5);

  ctx.restore();
}

// Draw Crazy Chicken Character (Matching 1791197881163.jpg)
export function drawCrazyChicken(
  ctx: CanvasRenderingContext2D,
  chicken: Chicken,
  shakeOffset: { x: number; y: number } = { x: 0, y: 0 }
) {
  ctx.save();
  const { x, y, isAttacking, cluckState, flappingFrame } = chicken;
  ctx.translate(x + shakeOffset.x, y + shakeOffset.y);

  // Bobbing / Running animation
  const bobY = Math.sin(flappingFrame * 0.4) * 4;
  const legAngle = Math.sin(flappingFrame * 0.5) * 0.4;
  ctx.translate(0, bobY);

  // If attacking, tilt forward aggressively
  if (isAttacking) {
    ctx.rotate(0.18);

    // Rocket / Dash flame behind chicken
    ctx.save();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(-35, 10);
    ctx.lineTo(-65 + Math.random() * 8, 20);
    ctx.lineTo(-35, 30);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(-35, 14);
    ctx.lineTo(-50, 20);
    ctx.lineTo(-35, 26);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  if (cluckState === 'crashed') {
    ctx.rotate(-0.35); // tipped backwards
  }

  // Shadow on ground
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 48 - bobY, 32, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // 1. Yellow Chicken Legs & Feet
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';

  // Left Leg
  ctx.save();
  ctx.rotate(legAngle);
  ctx.beginPath();
  ctx.moveTo(-10, 28);
  ctx.lineTo(-12, 42);
  ctx.lineTo(-4, 44);
  ctx.stroke();
  ctx.restore();

  // Right Leg
  ctx.save();
  ctx.rotate(-legAngle);
  ctx.beginPath();
  ctx.moveTo(8, 28);
  ctx.lineTo(12, 42);
  ctx.lineTo(20, 44);
  ctx.stroke();
  ctx.restore();

  // 2. White Feathered Body
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;

  ctx.beginPath();
  // Round plump body
  ctx.ellipse(0, 5, 28, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Fluffy Tail Feathers at back
  ctx.beginPath();
  ctx.moveTo(-24, 0);
  ctx.quadraticCurveTo(-38, -12, -32, 5);
  ctx.quadraticCurveTo(-38, 12, -22, 14);
  ctx.fill();
  ctx.stroke();

  // 3. Red Overalls / Suspender Pants (Matching image)
  ctx.fillStyle = '#dc2626';
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 2.5;

  // Pants base
  ctx.beginPath();
  ctx.arc(0, 12, 25, 0.2, Math.PI - 0.2);
  ctx.lineTo(0, 32);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Frilled hem
  ctx.fillStyle = '#b91c1c';
  for (let i = -16; i <= 16; i += 8) {
    ctx.beginPath();
    ctx.arc(i, 29, 4, 0, Math.PI);
    ctx.fill();
  }

  // Red Suspender Straps
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(-8, 22);
  ctx.moveTo(12, 0);
  ctx.lineTo(8, 22);
  ctx.stroke();

  // Shiny Yellow Buttons
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-8, 20, 4, 0, Math.PI * 2);
  ctx.arc(8, 20, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Wings (Yellow / Cream tone with feathers)
  ctx.fillStyle = '#fde047';
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2.5;

  ctx.save();
  const wingFlap = Math.sin(flappingFrame * 0.6) * 0.3;
  ctx.translate(-8, 8);
  ctx.rotate(wingFlap);
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 11, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 5. Head Mask & Eye Trim (Green Wing-shaped, matches Image 1)
  ctx.fillStyle = '#22c55e';
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-20, -18);
  ctx.quadraticCurveTo(-30, -30, -10, -26);
  ctx.quadraticCurveTo(0, -32, 10, -26);
  ctx.quadraticCurveTo(30, -30, 20, -18);
  ctx.fill();
  ctx.stroke();

  // 6. Huge Googly Eyes (Matching Image 1)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2.5;

  // Left Eye (Big and bulging)
  ctx.beginPath();
  ctx.arc(-6, -16, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right Eye (Slightly smaller, offset)
  ctx.beginPath();
  ctx.arc(14, -18, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pupils (Green eyes looking derpy / crazy in different directions!)
  if (cluckState === 'crashed') {
    // Spiral dizzy eyes!
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 2;
    drawSpiral(ctx, -6, -16, 6);
    drawSpiral(ctx, 14, -18, 5);
  } else {
    // Green iris
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(-4, -14, 4.5, 0, Math.PI * 2); // looking up/right
    ctx.arc(18, -20, 4, 0, Math.PI * 2); // looking up/crazy
    ctx.fill();

    // Black center pupil & white gleam
    ctx.fillStyle = '#052e16';
    ctx.beginPath();
    ctx.arc(-4, -14, 2.5, 0, Math.PI * 2);
    ctx.arc(18, -20, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-5, -15, 1.5, 0, Math.PI * 2);
    ctx.arc(17, -21, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. Yellow Beak & Lolling Pink Tongue (Matching Image 1)
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2.5;

  // Upper beak
  ctx.beginPath();
  ctx.moveTo(4, -8);
  ctx.quadraticCurveTo(22, -10, 28, -2);
  ctx.quadraticCurveTo(16, 4, 4, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lower beak open
  ctx.beginPath();
  ctx.moveTo(4, 3);
  ctx.lineTo(16, 7);
  ctx.lineTo(8, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tongue flopping out!
  ctx.fillStyle = '#f43f5e';
  ctx.strokeStyle = '#be123c';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(12, 1);
  ctx.quadraticCurveTo(24, 8, 16, 18);
  ctx.quadraticCurveTo(10, 16, 10, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 8. Jester Carnival Hat with Golden Bells (Matching Image 1)
  ctx.fillStyle = '#ef4444';
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 2;

  // Red main cap
  ctx.beginPath();
  ctx.arc(0, -28, 16, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Curving pink horns / stems
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';

  // Left stem
  ctx.beginPath();
  ctx.moveTo(-10, -36);
  ctx.quadraticCurveTo(-26, -55, -14, -60);
  ctx.stroke();

  // Right stem
  ctx.beginPath();
  ctx.moveTo(8, -36);
  ctx.quadraticCurveTo(22, -55, 14, -60);
  ctx.stroke();

  // Center crown
  ctx.beginPath();
  ctx.moveTo(0, -36);
  ctx.quadraticCurveTo(2, -50, 0, -56);
  ctx.stroke();

  // Golden sphere bells on tips!
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = '#854d0e';
  ctx.lineWidth = 1.5;
  [-14, 0, 14].forEach((bx) => {
    ctx.beginPath();
    ctx.arc(bx, -58, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // Dizzy stars floating if crashed
  if (cluckState === 'crashed') {
    ctx.fillStyle = '#fbbf24';
    drawMiniStar(ctx, -20, -50, 6);
    drawMiniStar(ctx, 22, -45, 5);
    drawMiniStar(ctx, 4, -70, 7);
  }

  ctx.restore();
}

function drawSpiral(ctx: CanvasRenderingContext2D, cx: number, cy: number, maxRadius: number) {
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 4; a += 0.2) {
    const r = (a / (Math.PI * 4)) * maxRadius;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function drawMiniStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    const ia = a + Math.PI / 5;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(ia) * (r * 0.45), cy + Math.sin(ia) * (r * 0.45));
  }
  ctx.closePath();
  ctx.fill();
}

// Draw Zombie Character (Matching 1791199288834.jpg)
export function drawZombie(ctx: CanvasRenderingContext2D, zombie: Zombie) {
  ctx.save();
  const { x, y, type, isHit, hitTimer, isDying, walkFrame, headFlyVx, headFlyVy, headY, headRotation } = zombie;
  ctx.translate(x, y);

  // If hit flash
  if (isHit || hitTimer > 0) {
    ctx.filter = 'brightness(1.8) drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))';
  }

  // Zombie walk wobble
  const walkBob = Math.sin(walkFrame * 0.3) * 3;
  const legAngle = Math.sin(walkFrame * 0.3) * 0.35;

  // Scale for boss type & FLIP HORIZONTALLY so zombie faces LEFT towards the chicken!
  const baseScale = type === 'boss' ? 1.6 : type === 'runner' ? 0.95 : 1.05;
  ctx.scale(-baseScale, baseScale);

  // Shadow on ground
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 48, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(0, walkBob);

  // 1. Torn Brown Pants & Legs
  ctx.fillStyle = '#78350f';
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 2.5;

  // Left Leg (torn hem)
  ctx.save();
  ctx.rotate(legAngle);
  ctx.fillRect(-14, 20, 10, 22);
  ctx.strokeRect(-14, 20, 10, 22);
  // Shoe
  ctx.fillStyle = '#292524';
  ctx.beginPath();
  ctx.ellipse(-14, 44, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right Leg (with green patch on knee)
  ctx.save();
  ctx.rotate(-legAngle);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(4, 20, 10, 22);
  ctx.strokeRect(4, 20, 10, 22);

  // Olive green patch on knee
  ctx.fillStyle = '#84cc16';
  ctx.fillRect(5, 26, 7, 6);

  // Shoe
  ctx.fillStyle = '#292524';
  ctx.beginPath();
  ctx.ellipse(10, 44, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Ragged Blue Shirt / Body
  ctx.fillStyle = '#0284c7';
  ctx.strokeStyle = '#0369a1';
  ctx.lineWidth = 2.5;

  // Shirt torso
  ctx.beginPath();
  ctx.moveTo(-16, -2);
  ctx.lineTo(16, -2);
  ctx.lineTo(18, 22);
  ctx.lineTo(-18, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Ragged torn shirt bottom
  ctx.fillStyle = '#0369a1';
  for (let px = -16; px < 16; px += 8) {
    ctx.beginPath();
    ctx.moveTo(px, 22);
    ctx.lineTo(px + 4, 27);
    ctx.lineTo(px + 8, 22);
    ctx.fill();
  }

  // Collar
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(-10, -2);
  ctx.lineTo(-2, 8);
  ctx.lineTo(6, -2);
  ctx.fill();

  // 3. Outstretched Aggressive Zombie Claws (reaching directly at chicken)
  ctx.fillStyle = '#84cc16';
  ctx.strokeStyle = '#365314';
  ctx.lineWidth = 2.5;

  // Sleeve
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(-6, 2, 16, 10);
  ctx.strokeRect(-6, 2, 16, 10);

  // Outstretched aggressive arms
  ctx.fillStyle = '#84cc16';
  ctx.beginPath();
  ctx.moveTo(6, 3);
  ctx.lineTo(34, 4);
  ctx.lineTo(34, 15);
  ctx.lineTo(6, 13);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sharp aggressive claws reaching forward
  ctx.fillStyle = '#292524';
  ctx.beginPath();
  ctx.moveTo(34, 4); ctx.lineTo(44, 6); ctx.lineTo(34, 8);
  ctx.moveTo(34, 8); ctx.lineTo(45, 10); ctx.lineTo(34, 12);
  ctx.moveTo(34, 12); ctx.lineTo(43, 14); ctx.lineTo(34, 16);
  ctx.fill();
  ctx.stroke();

  // 4. Zombie Head (If dying, head flies off comically!)
  ctx.save();
  if (isDying && headY !== undefined) {
    ctx.translate(0, headY);
    ctx.rotate(headRotation || 0);
  }

  // Olive Green Head
  ctx.fillStyle = '#65a30d';
  ctx.strokeStyle = '#365314';
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.ellipse(-2, -22, 22, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Aggressive Furrowed Brow Ridges
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-18, -34);
  ctx.lineTo(-4, -29);
  ctx.lineTo(16, -34);
  ctx.stroke();

  // Aggressive Fiery Blood-Red & Yellow Eyes
  ctx.fillStyle = '#dc2626'; // outer bloodshot rim
  ctx.beginPath();
  ctx.arc(-10, -25, 11, 0, Math.PI * 2);
  ctx.arc(8, -23, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fef08a'; // yellow glowing iris
  ctx.beginPath();
  ctx.arc(-10, -25, 8.5, 0, Math.PI * 2);
  ctx.arc(8, -23, 10, 0, Math.PI * 2);
  ctx.fill();

  // Intense angry black pupils glaring straight at chicken
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-7, -25, 3.5, 0, Math.PI * 2);
  ctx.arc(11, -23, 4, 0, Math.PI * 2);
  ctx.fill();

  // Fierce Snarling Jaw with Sharp Predator Fangs
  ctx.fillStyle = '#3f0404'; // dark red mouth cavern
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.ellipse(-2, -9, 15, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sharp jagged fangs
  ctx.fillStyle = '#fef9c3';
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 1;

  // Top fangs
  ctx.beginPath();
  ctx.moveTo(-12, -16); ctx.lineTo(-9, -9); ctx.lineTo(-6, -16);
  ctx.moveTo(-4, -16); ctx.lineTo(-1, -10); ctx.lineTo(2, -16);
  ctx.moveTo(4, -16); ctx.lineTo(7, -9); ctx.lineTo(10, -16);
  ctx.fill();
  ctx.stroke();

  // Bottom fangs
  ctx.beginPath();
  ctx.moveTo(-8, -3); ctx.lineTo(-5, -8); ctx.lineTo(-2, -3);
  ctx.moveTo(2, -3); ctx.lineTo(5, -8); ctx.lineTo(8, -3);
  ctx.fill();
  ctx.stroke();

  // Toxic green drool dripping from jaws
  ctx.fillStyle = '#84cc16';
  ctx.beginPath();
  ctx.arc(4, -1, 2.5, 0, Math.PI * 2);
  ctx.arc(5, 5, 2, 0, Math.PI * 2);
  ctx.fill();

  // 5. Zombie Special Accessories based on Type
  if (type === 'conehead') {
    // Traffic cone on head
    ctx.fillStyle = '#ea580c';
    ctx.strokeStyle = '#9a3412';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, -42);
    ctx.lineTo(0, -78);
    ctx.lineTo(12, -42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // White cone reflective stripe
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-8, -60, 14, 8);
  } else if (type === 'buckethead') {
    // Galvanized metal bucket on head
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.fillRect(-16, -56, 30, 24);
    ctx.strokeRect(-16, -56, 30, 24);
    // Bucket rim & handle
    ctx.strokeRect(-18, -34, 34, 4);
  } else if (type === 'runner') {
    // Red sweatband
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-18, -38, 34, 7);
  } else if (type === 'boss') {
    // Spiked iron crown & war paint
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-14, -20, 4, 18);
    ctx.fillRect(8, -20, 4, 18);
    // Horns
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(-18, -42);
    ctx.lineTo(-28, -65);
    ctx.lineTo(-12, -45);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore(); // end head

  ctx.restore();
}

// Draw Comic Starburst Impact Explosion (Matching Screenshot_20261005_121138_Google Play Store.jpg)
export function drawImpactStarburst(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number = 0
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Outer orange starburst
  const points = 12;
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 3;

  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const outerA = (i * Math.PI * 2) / points;
    const innerA = outerA + Math.PI / points;
    const outerR = size;
    const innerR = size * 0.45;

    ctx.lineTo(Math.cos(outerA) * outerR, Math.sin(outerA) * outerR);
    ctx.lineTo(Math.cos(innerA) * innerR, Math.sin(innerA) * innerR);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner bright yellow & white core
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const outerA = (i * Math.PI * 2) / points;
    const innerA = outerA + Math.PI / points;
    const outerR = size * 0.7;
    const innerR = size * 0.3;

    ctx.lineTo(Math.cos(outerA) * outerR, Math.sin(outerA) * outerR);
    ctx.lineTo(Math.cos(innerA) * innerR, Math.sin(innerA) * innerR);
  }
  ctx.closePath();
  ctx.fill();

  // Bright white flash center
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Draw Particles (Comic text, feathers, coins, slime, sparks)
export function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.translate(p.x, p.y);
  const alpha = Math.max(0, p.life / p.maxLife);
  ctx.globalAlpha = alpha;

  if (p.type === 'text' && p.text) {
    ctx.font = 'bold 22px "Luckiest Guy", "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 4;
    ctx.strokeText(p.text, 0, 0);
    ctx.fillStyle = p.color;
    ctx.fillText(p.text, 0, 0);
  } else if (p.type === 'coin') {
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#854d0e';
    ctx.font = `bold ${p.size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);
  } else if (p.type === 'feather') {
    ctx.rotate(p.rotation || 0);
    ctx.fillStyle = p.color || '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 2, p.size, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.type === 'slime') {
    ctx.fillStyle = p.color || '#84cc16';
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.type === 'sun') {
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.type === 'starburst') {
    drawImpactStarburst(ctx, 0, 0, p.size, p.rotation || 0);
  } else {
    // Default sparks
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Draw Combat Target Reticle & Strike Zone Alert
export function drawStrikeZoneIndicator(
  ctx: CanvasRenderingContext2D,
  zombieX: number,
  zombieY: number,
  inStrikeZone: boolean
) {
  ctx.save();
  ctx.translate(zombieX, zombieY - 60);

  if (inStrikeZone) {
    // Pulsing bright red/yellow target reticle
    const pulse = Math.sin(Date.now() * 0.015) * 4;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;

    // Crosshair circle
    ctx.beginPath();
    ctx.arc(0, 0, 18 + pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshair ticks
    ctx.beginPath();
    ctx.moveTo(0, -26 - pulse);
    ctx.lineTo(0, -12);
    ctx.moveTo(0, 12);
    ctx.lineTo(0, 26 + pulse);
    ctx.moveTo(-26 - pulse, 0);
    ctx.lineTo(-12, 0);
    ctx.moveTo(12, 0);
    ctx.lineTo(26 + pulse, 0);
    ctx.stroke();

    // "FIGHT NOW!" Comic Banner
    ctx.font = 'bold 15px "Luckiest Guy", "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText('⚔️ FIGHT NOW!', 0, -26 - pulse);
    ctx.fillStyle = '#facc15';
    ctx.fillText('⚔️ FIGHT NOW!', 0, -26 - pulse);
  }

  ctx.restore();
}

