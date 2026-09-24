import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UniversityDataService } from '../../core/services/university-data.service';
import { PageBannerComponent } from '../../shared/components/page-banner/page-banner.component';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-admissions-page',
  standalone: true,
  imports: [RouterLink, PageBannerComponent, TranslatePipe],
  template: `
    <app-page-banner
      [eyebrow]="'pages.admissions.eyebrow' | translate"
      [title]="'pages.admissions.title' | translate"
      [lede]="'pages.admissions.lede' | translate"
      [image]="data.admissionsImage"
    >
      <div class="actions">
        <a class="au-btn au-btn-gold" routerLink="/contact">{{ 'pages.admissions.inquiry' | translate }}</a>
        <a class="au-btn au-btn-secondary" routerLink="/agenda">{{ 'pages.admissions.agenda' | translate }}</a>
      </div>
    </app-page-banner>

    <section class="au-section">
      <div class="au-container">
        <div class="mosaic">
          <img [src]="data.studyCards[0].image" alt="" loading="lazy" />
          <img [src]="data.admissionsImage" alt="" loading="lazy" />
          <img [src]="data.eventsImage" alt="" loading="lazy" />
        </div>
        <div class="grid">
          @for (item of items; track item.title) {
            <article>
              <h2>{{ item.title }}</h2>
              <p>{{ item.body }}</p>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.25rem; }
    .mosaic {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr;
      gap: 0.65rem;
      margin-bottom: 1.75rem;
    }
    .mosaic img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      border-top: 3px solid var(--teal);
    }
    .mosaic img:first-child { height: 100%; min-height: 180px; grid-row: span 1; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
    article {
      padding: 1.35rem;
      border: 1px solid var(--line);
      border-top: 3px solid var(--teal);
      background: var(--surface);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    article:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-soft);
    }
    h2 { margin: 0 0 .6rem; font-family: var(--font-serif); font-size: 1.25rem; color: var(--primary-deep); }
    p { margin: 0; color: var(--muted); line-height: 1.6; }
    @media (max-width: 900px) {
      .grid, .mosaic { grid-template-columns: 1fr; }
      .mosaic img { height: 160px; }
    }
  `,
})
export class AdmissionsPageComponent {
  readonly data = inject(UniversityDataService);
  readonly items = [
    { title: 'البرامج الجامعية', body: 'كليات التربية والسياحة والألسن والحاسبات والعلوم وبرامج مرتبطة بسوق العمل.' },
    { title: 'الدراسات العليا', body: 'برامج مهنية مثل الماجستير المهني في إدارة الأعمال والمحاسبة.' },
    { title: 'الطلاب الجدد', body: 'التعرّف على الكليات وخطوات الالتحاق والخدمات الإلكترونية.' },
    { title: 'عملية التقديم', body: 'مواعيد التنسيق والمستندات وما بعد القبول عبر قنوات الجامعة.' },
    { title: 'الرسوم والتمويل', body: 'معلومات عامة عن الرسوم وسبل الدعم المتاحة للطلاب.' },
    { title: 'المنح', body: 'فرص المنح والدعم للطلاب المتميزين وذوي الاحتياجات.' },
  ];
}
