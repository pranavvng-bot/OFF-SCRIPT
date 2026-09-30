/* ============================================================
   OFF-SCRIPT — hero 3D engine
   A hand-rolled 3D particle sculpture. No dependencies.
   • 400 particles morph between five mathematical forms
   • Drag to rotate (with inertia), click / HUD / keys to morph
   • Scroll tilts the sculpture, hover spins it faster
   • Pauses off-screen & on hidden tabs, honors reduced motion
     (renders one static frame) and stays readable in light mode
   ============================================================ */
(function(){
  'use strict';
  const canvas = document.getElementById('heroCanvas');
  if(!canvas) return;
  if(canvas.dataset.os3d === '1') return;
  canvas.dataset.os3d = '1';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const TAU = Math.PI * 2;
  let w = 0, h = 0, cx = 0, cy = 0, S = 1;

  /* ---------- configuration ---------- */
  const COUNT = 400;
  const SHAPES = ['sphere', 'torus', 'helix', 'grid', 'wave', 'sphere'];
  let shapeIndex = 0;

  const THEMES = {
    dark:  { ink: [243, 234, 217], accent: [210, 154, 91] },
    light: { ink: [36, 26, 16],    accent: [154, 106, 51] }
  };
  function themeName(){
    const t = document.documentElement.getAttribute('data-theme');
    if(t === 'light' || t === 'dark') return t;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  /* ---------- tiny 3D helpers ---------- */
  function rot3(p, ax, ay, az){
    let x = p.x, y = p.y, z = p.z;
    if(ax){ const c = Math.cos(ax), s = Math.sin(ax); const y2 = y*c - z*s; z = y*s + z*c; y = y2; }
    if(ay){ const c = Math.cos(ay), s = Math.sin(ay); const x2 = x*c + z*s; z = -x*s + z*c; x = x2; }
    if(az){ const c = Math.cos(az), s = Math.sin(az); const x2 = x*c - y*s; y = x*s + y*c; x = x2; }
    p.x = x; p.y = y; p.z = z;
  }
  function project(p){
    const f = 2.6;
    const pz = f / (f + p.z);
    return { x: p.x * S * pz, y: p.y * S * pz, s: pz };
  }

  /* ---------- shape generators (unit-ish space) ---------- */
  function target(i, shape, t){
    switch(shape){
      case 'sphere': {
        const g = Math.PI * (3 - Math.sqrt(5));
        const y = 1 - (i / (COUNT - 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y*y));
        const th = g * i + t * .3;
        return { x: Math.cos(th)*r, y: y, z: Math.sin(th)*r };
      }
      case 'torus': {
        const N = 50;
        const rings = Math.ceil(COUNT / N);
        const a = i % N, b = Math.floor(i / N);
        const u2 = (a / N) * TAU;
        const v2 = (b / rings) * TAU;
        const R = .78, r = .3;
        return {
          x: (R + r*Math.cos(v2)) * Math.cos(u2),
          y: (R + r*Math.cos(v2)) * Math.sin(u2),
          z: r * Math.sin(v2)
        };
      }
      case 'helix': {
        const strands = 3;
        const per = Math.ceil(COUNT / strands);
        const s = i % strands, k = Math.floor(i / strands);
        const a = (k / per) * 5 * TAU + s * (TAU / strands);
        const rad = .8;
        return {
          x: Math.cos(a) * rad,
          y: (k / per) * 2.2 - 1.1,
          z: Math.sin(a) * rad
        };
      }
      case 'grid': {
        const N = 20;
        const a = i % N;
        const b = Math.floor(i / N) % N;
        const c = Math.floor(i / (N * N)) % N;
        return { x: (a/(N-1) - .5)*2, y: (b/(N-1) - .5)*2, z: (c/(N-1) - .5)*2 };
      }
      case 'wave': {
        const N = 20;
        const a = i % N;
        const b = Math.floor(i / N) % N;
        const x = (a/(N-1) - .5)*2.1;
        const z = (b/(N-1) - .5)*2.1;
        const y = Math.sin((x + t*.9) * 2.4) * .3 + Math.cos((z + t*.7) * 2.0) * .24;
        return { x, y, z };
      }
    }
    return { x: 0, y: 0, z: 0 };
  }

  /* ---------- state ---------- */
  const rot = { x: -.35, y: 0, z: 0 };
  const vel = { x: 0, y: .0035, z: 0 };   // idle spin
  const drag = { on:false, px:0, py:0, mx:0, my:0, moved:0 };
  let scrollTilt = 0;
  let hoverBoost = 0;
  let morphPulse = 0;                      // flash on morph
  const cur = [];
  for(let i = 0; i < COUNT; i++) cur.push({ x: 0, y: 0, z: 0 });
  const proj = new Array(COUNT);
  let lastT = 0;

  function resize(){
    const box = canvas.parentElement || canvas;
    w = box.offsetWidth; h = box.offsetHeight;
    canvas.width = Math.max(1, w * DPR);
    canvas.height = Math.max(1, h * DPR);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx = w / 2; cy = h / 2;
    S = Math.min(w, h) * .33;
  }

  function accentAlpha(a){
    const c = THEMES[themeName()].accent;
    return 'rgba(' + c.join(',') + ',' + a + ')';
  }

  /* ---------- render one static frame (reduced motion) ---------- */
  function drawStatic(){
    ctx.clearRect(0, 0, w, h);
    const th = THEMES[themeName()];
    for(let i = 0; i < COUNT; i++){
      const t3 = target(i, SHAPES[shapeIndex], 0);
      const p = { x: t3.x, y: t3.y, z: t3.z };
      rot3(p, rot.x, rot.y + .6, rot.z);
      const q = project(p);
      const lightness = 1 - Math.min(Math.max((p.z + 1.2)/2.4, 0), 1);
      const col = [
        Math.round(th.ink[0]*(1-lightness) + th.accent[0]*lightness),
        Math.round(th.ink[1]*(1-lightness) + th.accent[1]*lightness),
        Math.round(th.ink[2]*(1-lightness) + th.accent[2]*lightness)
      ];
      ctx.fillStyle = 'rgba(' + col.join(',') + ',' + (.25 + lightness*.65).toFixed(2) + ')';
      ctx.beginPath();
      ctx.arc(cx + q.x, cy + q.y, Math.max(.6, 2.1 * q.s), 0, TAU);
      ctx.fill();
    }
  }

  /* ---------- main loop ---------- */
  function step(ts){
    raf = requestAnimationFrame(step);
    const dt = Math.min(Math.max((ts - lastT) / 16.666, .25), 2.5);
    lastT = ts;
    const t = ts / 1000;

    if(!drag.on){
      vel.y += ((.0035 + hoverBoost * .004) - vel.y) * .04;
      vel.x += (0 - vel.x) * .05;
      rot.x += vel.x * dt;
      rot.y += vel.y * dt;
    }
    rot.x += drag.mx;
    rot.y += drag.my;
    drag.mx = 0; drag.my = 0;
    rot.x = Math.max(-1.25, Math.min(1.25, rot.x));

    morphPulse *= .92;
    hoverBoost *= .96;

    ctx.clearRect(0, 0, w, h);

    const rx = rot.x + scrollTilt * .5;
    const ry = rot.y;
    const th = THEMES[themeName()];

    /* transform + project every particle once */
    for(let i = 0; i < COUNT; i++){
      const p = { x: cur[i].x, y: cur[i].y, z: cur[i].z };
      rot3(p, rx, ry, 0);
      proj[i] = project(p);
      proj[i].depth = p.z;
    }

    /* faint constellation web — depth-faded */
    ctx.lineWidth = .5;
    for(let i = 0; i < COUNT; i += 13){
      const a = proj[i], b = proj[(i*7 + 11) % COUNT];
      ctx.strokeStyle = accentAlpha((.22 * ((a.s + b.s) / 2)).toFixed(3));
      ctx.beginPath();
      ctx.moveTo(cx + a.x, cy + a.y);
      ctx.lineTo(cx + b.x, cy + b.y);
      ctx.stroke();
    }

    /* particles, far → near, depth-tinted */
    const order = [];
    for(let i = 0; i < COUNT; i++) order.push(i);
    order.sort((a, b) => proj[a].depth - proj[b].depth);
    for(const i of order){
      const q = proj[i];
      const lightness = 1 - Math.min(Math.max((q.depth + 1.2)/2.4, 0), 1);
      const size = Math.max(.6, 2.1 * q.s) + morphPulse * 2.2;
      const col = [
        Math.round(th.ink[0]*(1-lightness) + th.accent[0]*lightness),
        Math.round(th.ink[1]*(1-lightness) + th.accent[1]*lightness),
        Math.round(th.ink[2]*(1-lightness) + th.accent[2]*lightness)
      ];
      ctx.fillStyle = 'rgba(' + col.join(',') + ',' + (.25 + lightness*.7).toFixed(2) + ')';
      ctx.beginPath();
      ctx.arc(cx + q.x, cy + q.y, size, 0, TAU);
      ctx.fill();
    }

    /* near-particle glow */
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = accentAlpha(.05);
    for(let i = 0; i < COUNT; i += 7){
      const q = proj[i];
      if(q.depth < .1){
        ctx.fillRect(cx + q.x - 14, cy + q.y - 14, 28, 28);
      }
    }
    ctx.globalCompositeOperation = 'source-over';

    /* ease particles toward the current shape */
    const tg_shape = SHAPES[shapeIndex];
    for(let i = 0; i < COUNT; i++){
      const tg = target(i, tg_shape, t);
      const c = cur[i];
      const k = .06 * dt;
      c.x += (tg.x - c.x) * k;
      c.y += (tg.y - c.y) * k;
      c.z += (tg.z - c.z) * k;
    }

    /* HUD readouts */
    if(hud.sx) hud.sx.textContent = String(shapeIndex + 1).padStart(2, '0');
    if(hud.sn) hud.sn.textContent = tg_shape.toUpperCase();
    if(hud.rt){
      const deg = Math.round((((rot.y % TAU) + TAU) % TAU) / TAU * 360);
      hud.rt.textContent = String(deg).padStart(3, '0') + '°';
    }
  }

  let raf = null, running = false;
  function start(){ if(running || prefersReduced) return; running = true; lastT = performance.now(); raf = requestAnimationFrame(step); }
  function stop(){ running = false; if(raf) cancelAnimationFrame(raf); raf = null; }

  /* ---------- HUD (auto-injected) ---------- */
  const hud = {};
  function ensureHud(){
    const host = canvas.closest('section');
    if(!host) return;
    hud.root = host.querySelector('.hero-hud');
    if(!hud.root){
      hud.root = document.createElement('div');
      hud.root.className = 'hero-hud';
      hud.root.setAttribute('aria-hidden', 'true');
      hud.root.innerHTML =
        '<div class="hud-left">' +
          '<span class="hud-k">FORM</span><b class="hud-v" data-hud="sn">SPHERE</b>' +
          '<span class="hud-k">IDX</span><b class="hud-v" data-hud="sx">01</b>' +
          '<span class="hud-k">ROT</span><b class="hud-v" data-hud="rt">000°</b>' +
        '</div>' +
        '<div class="hud-right">' +
          '<button type="button" class="hud-btn" data-morph="prev" aria-label="Previous form">◂</button>' +
          '<button type="button" class="hud-btn" data-morph="next" aria-label="Next form">▸</button>' +
        '</div>';
      host.appendChild(hud.root);
    }
    hud.sx = hud.root.querySelector('[data-hud="sx"]');
    hud.sn = hud.root.querySelector('[data-hud="sn"]');
    hud.rt = hud.root.querySelector('[data-hud="rt"]');
    hud.root.addEventListener('click', e => {
      const b = e.target.closest('[data-morph]');
      if(!b) return;
      e.preventDefault();
      morph(b.dataset.morph);
    });
  }

  /* ---------- morphing ---------- */
  function morph(dir){
    shapeIndex = (shapeIndex + (dir === 'prev' ? -1 : 1) + SHAPES.length) % SHAPES.length;
    morphPulse = 1;
  }

  /* ---------- pointer, click, keys, scroll ---------- */
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if(!isTouch){
    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', e => {
      drag.on = true; drag.px = e.clientX; drag.py = e.clientY; drag.moved = 0;
      canvas.style.cursor = 'grabbing';
      try{ canvas.setPointerCapture(e.pointerId); }catch(err){}
    });
    window.addEventListener('pointermove', e => {
      if(drag.on){
        drag.mx = (e.clientX - drag.px) * .006;
        drag.my = (e.clientY - drag.py) * .006;
        drag.moved += Math.abs(e.clientX - drag.px) + Math.abs(e.clientY - drag.py);
        drag.px = e.clientX; drag.py = e.clientY;
      } else {
        const r = canvas.getBoundingClientRect();
        const near = e.clientX >= r.left && e.clientX <= r.right &&
                     e.clientY >= r.top && e.clientY <= r.bottom;
        if(near) hoverBoost = 1;
      }
    }, { passive: true });
    window.addEventListener('pointerup', () => { drag.on = false; canvas.style.cursor = 'grab'; });
  }

  canvas.addEventListener('click', e => {
    if(drag.moved > 6) return;              // it was a drag, not a click
    morph('next');
  });

  document.addEventListener('keydown', e => {
    if(e.key === ' ' && !/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(document.activeElement.tagName)){
      const r = canvas.getBoundingClientRect();
      if(r.bottom > 0 && r.top < innerHeight){ e.preventDefault(); morph('next'); }
    }
  });

  const hero = canvas.closest('section, .page-hero, .auth-shell');
  if('IntersectionObserver' in window && hero){
    new IntersectionObserver(en => en.forEach(x => x.isIntersecting ? start() : stop()), { threshold: 0 }).observe(hero);
  } else {
    start();
  }
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollTilt = max > 0 ? (scrollY / max) : 0;
  }, { passive: true });

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { resize(); if(prefersReduced) drawStatic(); }, 150);
  });

  /* ---------- boot ---------- */
  resize();
  if(!prefersReduced) ensureHud();

  if(prefersReduced){
    drawStatic();
  } else {
    start();
  }

  /* keep the drawing buffer in sync as layout settles (fonts, images) */
  if('ResizeObserver' in window && canvas.parentElement){
    const ro = new ResizeObserver(() => {
      resize();
      if(prefersReduced) drawStatic();
    });
    ro.observe(canvas.parentElement);
  } else {
    window.addEventListener('load', resize);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  }
})();
