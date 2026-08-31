export type ProjectStatus = 'live' | 'coming-soon' | 'archived';

export type ProjectCategory = 
  | 'Commercial Web Experience'
  | 'Commerce Experience'
  | 'Healthcare Experience'
  | 'Interactive Experience'
  | 'Operational Interface';

export interface ProjectRegistryItem {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  summary: string;
  detailedDescription?: string;
  honestDisclosure: string;
  status: ProjectStatus;
  path: string;
  externalUrl?: string;
  githubUrl?: string;
  capabilities: string[];
  technologies: string[];
  featured: boolean;
  order: number;
  previewImage?: string;
  accentColor?: string;
}
