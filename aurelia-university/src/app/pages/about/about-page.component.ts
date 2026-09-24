import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UniversityDataService } from '../../core/services/university-data.service';
import { PageBannerComponent } from '../../shared/components/page-banner/page-banner.component';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [RouterLink, PageBannerComponent, TranslatePipe],
  template: `
    <app-page-banner
      [eyebrow]="'pages.about.eyebrow' | translate"
      [title]="'pages.about.title' | translate"
      [lede]="'pages.about.lede' | translate"
      [image]="data.aboutBannerImage"
    />
    <section class="au-section">
      <div class="au-container split">
        <div class="gallery">
          <img [src]="data.aboutBannerImage" alt="حرم جامعة الغردقة" loading="lazy" width="900" height="700" />
          <img [src]="data.heroImage" alt="منشآت الجامعة" loading="lazy" width="900" height="500" />
        </div>
        <div>
          <h2>نشأة الجامعة</h2>
          <p>
            بدأت الدراسة بكلية التربية بفرع الغردقة عام 1995، ثم خُصصت 500 فدان شمال المدينة للحرم الجامعي،
            وصدر القرار الجمهوري بإنشاء جامعة الغردقة لخدمة محافظة البحر الأحمر ومصر.
          </p>
          <h2>قيادات الجامعة</h2>
          <ul>
            @for (leader of data.leaders; track leader.name) {
              <li>
                <strong>{{ leader.name }}</strong>
                <span>{{ leader.role }}</span>
              </li>
            }
          </ul>
          <a class="au-text-link" routerLink="/about/history">المزيد عن تاريخ الجامعة <span class="au-arrow" aria-hidden="true">←</span></a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .split { display: grid; grid-template-columns: 1.1fr 1fr; gap: 2.5rem; align-items: start; }
    .gallery { display: grid; gap: 0.75rem; }
    .gallery img { width: 100%; object-fit: cover; border-top: 4px solid var(--accent); }
    .gallery img:first-child { min-height: 280px; }
    .gallery img:last-child { min-height: 180px; }
    h2 { margin: 0 0 0.6rem; font-family: var(--font-serif); font-size: 1.45rem; color: var(--primary-deep); }
    p { margin: 0 0 1.5rem; color: var(--muted); line-height: 1.7; }
    ul { list-style: none; margin: 0 0 1.5rem; padding: 0; }
    li { padding: 0.75rem 0; border-bottom: 1px solid var(--line); display: grid; gap: 0.2rem; }
    li strong { color: var(--primary-deep); }
    li span { color: var(--muted); font-size: 0.95rem; }
    @media (max-width: 900px) { .split { grid-template-columns: 1fr; } }
  `,
})
export class AboutPageComponent {
  readonly data = inject(UniversityDataService);
}
