/* ============================================================
   OFF-SCRIPT — forms.js

   New frontend + real backend integration.

   WORKFLOW:
   Client submits form
        ↓
   POST /api/inquiries
        ↓
   Supabase stores inquiry
        ↓
   Team receives email
        ↓
   Inquiry appears in Admin Dashboard
        ↓
   Team calls client
        ↓
   Team clicks Proceed OR Decline
        ↓
   Proceed  → Project created + Project ID email
   Decline  → Apology email

   IMPORTANT:
   Client is NOT logged into a dashboard after submitting.
   Dashboard access happens only after receiving a real Project ID.
============================================================ */

(function () {

    'use strict';


    /* =========================================================
       HELPERS
    ========================================================= */

    const $ = (selector, context) =>
        (context || document).querySelector(selector);

    const $$ = (selector, context) =>
        Array.from(
            (context || document).querySelectorAll(selector)
        );


    /* =========================================================
       SHARED VALIDATION
    ========================================================= */

    window.OSForms = {

        email(value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                String(value || '').trim()
            );
        },


        mark(fieldEl, ok) {

            if (!fieldEl) {
                return ok;
            }

            const wrap =
                fieldEl.closest('.field');

            if (wrap) {

                wrap.classList.toggle(
                    'has-error',
                    !ok
                );

            }

            return ok;
        },


        value(id) {

            const element =
                document.getElementById(id);

            return element
                ? element.value.trim()
                : '';

        }

    };


    const mark =
        window.OSForms.mark;


    /* =========================================================
       QUICK CONTACT
       Keeps existing frontend behaviour.
    ========================================================= */

    const quick =
        $('#quickContactForm');


    if (quick) {

        quick.addEventListener(
            'submit',
            event => {

                event.preventDefault();


                const name =
                    $('#qc-name');

                const email =
                    $('#qc-email');

                const message =
                    $('#qc-message');


                let ok = true;


                ok =
                    mark(
                        name,
                        name &&
                        name.value.trim().length > 1
                    ) && ok;


                ok =
                    mark(
                        email,
                        email &&
                        OSForms.email(email.value)
                    ) && ok;


                ok =
                    mark(
                        message,
                        message &&
                        message.value.trim().length > 4
                    ) && ok;


                if (!ok) {
                    return;
                }


                /*
                 * Keep this as the existing frontend-only
                 * quick contact behaviour.
                 */

                try {

                    const messages =
                        JSON.parse(
                            localStorage.getItem(
                                'os-messages'
                            ) || '[]'
                        );


                    messages.push({

                        name:
                            name.value.trim(),

                        email:
                            email.value.trim(),

                        message:
                            message.value.trim(),

                        at:
                            new Date().toISOString()

                    });


                    localStorage.setItem(
                        'os-messages',
                        JSON.stringify(messages)
                    );

                } catch (error) {

                    console.warn(
                        'Could not save quick contact:',
                        error
                    );

                }


                if (typeof showToast === 'function') {

                    showToast(
                        "Message sent — we'll reply within one business day."
                    );

                }


                quick.reset();

            }
        );

    }


    /* =========================================================
       PROJECT INTAKE
       START.HTML
    ========================================================= */

    const form =
        $('#projectForm');


    if (form) {


        const panels =
            $$('.step-panel', form);


        const dots =
            $$('.step-dot');


        const btnNext =
            $('#stepNext');


        const btnBack =
            $('#stepBack');


        const btnSubmit =
            $('#projectSubmitBtn');


        let step = 0;


        /* =====================================================
           CHOICE CARDS
        ===================================================== */

        $$('.choice-card', form)
            .forEach(card => {

                card.addEventListener(
                    'click',
                    () => {

                        const group =
                            card.closest(
                                '.choice-cards'
                            );


                        $$('.choice-card', group)
                            .forEach(
                                item => {

                                    item.classList.remove(
                                        'selected'
                                    );

                                }
                            );


                        card.classList.add(
                            'selected'
                        );


                        const target =
                            card.dataset.target;


                        const value =
                            card.dataset.value;


                        const input =
                            document.getElementById(
                                target
                            );


                        if (input) {

                            input.value =
                                value;

                        }


                        const wrap =
                            input &&
                            input.closest('.field');


                        if (wrap) {

                            wrap.classList.remove(
                                'has-error'
                            );

                        }

                    }
                );

            });


        /* =====================================================
           PRICING CTA
        ===================================================== */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const selectedPlan =
            params.get('plan');


        if (selectedPlan) {

            const card =
                $(
                    '.choice-card[data-value="' +
                    CSS.escape(selectedPlan) +
                    '"]'
                );


            if (card) {

                card.click();

            }

        }


        /* =====================================================
           VALIDATE STEP
        ===================================================== */

        function validateStep(index) {

            let ok = true;


            /* STEP 1 — CLIENT DETAILS */

            if (index === 0) {

                ok =
                    mark(
                        $('#p-name'),
                        OSForms.value('p-name')
                            .length > 1
                    ) && ok;


                ok =
                    mark(
                        $('#p-email'),
                        OSForms.email(
                            OSForms.value('p-email')
                        )
                    ) && ok;


                ok =
                    mark(
                        $('#p-phone'),
                        OSForms.value('p-phone')
                            .length > 5
                    ) && ok;

            }


            /* STEP 2 — PROJECT DETAILS */

            if (index === 1) {

                ok =
                    mark(
                        $('#p-type'),
                        OSForms.value('p-type') !== ''
                    ) && ok;


                ok =
                    mark(
                        $('#p-requirements'),
                        OSForms.value(
                            'p-requirements'
                        ).length > 4
                    ) && ok;

            }


            /* STEP 4 — BUDGET */

            if (index === 3) {

                ok =
                    mark(
                        $('#p-budget'),
                        OSForms.value('p-budget') !== ''
                    ) && ok;

            }


            /* STEP 5 — CONSENT */

            if (index === 4) {

                const consent =
                    $('#p-consent');


                ok =
                    mark(
                        consent,
                        consent &&
                        consent.checked
                    ) && ok;

            }


            return ok;

        }


        /* =====================================================
           GO TO STEP
        ===================================================== */

        function goto(index) {

            step =
                Math.max(
                    0,
                    Math.min(
                        panels.length - 1,
                        index
                    )
                );


            panels.forEach(
                (panel, panelIndex) => {

                    panel.classList.toggle(
                        'active',
                        panelIndex === step
                    );

                }
            );


            dots.forEach(
                (dot, dotIndex) => {

                    dot.classList.toggle(
                        'current',
                        dotIndex === step
                    );


                    dot.classList.toggle(
                        'done',
                        dotIndex < step
                    );

                }
            );


            if (btnBack) {

                btnBack.style.visibility =
                    step === 0
                        ? 'hidden'
                        : 'visible';

            }


            if (btnNext) {

                btnNext.style.display =
                    step === panels.length - 1
                        ? 'none'
                        : 'inline-flex';

            }


            if (btnSubmit) {

                btnSubmit.style.display =
                    step === panels.length - 1
                        ? 'inline-flex'
                        : 'none';

            }


            if (
                step === panels.length - 1
            ) {

                fillReview();

            }


            const top =
                form.getBoundingClientRect().top +
                window.scrollY -
                120;


            window.scrollTo({

                top,

                behavior: 'smooth'

            });

        }


        /* =====================================================
           NEXT
        ===================================================== */

        if (btnNext) {

            btnNext.addEventListener(
                'click',
                () => {

                    if (
                        !validateStep(step)
                    ) {

                        if (
                            typeof showToast ===
                            'function'
                        ) {

                            showToast(
                                'Please complete the highlighted fields.'
                            );

                        }

                        return;

                    }


                    goto(step + 1);

                }
            );

        }


        /* =====================================================
           BACK
        ===================================================== */

        if (btnBack) {

            btnBack.addEventListener(
                'click',
                () => {

                    goto(step - 1);

                }
            );

        }


        /* =====================================================
           REVIEW
        ===================================================== */

        function fillReview() {

            const reviewList =
                $('#reviewList');


            if (!reviewList) {
                return;
            }


            const rows = [

                [
                    'Name',
                    OSForms.value('p-name')
                ],

                [
                    'Email',
                    OSForms.value('p-email')
                ],

                [
                    'Phone',
                    OSForms.value('p-phone')
                ],

                [
                    'Company',
                    OSForms.value('p-company') || '—'
                ],

                [
                    'Project type',
                    OSForms.value('p-type')
                ],

                [
                    'Requirements',
                    OSForms.value('p-requirements')
                ],

                [
                    'Features',
                    $$(
                        'input[name="p-feature"]:checked'
                    )
                        .map(
                            checkbox =>
                                checkbox.value
                        )
                        .join(', ') || '—'
                ],

                [
                    'References',
                    OSForms.value('p-reference') || '—'
                ],

                [
                    'Budget',
                    OSForms.value('p-budget')
                ],

                [
                    'Deadline',
                    OSForms.value('p-deadline') ||
                    'Flexible'
                ],

                [
                    'Preferred contact',
                    OSForms.value('p-contact') ||
                    'Email'
                ]

            ];


            reviewList.innerHTML =
                rows
                    .map(row => {

                        const label =
                            escapeHTML(row[0]);

                        const value =
                            escapeHTML(row[1]);


                        return `

                            <div class="milestone-row">

                                <span
                                    style="
                                        color:var(--ink-faint);
                                    "
                                >
                                    ${label}
                                </span>

                                <span
                                    style="
                                        text-align:right;
                                        max-width:60%;
                                    "
                                >
                                    ${value}
                                </span>

                            </div>

                        `;

                    })
                    .join('');

        }


        /* =====================================================
           FILE DROP
        ===================================================== */

        const fileInput =
            $('#p-files');


        const drop =
            $('#fileDrop');


        const fileList =
            $('#fileList');


        if (
            fileInput &&
            drop
        ) {

            [
                'dragenter',
                'dragover'
            ].forEach(
                eventName => {

                    drop.addEventListener(
                        eventName,
                        event => {

                            event.preventDefault();

                            drop.classList.add(
                                'dragover'
                            );

                        }
                    );

                }
            );


            [
                'dragleave',
                'drop'
            ].forEach(
                eventName => {

                    drop.addEventListener(
                        eventName,
                        event => {

                            event.preventDefault();

                            drop.classList.remove(
                                'dragover'
                            );

                        }
                    );

                }
            );


            drop.addEventListener(
                'drop',
                event => {

                    if (
                        event.dataTransfer &&
                        event.dataTransfer.files.length
                    ) {

                        fileInput.files =
                            event.dataTransfer.files;


                        fileInput.dispatchEvent(
                            new Event('change')
                        );

                    }

                }
            );


            fileInput.addEventListener(
                'change',
                () => {

                    if (!fileList) {
                        return;
                    }


                    fileList.innerHTML =
                        Array.from(
                            fileInput.files
                        )
                            .map(
                                file => `
                                    <span>
                                        ${escapeHTML(file.name)}
                                    </span>
                                `
                            )
                            .join('');

                }
            );

        }


        /* =====================================================
           REAL BACKEND SUBMISSION
        ===================================================== */

        form.addEventListener(
            'submit',
            async event => {

                event.preventDefault();


                /* ---------------------------------------------
                   Validate every step
                --------------------------------------------- */

                for (
                    let i = 0;
                    i < panels.length;
                    i++
                ) {

                    if (
                        !validateStep(i)
                    ) {

                        goto(i);


                        if (
                            typeof showToast ===
                            'function'
                        ) {

                            showToast(
                                'Please complete the highlighted fields.'
                            );

                        }

                        return;

                    }

                }


                /* ---------------------------------------------
                   Disable button
                --------------------------------------------- */

                if (btnSubmit) {

                    btnSubmit.disabled =
                        true;

                    btnSubmit.textContent =
                        'Submitting…';

                }


                /* ---------------------------------------------
                   Collect form data
                --------------------------------------------- */

                const features =
                    $$(
                        'input[name="p-feature"]:checked'
                    )
                        .map(
                            checkbox =>
                                checkbox.value
                        );


                const referenceWebsites =
                    OSForms
                        .value('p-reference')
                        .split(',')
                        .map(
                            item =>
                                item.trim()
                        )
                        .filter(Boolean);


                const payload = {

                    name:
                        OSForms.value(
                            'p-name'
                        ),


                    email:
                        OSForms.value(
                            'p-email'
                        )
                            .toLowerCase(),


                    phone:
                        OSForms.value(
                            'p-phone'
                        ),


                    company:
                        OSForms.value(
                            'p-company'
                        ),


                    preferredContactMethod:
                        OSForms.value(
                            'p-contact'
                        ) || 'Email',


                    projectType:
                        OSForms.value(
                            'p-type'
                        ),


                    requirements:
                        OSForms.value(
                            'p-requirements'
                        ),


                    features:
                        features,


                    referenceWebsites:
                        referenceWebsites,


                    budget:
                        OSForms.value(
                            'p-budget'
                        ),


                    deadline:
                        OSForms.value(
                            'p-deadline'
                        ) || null,


                    notes:
                        OSForms.value(
                            'p-notes'
                        )

                };


                console.log(
                    'OFF-SCRIPT inquiry payload:',
                    payload
                );


                try {

                    /* -----------------------------------------
                       SEND TO BACKEND
                    ----------------------------------------- */

                    const response =
                        await fetch(
                            'https://off-script-backend.onrender.com/api/inquiries',
                            {

                                method: 'POST',

                                headers: {

                                    'Content-Type':
                                        'application/json'

                                },

                                body:
                                    JSON.stringify(
                                        payload
                                    )

                            }
                        );


                    let result;


                    try {

                        result =
                            await response.json();

                    } catch (jsonError) {

                        throw new Error(
                            'Backend returned an invalid response.'
                        );

                    }


                    console.log(
                        'OFF-SCRIPT inquiry response:',
                        result
                    );


                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        throw new Error(
                            result.message ||
                            'Submission failed.'
                        );

                    }


                    /* -----------------------------------------
                       SUCCESS

                       IMPORTANT:
                       Do NOT create a local project.
                       Do NOT create a fake Project ID.
                       Do NOT create os-session.

                       The real Project ID will be generated
                       only after the team clicks Proceed.
                    ----------------------------------------- */


                    const startFormWrap =
                        $('#startFormWrap');


                    const confirmWrap =
                        $('#confirmWrap');


                    const confirmId =
                        $('#confirmId');


                    if (startFormWrap) {

                        startFormWrap.style.display =
                            'none';

                    }


                    if (confirmWrap) {

                        confirmWrap.style.display =
                            'block';

                    }


                    if (confirmId) {

                        confirmId.textContent =
                            'Request received successfully.';

                    }


                    /*
                     * Remove/disable any old
                     * "View your Dashboard" button
                     * from the confirmation screen.
                     */

                    if (confirmWrap) {

                        const dashboardButtons =
                            confirmWrap.querySelectorAll(
                                'a[href*="dashboard"],' +
                                'button[data-dashboard],' +
                                '.dashboard-btn'
                            );


                        dashboardButtons.forEach(
                            button => {

                                button.remove();

                            }
                        );

                    }


                    window.scrollTo({

                        top: 0,

                        behavior: 'smooth'

                    });


                    if (
                        typeof showToast ===
                        'function'
                    ) {

                        showToast(
                            'Request received — we will contact you after reviewing your project.'
                        );

                    }


                    /*
                     * IMPORTANT:
                     * Do NOT redirect to dashboard.
                     * Do NOT save os-session.
                     */

                } catch (error) {

                    console.error(
                        'OFF-SCRIPT submission error:',
                        error
                    );


                    if (
                        typeof showToast ===
                        'function'
                    ) {

                        showToast(
                            error.message ||
                            'Could not submit your request. Please try again.'
                        );

                    }

                } finally {

                    if (btnSubmit) {

                        btnSubmit.disabled =
                            false;

                        btnSubmit.textContent =
                            'Submit project request';

                    }

                }

            }
        );


        /* =====================================================
           INITIAL STEP
        ===================================================== */

        goto(0);

    }


    /* =========================================================
       CLIENT LOGIN
       
       Email + Project ID only.
       
       This is the REAL backend login.
    ========================================================= */

    const loginForm =
        $('#loginForm');


    if (loginForm) {

        loginForm.addEventListener(
            'submit',
            async event => {

                event.preventDefault();


                const emailInput =
                    $('#a-email');


                const projectIdInput =
                    $('#a-project-id');


                const email =
                    emailInput
                        ? emailInput.value
                            .trim()
                            .toLowerCase()
                        : '';


                const projectId =
                    projectIdInput
                        ? projectIdInput.value.trim()
                        : '';


                if (
                    !email ||
                    !projectId
                ) {

                    if (
                        typeof showToast ===
                        'function'
                    ) {

                        showToast(
                            'Please enter your email and Project ID.'
                        );

                    }

                    return;

                }


                try {

                    const response =
                        await fetch(
                            `https://off-script-backend.onrender.com/api/projects/login`,
                            {

                                method: 'POST',

                                headers: {

                                    'Content-Type':
                                        'application/json'

                                },

                                body:
                                    JSON.stringify({

                                        email,

                                        projectId

                                    })

                            }
                        );


                    const result =
                        await response.json();


                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        throw new Error(
                            result.message ||
                            'Invalid email or Project ID.'
                        );

                    }


                    const project =
                        result.project;


                    /*
                     * Store ONLY the exact project
                     * the client authenticated with.
                     */

                    localStorage.setItem(

                        'os-session',

                        JSON.stringify({

                            name:
                                project.client_name,

                            email:
                                project.client_email,

                            projectId:
                                project.project_id,

                            role:
                                'client'

                        })

                    );


                    if (
                        typeof showToast ===
                        'function'
                    ) {

                        showToast(
                            'Login successful. Redirecting…'
                        );

                    }


                    setTimeout(
                        () => {

                            window.location.href =
                                'client-dashboard.html';

                        },
                        500
                    );


                } catch (error) {

                    console.error(
                        'Client login error:',
                        error
                    );


                    if (
                        typeof showToast ===
                        'function'
                    ) {

                        showToast(
                            error.message ||
                            'Login failed. Please check your details.'
                        );

                    }

                }

            }
        );

    }


    /* =========================================================
       DEMO REGISTER
       
       Kept because this exists in the new frontend.
       It is NOT part of the project-request workflow.
    ========================================================= */

    function getUsers() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    'os-users'
                ) || '{}'
            );

        } catch (error) {

            return {};

        }

    }


    function setUsers(users) {

        try {

            localStorage.setItem(
                'os-users',
                JSON.stringify(users)
            );

        } catch (error) {}

    }


    function setSession(session) {

        try {

            localStorage.setItem(
                'os-session',
                JSON.stringify(session)
            );

        } catch (error) {}

    }


    const DEMO = {

        'client@demo.studio': {

            name:
                'Demo Client',

            password:
                'demo123',

            role:
                'client'

        }

    };


    const registerForm =
        $('#registerForm');


    if (registerForm) {

        registerForm.addEventListener(
            'submit',
            event => {

                event.preventDefault();


                const name =
                    $('#r-name');


                const email =
                    $('#r-email');


                const password =
                    $('#r-password');


                const password2 =
                    $('#r-password2');


                let ok = true;


                ok =
                    mark(
                        name,
                        name &&
                        name.value.trim().length > 1
                    ) && ok;


                ok =
                    mark(
                        email,
                        email &&
                        OSForms.email(email.value)
                    ) && ok;


                ok =
                    mark(
                        password,
                        password &&
                        password.value.length >= 8
                    ) && ok;


                ok =
                    mark(
                        password2,
                        password2 &&
                        password2.value ===
                        password.value &&
                        password2.value.length > 0
                    ) && ok;


                if (!ok) {
                    return;
                }


                const users =
                    getUsers();


                const key =
                    email.value
                        .trim()
                        .toLowerCase();


                if (
                    users[key] ||
                    DEMO[key]
                ) {

                    mark(
                        email,
                        false
                    );


                    if (
                        typeof showToast ===
                        'function'
                    ) {

                        showToast(
                            'An account with this email already exists.'
                        );

                    }

                    return;

                }


                users[key] = {

                    name:
                        name.value.trim(),

                    password:
                        password.value,

                    role:
                        'client',

                    at:
                        new Date().toISOString()

                };


                setUsers(users);


                setSession({

                    name:
                        name.value.trim(),

                    email:
                        key,

                    role:
                        'client'

                });


                if (
                    typeof showToast ===
                    'function'
                ) {

                    showToast(
                        'Account created. Redirecting…'
                    );

                }


                setTimeout(
                    () => {

                        window.location.href =
                            'client-dashboard.html';

                    },
                    600
                );

            }
        );

    }


    /* =========================================================
       FORGOT PASSWORD
       
       Kept as frontend UI only.
    ========================================================= */

    const forgotForm =
        $('#forgotForm');


    if (forgotForm) {

        forgotForm.addEventListener(
            'submit',
            event => {

                event.preventDefault();


                const email =
                    $('#f-email');


                if (
                    !email ||
                    !mark(
                        email,
                        OSForms.email(
                            email.value
                        )
                    )
                ) {

                    return;

                }


                const firstStep =
                    $('#forgotStep1');


                const secondStep =
                    $('#forgotStep2');


                if (firstStep) {

                    firstStep.style.display =
                        'none';

                }


                if (secondStep) {

                    secondStep.style.display =
                        'block';

                }

            }
        );

    }


    /* =========================================================
       SECURITY HELPER
    ========================================================= */

    function escapeHTML(value) {

        return String(
            value ?? ''
        )

            .replace(
                /&/g,
                '&amp;'
            )

            .replace(
                /</g,
                '&lt;'
            )

            .replace(
                />/g,
                '&gt;'
            )

            .replace(
                /"/g,
                '&quot;'
            )

            .replace(
                /'/g,
                '&#039;'
            );

    }

})();
