import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UniversityDataService } from '../../core/services/university-data.service';
import { PageBannerComponent } from '../../shared/components/page-banner/page-banner.component';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-links-page',
  standalone: true,
  imports: [RouterLink, PageBannerComponent, TranslatePipe],
  template: `
    <app-page-banner
      [eyebrow]="'pages.links.eyebrow' | translate"
      [title]="'pages.links.title' | translate"
      [lede]="'pages.links.lede' | translate"
      [image]="data.linksImage"
    />
    <section class="au-section">
      <div class="au-container wrap">
        <figure class="side-visual">
          <img [src]="data.linksImage" alt="" loading="lazy" width="640" height="800" />
        </figure>
        <ul>
          @for (link of data.importantLinks; track link.labelKey) {
            <li>
              @if (isExternal(link.path)) {
                <a [href]="link.path" target="_blank" rel="noopener noreferrer"
                  >{{ link.labelKey | translate }} <span aria-hidden="true">‹</span></a
                >
              } @else {
                <a [routerLink]="link.path">{{ link.labelKey | translate }} <span aria-hidden="true">‹</span></a>
              }
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    .wrap {
      display: grid;
      grid-template-columns: 0.85fr 1.15fr;
      gap: 1.5rem;
      align-items: start;
    }
    .side-visual {
      margin: 0;
      overflow: hidden;
      border-top: 4px solid var(--accent);
      min-height: 280px;
    }
    .side-visual img {
      width: 100%;
      height: 100%;
      min-height: 360px;
      object-fit: cover;
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: 1fr;
      border: 1px solid var(--line);
    }
    li { border-bottom: 1px solid var(--line); }
    li:last-child { border-bottom: 0; }
    a {
      display: flex;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      text-decoration: none;
      font-weight: 600;
      color: var(--primary);
      transition: background 0.2s ease, color 0.2s ease;
    }
    a:hover {
      background: var(--teal-mist);
      color: var(--teal);
    }
    @media (max-width: 800px) {
      .wrap { grid-template-columns: 1fr; }
      .side-visual img { min-height: 220px; }
    }
  `,
})
export class LinksPageComponent {
  readonly data = inject(UniversityDataService);

  isExternal(path: string): boolean {
    return path.startsWith('mailto:') || path.startsWith('http');
  }
}
