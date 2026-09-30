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
   CLIENT DASHBOARD — BACKEND
============================================================ */

const dashRoot = $('#dashboardContent');

if (dashRoot) {

    async function loadClientDashboard() {

        try {

            /* ============================================
               GET CLIENT SESSION
            ============================================ */

            const session = getSession();


            if (
                !session ||
                !session.email ||
                !session.projectId
            ) {

                $('#dashWelcome').textContent =
                    'Client Login Required';

                $('#dashWelcomeKicker').textContent =
                    'Please sign in to continue';


                dashRoot.innerHTML = `

                    <div class="dash-card empty-state">

                        <h3>
                            You're not logged in
                        </h3>

                        <p>
                            Please log in using your
                            registered email and Project ID.
                        </p>

                        <br>

                        <a
                            href="login.html"
                            class="btn btn-primary"
                            data-no-transition
                        >
                            Client Login →
                        </a>

                    </div>

                `;

                return;
            }


            /* ============================================
               SHOW CLIENT NAME
            ============================================ */

            $('#dashWelcome').textContent =
                'Welcome, ' +
                (session.name || 'Client').split(' ')[0];


            $('#dashWelcomeKicker').textContent =
                'Client dashboard — ' +
                session.email;


            /* ============================================
               GET PROJECTS FROM BACKEND
            ============================================ */

            const response = await fetch(
                `https://off-script-backend.onrender.com/api/projects/client/${encodeURIComponent(session.email)}`
            );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    'Unable to load project'
                );
            }


            const projects =
                result.projects || [];


            /* ============================================
               NO PROJECTS
            ============================================ */

            if (!projects.length) {

                $('#dashWelcome').textContent =
                    'No Project Found';


                dashRoot.innerHTML = `

                    <div class="dash-card empty-state">

                        <h3>
                            No project found
                        </h3>

                        <p>
                            We couldn't find a project
                            associated with this account.
                        </p>

                        <br>

                        <a
                            href="start.html"
                            class="btn btn-primary"
                            data-no-transition
                        >
                            Start a Project →
                        </a>

                    </div>

                `;

                return;
            }


            /* ============================================
               IMPORTANT:
               FIND THE EXACT PROJECT
            ============================================ */

            const project =
                projects.find(
                    item =>
                        item.project_id ===
                        session.projectId
                );


            /* ============================================
               PROJECT ID NOT FOUND
            ============================================ */

            if (!project) {

                console.error(
                    'Project ID not found in client projects:',
                    session.projectId
                );


                dashRoot.innerHTML = `

                    <div class="dash-card empty-state">

                        <h3>
                            Project not found
                        </h3>

                        <p>
                            We couldn't find Project ID
                            <strong>
                                ${esc(session.projectId)}
                            </strong>
                            for this account.
                        </p>

                        <br>

                        <a
                            href="login.html"
                            class="btn btn-primary"
                            data-no-transition
                        >
                            Back to Login →
                        </a>

                    </div>

                `;

                return;
            }


            /* ============================================
               PROJECT DATA
            ============================================ */

            const projectType =
                project.project_type ||
                'Website Project';


            const company =
                project.company ||
                '';


            const status =
                project.status ||
                'PLANNING';


            const progress =
                Math.min(
                    Math.max(
                        Number(project.progress) || 0,
                        0
                    ),
                    100
                );


            const currentStage =
                project.current_stage ||
                'Project Confirmed';


            const requirements =
                project.requirements ||
                'No requirements added yet.';


            const budget =
                project.budget ||
                'Not specified';


            const deadline =
                project.deadline
                    ? fmtDate(project.deadline)
                    : 'Not set';


            /* ============================================
               DISPLAY PROJECT
            ============================================ */

            dashRoot.innerHTML = `

                <div class="dash-grid">

                    <div>

                        <!-- PROJECT OVERVIEW -->

                        <div class="dash-card">

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    align-items:center;
                                    gap:14px;
                                    margin-bottom:4px;
                                    flex-wrap:wrap;
                                "
                            >

                                <div>

                                    <p
                                        style="
                                            margin:0 0 6px;
                                            font-size:.72rem;
                                            color:var(--ink-faint);
                                            font-family:'JetBrains Mono',monospace;
                                        "
                                    >
                                        ${esc(project.project_id)}
                                    </p>

                                    <h3 style="margin:0;">
                                        ${esc(projectType)}
                                        ${
                                            company
                                                ? ' — ' + esc(company)
                                                : ''
                                        }
                                    </h3>

                                </div>


                                <span class="status-badge live">
                                    ${esc(status)}
                                </span>

                            </div>


                            <div
                                class="progress-track"
                                style="margin-top:20px;"
                            >

                                <div
                                    class="progress-fill"
                                    style="width:${progress}%"
                                ></div>

                            </div>


                            <p
                                style="
                                    font-size:.8rem;
                                    color:var(--ink-faint);
                                "
                            >
                                ${progress}% complete
                                · Current stage:
                                ${esc(currentStage)}
                            </p>

                        </div>


                        <!-- REQUIREMENTS -->

                        <div class="dash-card">

                            <h3>
                                Requirements on file
                            </h3>

                            <p
                                style="
                                    font-size:.88rem;
                                    color:var(--ink-dim);
                                    white-space:pre-wrap;
                                "
                            >
                                ${esc(requirements)}
                            </p>

                        </div>


                        <!-- PROJECT INFORMATION -->

                        <div class="dash-card">

                            <h3>
                                Project information
                            </h3>


                            <div class="milestone-row">

                                <span>
                                    Project ID
                                </span>

                                <span class="when">
                                    ${esc(project.project_id)}
                                </span>

                            </div>


                            <div class="milestone-row">

                                <span>
                                    Budget
                                </span>

                                <span class="when">
                                    ${esc(budget)}
                                </span>

                            </div>


                            <div class="milestone-row">

                                <span>
                                    Deadline
                                </span>

                                <span class="when">
                                    ${esc(deadline)}
                                </span>

                            </div>


                            <div class="milestone-row">

                                <span>
                                    Current stage
                                </span>

                                <span class="when">
                                    ${esc(currentStage)}
                                </span>

                            </div>

                        </div>

                    </div>


                    <div>

                        <!-- PROJECT STATUS -->

                        <div class="dash-card">

                            <h3>
                                Project status
                            </h3>


                            <div class="milestone-row">

                                <span>
                                    Status
                                </span>

                                <span class="tag-chip">
                                    ${esc(status)}
                                </span>

                            </div>


                            <div class="milestone-row">

                                <span>
                                    Progress
                                </span>

                                <span class="when">
                                    ${progress}%
                                </span>

                            </div>

                        </div>


                        <!-- CLIENT INFORMATION -->

                        <div class="dash-card">

                            <h3>
                                Client information
                            </h3>


                            <div class="milestone-row">

                                <span>
                                    Name
                                </span>

                                <span class="when">
                                    ${esc(
                                        project.client_name ||
                                        session.name ||
                                        'Client'
                                    )}
                                </span>

                            </div>


                            <div class="milestone-row">

                                <span>
                                    Email
                                </span>

                                <span class="when">
                                    ${esc(
                                        project.client_email ||
                                        session.email
                                    )}
                                </span>

                            </div>


                            <div class="milestone-row">

                                <span>
                                    Phone
                                </span>

                                <span class="when">
                                    ${esc(
                                        project.client_phone ||
                                        'Not provided'
                                    )}
                                </span>

                            </div>

                        </div>


                        <!-- CONTACT TEAM -->

                        <div class="dash-card">

                            <h3>
                                Contact the team
                            </h3>

                            <a
                                href="mailto:offscriptofficial07@gmail.com"
                                class="btn btn-ghost btn-sm"
                                style="
                                    width:100%;
                                    justify-content:center;
                                "
                            >
                                Message us
                            </a>

                        </div>

                    </div>

                </div>

            `;

        } catch (error) {

            console.error(
                'Client dashboard error:',
                error
            );


            dashRoot.innerHTML = `

                <div class="dash-card empty-state">

                    <h3>
                        Unable to load your project
                    </h3>

                    <p>
                        Please refresh the page and try again.
                    </p>

                    <br>

                    <button
                        class="btn btn-primary"
                        onclick="location.reload()"
                    >
                        Refresh Dashboard
                    </button>

                </div>

            `;
        }
    }


    /* ============================================
       LOAD DASHBOARD
    ============================================ */

    loadClientDashboard();


    /* ============================================
       LOGOUT
    ============================================ */

    const out =
        $('#logoutBtn');


    if (out) {

        out.addEventListener(
            'click',
            () => {

                try {

                    localStorage.removeItem(
                        'os-session'
                    );

                } catch (e) {}

                showToast(
                    'Signed out.'
                );

                setTimeout(
                    () => {
                        window.location.href =
                            'index.html';
                    },
                    400
                );

            }
        );

    }

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
   SECURITY — HTML ESCAPE
