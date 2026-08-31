import { ProjectRegistryItem } from '../types/project';

export const PROJECTS_REGISTRY: ProjectRegistryItem[] = [
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
    order: 1,
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
    order: 2,
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
    order: 3,
    accentColor: '#38bdf8',
    previewImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=800&fit=crop&q=80'
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
    order: 4,
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

