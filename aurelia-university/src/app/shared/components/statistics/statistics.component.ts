import { Component, inject } from '@angular/core';
import { UniversityDataService } from '../../../core/services/university-data.service';
import { TranslatePipe } from '../../../core/translate.pipe';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section class="stats au-section" [attr.aria-label]="'statistics.aria' | translate">
      <div class="au-container grid">
        @for (stat of data.statistics; track stat.label) {
          <div class="item">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .stats {
      background: var(--secondary);
      border-block: 1px solid var(--line);
      color: var(--text);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .item {
      text-align: start;
      padding-inline-end: 1rem;
      border-inline-end: 1px solid var(--line);
    }

    .item:last-child {
      border-inline-end: 0;
    }

    strong {
      display: block;
      font-family: var(--font-serif);
      font-size: clamp(2rem, 3.8vw, 2.75rem);
      font-weight: 700;
      color: var(--primary-deep);
      line-height: 1.1;
      margin-bottom: 0.4rem;
    }

    span {
      color: var(--muted);
      font-size: 0.95rem;
    }

    @media (max-width: 800px) {
      .grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .item:nth-child(2n) {
        border-inline-end: 0;
      }

      .item:nth-child(-n + 2) {
        padding-bottom: 1.25rem;
        border-bottom: 1px solid var(--line);
      }
    }
  `,
})
export class StatisticsComponent {
  readonly data = inject(UniversityDataService);
}
