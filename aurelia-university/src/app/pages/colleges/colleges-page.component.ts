import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UniversityDataService } from '../../core/services/university-data.service';
import { CollegeCardComponent } from '../../shared/components/college-card/college-card.component';
import { PageBannerComponent } from '../../shared/components/page-banner/page-banner.component';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-colleges-page',
  standalone: true,
  imports: [CollegeCardComponent, RouterLink, PageBannerComponent, TranslatePipe],
  template: `
    <app-page-banner
      [eyebrow]="'pages.colleges.eyebrow' | translate"
      [title]="'pages.colleges.title' | translate"
      [lede]="'pages.colleges.lede' | translate"
      [image]="data.facultiesBannerImage"
    />
    <section class="au-section">
      <div class="au-container">
        <div class="grid">
          @for (faculty of data.faculties; track faculty.id) {
            <app-college-card [college]="faculty" />
          } @empty {
            <p class="empty">لا توجد كليات لعرضها حاليًا.</p>
          }
        </div>
        <p class="more">
          <a class="au-text-link" routerLink="/academic">العودة للشئون الأكاديمية <span class="au-arrow" aria-hidden="true">←</span></a>
        </p>
      </div>
    </section>
  `,
  styles: `
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
    .empty { color: var(--muted); margin: 0; padding: 2rem; border: 1px dashed var(--line); }
    .more { margin-top: 2rem; }
    @media (max-width: 900px) { .grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
  `,
})
export class CollegesPageComponent {
  readonly data = inject(UniversityDataService);
}
