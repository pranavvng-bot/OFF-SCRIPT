/* ============================================================
   OFF-SCRIPT — dashboard / payment / admin
   Reads the demo store (localStorage 'os-projects'). Replace
   with API calls at the marked integration points.
   ============================================================ */
(function(){
  'use strict';
  const $  = (s,c) => (c||document).querySelector(s);
  const $$ = (s,c) => Array.from((c||document).querySelectorAll(s));
  const esc = OFFSCRIPT.esc;

  function getProjects(){ try{ return JSON.parse(localStorage.getItem('os-projects') || '{}'); }catch(e){ return {}; } }
  function getSession(){ try{ return JSON.parse(localStorage.getItem('os-session') || 'null'); }catch(e){ return null; } }
  function latestRecord(){
    const all = Object.values(getProjects());
    all.sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    return all[0] || null;
  }
  function fmtDate(iso){ try{ return new Date(iso).toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' }); }catch(e){ return '—'; } }

  /* ============================================================
     CLIENT DASHBOARD
  ============================================================ */
  const dashRoot = $('#dashboardContent');
  if(dashRoot){
    const session = getSession();
    const record = latestRecord();

    if(session && session.name){
      $('#dashWelcome').textContent = 'Welcome, ' + session.name.split(' ')[0];
      $('#dashWelcomeKicker').textContent = 'Client dashboard — ' + session.email;
    }

    if(!record){
      $('#dashWelcome').textContent = 'No project yet';
      dashRoot.innerHTML = '<div class="dash-card empty-state">You haven\'t submitted a project request yet.<br><br>' +
        '<a href="start.html" class="btn btn-primary" data-no-transition>Start a project</a></div>';
    } else {
      const ms = record.milestones && record.milestones[0] ? record.milestones[0].name : '—';
      $('#dashWelcome').textContent = 'Welcome, ' + (record.name || 'there').split(' ')[0];
      const msRows = (record.milestones || []).map(m =>
        '<div class="milestone-row"><span>' + esc(m.name) + '</span>' +
        '<span class="' + (m.paid ? 'pay-paid">Paid' : 'pay-pending">' + esc(m.amount) + ' — Pending') + '</span></div>').join('');

      dashRoot.innerHTML =
        '<div class="dash-grid"><div>' +
          '<div class="dash-card">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; gap:14px; margin-bottom:4px; flex-wrap:wrap;">' +
              '<h3 style="margin:0;">' + esc(record.projectType) + (record.company ? ' — ' + esc(record.company) : '') + '</h3>' +
              '<span class="status-badge live">' + esc(record.status) + '</span>' +
            '</div>' +
            '<div class="progress-track"><div class="progress-fill" style="width:' + (record.progress || 0) + '%"></div></div>' +
            '<p style="font-size:.8rem; color:var(--ink-faint);">' + (record.progress || 0) + '% complete · Next milestone: ' + esc(ms) + '</p>' +
          '</div>' +
          '<div class="dash-card"><h3>Requirements on file</h3>' +
            '<p style="font-size:.88rem; color:var(--ink-dim); white-space:pre-wrap;">' + esc(record.requirements) + '</p></div>' +
          '<div class="dash-card"><h3>Recent updates</h3>' +
            '<div class="milestone-row"><span>Request received</span><span class="when">' + fmtDate(record.submittedAt) + '</span></div>' +
            '<div class="milestone-row"><span>Awaiting quote confirmation</span><span class="when">—</span></div></div>' +
        '</div><div>' +
          '<div class="dash-card"><h3>Payment summary</h3>' + msRows +
            '<a href="payment.html" class="btn btn-ghost btn-sm" style="margin-top:18px;" data-no-transition>Go to payments <span class="arr">→</span></a></div>' +
          '<div class="dash-card"><h3>Files</h3>' +
            ((record.fileNames && record.fileNames.length)
              ? record.fileNames.map(f => '<div class="milestone-row"><span>' + esc(f) + '</span><span class="tag-chip">Attached</span></div>').join('')
              : '<p class="empty-state" style="padding:18px 0;">No files uploaded yet.</p>') + '</div>' +
          '<div class="dash-card"><h3>Contact the team</h3>' +
            '<a href="mailto:' + esc(OFFSCRIPT.CONTACT.email) + '" class="btn btn-ghost btn-sm" style="width:100%; justify-content:center;">Message us</a></div>' +
        '</div></div>';
    }

    const out = $('#logoutBtn');
    if(out) out.addEventListener('click', () => {
      try{ localStorage.removeItem('os-session'); }catch(e){}
      showToast('Signed out.');
      setTimeout(() => { window.location.href = 'index.html'; }, 400);
    });
  }

  /* ============================================================
     PAYMENT PAGE (frontend only — no fake confirmations)
  ============================================================ */
  const payRoot = $('#paymentRoot');
  if(payRoot){
    const record = latestRecord();
    const amount = $('#payAmount'), status = $('#payStatus'), method = $('#payMethod');
    const stage = $('#payStage'), stageConfirm = $('#payStageConfirm');
    const projectEl = $('#payProject');

    if(projectEl) projectEl.textContent = record ? (record.projectType + (record.company ? ' — ' + record.company : '')) : 'No active project';
    if(method) method.addEventListener('change', () => {
      $('#payGatewayNote').textContent = method.value === 'upi'
        ? 'You will receive UPI payment details by email.'
        : 'You will be redirected to a secure ' + method.options[method.selectedIndex].text + ' checkout.';
    });

    const payForm = $('#paymentForm');
    if(payForm){
      payForm.addEventListener('submit', e => {
        e.preventDefault();
        if(!record){
          showToast('No active project found — submit a project request first.');
          return;
        }
        /* INTEGRATION POINT: create an order with your payment gateway
           (Razorpay / Stripe / etc.) and redirect to its checkout.
           This preview intentionally does NOT confirm any payment. */
        showToast('Gateway not connected in this preview — no charge was made.');
      });
    }
  }

  /* ============================================================
     ADMIN
  ============================================================ */
  const adminBody = $('#adminTableBody');
  if(adminBody){
    const tbody = adminBody;
    tbody.innerHTML = '<tr><td colspan="5"><div class="skeleton" style="height:20px;"></div></td></tr>';
    setTimeout(() => {
      /* INTEGRATION POINT: fetch('GET /api/admin/projects') */
      const records = Object.values(getProjects()).sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      if(!records.length){
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state">No client requests yet — they\'ll appear here once someone submits the "Start a Project" form.</div></td></tr>';
        return;
      }
      tbody.innerHTML = records.map(r =>
        '<tr>' +
          '<td><strong>' + esc(r.name) + '</strong><br><span class="sub">' + esc(r.email) + '</span></td>' +
          '<td>' + esc(r.projectType) + (r.company ? '<br><span class="sub">' + esc(r.company) + '</span>' : '') + '</td>' +
          '<td>' + esc(r.budget || '—') + '</td>' +
          '<td><span class="tag-chip">' + esc(r.status) + '</span></td>' +
          '<td class="sub">' + fmtDate(r.submittedAt) + '</td>' +
        '</tr>').join('');
    }, 250);
  }
})();
