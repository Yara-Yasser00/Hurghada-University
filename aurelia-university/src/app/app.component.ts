import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { UniversityHeaderComponent } from './layout/header/header.component';
import { UniversityFooterComponent } from './layout/footer/footer.component';
import { TranslatePipe } from './core/translate.pipe';
import { LocaleService } from './core/services/locale.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UniversityHeaderComponent, UniversityFooterComponent, TranslatePipe],
  template: `
    <a class="skip-link" href="#main">{{ 'common.skipToContent' | translate }}</a>
    <app-university-header />
    <main
      id="main"
      class="page-shell"
      tabindex="-1"
      [class.page-enter]="entering()"
    >
      <router-outlet />
    </main>
    <app-university-footer />
  `,
  styles: `
    :host { display: block; min-height: 100vh; }
    .skip-link {
      position: absolute;
      inset-inline-start: 1rem;
      top: -3rem;
      z-index: 2000;
      padding: 0.55rem 0.9rem;
      background: var(--teal);
      color: #fff;
      font-weight: 700;
      text-decoration: none;
      transition: top 0.2s ease;
    }
    .skip-link:focus {
      top: 0.75rem;
    }
    main.page-shell {
      min-height: 50vh;
      outline: none;
    }
    main.page-shell.page-enter {
      animation: au-page-enter 0.4s var(--ease-out) both;
    }
  `,
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly locale = inject(LocaleService);
  private readonly destroyRef = inject(DestroyRef);

  readonly entering = signal(true);

  constructor() {
    effect(() => {
      this.locale.lang();
      this.syncDocumentTitle();
    });
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.entering.set(false);
        requestAnimationFrame(() => {
          this.entering.set(true);
          document.getElementById('main')?.focus({ preventScroll: true });
        });
        this.syncDocumentTitle();
      });

    this.syncDocumentTitle();
  }

  private syncDocumentTitle(): void {
    const brand = this.locale.lang() === 'en' ? 'Hurghada University' : 'جامعة الغردقة';
    const path = this.router.url.split('?')[0].replace(/^\//, '') || 'home';
    const segment = path.split('/')[0] || 'home';
    const keyMap: Record<string, string> = {
      home: 'nav.home',
      faculties: 'nav.faculties',
      academic: 'nav.academic',
      research: 'nav.research',
      students: 'nav.students',
      community: 'nav.community',
      staff: 'nav.staff',
      about: 'nav.about',
      news: 'common.news',
      agenda: 'common.agenda',
      events: 'common.agenda',
      contact: 'common.contact',
      portal: 'nav.portal',
      admissions: 'nav.students',
      links: 'utility.links',
      visitors: 'nav.about',
    };
    const label = this.locale.t(keyMap[segment] || 'nav.home');
    document.title = !path || segment === 'home' ? brand : `${label} · ${brand}`;
  }
}
