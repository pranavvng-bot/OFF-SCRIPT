/* ============================================================
   OFF-SCRIPT — content config (single source of truth)
   Replace the marked placeholders with real studio data.
   ============================================================ */

window.OFFSCRIPT = window.OFFSCRIPT || {};

OFFSCRIPT.CONTACT = {
  email: 'hello@off-script.studio',          // PLACEHOLDER — replace with real studio email
  phone: '+91 82484 79834',
  phoneHref: '+918248479834',
  location: 'Coimbatore, India',
  hours: [
    { d: 'Mon — Fri', h: '9:00 — 19:00 IST' },
    { d: 'Saturday', h: '10:00 — 16:00 IST' },
    { d: 'Sunday', h: 'Closed', closed: true },
  ],
  socials: [
    { name: 'Instagram', url: '#' },          // PLACEHOLDER — add real profiles
    { name: 'LinkedIn', url: '#' },
    { name: 'GitHub', url: '#' },
    { name: 'Dribbble', url: '#' },
  ],
};

OFFSCRIPT.SERVICES = [
  { num:'01', name:'Website Development', icon:'code',
    blurb:'Fast, responsive, scalable builds using modern, production-grade tools.',
    details:['Performance-first builds','Responsive down to 320px','CMS integration','Deployment & handover'] },
  { num:'02', name:'UI/UX Design', icon:'pen',
    blurb:'Clean interfaces designed for usability, conversion and your brand — not a recolored template.',
    details:['Wireframes & flows','Design systems','Interactive prototypes','Usability reviews'] },
  { num:'03', name:'E-Commerce', icon:'cart',
    blurb:'Online stores with product management, payments and a checkout customers trust.',
    details:['Product & inventory setup','Payment gateway integration','Order flows & invoices','Conversion-focused UX'] },
  { num:'04', name:'Web Applications', icon:'grid',
    blurb:'Custom applications built around your specific business requirements.',
    details:['Dashboards & internal tools','Authentication & roles','API design & integrations','Scalable architecture'] },
  { num:'05', name:'Landing Pages', icon:'target',
    blurb:'High-converting landing pages for products, startups and campaigns.',
    details:['Copy-assisted structure','A/B-ready sections','Analytics & tracking','Speed under 1s'] },
  { num:'06', name:'Maintenance', icon:'life',
    blurb:'Continuous improvements, updates, bug fixes and technical support after launch.',
    details:['Monthly care plans','Security & version updates','Content edits','Priority support'] },
];

