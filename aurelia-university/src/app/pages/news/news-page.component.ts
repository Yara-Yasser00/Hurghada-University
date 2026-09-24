import { Component, inject } from '@angular/core';
import { UniversityDataService } from '../../core/services/university-data.service';
import { NewsCardComponent } from '../../shared/components/news-card/news-card.component';
import { PageBannerComponent } from '../../shared/components/page-banner/page-banner.component';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-news-page',
  standalone: true,
  imports: [NewsCardComponent, PageBannerComponent, TranslatePipe],
  template: `
    <app-page-banner
      [eyebrow]="'pages.news.eyebrow' | translate"
      [title]="'pages.news.title' | translate"
      [lede]="'pages.news.lede' | translate"
      [image]="data.newsBannerImage"
    />
    <section class="au-section">
      <div class="au-container layout">
        @if (data.news.length) {
          <app-news-card [article]="data.getFeaturedNews()" [featured]="true" />
          <div class="side">
            @for (article of data.news; track article.id) {
              @if (!article.featured) {
                <app-news-card [article]="article" />
              }
            }
          </div>
        } @else {
          <p class="empty">لا توجد أخبار منشورة حاليًا.</p>
        }
      </div>
    </section>
  `,
  styles: `
    .layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.75rem; }
    .side { display: flex; flex-direction: column; gap: 0; }
    .empty { grid-column: 1 / -1; color: var(--muted); margin: 0; padding: 2rem; border: 1px dashed var(--line); }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
  `,
})
export class NewsPageComponent {
  readonly data = inject(UniversityDataService);
}