============================================================ */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

  /* ============================================================
   ADMIN — CLIENT REQUESTS
============================================================ */

async function loadAdminClientRequests() {

    const tableBody =
        document.getElementById("adminTableBody");

    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="6">
                <div class="skeleton" style="height:20px;"></div>
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            "https://off-script-backend.onrender.com/api/projects/admin/inquiries"
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message ||
                "Failed to load client requests"
            );
        }

        const inquiries =
            result.inquiries || [];

        if (!inquiries.length) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6"
                        style="
                            text-align:center;
                            padding:35px;
                            color:var(--ink-faint);
                        ">
                        No client requests yet.
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML =
            inquiries.map(inquiry => {

                const status =
                    String(
                        inquiry.status || "PENDING"
                    ).toUpperCase();

                return `
                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(
                                    inquiry.name || "Unknown client"
                                )}
                            </strong>

                            <div style="
                                margin-top:4px;
                                font-size:.72rem;
                                color:var(--ink-faint);
                            ">
                                ${escapeHTML(
                                    inquiry.email || ""
                                )}
                            </div>
                        </td>

                        <td>
                            ${escapeHTML(
                                inquiry.project_type ||
                                "Website Project"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                inquiry.budget ||
                                "Not specified"
                            )}
                        </td>

                        <td>
                            <span style="
                                display:inline-flex;
                                align-items:center;
                                padding:6px 10px;
                                border:1px solid var(--line);
                                border-radius:100px;
                                font-family:'JetBrains Mono',monospace;
                                font-size:.65rem;
                                text-transform:uppercase;
                            ">
                                ${escapeHTML(status)}
                            </span>
                        </td>

                        <td>
                            ${formatAdminDate(
                                inquiry.submitted_at
                            )}
                        </td>

                        <td>

                            ${
                                status === "PENDING"
                                ? `
                                    <div style="
                                        display:flex;
                                        gap:8px;
                                        flex-wrap:wrap;
                                    ">

                                        <button
                                            class="btn btn-sm btn-primary"
                                            onclick="proceedWithProject('${inquiry.id}')"
                                        >
                                            Proceed →
                                        </button>

                                        <button
                                            class="btn btn-sm btn-ghost"
                                            onclick="declineProject('${inquiry.id}')"
                                        >
                                            Decline
                                        </button>

                                    </div>
                                `
                                : status === "ACCEPTED"
                                ? `
                                    <span style="
                                        font-size:.72rem;
                                        color:var(--ink-faint);
                                    ">
                                        Project accepted
                                    </span>
                                `
                                : `
                                    <span style="
                                        font-size:.72rem;
                                        color:var(--ink-faint);
                                    ">
                                        Request declined
                                    </span>
                                `
                            }

                        </td>

                    </tr>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "Load admin client requests error:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="
                        text-align:center;
                        padding:35px;
                        color:var(--ink-faint);
                    ">
                    Unable to load client requests.
                </td>
            </tr>
        `;
    }
}


