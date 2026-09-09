// ===== PRELOADER =====
document.body.style.overflow = 'hidden';
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('done');
    document.body.style.overflow = '';
    startHeroAnim();
  }, 4200);
});

// ===== PREMIUM BACKGROUND — Smoke + Aurora + Embers =====
(function() {
  const c = document.getElementById('bg-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let mouse = { x: -1000, y: -1000 };
  let W, H;

  function resize() {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });

  const blobs = [];
  for (let i = 0; i < 6; i++) {
    blobs.push({
      x: Math.random() * 2000, y: Math.random() * 2000,
      radius: 150 + Math.random() * 250,
      vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.12,
      phase: Math.random() * Math.PI * 2,
      breathSpeed: 0.003 + Math.random() * 0.004,
      alpha: 0.02 + Math.random() * 0.02
    });
  }

  const streams = [];
  for (let i = 0; i < 5; i++) {
    const pts = [];
    const sx = Math.random() * 2000, sy = Math.random() * 2000;
    for (let j = 0; j < 8; j++) {
      pts.push({
        x: sx + j * 120 + (Math.random() - 0.5) * 80,
        y: sy + (Math.random() - 0.5) * 200,
        phase: Math.random() * Math.PI * 2,
        amp: 20 + Math.random() * 40,
        speed: 0.005 + Math.random() * 0.008
      });
    }
    streams.push({ pts, alpha: 0.03 + Math.random() * 0.025 });
  }

  const embers = [];
  function spawnEmber() {
    embers.push({
      x: Math.random() * W, y: H + 10,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.5, vy: -(Math.random() * 1.0 + 0.3),
      alpha: Math.random() * 0.5 + 0.2,
      life: 0, maxLife: 300 + Math.random() * 400,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.015 + Math.random() * 0.025
    });
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t++;

    for (const b of blobs) {
      b.phase += b.breathSpeed;
      b.x += b.vx; b.y += b.vy;
      if (b.x < -b.radius) b.x = W + b.radius;
      if (b.x > W + b.radius) b.x = -b.radius;
      if (b.y < -b.radius) b.y = H + b.radius;
      if (b.y > H + b.radius) b.y = -b.radius;
      const breathR = b.radius + Math.sin(b.phase) * 30;
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, breathR);
      grad.addColorStop(0, `rgba(255,77,0,${b.alpha})`);
      grad.addColorStop(0.4, `rgba(255,50,0,${b.alpha * 0.4})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(b.x - breathR, b.y - breathR, breathR * 2, breathR * 2);
    }

    for (const s of streams) {
      ctx.beginPath();
      for (let i = 0; i < s.pts.length; i++) {
        const p = s.pts[i];
        p.phase += p.speed;
        const px = p.x + Math.sin(p.phase) * p.amp * 0.5;
        const py = p.y + Math.cos(p.phase) * p.amp;
        if (px > W + 200) p.x -= W + 400;
        if (px < -200) p.x += W + 400;
        if (i === 0) ctx.moveTo(px, py);
        else {
          const prev = s.pts[i - 1];
          const prevX = prev.x + Math.sin(prev.phase) * prev.amp * 0.5;
          const prevY = prev.y + Math.cos(prev.phase) * prev.amp;
          ctx.quadraticCurveTo(prevX, prevY, (prevX + px) / 2, (prevY + py) / 2);
        }
      }
      ctx.strokeStyle = `rgba(255,77,0,${s.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (mouse.x > 0 && mouse.y > 0) {
      const g1 = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
      g1.addColorStop(0, 'rgba(255,77,0,0.07)');
      g1.addColorStop(0.5, 'rgba(255,40,0,0.025)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 200, 0, Math.PI * 2);
      ctx.fill();
    }

    if (Math.random() > 0.94) spawnEmber();
    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i];
      e.life++;
      e.wobble += e.wobbleSpeed;
      e.x += e.vx + Math.sin(e.wobble) * 0.3;
      e.y += e.vy;
      const lifeRatio = e.life / e.maxLife;
      const fadeIn = Math.min(lifeRatio * 5, 1);
      const fadeOut = Math.max(0, 1 - (lifeRatio - 0.6) / 0.4);
      const alpha = e.alpha * fadeIn * fadeOut;
      if (alpha <= 0 || e.life > e.maxLife) { embers.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,77,0,${alpha * 0.1})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,${100 + Math.random() * 50 | 0},0,${alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== PRELOADER — Stroke-Trace "25" =====
(function() {
  const c = document.getElementById('preloader-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  c.width = window.innerWidth;
  c.height = window.innerHeight;

  const fontSize = Math.min(c.width * 0.35, 300);
  const cx = c.width / 2, cy = c.height / 2;

  // Sample the outline of "25" by drawing and extracting edge pixels
  ctx.font = `italic 400 ${fontSize}px "Instrument Serif", Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText('25', cx, cy);

  const imgData = ctx.getImageData(0, 0, c.width, c.height);
  const px = imgData.data;

  // Extract edge points (outline only)
  const edgePoints = [];
  const step = 2;
  for (let y = 0; y < c.height; y += step) {
    for (let x = 0; x < c.width; x += step) {
      const i = (y * c.width + x) * 4;
      if (px[i + 3] > 128) {
        // Check if it's an edge (has a transparent neighbor)
        let isEdge = false;
        for (const [dx, dy] of [[-step,0],[step,0],[0,-step],[0,step]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= c.width || ny >= c.height) { isEdge = true; break; }
          const ni = (ny * c.width + nx) * 4;
          if (px[ni + 3] < 128) { isEdge = true; break; }
        }
        if (isEdge) edgePoints.push({ x, y });
      }
    }
  }

  ctx.clearRect(0, 0, c.width, c.height);

  // Sort edge points roughly by angle from center for a coherent trace
  const textCx = cx, textCy = cy;
  edgePoints.sort((a, b) => {
    const aa = Math.atan2(a.y - textCy, a.x - textCx);
    const ba = Math.atan2(b.y - textCy, b.x - textCx);
    return aa - ba;
  });

  let startTime = performance.now();
  const duration = 3.5;
  const trailLength = 0.15;

  function animate(now) {
    const elapsed = (now - startTime) / 1000;
    const progress = Math.min(elapsed / duration, 1);

    ctx.clearRect(0, 0, c.width, c.height);

    // Draw revealed portions with glow
    const revealed = Math.floor(progress * edgePoints.length);

    // Full text glow (fades in)
    const textAlpha = Math.max(0, (progress - 0.3) / 0.7) * 0.15;
    if (textAlpha > 0) {
      ctx.font = `italic 400 ${fontSize}px "Instrument Serif", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(255,77,0,${textAlpha})`;
      ctx.fillText('25', cx, cy);
    }

    // Draw traced outline
    for (let i = 0; i < revealed; i++) {
      const p = edgePoints[i];
      const recency = (revealed - i) / (edgePoints.length * trailLength);
      const bright = recency < 1 ? recency : 0;
      const baseAlpha = 0.3 + bright * 0.7;
      const r = 1 + bright * 2;

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,77,0,${baseAlpha * (0.3 + progress * 0.7)})`;
      ctx.fill();

      // Bright head glow
      if (bright > 0.8) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,77,0,${bright * 0.2})`;
        ctx.fill();
      }
    }

    // Final state: solid outlined "25"
    if (progress >= 1) {
      ctx.font = `italic 400 ${fontSize}px "Instrument Serif", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(255,77,0,0.6)';
      ctx.lineWidth = 2;
      ctx.strokeText('25', cx, cy);
      ctx.fillStyle = 'rgba(255,77,0,0.12)';
      ctx.fillText('25', cx, cy);
    }

    if (progress < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

// ===== HERO "25" — Glowing Outlined Text (no dots) =====
(function() {
  const c = document.getElementById('hero-particles');
  if (!c) return;
  const ctx = c.getContext('2d');
  let mouse = { x: -1000, y: -1000 };

  function setup() {
    const rect = c.parentElement.getBoundingClientRect();
    c.width = rect.width;
    c.height = rect.height;
  }

  let t = 0;
  function animate() {
    ctx.clearRect(0, 0, c.width, c.height);
    t += 0.015;

    const fontSize = Math.min(c.width * 0.25, 250);
    const cx = c.width / 2, cy = c.height / 2 - 20;

    // Pulsing glow layers
    const pulse = Math.sin(t) * 0.03 + 0.07;
    const pulse2 = Math.sin(t * 0.7 + 1) * 0.02 + 0.05;

    ctx.font = `italic 400 ${fontSize}px "Instrument Serif", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Outer glow
    ctx.shadowColor = 'rgba(255,77,0,0.3)';
    ctx.shadowBlur = 40 + Math.sin(t) * 10;
    ctx.fillStyle = `rgba(255,77,0,${pulse})`;
    ctx.fillText('25', cx, cy);

    // Mid glow
    ctx.shadowBlur = 20;
    ctx.fillStyle = `rgba(255,77,0,${pulse2})`;
    ctx.fillText('25', cx, cy);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // Outline stroke
    ctx.strokeStyle = `rgba(255,77,0,${0.15 + Math.sin(t * 1.2) * 0.05})`;
    ctx.lineWidth = 1.5;
    ctx.strokeText('25', cx, cy);

    // Mouse interaction: bright spot near cursor
    if (mouse.x > 0 && mouse.y > 0) {
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120);
      grad.addColorStop(0, 'rgba(255,77,0,0.08)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  c.addEventListener('mousemove', (e) => {
    const rect = c.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  c.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

  setTimeout(() => { setup(); animate(); }, 300);
  window.addEventListener('resize', setup);
})();

// ===== NAVBAR =====
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const mmenu = document.getElementById('mobile-menu');
if (hamburger && mmenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mmenu.classList.toggle('active');
    document.body.style.overflow = mmenu.classList.contains('active') ? 'hidden' : '';
  });
  mmenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mmenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const el = document.querySelector(a.getAttribute('href'));
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== SHARED: Sample shards from hero title =====
function sampleHeroShards(dc, ctx, heroTitle, heroInner) {
  const rect = heroInner.getBoundingClientRect();
  dc.width = rect.width;
  dc.height = rect.height;

  const topSpan = heroTitle.querySelector('.hero-title-top');
  const bottomSpan = heroTitle.querySelector('.hero-title-bottom');
  const topSize = parseFloat(getComputedStyle(topSpan).fontSize);
  const bottomSize = parseFloat(getComputedStyle(bottomSpan).fontSize);

  ctx.clearRect(0, 0, dc.width, dc.height);
  ctx.font = `400 ${topSize}px "Instrument Serif", Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f0f0f0';
  const topRect = topSpan.getBoundingClientRect();
  const topY = topRect.top - rect.top;
  ctx.fillText('Technical', dc.width / 2, topY + topSize * 0.82);

  ctx.font = `italic 400 ${bottomSize}px "Instrument Serif", Georgia, serif`;
  ctx.fillStyle = '#ff4d00';
  const bottomRect = bottomSpan.getBoundingClientRect();
  const bottomY = bottomRect.top - rect.top;
  ctx.fillText('Symposium.', dc.width / 2, bottomY + bottomSize * 0.82);

  const fullImage = ctx.getImageData(0, 0, dc.width, dc.height);
  ctx.clearRect(0, 0, dc.width, dc.height);

  const shards = [];
  const shardW = 18 + Math.random() * 12;
  const shardH = 22 + Math.random() * 10;
  const textTop = Math.min(topY, bottomY) - 10;
  const textBottom = Math.max(topY + topSize, bottomY + bottomSize) + 10;
  const textLeft = dc.width * 0.1;
  const textRight = dc.width * 0.9;

  for (let y = textTop; y < textBottom; y += shardH) {
    for (let x = textLeft; x < textRight; x += shardW) {
      const w = Math.min(shardW, textRight - x);
      const h = Math.min(shardH, textBottom - y);
      let hasContent = false;
      for (let sy = Math.max(0, y | 0); sy < Math.min(dc.height, (y + h) | 0); sy += 3) {
        for (let sx = Math.max(0, x | 0); sx < Math.min(dc.width, (x + w) | 0); sx += 3) {
          const i = (sy * dc.width + sx) * 4;
          if (fullImage.data[i + 3] > 50) { hasContent = true; break; }
        }
        if (hasContent) break;
      }
      if (hasContent) {
        const centerX = x + w / 2;
        const centerY = y + h / 2;
        const angle = Math.atan2(centerY - dc.height / 2, centerX - dc.width / 2);
        shards.push({
          x: x | 0, y: y | 0, w: w | 0, h: h | 0,
          tx: Math.cos(angle + (Math.random() - 0.5) * 0.8) * (200 + Math.random() * 300),
          ty: Math.sin(angle + (Math.random() - 0.5) * 0.8) * (150 + Math.random() * 200),
          rot: (Math.random() - 0.5) * 60,
          delay: Math.random() * 0.3
        });
      }
    }
  }
  return { shards, image: fullImage };
}

// ===== SHARD ASSEMBLY INTRO (reverse of dispersion) =====
function assembleTitle(onDone) {
  const dc = document.getElementById('dispersion-canvas');
  const heroTitle = document.getElementById('hero-title');
  if (!dc || !heroTitle) { onDone(); return; }

  const ctx = dc.getContext('2d');
  const heroInner = heroTitle.closest('.hero-inner');

  heroTitle.style.opacity = '1';
  heroTitle.style.transform = 'translateY(0px)';
  heroTitle.classList.add('visible');

  const data = sampleHeroShards(dc, ctx, heroTitle, heroInner);
  heroTitle.style.opacity = '0';

  dc.style.opacity = '1';

  const off = document.createElement('canvas');
  off.width = dc.width;
  off.height = dc.height;
  off.getContext('2d').putImageData(data.image, 0, 0);

  const duration = 2200;
  const startTime = performance.now();

  function animate(now) {
    const elapsed = now - startTime;
    const rawP = Math.min(elapsed / duration, 1);
    const progress = 1 - rawP;

    ctx.clearRect(0, 0, dc.width, dc.height);

    if (progress < 0.001) {
      ctx.putImageData(data.image, 0, 0);
    } else {
      for (const s of data.shards) {
        const sp = Math.max(0, Math.min(1, (progress - s.delay) / (1 - s.delay)));
        const ease = sp * sp;
        const offsetX = s.tx * ease;
        const offsetY = s.ty * ease;
        const rot = s.rot * ease * (Math.PI / 180);
        const alpha = 1 - sp;
        if (alpha <= 0.01) continue;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(s.x + s.w / 2 + offsetX, s.y + s.h / 2 + offsetY);
        ctx.rotate(rot);
        ctx.drawImage(off, s.x, s.y, s.w, s.h, -s.w / 2, -s.h / 2, s.w, s.h);
        ctx.restore();
      }
    }

    if (rawP < 1) {
      requestAnimationFrame(animate);
    } else {
      dc.style.opacity = '0';
      heroTitle.style.opacity = '1';
      onDone();
    }
  }
  requestAnimationFrame(animate);
}

// ===== GEOMETRIC SHARD DISPERSION ON SCROLL (fully reversible) =====
function setupDispersion() {
  const dc = document.getElementById('dispersion-canvas');
  const heroTitle = document.getElementById('hero-title');
  const heroTag = document.getElementById('hero-tag');
  const heroCollege = document.getElementById('hero-college');
  if (!dc || !heroTitle) return;

  const ctx = dc.getContext('2d');
  const heroInner = heroTitle.closest('.hero-inner');

  let data = null;
  let currentProgress = 0;
  let rafId = null;

  function drawFrame() {
    if (!data) return;
    ctx.clearRect(0, 0, dc.width, dc.height);

    const p = currentProgress;

    ctx.putImageData(data.image, 0, 0);

    if (p > 0.001) {
      ctx.clearRect(0, 0, dc.width, dc.height);

      const off = document.createElement('canvas');
      off.width = dc.width;
      off.height = dc.height;
      off.getContext('2d').putImageData(data.image, 0, 0);

      for (const s of data.shards) {
        const sp = Math.max(0, Math.min(1, (p - s.delay) / (1 - s.delay)));
        const ease = sp * sp;

        const offsetX = s.tx * ease;
        const offsetY = s.ty * ease;
        const rot = s.rot * ease * (Math.PI / 180);
        const alpha = 1 - sp;

        if (alpha <= 0.01) continue;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(s.x + s.w / 2 + offsetX, s.y + s.h / 2 + offsetY);
        ctx.rotate(rot);
        ctx.drawImage(off, s.x, s.y, s.w, s.h, -s.w / 2, -s.h / 2, s.w, s.h);
        ctx.restore();
      }
    }
  }

  function loop() {
    drawFrame();
    rafId = requestAnimationFrame(loop);
  }

  ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 0.3,
    onUpdate: (self) => {
      const prog = self.progress;

      if (!data && prog > 0.02) {
        data = sampleHeroShards(dc, ctx, heroTitle, heroInner);
        loop();
      }

      if (prog > 0.02) {
        const disperseP = Math.min((prog - 0.02) / 0.75, 1);
        currentProgress = disperseP;
        dc.style.opacity = '1';
        heroTitle.style.opacity = disperseP > 0.01 ? '0' : '1';
      } else {
        currentProgress = 0;
        dc.style.opacity = '0';
        heroTitle.style.opacity = '1';
      }

      const fade = Math.max(0, 1 - prog * 1.5);
      if (heroTag) heroTag.style.opacity = String(fade);
      if (heroCollege) heroCollege.style.opacity = String(fade);
    },
    onLeave: () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    },
    onEnterBack: () => {
      if (data && !rafId) loop();
    }
  });
}

// ===== HERO GSAP ANIMATION =====
function startHeroAnim() {
  if (typeof gsap === 'undefined') {
    document.querySelectorAll('[data-anim], .hero-tag, .hero-title, .hero-college, .hero-sys').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.to('.hero-tag', {
    opacity:1, y:0, scale:1, duration:1.2, ease:'power2.out',
    onComplete: () => {
      const tag = document.getElementById('hero-tag');
      if (tag) { tag.style.opacity = '1'; tag.style.transform = 'translateY(0px) scale(1)'; }

      assembleTitle(() => {
        const title = document.getElementById('hero-title');
        const college = document.getElementById('hero-college');
        if (title) { title.style.opacity = '1'; title.style.transform = 'translateY(0px)'; }

        gsap.to('.hero-college', {
          opacity:1, y:0, duration:1, ease:'power2.out',
          onComplete: () => {
            if (college) { college.style.opacity = '1'; college.style.transform = 'translateY(0px)'; }
            setTimeout(setupDispersion, 200);
          }
        });
        gsap.to('.hero-sys', { opacity:1, duration:.8 });
      });
    }
  });

  document.querySelectorAll('[data-anim]').forEach(el => {
    gsap.to(el, {
      opacity:1, y:0, duration:.8, ease:'power3.out',
      scrollTrigger: { trigger:el, start:'top 85%', toggleActions:'play none none none' }
    });
  });

  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
      opacity:0, x:-30, duration:.6, delay: i * .1, ease:'power3.out',
      scrollTrigger: { trigger:item, start:'top 88%', toggleActions:'play none none none' }
    });
  });

  gsap.utils.toArray('.event-card').forEach((card, i) => {
    gsap.from(card, {
      opacity:0, y:30, scale: 0.95, duration:.6, delay: i * .06, ease:'power3.out',
      scrollTrigger: { trigger:card, start:'top 90%', toggleActions:'play none none none' }
    });
  });

  gsap.utils.toArray('.about-num-item').forEach((item, i) => {
    gsap.from(item, {
      opacity:0, scale:.9, duration:.5, delay: i * .1, ease:'power3.out',
      scrollTrigger: { trigger:item, start:'top 88%', toggleActions:'play none none none' }
    });
  });
}

// Fallback init
window.addEventListener('DOMContentLoaded', () => {
  const check = setInterval(() => {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      clearInterval(check);
    }
  }, 100);
  setTimeout(() => {
    clearInterval(check);
    if (!document.getElementById('preloader').classList.contains('done')) {
      document.getElementById('preloader').classList.add('done');
      document.body.style.overflow = '';
      startHeroAnim();
    }
  }, 5000);
});

// ===== REGISTRATION FORM =====
(function() {
  const form = document.getElementById('reg-form');
  if (!form) return;

  const step1 = document.getElementById('reg-step-1');
  const step2 = document.getElementById('reg-step-2');
  const step3 = document.getElementById('reg-step-3');
  const toStep2Btn = document.getElementById('to-step-2');
  const toStep1Btn = document.getElementById('to-step-1');
  const eventError = document.getElementById('event-error');
  const teamError = document.getElementById('team-error');
  const selectedEventName = document.getElementById('selected-event-name');
  const membersContainer = document.getElementById('members-container');
  const teamSizeSelect = document.getElementById('team-size');
  const regAnother = document.getElementById('reg-another');

  const eventConfig = {
    'Ideathon': { minTeam: 2, maxTeam: 4, fields: ['idea-title', 'idea-domain'] },
    'App Development': { minTeam: 2, maxTeam: 4, fields: ['app-platform', 'app-techstack'] },
    'Zerocrypt CTF': { minTeam: 2, maxTeam: 3, fields: ['ctf-experience'] },
    'AI Prompt Battle': { minTeam: 1, maxTeam: 2, fields: ['ai-tool-pref'] },
    'Code Relay': { minTeam: 4, maxTeam: 4, fields: ['relay-languages'] },
    'Hack & Hunt': { minTeam: 2, maxTeam: 3, fields: ['hunt-experience'] },
    'Green Tech Challenge': { minTeam: 3, maxTeam: 4, fields: ['greentech-domain'] },
    'RoboInnovate': { minTeam: 3, maxTeam: 4, fields: ['robo-hardware'] }
  };

  const extraFieldDefs = {
    'idea-title': { label: 'Idea Title / Theme', type: 'text', placeholder: 'Brief title of your idea' },
    'idea-domain': { label: 'Domain', type: 'select', options: ['HealthTech', 'EdTech', 'FinTech', 'AgriTech', 'Sustainability', 'Other'] },
    'app-platform': { label: 'Target Platform', type: 'select', options: ['Android', 'iOS', 'Cross-Platform', 'Web App'] },
    'app-techstack': { label: 'Preferred Tech Stack', type: 'text', placeholder: 'e.g. Flutter, React Native, Kotlin' },
    'ctf-experience': { label: 'CTF Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
    'ai-tool-pref': { label: 'Preferred AI Tool', type: 'select', options: ['ChatGPT', 'Claude', 'Gemini', 'Midjourney', 'Other'] },
    'relay-languages': { label: 'Languages Known (team)', type: 'text', placeholder: 'e.g. Python, Java, C++, JavaScript' },
    'hunt-experience': { label: 'Puzzle/CTF Experience', type: 'select', options: ['First time', 'Done 1-3 events', 'Experienced'] },
    'greentech-domain': { label: 'Focus Area', type: 'select', options: ['Renewable Energy', 'Waste Management', 'Water Conservation', 'Carbon Reduction', 'Other'] },
    'robo-hardware': { label: 'Own Hardware/Kit?', type: 'select', options: ['Yes — Arduino/ESP32', 'Yes — Raspberry Pi', 'Yes — Other', 'No — Need Provided Kit'] }
  };

  function getSelectedEvent() {
    const checked = form.querySelector('input[name="event"]:checked');
    return checked ? checked.value : null;
  }

  function updateTeamSizeOptions(eventName) {
    const cfg = eventConfig[eventName];
    if (!cfg) return;
    teamSizeSelect.innerHTML = '<option value="">Select</option>';
    for (let i = cfg.minTeam; i <= cfg.maxTeam; i++) {
      const label = i === 1 ? '1 (Individual)' : `${i} Members`;
      teamSizeSelect.innerHTML += `<option value="${i}">${label}</option>`;
    }
  }

  function renderExtraFields(eventName) {
    const cfg = eventConfig[eventName];
    if (!cfg) return '';
    let html = '<div class="member-group"><span class="member-group-title">Event-Specific Details</span>';
    for (const fid of cfg.fields) {
      const def = extraFieldDefs[fid];
      if (!def) continue;
      html += `<div class="reg-field"><label for="${fid}">${def.label}</label>`;
      if (def.type === 'select') {
        html += `<select id="${fid}" required><option value="">Select</option>`;
        for (const o of def.options) html += `<option value="${o}">${o}</option>`;
        html += '</select>';
      } else {
        html += `<input type="text" id="${fid}" placeholder="${def.placeholder || ''}" required>`;
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function renderMembers(count) {
    let html = '';
    const eventName = getSelectedEvent();
    for (let i = 2; i <= count; i++) {
      html += `<div class="member-group">
        <span class="member-group-title">Member ${i}</span>
        <div class="reg-field"><label for="m${i}-name">Full Name</label><input type="text" id="m${i}-name" placeholder="Member name" required></div>
        <div class="reg-field"><label for="m${i}-email">Email</label><input type="email" id="m${i}-email" placeholder="email@college.edu" required></div>
      </div>`;
    }
    html += renderExtraFields(eventName);
    membersContainer.innerHTML = html;
  }

  toStep2Btn.addEventListener('click', () => {
    const ev = getSelectedEvent();
    if (!ev) {
      eventError.textContent = 'Please select an event to continue.';
      return;
    }
    eventError.textContent = '';
    selectedEventName.textContent = ev;
    updateTeamSizeOptions(ev);
    membersContainer.innerHTML = renderExtraFields(ev);
    step1.classList.add('reg-step-hidden');
    step2.classList.remove('reg-step-hidden');
    step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  toStep1Btn.addEventListener('click', () => {
    step2.classList.add('reg-step-hidden');
    step1.classList.remove('reg-step-hidden');
  });

  teamSizeSelect.addEventListener('change', () => {
    const val = parseInt(teamSizeSelect.value, 10);
    if (val && val > 1) {
      renderMembers(val);
    } else {
      membersContainer.innerHTML = renderExtraFields(getSelectedEvent());
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const teamName = document.getElementById('team-name').value.trim();
    const leaderName = document.getElementById('leader-name').value.trim();
    const leaderEmail = document.getElementById('leader-email').value.trim();
    const leaderPhone = document.getElementById('leader-phone').value.trim();
    const college = document.getElementById('college-name').value.trim();
    const teamSize = teamSizeSelect.value;

    if (!teamName || !leaderName || !leaderEmail || !leaderPhone || !college || !teamSize) {
      teamError.textContent = 'Please fill in all required fields.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leaderEmail)) {
      teamError.textContent = 'Please enter a valid email address.';
      return;
    }

    teamError.textContent = '';

    document.getElementById('success-event').textContent = getSelectedEvent();
    document.getElementById('success-email').textContent = leaderEmail;

    step2.classList.add('reg-step-hidden');
    step3.classList.remove('reg-step-hidden');
    step3.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  regAnother.addEventListener('click', () => {
    form.reset();
    membersContainer.innerHTML = '';
    step3.classList.add('reg-step-hidden');
    step1.classList.remove('reg-step-hidden');
    document.getElementById('register').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
