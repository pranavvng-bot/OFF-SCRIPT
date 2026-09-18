/* ============================================================
   OFF-SCRIPT — portfolio
   Grid + list rendering, filtering, modal, cursor preview.
   ============================================================ */
(function(){
  'use strict';
  const $  = (s,c) => (c||document).querySelector(s);
  const $$ = (s,c) => Array.from((c||document).querySelectorAll(s));
  const esc = OFFSCRIPT.esc;
  const PROJECTS = OFFSCRIPT.PROJECTS || [];
  const COLORS = ['#8b7fff','#5fd4a0','#ff9f6b','#5fb9ff','#ff6b9d','#ffd166'];

  function thumbSVG(idx, seedShift){
    const c = COLORS[(idx + (seedShift||0)) % COLORS.length];
    const k = idx * 17;
    return '<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs><linearGradient id="pg' + idx + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="' + c + '" stop-opacity="0.34"/>' +
      '<stop offset="100%" stop-color="' + c + '" stop-opacity="0.05"/></linearGradient></defs>' +
      '<rect width="400" height="250" fill="url(#pg' + idx + ')"/>' +
      '<circle cx="' + (70 + (k%160)) + '" cy="' + (85 + (k%70)) + '" r="76" fill="' + c + '" opacity="0.13"/>' +
      '<rect x="' + (250 - (k%50)) + '" y="' + (150 - (k%40)) + '" width="110" height="70" rx="3" fill="none" stroke="' + c + '" stroke-opacity="0.35"/>' +
      '<path d="M0 ' + (210 - (k%30)) + ' Q 120 ' + (170 - (k%50)) + ' 400 ' + (220 - (k%30)) + '" stroke="' + c + '" stroke-opacity="0.25" fill="none"/>' +
      '</svg>';
  }

  /* ---------- grid (home / work) ---------- */
  function renderGrid(filter){
    const grid = $('#portfolioGrid');
    if(!grid) return;
    const f = filter || 'All';
    grid.innerHTML = PROJECTS.map((p,i) => {
      const hidden = (f !== 'All' && p.cat !== f) ? ' hidden-item' : '';
      return '<article class="project-card pop' + hidden + '" data-idx="' + i + '" data-cat="' + esc(p.cat) + '" tabindex="0" role="button" aria-label="View ' + esc(p.name) + ' case study" style="animation-delay:' + (i*60) + 'ms">' +
        '<div class="project-thumb">' + thumbSVG(i) + '</div>' +
        '<div class="project-body">' +
          '<div class="project-cat">' + esc(p.cat) + ' — ' + esc(p.year) + '</div>' +
          '<h3>' + esc(p.name) + '</h3>' +
          '<p>' + esc(p.desc) + '</p>' +
          '<div class="project-tech">' + p.tech.map(t => '<span>' + esc(t) + '</span>').join('') + '</div>' +
          '<div class="project-link-row">' +
            '<a href="case-study.html?p=' + encodeURIComponent(p.slug) + '" data-no-transition>Case study <span class="arr">→</span></a>' +
            '<a href="' + esc(p.live) + '" onclick="showToast(\'Live link placeholder — connect the real URL\'); return false;">Live demo <span class="arr">↗</span></a>' +
          '</div>' +
        '</div></article>';
    }).join('');
    bindCards(grid);
  }

  /* ---------- rows (work page list) ---------- */
  function renderRows(){
    const list = $('#workRows');
    if(!list) return;
    list.innerHTML = PROJECTS.map((p,i) =>
      '<div class="work-row" data-idx="' + i + '" tabindex="0" role="link" aria-label="Open ' + esc(p.name) + ' case study">' +
        '<span class="idx">' + String(i+1).padStart(2,'0') + '</span>' +
        '<h3>' + esc(p.name) + '</h3>' +
        '<div class="meta"><span>' + esc(p.cat) + '</span>' + esc(p.stack) + '</div>' +
        '<span class="go" aria-hidden="true">→</span>' +
      '</div>').join('');
    bindRows(list);
  }

  function openCase(i){
    const p = PROJECTS[i];
    if(p) window.location.href = 'case-study.html?p=' + encodeURIComponent(p.slug);
  }

  function bindCards(scope){
    $$('.project-card', scope).forEach(card => {
      const go = e => { if(e.target.closest('a')) return; openCase(+card.dataset.idx); };
      card.addEventListener('click', go);
      card.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); go(e); } });
    });
  }
  function bindRows(scope){
    $$('.work-row', scope).forEach(row => {
      const go = () => openCase(+row.dataset.idx);
      row.addEventListener('click', go);
      row.addEventListener('keydown', e => { if(e.key === 'Enter'){ go(e); } });
    });
  }

  /* ---------- filter buttons ---------- */
  const filterRow = $('#filterRow');
  if(filterRow){
    filterRow.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if(!btn) return;
      $$('.filter-btn', filterRow).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid(btn.dataset.filter);
    });
  }

  /* ---------- modal (quick view) ---------- */
  const overlay = $('#modalOverlay');
  function openModal(idx){
    if(!overlay) return;
    const p = PROJECTS[idx]; if(!p) return;
    $('#modalThumb').innerHTML = thumbSVG(idx, 2);
    $('#modalCat').textContent = p.cat + ' — ' + p.year;
    $('#modalTitle').textContent = p.name;
    $('#modalDesc').textContent = p.desc;
    $('#modalTech').innerHTML = p.tech.map(t => '<span>' + esc(t) + '</span>').join('');
    $('#modalLink').href = 'case-study.html?p=' + encodeURIComponent(p.slug);
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    $('.modal-close', overlay).focus();
  }
  function closeModal(){
    if(!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  if(overlay){
    overlay.addEventListener('click', e => { if(e.target === overlay) closeModal(); });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });
    const mc = $('#modalClose'); if(mc) mc.addEventListener('click', closeModal);
  }

  /* ---------- cursor-following preview (work list) ---------- */
  (function cursorPreview(){
    if(OS.isTouch || OS.prefersReduced) return;
    const list = $('#workRows');
    const prev = $('#cursorPreview');
    if(!list || !prev) return;
    prev.style.display = 'block';
    let raf, tx = 0, ty = 0, cx = 0, cy = 0;
    list.addEventListener('mousemove', e => {
      tx = e.clientX; ty = e.clientY;
      if(!raf) loop();
    });
    function loop(){
      cx += (tx-cx)*.12; cy += (ty-cy)*.12;
      prev.style.left = cx + 'px'; prev.style.top = cy + 'px';
      raf = (Math.abs(tx-cx) > .5 || Math.abs(ty-cy) > .5) ? requestAnimationFrame(loop) : null;
    }
    list.addEventListener('mouseover', e => {
      const row = e.target.closest('.work-row');
      if(!row) return;
      prev.innerHTML = thumbSVG(+row.dataset.idx, 1);
      prev.classList.add('show');
    });
    list.addEventListener('mouseleave', () => prev.classList.remove('show'));
  })();

  /* ---------- case-study page renderer ---------- */
  function renderCase(){
    const root = $('#caseRoot');
    if(!root) return;
    const slug = new URLSearchParams(location.search).get('p');
    const idx = Math.max(0, PROJECTS.findIndex(p => p.slug === slug));
    const p = PROJECTS[idx] || PROJECTS[0];
    if(!p){ root.innerHTML = '<div class="empty-state">Project not found.</div>'; return; }
    const next = PROJECTS[(idx+1) % PROJECTS.length];

    document.title = p.name + ' — Case Study | OFF-SCRIPT';
    const meta = $('#caseMeta'); if(meta) meta.setAttribute('content', p.tagline);

    root.innerHTML =
      '<section class="case-hero"><div class="wrap">' +
        '<div class="kicker">' + esc(p.cat) + ' — ' + esc(p.year) + '</div>' +
        '<h1 class="split-words">' + esc(p.name) + '</h1>' +
        '<p class="lede">' + esc(p.tagline) + '</p>' +
        '<div class="case-meta reveal">' +
          '<div><span>Client</span><strong>' + esc(p.name) + '</strong></div>' +
          '<div><span>Role</span><strong>' + esc(p.role) + '</strong></div>' +
          '<div><span>Stack</span><strong>' + esc(p.stack) + '</strong></div>' +
          '<div><span>Duration</span><strong>' + esc(p.duration) + '</strong></div>' +
        '</div>' +
        '<div class="case-visual reveal" data-drift="0.02">' + thumbSVG(idx, 3) + '</div>' +
      '</div></section>' +

      '<section class="case-section"><div class="wrap"><div class="cs-grid">' +
        '<h2 class="kicker">Overview</h2>' +
        '<div class="cs-body"><p>' + esc(p.desc) + '</p>' +
        '<a class="btn btn-ghost btn-sm" href="' + esc(p.live) + '" onclick="showToast(\'Live link placeholder — connect the real URL\'); return false;">Visit live site <span class="arr">↗</span></a></div>' +
      '</div></div></section>' +

      '<section class="case-section"><div class="wrap"><div class="cs-grid">' +
        '<h2 class="kicker">The challenge</h2>' +
        '<div class="cs-body"><p>' + esc(p.challenge) + '</p></div>' +
      '</div></div></section>' +

      '<section class="case-section"><div class="wrap"><div class="cs-grid">' +
        '<h2 class="kicker">Our approach</h2>' +
        '<div class="cs-body"><p>' + esc(p.approach) + '</p>' +
          '<ul>' + p.features.map(f => '<li>' + esc(f) + '</li>').join('') + '</ul></div>' +
      '</div></div></section>' +

      '<section class="case-section"><div class="wrap"><div class="cs-grid">' +
        '<h2 class="kicker">Result</h2>' +
        '<div class="cs-body"><p>' + esc(p.result) + ' <span class="ph">placeholder — add real metrics</span></p>' +
        '<blockquote class="case-quote">“They treated our project like it was their own product.”' +
        '<cite>Placeholder quote — replace with the real client</cite></blockquote></div>' +
      '</div></div></section>' +

      '<nav class="case-nav"><a href="case-study.html?p=' + encodeURIComponent(PROJECTS[(idx-1+PROJECTS.length)%PROJECTS.length].slug) + '" data-no-transition><span>← Previous</span><strong>' + esc(PROJECTS[(idx-1+PROJECTS.length)%PROJECTS.length].name) + '</strong></a>' +
      '<a href="case-study.html?p=' + encodeURIComponent(next.slug) + '" data-no-transition><span>Next →</span><strong>' + esc(next.name) + '</strong></a></nav>';

    /* re-run reveals + splits for injected DOM */
    $$('.reveal, .split-words', root).forEach(el => OS.io.observe(el));
    $$('.split-words', root).forEach(el => {
      const walk = node => Array.from(node.childNodes).forEach(child => {
        if(child.nodeType === 3){
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if(!part) return;
            if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i2 = document.createElement('i'); i2.textContent = part;
            w.appendChild(i2); frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if(child.nodeType === 1 && !child.classList.contains('w')) walk(child);
      });
      walk(el);
      $$('.w', el).forEach((w,i) => w.firstChild && w.firstChild.style.setProperty('--wi', i));
      OS.io.observe(el);
    });
  }

  renderGrid(); renderRows(); renderCase();

  /* expose for other scripts */
  window.OSPortfolio = { openModal, thumbSVG };
})();
