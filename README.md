# OFF-SCRIPT — Studio Website

Premium multi-page website for a four-person web design & development studio.
Vanilla HTML/CSS/JS — no build step, no frameworks.

## Run it

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

(Or just open `index.html` directly — everything works from `file://` too,
except the case-study `?p=` query param in some browsers.)

## Structure

```
/
├── index.html              Homepage (hero, services, process, work, stats, team, pricing, FAQ)
├── about.html              Studio story, principles, stats, team preview
├── team.html               Team detail + jobs preview
├── services.html           Six services (expandable cards) + engagement models
├── work.html               Filterable portfolio grid + interactive project index
├── case-study.html         Case-study template (?p=project-slug)
├── process.html            Six-step process + expectations
├── pricing.html            Packages, comparison table, FAQ
├── testimonials.html       Card grid + quote slider
├── faq.html                Full accordion
├── careers.html            Open roles
├── contact.html            Contact info + quick form
├── start.html              5-step project intake form
├── login.html              Client login (demo)
├── register.html           Client registration (demo)
├── forgot-password.html    Reset flow (demo)
├── client-dashboard.html   Client project dashboard
├── payment.html            Invoice/payment frontend (no gateway connected)
├── admin.html              Studio-side request list
├── privacy.html / terms.html
│
├── css/
│   ├── style.css           Tokens, base, nav, footer, layout primitives
│   ├── components.css      Buttons, cards, forms, tables, modal, dashboard…
│   ├── animations.css      Preloader, cursor, reveals, page transitions
│   └── responsive.css      Breakpoints (1100 / 980 / 720 / 480)
│
├── js/
│   ├── config.js           ★ ALL editable content lives here
│   ├── main.js             Runtime: preloader, cursor, nav, reveals, counters,
│   │                       toasts, transitions, shared renderers
│   ├── hero-canvas.js      Hero node-network (reduced-motion aware)
│   ├── portfolio.js        Portfolio grid/list, filters, modal, case studies
│   ├── forms.js            Validation, quick contact, multi-step intake, demo auth
│   └── dashboard.js        Dashboard, payment, admin rendering
│
├── favicon.svg · sitemap.xml · robots.txt
└── html.html / studio.html  ← original single-file versions (legacy, kept for reference)
```

## Editing content

Everything client-editable is in **`js/config.js`** — one file:

| Key | Controls |
|---|---|
| `OFFSCRIPT.CONTACT` | email, phone, location, hours, socials |
| `OFFSCRIPT.SERVICES` | the six services + their detail bullets |
| `OFFSCRIPT.PROJECTS` | portfolio + case studies (slug, category, stack, challenge, approach, features…) |
| `OFFSCRIPT.PRICING` | package tiers, prices, feature lists |
| `OFFSCRIPT.PROCESS` | the six process steps |
| `OFFSCRIPT.STATS` | animated counters |
| `OFFSCRIPT.TESTIMONIALS` | quotes |
| `OFFSCRIPT.FAQS` | Q&A on home / process / pricing / faq pages |
| `OFFSCRIPT.JOBS` | careers list (`open: true/false`) |
| `OFFSCRIPT.TEAM` | the four members (names, roles, skills, bios) |

Prices shown (₹18,000 / ₹55,000) were taken from the earlier `html.html`
version. Stats marked `placeholder: true` and testimonials are labelled
inline with a `ph` chip until you replace them with real data.

## Backend integration points

The site runs fully client-side for preview. Search the code for
`INTEGRATION POINT` comments:

- `js/forms.js` — quick contact POST, project intake persistence, real auth
  (registration currently stores to `localStorage` for demo only — **never**
  ship plaintext-password storage to production)
- `js/dashboard.js` — replace the `localStorage` demo store (`os-projects`)
  with your API; add a real gateway (Razorpay/Stripe) to `payment.html`.
  The payment page deliberately does **not** fake successful payments.
- Demo login: `client@demo.studio` / `demo123`

## Notes

- Dark theme is default; light theme via the ◐ toggle (persisted per browser).
  `prefers-color-scheme` is respected on first visit.
- `prefers-reduced-motion` disables the preloader, cursor, canvas motion and
  transitions; the hero canvas renders one static frame instead.
- The custom cursor activates only on fine-pointer devices.
- Per-page SEO: titles, descriptions, Open Graph tags; JSON-LD on the homepage;
  sitemap/robots included. Client-area pages are `noindex` and disallowed in
  robots.txt.
- Legacy `html.html` / `studio.html` are the pre-refactor single-file sites,
  kept only for reference — safe to delete once migrated.