OFFSCRIPT.PROJECTS = [
  { slug:'northfield-realty', name:'Northfield Realty', cat:'Business',
    year:'2026', role:'Design + Development', stack:'React, Tailwind, Node.js', duration:'5 weeks',
    tagline:'A trust-building brochure site for a boutique real-estate agency.',
    desc:'A searchable listings grid and a calm, editorial inquiry flow that makes a small agency feel established.',
    challenge:'The agency depended on portals that owned the client relationship. They needed a web presence that built trust and captured inquiries directly.',
    approach:'We designed an editorial listing experience — large photography, honest copy, a grid that filters instantly — and paired it with a short inquiry flow that respects the user\'s time.',
    features:['Instant client-side listings search','Inquiry flow with validation','CMS-managed listings','SEO-ready property pages'],
    result:'Placeholder results — replace with real metrics once the project ships.',
    tech:['React','Tailwind','Node.js'], live:'#' },
  { slug:'lumen-co', name:'Lumen & Co.', cat:'E-Commerce',
    year:'2026', role:'Design + Build', stack:'Next.js, Stripe, Sanity', duration:'7 weeks',
    tagline:'A jewellery storefront with fast product filtering and a streamlined checkout.',
    desc:'Product filtering that feels instant, a wishlist worth returning to, and a checkout with no dead ends.',
    challenge:'High-intent visitors were abandoning a slow, generic catalog. The brand needed the site to feel as considered as the product.',
    approach:'We rebuilt the catalog around a headless CMS with aggressive image optimization, added faceted filtering that runs client-side, and reduced checkout to the fewest possible steps.',
    features:['Faceted product filtering','Wishlist with persistence','Three-step checkout','Image pipeline with blur-up placeholders'],
    result:'Placeholder results — replace with real metrics once the project ships.',
    tech:['Next.js','Stripe','Sanity'], live:'#' },
  { slug:'pulse-fitness', name:'Pulse Fitness Launch', cat:'Landing Pages',
    year:'2025', role:'Design + Build', stack:'HTML, GSAP, Netlify', duration:'2 weeks',
    tagline:'A single-page campaign site built to convert sign-ups ahead of a studio opening.',
    desc:'One page, one job: turn local interest into pre-opening memberships before doors opened.',
    challenge:'A fixed opening date and zero web presence. The page had to ship in two weeks and still feel premium.',
    approach:'A kinetic single-pager — bold type, scroll-choreographed sections and a sign-up form above every fold, backed by a tiny static backend.',
    features:['Scroll-driven storytelling','Sticky sign-up module','Form-to-CRM wiring','Launch-day analytics'],
    result:'Placeholder results — replace with real metrics once the project ships.',
    tech:['HTML','GSAP','Netlify'], live:'#' },
  { slug:'fieldnote', name:'Fieldnote', cat:'Web Apps',
    year:'2025', role:'Full product build', stack:'React, Firebase, WebSockets', duration:'8 weeks',
    tagline:'An internal tool for a logistics team to track deliveries and flag delays in real time.',
    desc:'A live operations board that replaced a spreadsheet and three group chats.',
    challenge:'Dispatchers were juggling updates across tools, and delays surfaced hours late.',
    approach:'We mapped the real workflow first, then built a realtime board with role-based views, live status pushes and a delay-flagging rule engine.',
    features:['Realtime delivery board','Role-based access','Delay alerts & audit trail','Mobile-friendly dispatch view'],
    result:'Placeholder results — replace with real metrics once the project ships.',
    tech:['React','Firebase','WebSockets'], live:'#' },
  { slug:'aperture-journal', name:'Aperture Journal', cat:'Creative',
    year:'2025', role:'Design + Development', stack:'Vue, Three.js, Cloudinary', duration:'6 weeks',
    tagline:'An editorial photography magazine with scroll-driven story pages.',
    desc:'A custom grid, large typography and stories that unfold as you scroll.',
    challenge:'The magazine wanted print-grade art direction on the web without sacrificing performance.',
    approach:'We built a flexible editorial layout system with an optional WebGL layer for hero pieces — always behind a feature check, always skippable.',
    features:['Custom editorial grid','Scroll-driven story pages','Optional WebGL hero scenes','Cloudinary-driven assets'],
    result:'Placeholder results — replace with real metrics once the project ships.',
    tech:['Vue','Three.js','Cloudinary'], live:'#' },
  { slug:'harbor-supply', name:'Harbor Supply Co.', cat:'E-Commerce',
    year:'2026', role:'Design + Build', stack:'React, Node.js, PostgreSQL', duration:'9 weeks',
    tagline:'A wholesale ordering platform with tiered pricing and bulk-order tooling.',
    desc:'Repeat buyers get an account, tiered pricing and reorder flows that take minutes, not emails.',
    challenge:'Wholesale orders arrived by email and were re-keyed by hand. Errors were common and slow.',
    approach:'We designed an account-based ordering portal with customer-specific pricing, quick reorder, bulk CSV upload and clear order states.',
    features:['Customer-specific tiered pricing','Quick reorder & CSV bulk order','Order status tracking','Admin fulfillment view'],
    result:'Placeholder results — replace with real metrics once the project ships.',
    tech:['React','Node.js','PostgreSQL'], live:'#' },
];

OFFSCRIPT.PRICING = [
  { tier:'Starter', name:'For individuals & small businesses', value:'From ₹18,000', featured:false,
    items:['Custom landing / business website','Responsive design','Basic animations','Contact form','Basic SEO setup','Deployment included'] },
  { tier:'Professional', name:'For growing businesses', value:'From ₹55,000', featured:true,
    items:['Everything in Starter','Multiple pages','Advanced UI/UX','CMS / content management','Analytics integration','Performance optimization'] },
  { tier:'Custom', name:'For unique requirements', value:'Let\'s scope it', featured:false,
    items:['Custom web applications','E-commerce','Dashboards','API integrations','Authentication','Advanced functionality'] },
];

OFFSCRIPT.PROCESS = [
  { num:'01', name:'Discover', text:'We dig into your business, audience and goals — and come back with the right questions answered.' },
  { num:'02', name:'Strategize', text:'Structure, user experience and technology are mapped before a single pixel is placed.' },
  { num:'03', name:'Design', text:'We create the visual identity and interface, then walk you through it for feedback.' },
  { num:'04', name:'Develop', text:'The approved design becomes a fast, functional, tested build with modern tooling.' },
  { num:'05', name:'Test', text:'Responsiveness, performance, accessibility and usability — checked properly, not skimmed.' },
  { num:'06', name:'Launch', text:'Your site goes live. You receive everything, fully yours — plus support after.' },
];