/* ============================================================
   ADMIN — PROCEED WITH PROJECT
============================================================ */

async function proceedWithProject(inquiryId) {

    const confirmed = confirm(
        "Proceed with this project?\n\nA Project ID will be created and sent to the client."
    );

    if (!confirmed) return;

    try {

        const response = await fetch(
           `https://off-script-backend.onrender.com/api/projects/proceed/${encodeURIComponent(inquiryId)}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Failed to create project"
            );
        }

        alert(
            `Project created successfully!\n\nProject ID: ${result.project.project_id}`
        );

        await loadAdminClientRequests();

    } catch (error) {

        console.error(
            "Proceed project error:",
            error
        );

        alert(
            error.message ||
            "Could not create project."
        );
    }
}


/* ============================================================
   ADMIN — DECLINE PROJECT
============================================================ */

async function declineProject(inquiryId) {

    const confirmed = confirm(
        "Decline this project request?\n\nThe client will receive a notification email."
    );

    if (!confirmed) return;

    try {

        const response = await fetch(
            `https://off-script-backend.onrender.com/api/projects/decline/${encodeURIComponent(inquiryId)}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Failed to decline project"
            );
        }

        alert(
            "Project request declined successfully."
        );

        await loadAdminClientRequests();

    } catch (error) {

        console.error(
            "Decline project error:",
            error
        );

        alert(
            error.message ||
            "Could not decline project."
        );
    }
}


/* ============================================================
   ADMIN DATE
============================================================ */

function formatAdminDate(value) {

    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


/* ============================================================
   MAKE FUNCTIONS AVAILABLE TO ADMIN HTML
============================================================ */

window.proceedWithProject =
    proceedWithProject;

window.declineProject =
    declineProject;


/* ============================================================
   ADMIN INITIALIZATION
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            document.getElementById(
                "adminTableBody"
            )
        ) {

            loadAdminClientRequests();

        }

    }
);
})();
