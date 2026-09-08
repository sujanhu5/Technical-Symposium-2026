// ===== PRELOADER =====
document.body.style.overflow = 'hidden';
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('done');
    document.body.style.overflow = '';
    startHeroAnim();
  }, 2200);
});

// ===== ANIMATED GRID BACKGROUND (RVCE-inspired) =====
(function() {
  const c = document.getElementById('bg-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let mouse = { x: -1000, y: -1000 };
  let scrollY = 0;
  const GAP = 60;
  let cols = 0, rows = 0;
  let nodesFlat = [];

  function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    cols = Math.ceil(c.width / GAP) + 1;
    rows = Math.ceil(c.height / GAP) + 1;
    nodesFlat = [];
    for (let r = 0; r < rows; r++) {
      for (let cl = 0; cl < cols; cl++) {
        nodesFlat.push({
          ox: cl * GAP, oy: r * GAP,
          x: cl * GAP, y: r * GAP,
          col: cl, row: r
        });
      }
    }
  }

  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  let t = 0;
  const maxDist = 180;
  const neighborOffsets = [[0,1],[1,0],[1,1],[-1,1]];

  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    t += 0.008;

    for (const n of nodesFlat) {
      const dx = mouse.x - n.ox;
      const dy = mouse.y - n.oy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < maxDist) {
        const force = (1 - dist / maxDist);
        n.x = n.ox - dx * force * 0.25;
        n.y = n.oy - dy * force * 0.25;
      } else {
        n.x += (n.ox - n.x) * 0.08;
        n.y += (n.oy - n.y) * 0.08;
      }
    }

    // Draw grid lines first
    ctx.lineWidth = 0.5;
    for (const n of nodesFlat) {
      const dx = mouse.x - n.ox;
      const dy = mouse.y - n.oy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      for (const [dr, dc] of neighborOffsets) {
        const nr = n.row + dr;
        const nc = n.col + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        const ni = nr * cols + nc;
        const n2 = nodesFlat[ni];

        const d2 = Math.sqrt((mouse.x - n2.ox) ** 2 + (mouse.y - n2.oy) ** 2);
        const closest = Math.min(dist, d2);

        let alpha = 0.025;
        if (closest < maxDist) {
          alpha = 0.025 + (1 - closest / maxDist) * 0.12;
        }

        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(n2.x, n2.y);
        ctx.strokeStyle = closest < maxDist
          ? `rgba(255,77,0,${alpha})`
          : `rgba(255,255,255,${alpha})`;
        ctx.stroke();
      }
    }

    // Draw dots
    for (const n of nodesFlat) {
      const dx = mouse.x - n.ox;
      const dy = mouse.y - n.oy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 1;
      let alpha = 0.04;

      if (dist < maxDist) {
        const force = 1 - dist / maxDist;
        r = 1 + force * 3;
        alpha = 0.04 + force * 0.5;
      }

      // Subtle ambient pulse
      const pulse = Math.sin(t * 2 + n.ox * 0.01 + n.oy * 0.01) * 0.015 + 0.015;
      alpha += pulse;

      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = dist < maxDist
        ? `rgba(255,77,0,${alpha})`
        : `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }

    // Occasional shooting star
    if (Math.random() > 0.997) {
      shooters.push({
        x: Math.random() * c.width,
        y: Math.random() * c.height * 0.5,
        l: Math.random() * 80 + 40,
        sp: Math.random() * 8 + 4,
        a: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
        o: 1, life: 0
      });
    }
    for (let i = shooters.length - 1; i >= 0; i--) {
      const ss = shooters[i];
      ss.life += 0.025;
      ss.x += Math.cos(ss.a) * ss.sp;
      ss.y += Math.sin(ss.a) * ss.sp;
      ss.o = Math.max(0, 1 - ss.life);
      const g = ctx.createLinearGradient(ss.x, ss.y,
        ss.x - Math.cos(ss.a) * ss.l, ss.y - Math.sin(ss.a) * ss.l);
      g.addColorStop(0, `rgba(255,77,0,${ss.o * 0.6})`);
      g.addColorStop(1, 'rgba(255,77,0,0)');
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x - Math.cos(ss.a) * ss.l, ss.y - Math.sin(ss.a) * ss.l);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1;
      ctx.stroke();
      if (ss.o <= 0) shooters.splice(i, 1);
    }

    requestAnimationFrame(draw);
  }

  let shooters = [];
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
const mm = document.getElementById('mobile-menu');
if (hamburger && mm) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mm.classList.toggle('active');
    document.body.style.overflow = mm.classList.contains('active') ? 'hidden' : '';
  });
  mm.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mm.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ===== DEPARTMENT CARD SWITCHING =====
document.querySelectorAll('.dept-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.dept-card').forEach(c => c.classList.remove('dept-card-active'));
    card.classList.add('dept-card-active');

    const dept = card.dataset.dept;
    document.querySelectorAll('.event-detail').forEach(d => d.classList.remove('active'));
    const detail = document.getElementById('detail-' + dept);
    if (detail) detail.classList.add('active');
  });
});

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

// ===== HERO GSAP ANIMATION =====
function startHeroAnim() {
  if (typeof gsap === 'undefined') {
    document.querySelectorAll('[data-anim], .hero-tag, .hero-title, .hero-tagline, .hero-college, .hero-stats, .hero-cta, .hero-sys').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline();
  tl.to('.hero-tag', { opacity:1, y:0, duration:.6, ease:'power3.out' })
    .to('.hero-title', { opacity:1, y:0, duration:.5, ease:'power3.out' }, '-=.2')
    .call(() => document.querySelector('.hero-title')?.classList.add('visible'))
    .to('.hero-tagline', { opacity:1, y:0, duration:.4, ease:'power3.out' }, '-=.1')
    .call(() => document.querySelector('.hero-tagline')?.classList.add('visible'))
    .to('.hero-college', { opacity:1, y:0, duration:.5, ease:'power3.out' }, '-=.2')
    .to('.hero-stats .hero-stat-card', { opacity:1, y:0, duration:.5, stagger:.08, ease:'power3.out' }, '-=.2')
    .to('.hero-stats', { opacity:1, y:0, duration:.01 }, '<')
    .to('.hero-cta', { opacity:1, y:0, duration:.5, ease:'power3.out' }, '-=.3')
    .to('.hero-sys', { opacity:1, duration:.5 }, '-=.3');

  // Scroll-triggered sections
  document.querySelectorAll('[data-anim]').forEach(el => {
    gsap.to(el, {
      opacity:1, y:0, duration:.8, ease:'power3.out',
      scrollTrigger: { trigger:el, start:'top 85%', toggleActions:'play none none none' }
    });
  });

  // Fade hero on scroll
  gsap.to('.hero-content', {
    opacity: 0.15, ease:'none',
    scrollTrigger: { trigger:'.hero', start:'center center', end:'bottom top', scrub:1 }
  });

  // Timeline items stagger
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.from(item, {
      opacity:0, x:-30, duration:.6, delay: i * .1, ease:'power3.out',
      scrollTrigger: { trigger:item, start:'top 88%', toggleActions:'play none none none' }
    });
  });

  // Department cards stagger
  gsap.utils.toArray('.dept-card').forEach((card, i) => {
    gsap.from(card, {
      opacity:0, y:20, duration:.5, delay: i * .08, ease:'power3.out',
      scrollTrigger: { trigger:card, start:'top 90%', toggleActions:'play none none none' }
    });
  });

  // Event items stagger
  gsap.utils.toArray('.event-item').forEach((item, i) => {
    gsap.from(item, {
      opacity:0, x:-20, duration:.5, delay: i * .08, ease:'power3.out',
      scrollTrigger: { trigger:item, start:'top 92%', toggleActions:'play none none none' }
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
