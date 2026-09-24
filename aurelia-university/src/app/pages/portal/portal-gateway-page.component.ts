import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UniversityDataService } from '../../core/services/university-data.service';
import { PageBannerComponent } from '../../shared/components/page-banner/page-banner.component';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-portal-gateway-page',
  standalone: true,
  imports: [RouterLink, PageBannerComponent, TranslatePipe],
  template: `
    <app-page-banner
      [eyebrow]="'portal.eyebrow' | translate"
      [title]="'portal.title' | translate"
      [lede]="'portal.lede' | translate"
      [image]="data.linksImage"
    />

    <section class="au-section gateway">
      <div class="au-container">
        <p class="intro">
          {{ 'portal.intro' | translate }}
        </p>

        <div class="doors">
          <a class="door door--students" [href]="studentLoginUrl">
            <span class="door__icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" width="56" height="56" fill="none">
                <circle cx="22" cy="22" r="8" stroke="currentColor" stroke-width="3" />
                <circle cx="42" cy="22" r="8" stroke="currentColor" stroke-width="3" />
                <path
                  d="M8 50c2-10 10-15 20-15s18 5 20 15"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <strong>{{ 'portal.studentsTitle' | translate }}</strong>
            <span>{{ 'portal.studentsDesc' | translate }}</span>
          </a>

          <a class="door door--staff" [href]="staffLoginUrl">
            <span class="door__icon" aria-hidden="true">
              <svg viewBox="0 0 64 64" width="56" height="56" fill="none">
                <circle cx="32" cy="20" r="10" stroke="currentColor" stroke-width="3" />
                <path
                  d="M12 54c3-14 12-20 20-20s17 6 20 20"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                />
                <path d="M44 18h10M49 13v10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
              </svg>
            </span>
            <strong>{{ 'portal.staffTitle' | translate }}</strong>
            <span>{{ 'portal.staffDesc' | translate }}</span>
          </a>
        </div>

        <ul class="hints">
          <li>{{ 'portal.hint1' | translate }}</li>
          <li>{{ 'portal.hint2' | translate }} <code>hurghada</code></li>
          <li>
            {{ 'portal.hint3' | translate }}
            <a routerLink="/contact">{{ 'portal.contact' | translate }}</a>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: `
    .gateway .intro {
      margin: 0 0 1.75rem;
      max-width: 40rem;
      line-height: 1.7;
      color: var(--text);
    }

    .doors {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .door {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.55rem;
      padding: 2rem 1.5rem;
      text-decoration: none;
      color: inherit;
      border: 1px solid var(--line);
      background: var(--surface);
      transition:
        transform 0.25s var(--ease-out, ease),
        border-color 0.25s ease,
        box-shadow 0.25s ease;
    }

    .door:hover {
      transform: translateY(-4px);
      border-color: var(--teal);
      box-shadow: var(--shadow-lift, 0 12px 28px rgba(11, 42, 74, 0.12));
    }

    .door__icon {
      color: var(--navy, var(--primary-deep));
      margin-bottom: 0.35rem;
    }

    .door--students .door__icon {
      color: var(--teal);
    }

    .door--staff .door__icon {
      color: var(--gold, #b8860b);
    }

    .door strong {
      font-family: var(--font-serif);
      font-size: 1.35rem;
      color: var(--primary-deep);
    }

    .door span:last-child {
      font-size: 0.92rem;
      color: var(--muted, #5a6b7d);
      line-height: 1.5;
      max-width: 16rem;
    }

    .hints {
      margin: 0;
      padding: 1.1rem 1.25rem;
      list-style: none;
      border: 1px solid var(--line);
      background: color-mix(in srgb, var(--teal-mist, #e8f4f2) 55%, #fff);
      display: grid;
      gap: 0.55rem;
      font-size: 0.95rem;
      line-height: 1.55;
    }

    .hints code {
      font-family: ui-monospace, monospace;
      font-size: 0.88em;
      padding: 0.1em 0.35em;
      background: #fff;
      border: 1px solid var(--line);
    }

    .hints a {
      color: var(--teal);
      font-weight: 600;
    }

    @media (max-width: 720px) {
      .doors {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class PortalGatewayPageComponent {
  readonly data = inject(UniversityDataService);
  readonly studentLoginUrl = `${environment.dashboardUrl}?door=student`;
  readonly staffLoginUrl = `${environment.dashboardUrl}?door=staff`;
}
