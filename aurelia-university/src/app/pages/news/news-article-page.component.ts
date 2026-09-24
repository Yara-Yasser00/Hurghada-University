import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { UniversityDataService } from '../../core/services/university-data.service';

@Component({
  selector: 'app-news-article-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (article(); as a) {
      <article class="article">
        <header class="page-hero">
          <div class="au-container">
            <p class="au-eyebrow">{{ a.category }}</p>
            <h1>{{ a.title }}</h1>
            <time>{{ a.date }}</time>
          </div>
        </header>
        <div class="au-container au-section content">
          <img [src]="a.image" [alt]="a.title" width="1200" height="700" />
          <p class="lead">{{ a.description }}</p>
          <p>
            جامعة الغردقة تواصل أنشطتها الأكاديمية والمجتمعية في محافظة البحر الأحمر.
            للمزيد من التفاصيل والمستجدات تابع صفحة الأخبار أو تواصل عبر قنوات الجامعة الرسمية.
          </p>
          <a class="au-text-link" routerLink="/news">العودة إلى الأخبار <span class="au-arrow" aria-hidden="true">←</span></a>
        </div>
      </article>
    } @else {
      <section class="au-section">
        <div class="au-container">
          <h1>الخبر غير موجود</h1>
          <a class="au-text-link" routerLink="/news">كل الأخبار</a>
        </div>
      </section>
    }
  `,
  styles: `
    .page-hero { padding: clamp(2.5rem, 6vw, 4rem) 0; background: var(--secondary); border-bottom: 1px solid var(--line); }
    h1 { margin: 0 0 0.75rem; font-family: var(--font-serif); font-size: clamp(1.85rem, 4vw, 2.6rem); color: var(--primary-deep); line-height: 1.25; max-width: 40rem; }
    time { color: var(--muted); font-size: 0.95rem; }
    .content { max-width: 820px; }
    img { width: 100%; aspect-ratio: 16/10; object-fit: cover; margin-bottom: 1.5rem; border-top: 4px solid var(--accent); }
    .lead { font-size: 1.15rem; color: var(--text); line-height: 1.75; margin: 0 0 1rem; }
    p { margin: 0 0 1.25rem; color: var(--muted); line-height: 1.75; }
  `,
})
export class NewsArticlePageComponent {
  private readonly data = inject(UniversityDataService);
  private readonly route = inject(ActivatedRoute);

  readonly article = toSignal(
    this.route.paramMap.pipe(map((p) => this.data.getNewsArticle(p.get('id') ?? ''))),
    { initialValue: undefined },
  );
}
