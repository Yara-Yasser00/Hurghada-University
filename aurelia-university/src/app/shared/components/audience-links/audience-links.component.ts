import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UniversityDataService } from '../../../core/services/university-data.service';
import { TranslatePipe } from '../../../core/translate.pipe';

@Component({
  selector: 'app-audience-links',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <nav class="audience" [attr.aria-label]="'home.audience.aria' | translate">
      <ul class="audience__list">
        @for (link of data.audienceLinks; track link.titleKey) {
          <li>
            <a [routerLink]="link.path" class="audience__item">
              <span class="audience__text">
                <span class="audience__title">{{ link.titleKey | translate }}</span>
                <span class="audience__desc">{{ link.descriptionKey | translate }}</span>
              </span>
              <span class="audience__chevron" aria-hidden="true">‹</span>
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: `
    .audience__list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0;
      border-block-start: 1px solid var(--line);
      border-inline-start: 1px solid var(--line);
    }

    .audience__list > li {
      border-inline-end: 1px solid var(--line);
      border-block-end: 1px solid var(--line);
    }

    .audience__item {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      min-height: 7.5rem;
      padding: 1.35rem 1.25rem;
      text-decoration: none;
      color: inherit;
      background: var(--surface);
      transition: background var(--transition);
    }

    .audience__item:hover {
      background: var(--teal-mist);
    }

    .audience__text {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      min-width: 0;
    }

    .audience__title {
      font-family: var(--font-serif);
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--primary-deep);
      line-height: 1.25;
    }

    .audience__desc {
      font-size: 0.9rem;
      color: var(--muted);
      line-height: 1.45;
    }

    .audience__chevron {
      flex-shrink: 0;
      margin-top: 0.1rem;
      font-size: 1.5rem;
      line-height: 1;
      color: var(--teal);
      transition: transform var(--transition);
    }

    .audience__item:hover .audience__chevron {
      transform: translateX(-4px);
    }

    @media (max-width: 900px) {
      .audience__list {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 560px) {
      .audience__list {
        grid-template-columns: 1fr;
      }

      .audience__item {
        min-height: 0;
      }
    }
  `,
})
export class AudienceLinksComponent {
  readonly data = inject(UniversityDataService);
}
