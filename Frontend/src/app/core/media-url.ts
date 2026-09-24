import { environment } from '../../environments/environment';

/** Resolve stored media paths to a browser-loadable URL. */
export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('/uploads/')) return `${environment.apiUrl}${trimmed}`;
  // Legacy aurelia static assets or other relative paths
  return trimmed;
}
