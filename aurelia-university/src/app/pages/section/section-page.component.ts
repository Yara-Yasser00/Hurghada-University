import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { UniversityDataService } from '../../core/services/university-data.service';
import { PageBannerComponent } from '../../shared/components/page-banner/page-banner.component';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-section-page',
  standalone: true,
  imports: [RouterLink, PageBannerComponent, TranslatePipe],
  template: `
    @if (section(); as s) {
      <app-page-banner [eyebrow]="s.eyebrow" [title]="s.title" [lede]="s.intro" [image]="s.image || ''" />

      <section class="au-section">
        <div class="au-container layout">
          <div class="main">
            @if (s.body?.length) {
              @for (para of s.body; track $index) {
                <p class="body-p">{{ para }}</p>
              }
            }

            @if (s.highlights?.length) {
              <div class="highlights">
                @for (h of s.highlights; track h.title) {
                  <article>
                    <h2>{{ h.title }}</h2>
                    <p>{{ h.text }}</p>
                  </article>
                }
              </div>
            }
          </div>

          <aside>
            <h2 class="aside-title">{{ 'common.relatedLinks' | translate }}</h2>
            <ul class="links">
              @for (link of s.links; track link.path + link.labelKey) {
                <li>
                  @if (isExternal(link.path)) {
                    <a [href]="link.path" target="_blank" rel="noopener noreferrer">
                      <span>{{ link.labelKey | translate }}</span>
                      <span aria-hidden="true">‹</span>
                    </a>
                  } @else {
                    <a [routerLink]="link.path">
                      <span>{{ link.labelKey | translate }}</span>
                      <span aria-hidden="true">‹</span>
                    </a>
                  }
                </li>
              }
            </ul>
          </aside>
        </div>
      </section>
    } @else {
      <section class="au-section">
        <div class="au-container">
          <h1>{{ 'common.sectionNotFound' | translate }}</h1>
          <a routerLink="/" class="au-text-link">{{ 'common.backHome' | translate }}</a>
        </div>
      </section>
    }
  `,
  styles: `
    .layout {
      display: grid;
      grid-template-columns: 1.35fr 0.85fr;
      gap: 2rem;
      align-items: start;
    }

    .body-p {
      margin: 0 0 1.1rem;
      color: var(--text);
      line-height: 1.75;
      max-width: 42rem;
    }

    .aside-title {
      margin: 0 0 0.75rem;
      font-family: var(--font-serif);
      font-size: 1.15rem;
      color: var(--primary-deep);
    }

    .links {
      list-style: none;
      margin: 0;
      padding: 0;
      border: 1px solid var(--line);
      background: var(--surface);
    }

    .links a {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--line);
      text-decoration: none;
      font-weight: 600;
      color: var(--primary);
      transition: background 0.2s ease, color 0.2s ease;
    }

    .links li:last-child a {
      border-bottom: 0;
    }

    .links a:hover {
      background: var(--teal-mist);
      color: var(--teal);
    }

    .highlights {
      display: grid;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .highlights article {
      padding: 1.35rem;
      background: var(--secondary);
      border: 1px solid var(--line);
      border-top: 3px solid var(--teal);
    }

    .highlights h2 {
      margin: 0 0 0.5rem;
      font-family: var(--font-serif);
      font-size: 1.25rem;
      color: var(--primary-deep);
    }

    .highlights p {
      margin: 0;
      color: var(--muted);
    }

    @media (max-width: 800px) {
      .layout {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class SectionPageComponent {
  private readonly data = inject(UniversityDataService);
  private readonly route = inject(ActivatedRoute);

  readonly section = toSignal(
    combineLatest([this.route.data, this.route.paramMap]).pipe(
      map(([d, params]) => {
        const sectionId = String(d['sectionId'] ?? '');
        const slug = params.get('slug');
        const key = slug ? `${sectionId}/${slug}` : sectionId;
        return this.data.getSection(key) ?? null;
      }),
    ),
    { initialValue: null },
  );

  isExternal(path: string): boolean {
    return path.startsWith('mailto:') || path.startsWith('http');
  }
}
