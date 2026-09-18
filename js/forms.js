/* ============================================================
   OFF-SCRIPT — forms
   Validation helpers, quick contact, multi-step project intake,
   demo authentication (login / register / forgot).
   NOTE: auth here is a UI demo (localStorage) — wire to a real
   backend before production. Never store real passwords.
   ============================================================ */
(function(){
  'use strict';
  const $  = (s,c) => (c||document).querySelector(s);
  const $$ = (s,c) => Array.from((c||document).querySelectorAll(s));

  /* ---------- shared validation helpers ---------- */
  window.OSForms = {
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    mark(fieldEl, ok){
      const wrap = fieldEl.closest('.field');
      if(wrap) wrap.classList.toggle('has-error', !ok);
      return ok;
    },
    value(id){ const el = document.getElementById(id); return el ? el.value.trim() : ''; }
  };
  const mark = OSForms.mark;

  /* ============================================================
     QUICK CONTACT (contact page)
  ============================================================ */
  const quick = $('#quickContactForm');
  if(quick){
    quick.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#qc-name'), email = $('#qc-email'), message = $('#qc-message');
      let ok = true;
      ok = mark(name, name.value.trim().length > 1) && ok;
      ok = mark(email, OSForms.email(email.value)) && ok;
      ok = mark(message, message.value.trim().length > 4) && ok;
      if(!ok) return;
      /* INTEGRATION POINT: POST to your backend / form service here */
      try{
        const box = JSON.parse(localStorage.getItem('os-messages') || '[]');
        box.push({ name:name.value.trim(), email:email.value.trim(), message:message.value.trim(), at:new Date().toISOString() });
        localStorage.setItem('os-messages', JSON.stringify(box));
      }catch(err){}
      showToast("Message sent — we'll reply within one business day.");
      quick.reset();
    });
  }

  /* ============================================================
     MULTI-STEP PROJECT INTAKE (start.html)
  ============================================================ */
  const form = $('#projectForm');
  if(form){
    const panels = $$('.step-panel', form);
    const dots   = $$('.step-dot');
    const btnNext = $('#stepNext'), btnBack = $('#stepBack'), btnSubmit = $('#projectSubmitBtn');
    let step = 0;

    /* choice cards → hidden inputs */
    $$('.choice-card', form).forEach(card => {
      card.addEventListener('click', () => {
        const group = card.closest('.choice-cards');
        $$('.choice-card', group).forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const input = $('#' + card.dataset.target);
        if(input) input.value = card.dataset.value;
        const wrap = input && input.closest('.field');
        if(wrap) wrap.classList.remove('has-error');
      });
    });
    /* restore preselected type from pricing CTA (?plan=Starter) */
    const params = new URLSearchParams(location.search);
    if(params.get('plan')){
      const card = $('.choice-card[data-value="' + params.get('plan') + '"]');
      if(card) card.click();
    }

    function validateStep(i){
      let ok = true;
      if(i === 0){
        ok = mark($('#p-name'), OSForms.value('p-name').length > 1) && ok;
        ok = mark($('#p-email'), OSForms.email(OSForms.value('p-email'))) && ok;
        ok = mark($('#p-phone'), OSForms.value('p-phone').length > 5) && ok;
      }
      if(i === 1){
        ok = mark($('#p-type'), OSForms.value('p-type') !== '') && ok;
        ok = mark($('#p-requirements'), OSForms.value('p-requirements').length > 4) && ok;
      }
      if(i === 3){
        ok = mark($('#p-budget'), OSForms.value('p-budget') !== '') && ok;
      }
      if(i === 4){
        ok = mark($('#p-consent'), $('#p-consent').checked) && ok;
      }
      return ok;
    }

    function goto(i){
      step = Math.max(0, Math.min(panels.length - 1, i));
      panels.forEach((p,idx) => p.classList.toggle('active', idx === step));
      dots.forEach((d,idx) => {
        d.classList.toggle('current', idx === step);
        d.classList.toggle('done', idx < step);
      });
      btnBack.style.visibility = step === 0 ? 'hidden' : 'visible';
      btnNext.style.display = step === panels.length - 1 ? 'none' : 'inline-flex';
      btnSubmit.style.display = step === panels.length - 1 ? 'inline-flex' : 'none';
      if(step === panels.length - 1) fillReview();
      const top = form.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior:'smooth' });
    }

    btnNext.addEventListener('click', () => {
      if(!validateStep(step)){ showToast('Please complete the highlighted fields.'); return; }
      goto(step + 1);
    });
    btnBack.addEventListener('click', () => goto(step - 1));

    function fillReview(){
      const rows = [
        ['Name', OSForms.value('p-name')],
        ['Email', OSForms.value('p-email')],
        ['Phone', OSForms.value('p-phone')],
        ['Company', OSForms.value('p-company') || '—'],
        ['Project type', OSForms.value('p-type')],
        ['Requirements', OSForms.value('p-requirements')],
        ['Features', $$('input[name="p-feature"]:checked').map(c => c.value).join(', ') || '—'],
        ['References', OSForms.value('p-reference') || '—'],
        ['Budget', OSForms.value('p-budget')],
        ['Deadline', OSForms.value('p-deadline') || 'Flexible'],
        ['Preferred contact', OSForms.value('p-contact') || 'Email'],
      ];
      $('#reviewList').innerHTML = rows.map(r =>
        '<div class="milestone-row"><span style="color:var(--ink-faint);">' + r[0] +
        '</span><span style="text-align:right; max-width:60%;">' + OFFSCRIPT.esc(r[1]) + '</span></div>').join('');
    }

    /* file drop */
    const fileInput = $('#p-files'), drop = $('#fileDrop'), fileList = $('#fileList');
    if(fileInput && drop){
      ['dragenter','dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('dragover'); }));
      ['dragleave','drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('dragover'); }));
      drop.addEventListener('drop', e => {
        if(e.dataTransfer.files.length){
          fileInput.files = e.dataTransfer.files;
          fileInput.dispatchEvent(new Event('change'));
        }
      });
      fileInput.addEventListener('change', () => {
        fileList.innerHTML = Array.from(fileInput.files).map(f => '<span>' + OFFSCRIPT.esc(f.name) + '</span>').join('');
      });
    }

    /* submit */
    form.addEventListener('submit', async e => {
      e.preventDefault();
      for(let i=0;i<panels.length;i++){
        if(!validateStep(i)){ goto(i); showToast('Please complete the highlighted fields.'); return; }
      }
      btnSubmit.disabled = true; btnSubmit.textContent = 'Submitting…';

      const clientId = 'client_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
      const record = {
        id: clientId,
        name: OSForms.value('p-name'),
        email: OSForms.value('p-email'),
        phone: OSForms.value('p-phone'),
        company: OSForms.value('p-company'),
        projectType: OSForms.value('p-type'),
        requirements: OSForms.value('p-requirements'),
        features: $$('input[name="p-feature"]:checked').map(c => c.value),
        reference: OSForms.value('p-reference'),
        budget: OSForms.value('p-budget'),
        deadline: OSForms.value('p-deadline'),
        contactMethod: OSForms.value('p-contact'),
        notes: OSForms.value('p-notes'),
        fileNames: fileInput ? Array.from(fileInput.files).map(f => f.name) : [],
        status:'Design', progress:15,
        milestones:[
          { name:'Design approval', amount:'On quote', paid:false },
          { name:'Development', amount:'On quote', paid:false },
          { name:'Final delivery', amount:'On quote', paid:false },
        ],
        submittedAt:new Date().toISOString(),
      };

      /* INTEGRATION POINT: replace localStorage with your API / database */
      try{
        if(window.claude && window.claude.use){
          try{
            const dbApi = await window.claude.use('db');
            await dbApi.doc('projects/' + clientId).set(record);
          }catch(err){ /* db not available — local fallback below */ }
        }
        const local = JSON.parse(localStorage.getItem('os-projects') || '{}');
        local[clientId] = record;
        localStorage.setItem('os-projects', JSON.stringify(local));
      }catch(err){ console.warn('Could not persist project', err); }

      try{ localStorage.setItem('os-session', JSON.stringify({ name:record.name, email:record.email, role:'client' })); }catch(err){}

      $('#startFormWrap').style.display = 'none';
      $('#confirmWrap').style.display = 'block';
      $('#confirmId').textContent = 'Reference: ' + clientId;
      window.scrollTo({ top:0, behavior:'smooth' });
      showToast('Request received — check your dashboard anytime.');
      btnSubmit.disabled = false; btnSubmit.textContent = 'Submit project request';
    });

    goto(0);
  }

  /* ============================================================
     DEMO AUTH — login / register / forgot
  ============================================================ */
  function getUsers(){ try{ return JSON.parse(localStorage.getItem('os-users') || '{}'); }catch(e){ return {}; } }
  function setUsers(u){ try{ localStorage.setItem('os-users', JSON.stringify(u)); }catch(e){} }
  function setSession(s){ try{ localStorage.setItem('os-session', JSON.stringify(s)); }catch(e){} }

  const DEMO = { 'client@demo.studio': { name:'Demo Client', password:'demo123', role:'client' } };

  const loginForm = $('#loginForm');
  if(loginForm){
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = OSForms.value('a-email').toLowerCase();
      const pwd = $('#a-password').value;
      let ok = true;
      ok = mark($('#a-email'), OSForms.email(email)) && ok;
      ok = mark($('#a-password'), pwd.length > 0) && ok;
      if(!ok) return;

      const users = getUsers();
      const user = users[email] || DEMO[email];
      if(!user || user.password !== pwd){
        mark($('#a-password'), false);
        showToast('Invalid email or password. Try the demo account below.');
        return;
      }
      setSession({ name:user.name, email, role:user.role || 'client' });
      showToast('Welcome back, ' + user.name.split(' ')[0] + '.');
      setTimeout(() => { window.location.href = user.role === 'admin' ? 'admin.html' : 'client-dashboard.html'; }, 500);
    });
  }

  const registerForm = $('#registerForm');
  if(registerForm){
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#r-name'), email = $('#r-email'), pwd = $('#r-password'), pwd2 = $('#r-password2');
      let ok = true;
      ok = mark(name, name.value.trim().length > 1) && ok;
      ok = mark(email, OSForms.email(email.value)) && ok;
      ok = mark(pwd, pwd.value.length >= 8) && ok;
      ok = mark(pwd2, pwd2.value === pwd.value && pwd2.value.length > 0) && ok;
      if(!ok) return;

      const users = getUsers();
      const key = email.value.trim().toLowerCase();
      if(users[key] || DEMO[key]){ mark(email, false); showToast('An account with this email already exists.'); return; }

      /* DEMO ONLY — never store plaintext passwords in production.
         INTEGRATION POINT: register via your backend auth API. */
      users[key] = { name:name.value.trim(), password:pwd.value, role:'client', at:new Date().toISOString() };
      setUsers(users);
      setSession({ name:name.value.trim(), email:key, role:'client' });
      showToast('Account created (demo). Redirecting…');
      setTimeout(() => { window.location.href = 'client-dashboard.html'; }, 600);
    });
  }

  const forgotForm = $('#forgotForm');
  if(forgotForm){
    forgotForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = $('#f-email');
      if(!mark(email, OSForms.email(email.value))) return;
      /* INTEGRATION POINT: call your password-reset API */
      $('#forgotStep1').style.display = 'none';
      $('#forgotStep2').style.display = 'block';
    });
  }
})();
