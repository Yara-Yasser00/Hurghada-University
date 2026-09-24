import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { UniversityDataService } from '../../core/services/university-data.service';

@Component({
  selector: 'app-faculty-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (faculty(); as f) {
      <section class="page-hero">
        <div class="au-container">
          <p class="au-eyebrow">كليات الجامعة</p>
          <h1>{{ f.name }}</h1>
          <p class="lede">{{ f.description }}</p>
        </div>
      </section>

      <section class="au-section">
        <div class="au-container split">
          <img [src]="f.image" [alt]="f.name" loading="lazy" width="900" height="650" />
          <div>
            <h2>عن الكلية</h2>
            <p>
              {{ f.description }}
              تُعد جزءًا من منظومة جامعة الغردقة في محافظة البحر الأحمر، وتسهم في إعداد كوادر أكاديمية ومهنية لسوق العمل المحلي والوطني.
            </p>
            <h2>روابط مفيدة</h2>
            <ul>
              <li><a routerLink="/academic/programs">البرامج الجامعية</a></li>
              <li><a routerLink="/students">خدمات الطلاب</a></li>
              <li><a routerLink="/contact">اتصل بنا</a></li>
              <li><a routerLink="/faculties">كل الكليات</a></li>
            </ul>
          </div>
        </div>
      </section>
    } @else {
      <section class="au-section">
        <div class="au-container">
          <h1>الكلية غير موجودة</h1>
          <a class="au-text-link" routerLink="/faculties">العودة إلى الكليات</a>
        </div>
      </section>
    }
  `,
  styles: `
    .page-hero { padding: clamp(3rem, 7vw, 5rem) 0; background: var(--secondary); border-bottom: 1px solid var(--line); }
    h1 { margin: 0 0 1rem; font-family: var(--font-serif); font-size: clamp(2rem, 4.5vw, 2.8rem); color: var(--primary-deep); line-height: 1.2; }
    .lede { margin: 0; max-width: 40rem; color: var(--muted); font-size: 1.08rem; }
    .split { display: grid; grid-template-columns: 1.1fr 1fr; gap: 2.25rem; align-items: start; }
    img { width: 100%; min-height: 280px; object-fit: cover; border-top: 4px solid var(--accent); }
    h2 { margin: 0 0 0.65rem; font-family: var(--font-serif); font-size: 1.35rem; color: var(--primary-deep); }
    p { margin: 0 0 1.35rem; color: var(--muted); line-height: 1.7; }
    ul { list-style: none; margin: 0; padding: 0; border: 1px solid var(--line); }
    li { border-bottom: 1px solid var(--line); }
    li:last-child { border-bottom: 0; }
    a { display: block; padding: 0.85rem 1.1rem; color: var(--primary); font-weight: 600; text-decoration: none; }
    a:hover { background: var(--teal-mist); color: var(--teal); }
    @media (max-width: 900px) { .split { grid-template-columns: 1fr; } }
  `,
})
export class FacultyPageComponent {
  private readonly data = inject(UniversityDataService);
  private readonly route = inject(ActivatedRoute);

  readonly faculty = toSignal(
    this.route.paramMap.pipe(map((p) => this.data.getFaculty(p.get('id') ?? ''))),
    { initialValue: undefined },
  );
}
