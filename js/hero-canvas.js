/* ============================================================
   OFF-SCRIPT — hero canvas
   Lightweight node network. Honors reduced motion, pauses off
   screen and on hidden tabs, degrades to a static field.
   ============================================================ */
(function(){
  'use strict';
  const canvas = document.getElementById('heroCanvas');
  if(!canvas) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = window.matchMedia('(max-width: 720px)').matches;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, nodes = [], raf = null, running = false;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const mouse = { x:-9999, y:-9999 };

  function resize(){
    w = canvas.parentElement.offsetWidth;
    h = canvas.parentElement.offsetHeight;
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function initNodes(){
    const count = Math.min(isSmall ? 22 : 46, Math.floor((w*h)/26000));
    nodes = Array.from({ length:count }, () => ({
      x:Math.random()*w, y:Math.random()*h,
      vx:(Math.random()-.5)*.28, vy:(Math.random()-.5)*.28,
      r:Math.random()*1.2 + 1
    }));
  }

  function drawStatic(){
    ctx.clearRect(0,0,w,h);
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(139,127,255,0.5)';
      ctx.fill();
    });
  }

  function step(){
    ctx.clearRect(0,0,w,h);
    const accent = '139,127,255';
    for(const n of nodes){
      n.x += n.vx; n.y += n.vy;
      if(n.x < 0 || n.x > w) n.vx *= -1;
      if(n.y < 0 || n.y > h) n.vy *= -1;
      /* gentle cursor attraction */
      const dx = mouse.x - n.x, dy = mouse.y - n.y;
      const d2 = dx*dx + dy*dy;
      if(d2 < 22500){ n.x += dx*.004; n.y += dy*.004; }
    }
    ctx.strokeStyle = 'rgba(139,127,255,0.16)';
    ctx.lineWidth = 1;
    for(let i=0;i<nodes.length;i++){
      for(let j=i+1;j<nodes.length;j++){
        const dx = nodes[i].x-nodes[j].x, dy = nodes[i].y-nodes[j].y;
        const d2 = dx*dx+dy*dy;
        if(d2 < 16900){
          const a = (1 - Math.sqrt(d2)/130) * .3;
          ctx.strokeStyle = 'rgba(' + accent + ',' + a.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = 'rgba(139,127,255,0.65)';
    for(const n of nodes){
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      ctx.fill();
    }
    raf = requestAnimationFrame(step);
  }

  function start(){ if(running || prefersReduced) return; running = true; raf = requestAnimationFrame(step); }
  function stop(){ running = false; if(raf) cancelAnimationFrame(raf); raf = null; }

  resize(); initNodes();

  if(prefersReduced){
    drawStatic();
  } else {
    const hero = canvas.closest('section, .hero, .page-hero, .auth-shell');
    if('IntersectionObserver' in window && hero){
      new IntersectionObserver(entries => {
        entries.forEach(en => en.isIntersecting ? start() : stop());
      }, { threshold:0 }).observe(hero);
    } else { start(); }
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });
  }

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { resize(); initNodes(); if(prefersReduced) drawStatic(); }, 150);
  });

  window.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }, { passive:true });
  window.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
})();
