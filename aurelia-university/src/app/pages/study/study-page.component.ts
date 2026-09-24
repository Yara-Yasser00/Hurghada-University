import { Component, inject } from '@angular/core';
import { UniversityDataService } from '../../core/services/university-data.service';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header.component';
import { FeatureCardComponent } from '../../shared/components/feature-card/feature-card.component';

@Component({
  selector: 'app-study-page',
  standalone: true,
  imports: [SectionHeaderComponent, FeatureCardComponent],
  template: `
    <section class="page-hero">
      <div class="au-container">
        <p class="au-eyebrow">الدراسة</p>
        <h1>ادرس في جامعة الغردقة</h1>
        <p class="lede">
          برامج جامعية في التربية والسياحة والألسن والحاسبات والعلوم — مرتبطة بسوق العمل في البحر الأحمر.
        </p>
      </div>
    </section>
    <section class="au-section">
      <div class="au-container">
        <app-section-header title="مسارات الدراسة" subtitle="اختر الكلية والبرنامج الذي يناسب طموحك." />
        <div class="grid">
          @for (card of data.studyCards; track card.id) {
            <app-feature-card [card]="card" />
          }
        </div>
      </div>
    </section>
    <section class="au-section band">
      <div class="au-container narrow">
        <h2>تعليم يربط المعرفة بسوق العمل</h2>
        <p>
          في جامعة الغردقة يجمع التعليم بين المحاضرات والتدريب العملي والشراكات المهنية،
          لإعداد خريجين قادرين على خدمة السياحة والتقنية والتعليم وتنمية المحافظة.
        </p>
      </div>
    </section>
  `,
  styles: `
    .page-hero { padding: clamp(3rem, 7vw, 5rem) 0; background: var(--secondary); border-bottom: 1px solid var(--line); }
    h1 { margin: 0 0 1rem; font-family: var(--font-serif); font-size: clamp(2.4rem, 5vw, 3.6rem); color: var(--primary-deep); line-height: 1.1; }
    .lede { margin: 0; max-width: 40rem; color: var(--muted); font-size: 1.15rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; }
    .band { background: var(--primary-deep); color: #fff; }
    .narrow { max-width: 44rem; }
    .band h2 { margin: 0 0 1rem; font-family: var(--font-serif); font-size: clamp(1.8rem, 3vw, 2.4rem); }
    .band p { margin: 0; color: rgba(255,255,255,.86); line-height: 1.7; }
  `,
})
export class StudyPageComponent {
  readonly data = inject(UniversityDataService);
}
