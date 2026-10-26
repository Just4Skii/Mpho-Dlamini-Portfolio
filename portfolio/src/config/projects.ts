import { ProjectRegistryItem } from '../types/project';

export const PROJECTS_REGISTRY: ProjectRegistryItem[] = [
  {
    id: 'klarrow',
    title: 'Klarrow',
    slug: 'klarrow',
    category: 'Evidence & Traceability Tooling',
    summary: 'AI-assisted evidence-reconciliation workbench for food-traceability investigations — source-grounded facts, human-gated confirmation, dual-path trace scope.',
    detailedDescription: 'A full-stack prototype engineered for FSQA teams responding to contamination alerts, complaints and audits: PDF/CSV/XLSX/EML ingestion with SHA-256 dedupe, deterministic + local Llama 3.2 3B candidate-fact extraction, verbatim source grounding, a human review desk with invalidation cascades, dual-path BFS trace traversal, gap and mass-balance findings, append-only audit history, and provenance-carrying HTML/JSON/CSV/XLSX exports.',
    honestDisclosure: 'Interactive synthetic-only demo — seeded Savanna Bites workspace, uploads disabled server-side. Prototype (.NET 10 · React 19 · SQLite), not a public food-safety tool.',
    status: 'live',
    path: '/work/klarrow',
    githubUrl: 'https://github.com/Just4Skii/Klarrow',
    capabilities: [
      'Evidence Ingestion + Dedupe',
      'Deterministic + AI Parsing',
      'Verbatim Source Grounding',
      'Human Review + Invalidation',
      'Dual-Path Trace Traversal',
      'Auditable Exports'
    ],
    technologies: ['ASP.NET Core · .NET 10', 'EF Core + SQLite', 'React 19 + TypeScript + Vite', 'Ollama · Llama 3.2 3B', 'xUnit + Playwright'],
    featured: true,
    order: 1,
    accentColor: '#8b5cf6',
    previewImage: '/klarrow-preview.svg'
  },
  {
    id: 'apex',
    title: 'Apex Facilities Group',
    slug: 'apex',
    category: 'Commercial Web Experience',
    summary: 'Enterprise facilities-management website concept focused on commercial service presentation, conversion UX, responsive design, and South African property-services context.',
    detailedDescription: 'An extensive commercial website architecture designed for multi-trade facility management. Features multi-trade service discovery, interactive sector journeys, illustrative remediation case studies, and responsive enquiry workflows tailored for South African commercial portfolios.',
    honestDisclosure: 'Independent commercial website concept for a hypothetical South African facilities-management business. Designed and developed from scratch.',
    status: 'live',
    path: '/work/apex',
    githubUrl: 'https://github.com/Just4Skii',
    capabilities: [
      'Commercial Architecture',
      'Service Discovery',
      'Responsive UI',
      'Conversion UX',
      'SEO Structure'
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite'],
    featured: true,
    order: 2,
    accentColor: '#f59e0b',
    previewImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop&q=80'
  },
  {
    id: 'kasicart',
    title: 'KasiCart',
    slug: 'kasicart',
    category: 'Commerce Experience',
    summary: 'Premium South African e-commerce experience with interactive shopping, local brand discovery, and polished frontend UX.',
    detailedDescription: 'A discovery-first digital commerce platform engineered around independent South African brands. Includes category filters, interactive look builders, real-time cart state management, and optimized responsive micro-interactions.',
    honestDisclosure: 'Independent product concept exploring a modern South African commerce experience. Designed and developed from scratch.',
    status: 'live',
    path: '/work/kasicart',
    githubUrl: 'https://github.com/Just4Skii',
    capabilities: [
      'E-commerce UX',
      'Cart State Management',
      'Interactive Discovery',
      'Brand Showcases',
      'Responsive Design'
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Modern Store State', 'Vite'],
    featured: true,
    order: 3,
    accentColor: '#10b981',
    previewImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=800&fit=crop&q=80'
  },
  {
    id: 'carepoint',
    title: 'CarePoint',
    slug: 'carepoint',
    category: 'Healthcare Experience',
    summary: 'Modern South African healthcare discovery and appointment platform with interactive search, scheduling, accessibility, and frontend UX.',
    detailedDescription: 'A comprehensive healthcare platform exploring provider directory search, clinic location maps, accessible appointment scheduling, and patient journey flows tailored for South African healthcare access.',
    honestDisclosure: 'Independent healthcare product concept exploring provider discovery, scheduling, location-aware search and accessible digital care experiences.',
    status: 'live',
    path: '/work/carepoint',
    githubUrl: 'https://github.com/Just4Skii',
    capabilities: [
      'Provider Discovery',
      'Interactive Scheduling',
      'Location-Aware Search',
      'Accessible UX'
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    featured: true,
    order: 4,
    accentColor: '#38bdf8',
    previewImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=800&fit=crop&q=80'
  },
  {
    id: 'stickerbridge',
    title: 'StickerBridge',
    slug: 'stickerbridge',
    category: 'Native Mobile Experience',
    summary: 'Open-source Android utility bridging TikTok stickers into WhatsApp. Custom WebP RIFF/VP8X parsing, 1-tap cache discovery across Scoped Storage, and native ContentProvider integration.',
    detailedDescription: 'A native Android application engineered to extract, normalize, and export static and animated stickers from TikTok into WhatsApp sticker packs. Features a lossless Animated WebP engine (VP8X/ANMF, 512×512, sub-500KB), 1-tap automated TikTok cache scanning, smart link/carousel ingestion with automatic 3-sticker padding, and an official WhatsApp ContentProvider · presented through an independently hosted React product site with direct APK distribution.',
    honestDisclosure: 'Independent native Android product concept designed and developed from scratch. Direct-install open-source APK, not distributed via app stores.',
    status: 'live',
    path: '/work/stickerbridge',
    downloadUrl: 'https://github.com/Just4Skii/StickerBridge/raw/main/stickerbridge.apk',
    githubUrl: 'https://github.com/Just4Skii/StickerBridge',
    capabilities: [
      'Animated WebP Engine',
      'Cache Discovery',
      'ContentProvider API',
      'Direct APK Distribution'
    ],
    technologies: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Coroutines & Flow', 'HTML5/CSS/JS'],
    featured: true,
    order: 5,
    accentColor: '#3DDC84',
    previewImage: '/stickerbridge-preview.svg'
  },
  {
    id: 'skii-os',
    title: 'Skii OS',
    slug: 'skii-os',
    category: 'Ambient Interface Engineering',
    summary: 'A custom Android TV launcher for the Skyworth 32E5400H — 58 anime realms, artwork-matched ambience drawn from real sprite atlases, a live now-playing surface, and a home screen that becomes the screensaver.',
    detailedDescription: 'A native Android TV launcher (com.skii.os) with a 1 GB memory budget and no Play Services. Ships 58 anime realms, each with its own palette sampled from its artwork, and a 19-family ambience engine: stars, sakura, cyber rain, embers, floaties, hearts, snow, leaves, bubbles, fog, fireflies, rain, feathers, aurora, smoke, shooting stars, dandelion, butterflies and confetti — each family backed by a real sprite atlas and matched to what is actually visible in the frame. A volumetric fog layer sits between the art and the particles, a NotificationListenerService feeds a now-playing strip that sits beside the realm name, and the home screen registers as the system dream so the wallpaper becomes the screensaver with the clock grown into the corner. This page is a browser port of the same rendering engine, running the same manifest and the same atlases the television draws.',
    honestDisclosure: 'Runs on real hardware (a Skyworth 32E5400H, Android 14). The boot animation and the bootloader logo are locked behind the read-only system partitions, so the television cannot replace them without a bootloader unlock — everything else ships and runs.',
    status: 'live',
    path: '/work/skii-os',
    githubUrl: 'https://github.com/Just4Skii',
    capabilities: [
      '58 Artwork-Themed Realms',
      '19-Family Ambience Engine',
      'Sprite-Atlas Particle System',
      'Live Now-Playing Surface',
      'Home-Screen Screensaver',
      '1 GB Memory Budget'
    ],
    technologies: ['Java · Android 14 · Leanback', 'Canvas Rendering', 'React 19 + TypeScript + Vite', 'NotificationListenerService', 'CC0 Sprite Atlases'],
    featured: true,
    order: 6,
    accentColor: '#FFC65C',
    previewImage: '/skii-os-preview.svg'
  },
    {
    id: 'trustkhaya',
    title: 'TrustKhaya',
    slug: 'trustkhaya',
    category: 'Financial Inclusion',
    summary: 'A Community Trust Score that turns stokvel, wallet, spaza and guarantor signals into an explainable 0–100 score a bank can underwrite a zero-fee first account against.',
    detailedDescription: 'A full-stack FNB hackathon prototype: a deterministic scoring engine (35/25/20/20 weights, a logistic good-standing probability, confidence bands and recommendation rules), a capped-liability guarantor flow with six fraud and collusion safeguards (self-vouch, duplicate vouches, a three-promise cap, a R5 000 exposure limit, and mutual-vouch flagging), granular withdrawable consent, an underwriter desk with a portfolio view, an append-only audit trail and an installable PWA. This embedded demo runs the same scoring engine and seeded rows entirely in the browser.',
    honestDisclosure: 'Hackathon prototype on simulated South African data. Guarantor agreements are not legally binding; this embedded page is a static in-browser slice of the full Next.js product.',
    status: 'live',
    path: '/work/trustkhaya',
    githubUrl: 'https://github.com/Just4Skii',
    capabilities: [
      'Explainable Trust Score',
      'Capped Guarantor Liability',
      'Vouch Safeguards',
      'Withdrawable Consent',
      'Underwriter Decision Desk',
      'Installable PWA'
    ],
    technologies: ['Next.js 14 + TypeScript', 'Supabase (Postgres)', 'Pure scoring engine + Vitest', 'Tailwind CSS', 'React 19 demo build'],
    featured: true,
    order: 7,
    accentColor: '#312E81',
    previewImage: '/trustkhaya-preview.svg'
  },
{
    id: 'project-four',
    title: 'Project Four',
    slug: 'project-four',
    category: 'Interactive Experience',
    summary: 'Upcoming frontend product architecture exploration.',
    honestDisclosure: 'Upcoming independent frontend product concept.',
    status: 'coming-soon',
    path: '/work/project-four',
    capabilities: ['Frontend Engineering', 'Interactive Design'],
    technologies: ['React', 'TypeScript'],
    featured: false,
    order: 7,
    accentColor: '#818cf8'
  }
];

export const getPublicProjects = () => PROJECTS_REGISTRY.filter(p => p.id !== 'project-four');
export const getFeaturedProjects = () => PROJECTS_REGISTRY.filter(p => p.featured && p.id !== 'project-four');
export const getProjectBySlug = (slug: string) => PROJECTS_REGISTRY.find(p => p.slug === slug || p.id === slug);

export function getAppUrl(path: string): string {
  if (typeof window === 'undefined') return path;
  const pathname = window.location.pathname;
  
  // Detect if running under a GitHub Pages repo prefix (e.g. /Mpho-Dlamini-Portfolio/)
  let prefix = '';
  const match = pathname.match(/^(\/[^\/]+)/);
  if (match && match[1] && !match[1].startsWith('/work')) {
    prefix = match[1];
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const target = `${prefix}${cleanPath}`.replace(/\/+/g, '/');
  return target.endsWith('/') ? target : `${target}/`;
}

