// ===== PRELOADER =====
document.body.style.overflow = 'hidden';
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('done');
    document.body.style.overflow = '';
    startHeroAnim();
  }, 2200);
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

  // Smoke / nebula blobs
  const blobs = [];
  for (let i = 0; i < 6; i++) {
    blobs.push({
      x: Math.random() * 2000,
      y: Math.random() * 2000,
      radius: 150 + Math.random() * 250,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.12,
      phase: Math.random() * Math.PI * 2,
      breathSpeed: 0.003 + Math.random() * 0.004,
      alpha: 0.02 + Math.random() * 0.02
    });
  }

  // Flowing lines (like energy streams)
  const streams = [];
  for (let i = 0; i < 5; i++) {
    const pts = [];
    const startX = Math.random() * 2000;
    const startY = Math.random() * 2000;
    for (let j = 0; j < 8; j++) {
      pts.push({
        x: startX + j * 120 + (Math.random() - 0.5) * 80,
        y: startY + (Math.random() - 0.5) * 200,
        phase: Math.random() * Math.PI * 2,
        amp: 20 + Math.random() * 40,
        speed: 0.005 + Math.random() * 0.008
      });
    }
    streams.push({ pts, alpha: 0.03 + Math.random() * 0.025 });
  }

  // Rising embers
  const embers = [];
  function spawnEmber() {
    embers.push({
      x: Math.random() * W,
      y: H + 10,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(Math.random() * 1.0 + 0.3),
      alpha: Math.random() * 0.5 + 0.2,
      life: 0,
      maxLife: 300 + Math.random() * 400,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.015 + Math.random() * 0.025
    });
  }

  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    t++;

    // Smoke / nebula blobs
    for (const b of blobs) {
      b.phase += b.breathSpeed;
      b.x += b.vx;
      b.y += b.vy;

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

    // Flowing energy streams
    for (const s of streams) {
      ctx.beginPath();
      const pts = s.pts;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.phase += p.speed;
        const px = p.x + Math.sin(p.phase) * p.amp * 0.5;
        const py = p.y + Math.cos(p.phase) * p.amp;

        // Wrap
        if (px > W + 200) p.x -= W + 400;
        if (px < -200) p.x += W + 400;

        if (i === 0) ctx.moveTo(px, py);
        else {
          const prev = pts[i - 1];
          const prevX = prev.x + Math.sin(prev.phase) * prev.amp * 0.5;
          const prevY = prev.y + Math.cos(prev.phase) * prev.amp;
          const cpx = (prevX + px) / 2;
          const cpy = (prevY + py) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cpx, cpy);
        }
      }
      ctx.strokeStyle = `rgba(255,77,0,${s.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Mouse glow
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

    // Embers
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

      if (alpha <= 0 || e.life > e.maxLife) {
        embers.splice(i, 1);
        continue;
      }

      // Glow halo
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,77,0,${alpha * 0.1})`;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,${100 + Math.random() * 50 | 0},0,${alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== PRELOADER PARTICLE EFFECT =====
(function() {
  const c = document.getElementById('preloader-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  c.width = window.innerWidth;
  c.height = window.innerHeight;

  const text = '25';
  const fontSize = Math.min(c.width * 0.35, 300);
  ctx.font = `italic 400 ${fontSize}px "Instrument Serif", Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(text, c.width / 2, c.height / 2);

  const imageData = ctx.getImageData(0, 0, c.width, c.height);
  const pixels = imageData.data;
  const dots = [];
  const gap = 4;

  for (let y = 0; y < c.height; y += gap) {
    for (let x = 0; x < c.width; x += gap) {
      const i = (y * c.width + x) * 4;
      if (pixels[i + 3] > 128) {
        dots.push({
          tx: x, ty: y,
          x: c.width / 2 + (Math.random() - 0.5) * c.width,
          y: c.height / 2 + (Math.random() - 0.5) * c.height,
          r: Math.random() * 1.5 + 0.5,
          o: Math.random() * 0.8 + 0.2
        });
      }
    }
  }

  ctx.clearRect(0, 0, c.width, c.height);
  let startTime = performance.now();

  function animate(now) {
    const elapsed = (now - startTime) / 1000;
    const progress = Math.min(elapsed / 1.8, 1);
    const ease = 1 - Math.pow(1 - progress, 3);

    ctx.clearRect(0, 0, c.width, c.height);

    for (const d of dots) {
      const cx = d.x + (d.tx - d.x) * ease;
      const cy = d.y + (d.ty - d.y) * ease;
      ctx.beginPath();
      ctx.arc(cx, cy, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,77,0,${d.o * ease})`;
      ctx.fill();
    }

    if (progress < 1) requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

// ===== HERO PARTICLE TEXT =====
(function() {
  const c = document.getElementById('hero-particles');
  if (!c) return;
  const ctx = c.getContext('2d');
  let dots = [], mouse = { x: -1000, y: -1000 };

  function setup() {
    const rect = c.parentElement.getBoundingClientRect();
    c.width = rect.width;
    c.height = rect.height;

    const text = '25';
    const fontSize = Math.min(c.width * 0.25, 250);
    ctx.font = `italic 400 ${fontSize}px "Instrument Serif", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(text, c.width / 2, c.height / 2 - 20);

    const imageData = ctx.getImageData(0, 0, c.width, c.height);
    const pixels = imageData.data;
    dots = [];
    const gap = 5;

    for (let y = 0; y < c.height; y += gap) {
      for (let x = 0; x < c.width; x += gap) {
        const i = (y * c.width + x) * 4;
        if (pixels[i + 3] > 128) {
          dots.push({
            x, y, ox: x, oy: y,
            r: Math.random() * 1.2 + 0.3,
            isOrange: Math.random() > 0.6
          });
        }
      }
    }
    ctx.clearRect(0, 0, c.width, c.height);
  }

  function animate() {
    ctx.clearRect(0, 0, c.width, c.height);

    for (const d of dots) {
      const dx = mouse.x - d.x;
      const dy = mouse.y - d.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = Math.max(0, 80 - dist) / 80;

      if (force > 0) {
        d.x -= dx * force * 0.15;
        d.y -= dy * force * 0.15;
      }

      d.x += (d.ox - d.x) * 0.08;
      d.y += (d.oy - d.y) * 0.08;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.isOrange
        ? 'rgba(255,77,0,0.5)'
        : 'rgba(255,255,255,0.12)';
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
  window.addEventListener('resize', () => { setup(); });
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

// ===== PARTICLE DISPERSION ON SCROLL (fully reversible) =====
function setupDispersion() {
  const dc = document.getElementById('dispersion-canvas');
  const heroTitle = document.getElementById('hero-title');
  const heroTag = document.getElementById('hero-tag');
  const heroCollege = document.getElementById('hero-college');
  if (!dc || !heroTitle) return;

  const ctx = dc.getContext('2d');
  const heroInner = heroTitle.closest('.hero-inner');

  function sampleText() {
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
    ctx.fillText('Technical', dc.width / 2, topRect.top - rect.top + topSize * 0.82);

    ctx.font = `italic 400 ${bottomSize}px "Instrument Serif", Georgia, serif`;
    ctx.fillStyle = '#ff4d00';
    const bottomRect = bottomSpan.getBoundingClientRect();
    ctx.fillText('Symposium.', dc.width / 2, bottomRect.top - rect.top + bottomSize * 0.82);

    const imageData = ctx.getImageData(0, 0, dc.width, dc.height);
    const pixels = imageData.data;
    const dots = [];
    const gap = 3;

    for (let y = 0; y < dc.height; y += gap) {
      for (let x = 0; x < dc.width; x += gap) {
        const i = (y * dc.width + x) * 4;
        if (pixels[i + 3] > 100) {
          const isOrange = pixels[i] > 200 && pixels[i + 1] < 120;
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 400 + 150;
          dots.push({
            ox: x, oy: y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            r: Math.random() * 1.4 + 0.4,
            isOrange,
            alpha: (pixels[i + 3] / 255) * (isOrange ? 0.9 : 0.85)
          });
        }
      }
    }

    ctx.clearRect(0, 0, dc.width, dc.height);
    return dots;
  }

  let particles = null;
  let currentProgress = 0;
  let rafId = null;

  function drawFrame() {
    if (!particles) return;
    ctx.clearRect(0, 0, dc.width, dc.height);

    const p = currentProgress;
    const eased = p * p;

    for (const d of particles) {
      const x = d.ox + d.dx * eased;
      const y = d.oy + d.dy * eased;
      const alpha = d.alpha * (1 - p);

      if (alpha <= 0.005) continue;

      ctx.beginPath();
      ctx.arc(x, y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.isOrange
        ? `rgba(255,77,0,${alpha})`
        : `rgba(240,240,240,${alpha})`;
      ctx.fill();
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

      // Sample particles once
      if (!particles && prog > 0.02) {
        particles = sampleText();
        loop();
      }

      if (prog > 0.02) {
        const disperseP = Math.min((prog - 0.02) / 0.45, 1);
        currentProgress = disperseP;
        dc.style.opacity = '1';
        // Hide original text, show canvas particles
        heroTitle.style.opacity = disperseP > 0.01 ? '0' : '1';
      } else {
        // FULLY RESTORE — back at top
        currentProgress = 0;
        dc.style.opacity = '0';
        heroTitle.style.opacity = '1';
      }

      // Fade tag and college with scroll (and restore fully at top)
      const fade = Math.max(0, 1 - prog * 2.5);
      if (heroTag) heroTag.style.opacity = String(fade);
      if (heroCollege) heroCollege.style.opacity = String(fade);
    },
    onLeave: () => {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    },
    onEnterBack: () => {
      if (particles && !rafId) loop();
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

  const tl = gsap.timeline({
    onComplete: () => {
      // After intro animation, set final states as inline styles
      // so ScrollTrigger restore works correctly
      const tag = document.getElementById('hero-tag');
      const title = document.getElementById('hero-title');
      const college = document.getElementById('hero-college');
      if (tag) { tag.style.opacity = '1'; tag.style.transform = 'translateY(0px)'; }
      if (title) { title.style.opacity = '1'; title.style.transform = 'translateY(0px)'; }
      if (college) { college.style.opacity = '1'; college.style.transform = 'translateY(0px)'; }

      setTimeout(setupDispersion, 200);
    }
  });

  tl.to('.hero-tag', { opacity:1, y:0, duration:.6, ease:'power3.out' })
    .to('.hero-title', { opacity:1, y:0, duration:.5, ease:'power3.out' }, '-=.2')
    .call(() => document.querySelector('.hero-title')?.classList.add('visible'))
    .to('.hero-college', { opacity:1, y:0, duration:.5, ease:'power3.out' }, '-=.2')
    .to('.hero-sys', { opacity:1, duration:.5 }, '-=.3');

  // Scroll-triggered sections
  document.querySelectorAll('[data-anim]').forEach(el => {
    gsap.to(el, {
      opacity:1, y:0, duration:.8, ease:'power3.out',
      scrollTrigger: { trigger:el, start:'top 85%', toggleActions:'play none none none' }
    });
  });

  // Timeline items stagger
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
      opacity:0, x:-30, duration:.6, delay: i * .1, ease:'power3.out',
      scrollTrigger: { trigger:item, start:'top 88%', toggleActions:'play none none none' }
    });
  });

  // Event cards stagger
  gsap.utils.toArray('.event-card').forEach((card, i) => {
    gsap.from(card, {
      opacity:0, y:30, scale: 0.95, duration:.6, delay: i * .06, ease:'power3.out',
      scrollTrigger: { trigger:card, start:'top 90%', toggleActions:'play none none none' }
    });
  });

  // About number items
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
