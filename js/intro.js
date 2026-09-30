/* ============================================================
   OFF-SCRIPT — THE OVERTURE · 5s cinematic intro
   Copper light-dust swirls in from the edges, converges into
   the OFF—SCRIPT wordmark, a lens flare blooms behind it, a
   progress rule fills 0→100, then the whole scene splits open
   into the site. Plays once per browser (7-day remember),
   skippable (Esc / click Skip), fully disabled under
   prefers-reduced-motion. Canvas particle layer + DOM text.
   ============================================================ */
(function(){
  'use strict';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced) return;

  const KEY = 'off-script-intro';
  const force = /[?&]intro=(replay|still)/.test(location.search);   // preview the show on demand
  const still = /[?&]intro=still/.test(location.search);            // freeze mid-show for inspection
  let remembered = null;
  try{
    remembered = JSON.parse(localStorage.getItem(KEY) || 'null');
  }catch(e){}
  const now = Date.now();
  if(!force && remembered && remembered.until && remembered.until > now) return;

  const DUR = 5000;                                   // total show length
  const canvas = document.createElement('canvas');
  canvas.id = 'os-intro-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  const stage = document.createElement('div');
  stage.id = 'os-intro';
  stage.setAttribute('role', 'dialog');
  stage.setAttribute('aria-label', 'OFF-SCRIPT intro');
  stage.innerHTML =
    '<canvas id="os-intro-canvas" aria-hidden="true"></canvas>' +
    '<div class="intro-center">' +
      '<div class="intro-kicker">FOUR MINDS · ONE DIGITAL STUDIO</div>' +
      '<div class="intro-word"><span>OFF</span><em>—</em><span>SCRIPT</span></div>' +
      '<div class="intro-sub">DESIGN &nbsp;·&nbsp; DEVELOPMENT &nbsp;·&nbsp; E-COMMERCE &nbsp;·&nbsp; WEB APPS</div>' +
    '</div>' +
    '<div class="intro-bottom">' +
      '<div class="intro-track"><div class="intro-fill"></div></div>' +
      '<div class="intro-meta"><span>EST. 2026 — COIMBATORE, IN</span><button type="button" class="intro-skip">Skip intro →</button><span class="intro-pct">0%</span></div>' +
    '</div>' +
    '<div class="intro-shutter intro-shutter-top"></div>' +
    '<div class="intro-shutter intro-shutter-bot"></div>';

  function mount(){
    document.body.appendChild(stage);
    return stage.querySelector('#os-intro-canvas');
  }

  const cvs = mount();
  const ctx = cvs.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0, CX = 0, CY = 0;

  function resize(){
    W = innerWidth; H = innerHeight; CX = W/2; CY = H/2;
    cvs.width = W * DPR; cvs.height = H * DPR;
    cvs.style.width = W + 'px'; cvs.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  /* palette */
  const GLOW = '210, 154, 91';        // copper
  const CORE = '255, 226, 186';       // warm cream
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- particles: swirl inward → hold → converge flash ---------- */
  const N = Math.min(260, Math.max(120, Math.floor(innerWidth / 7)));
  const P = [];
  for(let i = 0; i < N; i++){
    const a = Math.random() * Math.PI * 2;
    const r = Math.max(W, H) * rand(.55, 1.05);
    P.push({
      a, r,
      va: rand(.15, .55) * (Math.random() < .5 ? -1 : 1),   // angular speed
      vr: rand(0, .06),                                     // inward creep
      s: rand(.7, 2.3),
      tw: rand(0, Math.PI * 2),                             // twinkle phase
      x: 0, y: 0
    });
  }

  const t0 = performance.now();
  let raf = null, finished = false;

  /* easing helpers */
  const easeOut = k => 1 - Math.pow(1 - k, 3);
  const easeIO = k => k < .5 ? 4*k*k*k : 1 - Math.pow(-2*k + 2, 3)/2;

  function frame(ts){
    if(finished) return;
    const t = ts - t0;
    const k = still ? .5 : Math.min(t / DUR, 1);          // master 0→1 (or frozen showcase)

    /* choreography phases (of the 5s) */
    const converge = easeOut(Math.min(t / 1600, 1));      // 0–1.6s swirl in
    const hold = k > .30 && k < .82;                      // 1.5–4.1s showcase
    const collapse = easeIO(Math.max(0, (k - .82) / .18));// 4.1–5s suck inward

    ctx.clearRect(0, 0, W, H);

    /* particles */
    ctx.globalCompositeOperation = 'lighter';
    for(const p of P){
      p.a += p.va * .012 * (1 - converge * .8);
      const targetR = Math.min(W, H) * .33;
      p.r += (targetR - p.r) * .022 * converge;
      let r = p.r;
      if(collapse > 0) r = p.r * (1 - collapse) + 2 * collapse;
      p.x = CX + Math.cos(p.a) * r * 1.15;
      p.y = CY + Math.sin(p.a) * r * .62;
      const twk = .45 + .55 * Math.sin(p.tw + ts/300);
      const alpha = (.25 + .75 * twk) * (0.35 + .65 * converge) * (1 - collapse * .9);
      ctx.fillStyle = 'rgba(' + GLOW + ', ' + alpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s * (1 + collapse * .5), 0, Math.PI * 2);
      ctx.fill();
    }

    /* connecting whispers between nearby particles during hold */
    if(hold){
      ctx.strokeStyle = 'rgba(' + GLOW + ', .07)';
      ctx.lineWidth = .5;
      for(let i = 0; i < P.length; i += 6){
        const a = P[i], b = P[(i * 7 + 13) % P.length];
        const dx = a.x - b.x, dy = a.y - b.y;
        if(dx*dx + dy*dy < 32400){
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    /* lens-flare bloom behind the wordmark, peaks mid-show */
    const bloomK = hold ? Math.sin(Math.min((k - .30) / .52, 1) * Math.PI) : 0;
    if(bloomK > 0.01){
      const R = Math.min(W, H) * .42 * (0.6 + .4 * bloomK);
      const g = ctx.createRadialGradient(CX, CY, 0, CX, CY, R);
      g.addColorStop(0, 'rgba(' + CORE + ', ' + (.16 * bloomK).toFixed(3) + ')');
      g.addColorStop(.35, 'rgba(' + GLOW + ', ' + (.10 * bloomK).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(' + GLOW + ', 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      /* anamorphic streak */
      const streakW = W * .5 * bloomK;
      const lg = ctx.createLinearGradient(CX - streakW, CY, CX + streakW, CY);
      lg.addColorStop(0, 'rgba(' + GLOW + ', 0)');
      lg.addColorStop(.5, 'rgba(' + CORE + ', ' + (.28 * bloomK).toFixed(3) + ')');
      lg.addColorStop(1, 'rgba(' + GLOW + ', 0)');
      ctx.fillStyle = lg;
      ctx.fillRect(CX - streakW, CY - 1.2, streakW * 2, 2.4);
    }
    ctx.globalCompositeOperation = 'source-over';

    /* DOM choreography */
    stage.style.setProperty('--k', k.toFixed(3));
    if(k >= 1){ finish(); return; }
    raf = requestAnimationFrame(frame);
  }

  /* ---------- finish: shutter-open exit ---------- */
  function finish(){
    if(finished) return;
    finished = true;
    if(raf) cancelAnimationFrame(raf);
    if(document.activeElement && document.activeElement.blur) document.activeElement.blur();
    stage.classList.add('out');
    document.documentElement.classList.remove('intro-lock');
    document.body.classList.add('loaded');
    try{
      localStorage.setItem(KEY, JSON.stringify({ until: now + 7*24*3600*1000 }));
    }catch(e){}
    setTimeout(() => { stage.remove(); }, 1400);
  }

  /* skip button + Escape */
  stage.addEventListener('click', e => {
    if(e.target.closest('.intro-skip')) finish();
  });
  document.addEventListener('keydown', function onKey(e){
    if(e.key === 'Escape' && document.getElementById('os-intro')){
      finish();
      document.removeEventListener('keydown', onKey);
    }
  });

  /* scroll lock while the show plays */
  document.documentElement.classList.add('intro-lock');

  /* progress fill + % readout on rAF-aligned interval */
  const fill = stage.querySelector('.intro-fill');
  const pct = stage.querySelector('.intro-pct');
  const tick = setInterval(() => {
    if(finished){ clearInterval(tick); return; }
    const k = Math.min((performance.now() - t0) / DUR, 1);
    if(fill) fill.style.transform = 'scaleX(' + k + ')';
    if(pct) pct.textContent = Math.round(k * 100) + '%';
    if(k >= 1) clearInterval(tick);
  }, 80);

  /* hold the preloader page-reveal until the overture ends */
  document.documentElement.classList.add('intro-lock');
  raf = requestAnimationFrame(frame);
})();
