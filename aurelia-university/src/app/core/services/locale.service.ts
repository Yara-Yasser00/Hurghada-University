import { Injectable, computed, effect, signal } from '@angular/core';
import arCatalog from '../../../assets/i18n/ar.json';
import enCatalog from '../../../assets/i18n/en.json';

export type PublicLang = 'ar' | 'en';

type Dict = Record<string, unknown>;

function lookup(dict: Dict | undefined, key: string): string | undefined {
  if (!dict || !key) return undefined;
  const parts = key.split('.');
  let cur: unknown = dict;
  for (let i = 0; i < parts.length; i++) {
    if (cur == null || typeof cur !== 'object') return undefined;
    const obj = cur as Dict;
    // Support flat keys that contain dots, e.g. nav["faculties.edu"]
    const rest = parts.slice(i).join('.');
    if (typeof obj[rest] === 'string') return obj[rest] as string;
    cur = obj[parts[i]];
  }
  return typeof cur === 'string' ? cur : undefined;
}

const catalogs: Record<PublicLang, Dict> = {
  ar: arCatalog as Dict,
  en: enCatalog as Dict,
};

@Injectable({ providedIn: 'root' })
export class LocaleService {
  readonly lang = signal<PublicLang>(
    (localStorage.getItem('hu_public_lang') as PublicLang) || 'ar'
  );
  readonly isRtl = computed(() => this.lang() === 'ar');
  /** Always true — catalogs are bundled at build time. */
  readonly ready = signal(true);

  constructor() {
    effect(() => {
      const lang = this.lang();
      localStorage.setItem('hu_public_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    });
  }

  toggle(): void {
    this.lang.update((v) => (v === 'ar' ? 'en' : 'ar'));
  }

  setLang(lang: PublicLang): void {
    this.lang.set(lang);
  }

  t(key: string): string {
    return lookup(catalogs[this.lang()], key) ?? lookup(catalogs.ar, key) ?? key;
  }
}
