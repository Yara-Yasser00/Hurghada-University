import { Injectable, computed, effect, signal } from '@angular/core';
import arCatalog from '../../assets/i18n/ar.json';
import enCatalog from '../../assets/i18n/en.json';

export type Lang = 'EN' | 'AR';

type Dict = Record<string, unknown>;

function lookup(dict: Dict | undefined, key: string): string | undefined {
  if (!dict || !key) return undefined;
  const parts = key.split('.');
  let cur: unknown = dict;
  for (let i = 0; i < parts.length; i++) {
    if (cur == null || typeof cur !== 'object') return undefined;
    const obj = cur as Dict;
    const rest = parts.slice(i).join('.');
    if (typeof obj[rest] === 'string') return obj[rest] as string;
    cur = obj[parts[i]];
  }
  return typeof cur === 'string' ? cur : undefined;
}

const catalogs: Record<Lang, Dict> = {
  EN: enCatalog as Dict,
  AR: arCatalog as Dict,
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(readInitialLang());
  readonly isRtl = computed(() => this.lang() === 'AR');

  constructor() {
    effect(() => {
      const lang = this.lang();
      localStorage.setItem('hu_lang', lang);
      document.documentElement.lang = lang === 'AR' ? 'ar' : 'en';
      document.documentElement.dir = lang === 'AR' ? 'rtl' : 'ltr';
    });
  }

  toggle(): void {
    this.lang.update((v) => (v === 'EN' ? 'AR' : 'EN'));
  }

  t(key: string): string {
    return lookup(catalogs[this.lang()], key) ?? lookup(catalogs.EN, key) ?? key;
  }
}

function readInitialLang(): Lang {
  const saved = localStorage.getItem('hu_lang') as Lang | null;
  if (saved === 'AR' || saved === 'EN') return saved;
  // Follow public site preference when first opening the dashboard.
  const publicLang = localStorage.getItem('hu_public_lang');
  if (publicLang === 'ar') return 'AR';
  if (publicLang === 'en') return 'EN';
  return 'AR';
}
