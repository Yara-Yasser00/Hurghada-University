export interface NavLink {
  labelKey: string;
  path: string;
}

export interface NavGroup {
  labelKey: string;
  path: string;
  children: NavLink[];
}

export interface AudienceLink {
  titleKey: string;
  descriptionKey: string;
  path: string;
}

export interface QuickAction {
  id: string;
  titleKey: string;
  path: string;
  variant: 'primary' | 'teal' | 'green' | 'orange' | 'lime' | 'wide';
}

export interface FeatureCard {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  path: string;
}

export interface ResearchItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  area: string;
  featured?: boolean;
}

export interface NewsArticle {
  id: string;
  category: string;
  date: string;
  title: string;
  description: string;
  image: string;
  featured?: boolean;
}

export interface UniversityEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  location: string;
  category: string;
}

export interface Faculty {
  id: string;
  name: string;
  description: string;
  image: string;
}

/** @deprecated use Faculty */
export type College = Faculty;

export interface Statistic {
  value: string;
  label: string;
}

export interface CourseSummary {
  id: string;
  title: string;
  level: string;
  faculty: string;
  keywords: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  type: string;
  path: string;
  blurb: string;
}

export interface SectionContent {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  body?: string[];
  image?: string;
  links: NavLink[];
  highlights?: { title: string; text: string }[];
}

export interface Leader {
  name: string;
  role: string;
}
