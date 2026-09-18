/* ============================================================
   OFF-SCRIPT — core runtime
   Preloader, custom cursor, nav, reveals, counters, toasts,
   page transitions, shared data renderers.
   ============================================================ */
(function(){
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const esc = (OFFSCRIPT && OFFSCRIPT.esc) ? OFFSCRIPT.esc : (s => s);

  /* ============================================================
     THEME
  ============================================================ */
  const THEME_KEY = 'off-script-theme';
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme', t);
    document.querySelectorAll('.theme-toggle').forEach(b => b.textContent = t === 'light' ? '◑' : '◐');
  }
  try{
    const saved = localStorage.getItem(THEME_KEY);
    applyTheme(saved || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  }catch(e){ applyTheme('dark'); }
  document.addEventListener('click', e => {
    const btn = e.target.closest('.theme-toggle');
    if(!btn) return;
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try{ localStorage.setItem(THEME_KEY, next); }catch(err){}
  });

  /* ============================================================
     PRELOADER — believable progress, never blocks long
  ============================================================ */
  (function preloader(){
    const pre = $('#preloader');
    if(!pre){ document.body.classList.add('loaded'); return; }
    if(prefersReduced || sessionStorage.getItem('os-preloaded')){
      pre.remove(); document.body.classList.add('loaded'); return;
    }
    sessionStorage.setItem('os-preloaded', '1');
    const fill = $('.pre-fill', pre), count = $('.pre-count b', pre), status = $('.pre-mid .status', pre);
    let p = 0, done = false;
    const tick = setInterval(() => {
      p = Math.min(p + Math.random()*14 + 4, 96);
      paint();
    }, 130);
    function paint(){
      if(fill) fill.style.transform = 'scaleX(' + p/100 + ')';
      if(count) count.textContent = Math.round(p) + '%';
    }
    function finish(){
      if(done) return; done = true;
      clearInterval(tick);
      p = 100; paint();
      if(status) status.textContent = 'Ready';
      setTimeout(() => {
        pre.classList.add('done');
        document.body.classList.add('loaded');
        setTimeout(() => pre.remove(), 950);
      }, 260);
    }
    window.addEventListener('load', () => setTimeout(finish, 300));
    setTimeout(finish, 2600); // hard cap
  })();

  /* ============================================================
     CUSTOM CURSOR — desktop pointer devices only
  ============================================================ */
  (function cursor(){
    if(isTouch || prefersReduced) return;
    const dot = document.createElement('div'); dot.id = 'cursor-dot';
    const ring = document.createElement('div'); ring.id = 'cursor-ring';
    document.body.append(dot, ring);
    let x=-100, y=-100, rx=-100, ry=-100, visible=false;
    document.addEventListener('mousemove', e => {
      x = e.clientX; y = e.clientY;
      if(!visible){ visible = true; dot.style.opacity = ring.style.opacity = 1; }
      dot.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
    });
    (function loop(){
      rx += (x - rx) * .16; ry += (y - ry) * .16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    const hoverSel = 'a, button, [role="button"], input, select, textarea, label';
    document.addEventListener('mouseover', e => {
      if(e.target.closest(hoverSel)) ring.classList.add('hovering');
    });
    document.addEventListener('mouseout', e => {
      if(e.target.closest(hoverSel)) ring.classList.remove('hovering');
    });
    document.addEventListener('mousedown', () => ring.classList.add('pressing'));
    document.addEventListener('mouseup', () => ring.classList.remove('pressing'));
    document.documentElement.classList.add('has-cursor');
    document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { if(x>-50){ dot.style.opacity = ring.style.opacity = 1; } });
  })();

  /* ============================================================
     NAV — scrolled state, hide on scroll down, mobile menu
  ============================================================ */
  const nav = $('#nav');
  let lastY = 0;
  function onScroll(){
    const y = window.scrollY;
    if(nav){
      nav.classList.toggle('is-scrolled', y > 24);
      nav.classList.toggle('is-hidden', y > 420 && y > lastY && !document.body.classList.contains('menu-open'));
    }
    const bar = $('.scroll-progress span');
    if(bar){
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (y/max)*100 : 0) + '%';
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  const navToggle = $('#navToggle'), mobileMenu = $('#mobileMenu');
  function closeMobile(){
    document.body.classList.remove('menu-open');
    if(mobileMenu) mobileMenu.classList.remove('open');
    if(navToggle){ navToggle.setAttribute('aria-expanded','false'); }
    document.body.style.overflow = '';
  }
  if(navToggle && mobileMenu){
    navToggle.addEventListener('click', () => {
      const open = !mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if(open){
        $$('.mobile-links a', mobileMenu).forEach((a,i) => {
          a.style.transitionDelay = (80 + i*55) + 'ms';
        });
      }
    });
    $$('.mobile-links a, .mobile-foot a', mobileMenu).forEach(a => a.addEventListener('click', closeMobile));
    document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMobile(); });
  }

  /* ============================================================
     REVEALS + SPLIT TEXT
  ============================================================ */
  function splitWords(el){
    if(el.dataset.split) return;
    el.dataset.split = '1';
    const walk = node => {
      Array.from(node.childNodes).forEach(child => {
        if(child.nodeType === 3){
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if(!part) return;
            if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); return; }
            const wrap = document.createElement('span'); wrap.className = 'w';
            const inner = document.createElement('i'); inner.textContent = part;
            wrap.appendChild(inner); frag.appendChild(wrap);
          });
          node.replaceChild(frag, child);
        } else if(child.nodeType === 1 && !child.classList.contains('w')){
          walk(child);
        }
      });
    };
    walk(el);
    $$('.w', el).forEach((w,i) => w.firstChild && w.firstChild.style.setProperty('--wi', i));
  }
  $$('.split-words').forEach(splitWords);

  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(en.isIntersecting){
        en.target.classList.add('in-view');
        io.unobserve(en.target);
      }
    });
  }, { threshold:.18, rootMargin:'0px 0px -6% 0px' });
  $$('.reveal, .reveal-mask, .split-words, .process-item').forEach(el => io.observe(el));

  /* ============================================================
     COUNTERS — animate when visible
  ============================================================ */
  const cio = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(!en.isIntersecting) return;
      cio.unobserve(en.target);
      const el = en.target, target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';
      if(prefersReduced){ el.textContent = target + suffix; return; }
      const t0 = performance.now(), dur = 1600;
      (function step(t){
        const k = Math.min((t - t0)/dur, 1);
        const eased = 1 - Math.pow(1-k, 3);
        el.textContent = Math.round(target*eased) + (k === 1 ? suffix : '');
        if(k < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold:.5 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ============================================================
     PARALLAX DRIFT — transform-only, cheap
  ============================================================ */
  (function drift(){
    if(prefersReduced || isTouch) return;
    const els = $$('[data-drift]');
    if(!els.length) return;
    let ticking = false;
    function update(){
      const vh = window.innerHeight;
      els.forEach(el => {
        const speed = parseFloat(el.dataset.drift) || .08;
        const r = el.getBoundingClientRect();
        const mid = r.top + r.height/2 - vh/2;
        el.style.transform = 'translateY(' + (-mid*speed).toFixed(1) + 'px)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if(!ticking){ ticking = true; requestAnimationFrame(update); }
    }, { passive:true });
    update();
  })();

  /* ============================================================
     MAGNETIC ELEMENTS
  ============================================================ */
  (function magnetic(){
    if(isTouch || prefersReduced) return;
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width/2;
        const my = e.clientY - r.top - r.height/2;
        el.style.transform = 'translate(' + mx*.22 + 'px,' + my*.22 + 'px)';
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  })();

  /* ============================================================
     TOAST
  ============================================================ */
  let toastTimer;
  window.showToast = function(msg){
    let t = $('#toast');
    if(!t){
      t = document.createElement('div'); t.id = 'toast'; t.className = 'toast';
      t.setAttribute('role','status'); t.setAttribute('aria-live','polite');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3400);
  };

  /* ============================================================
     PAGE TRANSITIONS — internal links crossfade via veil
  ============================================================ */
  (function transitions(){
    if(prefersReduced) return;
    const veil = document.createElement('div'); veil.id = 'page-veil';
    document.body.appendChild(veil);
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if(!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const href = a.getAttribute('href');
      if(!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if(a.dataset.noTransition !== undefined) return;
      e.preventDefault();
      veil.classList.add('cover');
      setTimeout(() => { window.location.href = href; }, 480);
    });
    window.addEventListener('pageshow', ev => {
      if(ev.persisted) veil.classList.remove('cover');
    });
  })();

  /* ============================================================
     FOOTER YEAR
  ============================================================ */
  $$('.js-year').forEach(el => el.textContent = new Date().getFullYear());

  /* ============================================================
     SHARED RENDERERS (services / team / pricing / process)
  ============================================================ */
  const ICONS = {
    code:'<rect x="3" y="4" width="18" height="14" rx="1"/><path d="M3 9h18M7 4v5"/>',
    pen:'<path d="M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586"/>',
    cart:'<circle cx="9" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8a2 2 0 0 0 2-1.6L21 7H6"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
    life:'<circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>',
  };
  function icon(name){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">' + (ICONS[name] || ICONS.code) + '</svg>';
  }

  function renderServices(){
    const wrap = $('#servicesGrid');
    if(!wrap || !OFFSCRIPT.SERVICES) return;
    wrap.innerHTML = OFFSCRIPT.SERVICES.map((s,i) => `
      <article class="service-card reveal" style="--reveal-delay:${i*70}ms">
        <span class="service-num">${s.num}</span>
        <div class="service-icon">${icon(s.icon)}</div>
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.blurb)}</p>
        <button class="service-more" type="button" aria-expanded="false">Details <span class="arr">↓</span></button>
        <div class="service-detail"><ul>${s.details.map(d => `<li>${esc(d)}</li>`).join('')}</ul></div>
      </article>`).join('');
    $$('.service-more', wrap).forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.service-card');
        const open = card.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
        btn.innerHTML = 'Details <span class="arr">' + (open ? '↑' : '↓') + '</span>';
      });
    });
    $$('.service-card', wrap).forEach(c => io.observe(c));
  }

  function renderTeam(){
    const wrap = $('#teamGrid');
    if(!wrap || !OFFSCRIPT.TEAM) return;
    wrap.innerHTML = OFFSCRIPT.TEAM.map((m,i) => `
      <article class="team-card reveal" style="--reveal-delay:${i*70}ms">
        <div class="team-avatar">${esc(m.initials)}</div>
        <h3>${esc(m.name)}</h3>
        <div class="team-role">${esc(m.role)}</div>
        <p>${esc(m.bio)}</p>
        <div class="team-skills">${m.skills.map(s => `<span>${esc(s)}</span>`).join('')}</div>
        <div class="team-links">
          <a href="${OFFSCRIPT.CONTACT.socials[0].url}" aria-label="LinkedIn of ${esc(m.name)}">LinkedIn</a>
          <a href="${OFFSCRIPT.CONTACT.socials[1].url}" aria-label="Portfolio of ${esc(m.name)}">Portfolio</a>
        </div>
      </article>`).join('');
    $$('.team-card', wrap).forEach(c => io.observe(c));
  }

  function renderPricing(){
    const grid = $('#pricingGrid');
    if(!grid || !OFFSCRIPT.PRICING) return;
    grid.innerHTML = OFFSCRIPT.PRICING.map(t => `
      <div class="price-card ${t.featured ? 'featured':''} reveal">
        <div class="price-tier">${esc(t.tier)}</div>
        <h3>${esc(t.name)}</h3>
        <div class="price-value">${esc(t.value)}</div>
        <ul class="price-list">${t.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
        <a href="start.html" class="price-cta btn btn-ghost" data-no-transition>${esc(t.tier === 'Custom' ? 'Request a quote' : 'Start with ' + t.tier)}</a>
      </div>`).join('');
    $$('.price-card', grid).forEach(c => io.observe(c));
  }

  function renderProcess(){
    const list = $('#processList');
    if(!list || !OFFSCRIPT.PROCESS) return;
    list.innerHTML = OFFSCRIPT.PROCESS.map(p => `
      <div class="process-item">
        <span class="process-num">${p.num}</span>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.text)}</p>
      </div>`).join('');
    $$('.process-item', list).forEach(el => io.observe(el));
  }

  function renderStats(){
    const band = $('#statsBand');
    if(!band || !OFFSCRIPT.STATS) return;
    band.innerHTML = OFFSCRIPT.STATS.map(s => `
      <div class="stat">
        <strong><span data-count="${s.value}" data-suffix="${s.suffix}">0</span></strong>
        <span>${esc(s.label)}${s.placeholder ? ' <em class="ph" title="Placeholder — replace with a real number">ph</em>' : ''}</span>
      </div>`).join('');
    $$('[data-count]', band).forEach(el => cio.observe(el));
  }

  function renderFaqs(){
    const list = $('#faqList');
    if(!list || !OFFSCRIPT.FAQS) return;
    list.innerHTML = OFFSCRIPT.FAQS.map((f,i) => `
      <div class="faq-item">
        <button class="faq-q" aria-expanded="false" aria-controls="faq-a-${i}" id="faq-q-${i}">
          <span>${esc(f.q)}</span><span class="fi" aria-hidden="true">+</span>
        </button>
        <div class="faq-a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}"><p>${esc(f.a)}</p></div>
      </div>`).join('');
    $$('.faq-q', list).forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const open = item.classList.contains('open');
        $$('.faq-item.open', list).forEach(o => {
          o.classList.remove('open');
          $('.faq-a', o).style.maxHeight = null;
          $('.faq-q', o).setAttribute('aria-expanded','false');
        });
        if(!open){
          item.classList.add('open');
          const a = $('.faq-a', item);
          a.style.maxHeight = a.scrollHeight + 'px';
          btn.setAttribute('aria-expanded','true');
        }
      });
    });
  }

  function renderTestimonials(){
    const grid = $('#tstGrid');
    if(!grid || !OFFSCRIPT.TESTIMONIALS) return;
    grid.innerHTML = OFFSCRIPT.TESTIMONIALS.map((t,i) => `
      <figure class="tst-card reveal" style="--reveal-delay:${i*80}ms">
        <div class="tst-mark" aria-hidden="true">”</div>
        <blockquote class="tst-quote">${esc(t.quote)}</blockquote>
        <figcaption class="tst-who">
          <div class="tst-ava" aria-hidden="true">${esc(t.initials)}</div>
          <div>
            <strong>${esc(t.name)} <span class="ph" title="Placeholder testimonial — replace with a real client quote">ph</span></strong>
            <span>${esc(t.role)}, ${esc(t.company)}</span>
            <div class="tst-project">${esc(t.project)}</div>
          </div>
        </figcaption>
      </figure>`).join('');
    $$('.tst-card', grid).forEach(c => io.observe(c));
  }

  renderServices(); renderTeam(); renderPricing(); renderProcess();
  renderStats(); renderFaqs(); renderTestimonials();

  /* expose small helpers for page scripts */
  window.OS = { $, $$, esc, io, prefersReduced, isTouch };
})();
