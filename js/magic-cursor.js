/* ============================================================
   OFF-SCRIPT — magic cursor v2 · THE RIBBON
   The pointer leaves a glowing, smooth neon-brown trail that
   visualizes its exact path — like light dragged across a dark
   screen. The ribbon tapers from thick to hairline, has a hot
   core with a soft outer glow, and dissolves in embers.
   Pooled points, additive blending, self-sleeping loop.
   Desktop fine-pointer devices only; off under reduced motion.
   ============================================================ */
(function(){
  'use strict';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if(prefersReduced || isTouch) return;

  const ring = document.getElementById('cursor-ring');
  const canvas = document.createElement('canvas');
  canvas.id = 'os-magic';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  function resize(){
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  /* palette — neon brown / copper, follows theme */
  const PAL = {
    dark:  { core:'255, 226, 186', glow:'210, 154, 91'  },
    light: { core:'248, 242, 231', glow:'154, 106, 51'  }
  };
  function pal(){
    const t = document.documentElement.getAttribute('data-theme');
    if(t === 'light') return PAL.light;
    if(t === 'dark') return PAL.dark;
    return matchMedia('(prefers-color-scheme: light)').matches ? PAL.light : PAL.dark;
  }

  /* ---------- ribbon state ---------- */
  const MAXPTS = 90;
  const pts = [];                          // {x,y,w,life,max}
  let raf = null, idle = 0;

  /* ember particles that flake off fast movement */
  const embers = [];
  function addEmber(x, y, vx, vy){
    if(embers.length >= 70) embers.shift();
    embers.push({ x, y, vx, vy, life: 26 + Math.random()*18, max: 44, r: Math.random()*1.8 + .6 });
  }

  function pushPoint(x, y, speed){
    const w = Math.min(2.2 + speed * .09, 7.5);   // faster = fatter stroke
    pts.push({ x, y, w, life: 1, max: 1 });
    if(pts.length > MAXPTS) pts.shift();
  }

  /* ---------- pointer tracking ---------- */
  const ptr = { x: -100, y: -100, px: -100, py: -100, speed: 0, seen: false };
  let distAcc = 0;

  document.addEventListener('pointermove', e => {
    ptr.px = ptr.x; ptr.py = ptr.y;
    ptr.x = e.clientX; ptr.y = e.clientY;
    if(!ptr.seen){ ptr.seen = true; ptr.px = ptr.x; ptr.py = ptr.y; }
    const dx = ptr.x - ptr.px, dy = ptr.y - ptr.py;
    const d = Math.hypot(dx, dy);
    ptr.speed = Math.min(d, 60);

    /* squash & stretch on the ring */
    if(ring){
      const s = 1 + Math.min(ptr.speed * .006, .3);
      const nx = Math.abs(dx) >= Math.abs(dy) ? s : 1 - (s - 1) * .6;
      const ny = Math.abs(dy) > Math.abs(dx) ? s : 1 - (s - 1) * .6;
      ring.style.setProperty('--sx', nx.toFixed(3));
      ring.style.setProperty('--sy', ny.toFixed(3));
      ring.classList.add('wand');
    }

    /* interpolate so fast flicks stay a continuous line, not dots */
    const steps = Math.max(1, Math.min(Math.ceil(d / 6), 12));
    for(let i = 1; i <= steps; i++){
      const t = i / steps;
      pushPoint(ptr.px + dx * t, ptr.py + dy * t, d / steps);
    }

    /* fast movement flakes embers */
    distAcc += d;
    if(ptr.speed > 14){
      let n = Math.min(Math.floor(d / 22), 3);
      while(n--){
        addEmber(
          ptr.x + (Math.random() - .5) * 10,
          ptr.y + (Math.random() - .5) * 10,
          -dx * .045 + (Math.random() - .5) * .9,
          -dy * .045 + (Math.random() - .5) * .9 - .3);
      }
    }
    wake();
  }, { passive: true });

  /* press = a bright pulse travels down the ribbon (flag only) */
  let pulse = 0;
  document.addEventListener('pointerdown', () => {
    pulse = 1;
    if(ring) ring.classList.add('magic-press');
    wake();
  }, { passive: true });
  document.addEventListener('pointerup', () => {
    if(ring) ring.classList.remove('magic-press');
  }, { passive: true });

  /* ---------- render loop ---------- */
  function wake(){ idle = 0; if(raf === null) raf = requestAnimationFrame(step); }

  function step(){
    const P = pal();

    /* age + decay */
    for(let i = pts.length - 1; i >= 0; i--){
      pts[i].life -= .022;
      if(pts[i].life <= 0) pts.splice(i, 1);
    }
    for(let i = embers.length - 1; i >= 0; i--){
      const e = embers[i];
      e.x += e.vx; e.y += e.vy;
      e.vy += .05; e.vx *= .985; e.vy *= .985;
      e.life--;
      if(e.life <= 0) embers.splice(i, 1);
    }
    if(pulse > 0) pulse = Math.max(0, pulse - .06);

    /* draw */
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    /* pass 1 — outer glow (wide, soft, low alpha) */
    if(pts.length > 1){
      for(let pass = 0; pass < 2; pass++){
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for(let i = 1; i < pts.length - 1; i++){
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        const tail = pts[0], head = pts[pts.length - 1];
        ctx.strokeStyle = 'rgba(' + P.glow + ', ' + (pass === 0 ? .10 : .16) + ')';
        ctx.lineWidth = (pass === 0 ? 22 : 12) * Math.min(1, pts.length / 24);
        ctx.stroke();
      }

      /* pass 2 — tapered core: draw segment-by-segment so width tapers */
      const n = pts.length;
      for(let i = 1; i < n; i++){
        const a = pts[i - 1], b = pts[i];
        const ageK = b.life;                       // 1 fresh → 0 dying
        const posK = i / n;                        // 0 tail → 1 head
        const taper = Math.pow(posK, .55);         // thin at tail, fat at head
        const w = Math.max(.4, b.w * taper * (.55 + .45 * ageK));
        const hot = pulse * posK;                  // click pulse travels to head
        const col = hot > 0.05
          ? '255, ' + Math.round(226 + hot * 29) + ', ' + Math.round(186 + hot * 69)
          : P.core;
        ctx.strokeStyle = 'rgba(' + col + ', ' + (.92 * Math.min(1, ageK + .15)).toFixed(3) + ')';
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      /* head bloom — the bright tip of the wand */
      const head = pts[pts.length - 1];
      if(head && head.life > .3){
        const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 26);
        g.addColorStop(0, 'rgba(' + P.core + ', .5)');
        g.addColorStop(.4, 'rgba(' + P.glow + ', .18)');
        g.addColorStop(1, 'rgba(' + P.glow + ', 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 26, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* embers */
    for(const e of embers){
      const k = e.life / e.max;
      ctx.fillStyle = 'rgba(' + P.glow + ', ' + (k * .8).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(e.x, e.y, Math.max(.3, e.r * k), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';

    const alive = pts.length > 0 || embers.length > 0 || pulse > 0;
    if(alive){ idle = 0; raf = requestAnimationFrame(step); }
    else if(++idle < 20){ raf = requestAnimationFrame(step); }
    else { raf = null; }
  }

  /* starting a new page or re-entering the window shouldn't draw a stray line */
  document.addEventListener('mouseleave', () => { pts.length = 0; ptr.seen = false; });
  window.addEventListener('pageshow', () => { pts.length = 0; });
})();
