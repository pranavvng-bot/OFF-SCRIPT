/* ============================================================
   OFF-SCRIPT — interaction layer
   Site-wide pro touches. Every feature is guarded, desktop-only
   where appropriate, and honors prefers-reduced-motion.
   • 3D tilt cards with cursor glare (auto-attached)
   • Cursor labels ("View", "Drag", "Open"…)
   • Text scramble on nav hover
   • Scroll-velocity marquee skew
   • Ambient spotlight that trails the pointer
   • Hero scroll cue that retires once you scroll
   ============================================================ */
(function(){
  'use strict';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const lerp = (a, b, k) => a + (b - a) * k;
  const fancy = !prefersReduced && !isTouch;

  /* ============================================================
     CURSOR LABELS — the ring becomes a word on interactive media
  ============================================================ */
  (function cursorLabels(){
    const ring = document.getElementById('cursor-ring');
    if(!ring) return;
    let label = ring.querySelector('.cursor-label');
    if(!label){
      label = document.createElement('span');
      label.className = 'cursor-label';
      ring.appendChild(label);
    }
    const SEL = '[data-cursor]';
    document.addEventListener('mouseover', e => {
      const t = e.target.closest(SEL);
      if(!t) return;
      label.textContent = t.dataset.cursor || '';
      ring.classList.add('has-label');
    });
    document.addEventListener('mouseout', e => {
      if(e.target.closest(SEL)) ring.classList.remove('has-label');
    });
  })();

  /* ============================================================
     3D TILT CARDS — perspective rotation + glare, auto-attached
  ============================================================ */
  (function tilt(){
    if(!fancy) return;
    const SELECTOR = '.project-card, .price-card, .tst-card, .service-card, .team-card, .why-item, .auth-card, .dash-card';
    let cards = [];
    const attach = () => {
      $$ (SELECTOR).forEach(el => {
        if(el.dataset.tilt) return;
        el.dataset.tilt = '1';
        el.classList.add('tilt');
        cards.push(el);
        el.addEventListener('pointermove', e => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width * 2 - 1;
          const py = (e.clientY - r.top) / r.height * 2 - 1;
          el.style.transition = 'transform .08s linear, border-color .3s ease, box-shadow .3s ease';
          el.style.transform =
            'perspective(900px) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' + (px * 5).toFixed(2) + 'deg) translateZ(0)';
          el.style.setProperty('--gx', ((px + 1) / 2 * 100).toFixed(1) + '%');
          el.style.setProperty('--gy', ((py + 1) / 2 * 100).toFixed(1) + '%');
        });
        el.addEventListener('pointerleave', () => {
          el.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1), border-color .3s ease';
          el.style.transform = '';
        });
      });
    };
    attach();
    /* cards are rendered async by config renderers — catch late ones */
    const mo = new MutationObserver(() => attach());
    mo.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => mo.disconnect(), 15000);
  })();

  /* ============================================================
     TEXT SCRAMBLE — nav links resolve from noise on hover
  ============================================================ */
  (function scramble(){
    if(!fancy) return;
    const CHARS = '—+*/<>#@$%&AUS0152';
    function play(el){
      if(el.dataset.scrambling) return;
      el.dataset.scrambling = '1';
      const orig = el.dataset.orig || (el.dataset.orig = el.textContent);
      const end = performance.now() + 380;
      (function frame(now){
        const k = 1 - Math.max(0, (end - now) / 380);         // 0 → 1
        const solid = Math.floor(k * orig.length);
        let out = orig.slice(0, solid);
        for(let i = solid; i < orig.length; i++){
          out += orig[i] === ' ' ? ' ' : CHARS[(Math.random() * CHARS.length) | 0];
        }
        el.textContent = out;
        if(now < end){ requestAnimationFrame(frame); }
        else { el.textContent = orig; delete el.dataset.scrambling; }
      })(performance.now());
    }
    $$('.nav-links a:not(.nav-cta), .footer-col a').forEach(a => {
      a.addEventListener('mouseenter', () => play(a));
    });
  })();

  /* ============================================================
     MARQUEE — skews with scroll velocity, like it has mass
  ============================================================ */
  (function marquee(){
    if(prefersReduced) return;
    const tracks = $$('.marquee-track');
    if(!tracks.length) return;
    let lastY = window.scrollY, skew = 0, raf = null;
    function frame(){
      const y = window.scrollY;
      const v = y - lastY;                       // px this frame
      lastY = y;
      skew = lerp(skew, Math.max(-10, Math.min(10, v * .28)), .12);
      tracks.forEach(t => { t.style.transform = 'skewX(' + skew.toFixed(2) + 'deg)'; });
      if(Math.abs(skew) > .05) raf = requestAnimationFrame(frame);
      else raf = null;
    }
    window.addEventListener('scroll', () => { if(!raf) raf = requestAnimationFrame(frame); }, { passive: true });
  })();

  /* ============================================================
     AMBIENT SPOTLIGHT — soft accent glow trailing the pointer
  ============================================================ */
  (function spotlight(){
    if(prefersReduced) return;
    const el = document.createElement('div');
    el.id = 'os-spot';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    let tx = innerWidth / 2, ty = innerHeight * .3, x = tx, y = ty, on = false, raf = null;
    document.addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      if(!on){ on = true; el.classList.add('on'); }
      if(!raf) raf = requestAnimationFrame(frame);
    }, { passive: true });
    function frame(){
      x = lerp(x, tx, .09);
      y = lerp(y, ty, .09);
      el.style.setProperty('--sx', x.toFixed(1) + 'px');
      el.style.setProperty('--sy', y.toFixed(1) + 'px');
      raf = Math.abs(x - tx) > .5 || Math.abs(y - ty) > .5 ? requestAnimationFrame(frame) : null;
    }
    document.addEventListener('mouseleave', () => { el.classList.remove('on'); on = false; });
    document.addEventListener('mouseenter', () => { el.classList.add('on'); on = true; });
  })();

  /* ============================================================
     HERO SCROLL CUE — fades once the visitor commits to scrolling
  ============================================================ */
  (function scrollCue(){
    const cue = document.querySelector('.scroll-cue');
    if(!cue) return;
    const update = () => cue.classList.toggle('gone', window.scrollY > 90);
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();
})();