OFFSCRIPT.STATS = [
  { value:50, suffix:'+', label:'Projects', placeholder:true },
  { value:4, suffix:'', label:'Creative minds', placeholder:false },
  { value:24, suffix:'/7', label:'Digital ideas', placeholder:true },
  { value:100, suffix:'%', label:'Commitment', placeholder:false },
];

OFFSCRIPT.TESTIMONIALS = [
  { name:'A. Client', role:'Founder', company:'Northfield Realty', project:'Business website', initials:'AC',
    quote:'They treated our small agency like their only client. The site finally feels like us — and inquiries come straight to our inbox now.' },
  { name:'R. Client', role:'Operations Lead', company:'Harbor Supply Co.', project:'Wholesale platform', initials:'RC',
    quote:'The ordering portal removed an entire layer of email chaos. Reorders that took a day now take minutes.' },
  { name:'S. Client', role:'Studio Director', company:'Pulse Fitness', project:'Landing page', initials:'SC',
    quote:'Two weeks from brief to launch, and the page looked better than agencies quoted us triple for.' },
];

OFFSCRIPT.FAQS = [
  { q:'How long does a website take?',
    a:'A focused landing page ships in 1–2 weeks. A full business website typically takes 3–6 weeks, and custom web applications or e-commerce builds run 6–12 weeks depending on scope. You get a timeline with milestones before we start.' },
  { q:'How much does a website cost?',
    a:'Our starting points are on the pricing page — final quotes depend on scope. After a short discovery call you receive a fixed, itemized quote. No hourly surprises.' },
  { q:'Do you provide hosting?',
    a:'Yes. We deploy on modern platforms (Vercel, Netlify, or your preferred cloud) and can manage hosting, domains and SSL for you — or hand everything over to your team.' },
  { q:'Can you redesign my existing website?',
    a:'Absolutely. Redesigns start with an audit of what\'s working — content, SEO, analytics — so we improve rather than throw away.' },
  { q:'Do you provide maintenance?',
    a:'Yes — care plans cover updates, security patches, content edits and priority support. Every launch also includes a post-launch support window.' },
  { q:'Can you build e-commerce websites?',
    a:'That\'s one of our core services: product management, payments, checkout flows and the operational tooling behind them.' },
  { q:'Do you provide SEO?',
    a:'Every build ships with technical SEO: semantic structure, metadata, performance and sitemaps. Ongoing content SEO can be part of a maintenance plan.' },
  { q:'How does the payment process work?',
    a:'Typically milestone-based: an advance to begin, then payments at design approval and final delivery. Invoices and statuses are visible in your client dashboard.' },
  { q:'How do we communicate during development?',
    a:'Directly with the people building your site — a shared channel plus scheduled check-ins at each milestone. No account-manager telephone game.' },
];

OFFSCRIPT.JOBS = [
  { title:'Freelance Web Designer', loc:'Remote (India)', type:'Contract', open:true },
  { title:'React Intern', loc:'Coimbatore', type:'Internship', open:true },
  { title:'Content Writer (Web)', loc:'Remote', type:'Part-time', open:false },
];

OFFSCRIPT.TEAM = [
  { num:'01', name:'Person 01', role:'UI/UX Designer', initials:'P1',
    bio:'Shapes the first impression — from wireframe to a system that scales across every page.',
    skills:['Figma','UI Design','UX Research','Prototyping','Design Systems'] },
  { num:'02', name:'Person 02', role:'Frontend Developer', initials:'P2',
    bio:'Turns approved design into fast, interactive interfaces that feel as good as they look.',
    skills:['HTML','CSS','JavaScript','React','Animation'] },
  { num:'03', name:'Person 03', role:'Backend Developer', initials:'P3',
    bio:'Builds the systems underneath — data, auth and APIs that stay reliable as projects grow.',
    skills:['Node.js','APIs','Databases','Auth','Servers'] },
  { num:'04', name:'Person 04', role:'Full-Stack / Creative Lead', initials:'P4',
    bio:'Connects design and engineering end to end, from integration through to deployment.',
    skills:['Full-Stack','Integration','Deployment','Problem Solving'] },
];

/* Small helper shared by all pages */
OFFSCRIPT.esc = function(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
};
