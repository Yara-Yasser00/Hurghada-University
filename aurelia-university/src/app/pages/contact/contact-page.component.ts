import { Component, inject } from '@angular/core';
import { UniversityDataService } from '../../core/services/university-data.service';
import { PageBannerComponent } from '../../shared/components/page-banner/page-banner.component';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [PageBannerComponent, TranslatePipe],
  template: `
    <app-page-banner
      [eyebrow]="'pages.contact.eyebrow' | translate"
      [title]="'pages.contact.title' | translate"
      [lede]="'pages.contact.lede' | translate"
      [image]="data.contactImage"
    />
    <section class="au-section">
      <div class="au-container split">
        <figure class="visual">
          <img [src]="data.contactImage" [attr.alt]="'pages.about.title' | translate" loading="lazy" width="900" height="640" />
        </figure>
        <div class="grid">
          <article>
            <h2>{{ 'pages.contact.address' | translate }}</h2>
            @for (line of data.addressLines; track line) {
              <p>{{ line }}</p>
            }
          </article>
          <article>
            <h2>الاستفسارات العامة</h2>
            <p><a [href]="'mailto:' + data.email">{{ data.email }}</a></p>
            <p>{{ data.phone }}</p>
          </article>
          <article>
            <h2>خدمات إلكترونية</h2>
            <p>البريد الإلكتروني والبوابات المتاحة عبر الخدمات الإلكترونية للجامعة.</p>
          </article>
        </div>
      </div>
    </section>
  `,
  styles: `
    .split {
      display: grid;
      grid-template-columns: 1fr 1.1fr;
      gap: 1.75rem;
      align-items: start;
    }
    .visual {
      margin: 0;
      overflow: hidden;
      border-top: 4px solid var(--accent);
      min-height: 280px;
    }
    .visual img {
      width: 100%;
      height: 100%;
      min-height: 320px;
      object-fit: cover;
    }
    .grid { display: grid; gap: 1rem; }
    article {
      padding: 1.35rem 1.4rem;
      background: var(--surface);
      border: 1px solid var(--line);
      border-top: 3px solid var(--teal);
    }
    h2 { margin: 0 0 0.75rem; font-family: var(--font-serif); font-size: 1.25rem; color: var(--primary-deep); }
    p { margin: 0 0 0.5rem; color: var(--muted); line-height: 1.6; }
    a { color: var(--primary); font-weight: 600; }
    @media (max-width: 900px) { .split { grid-template-columns: 1fr; } }
  `,
})
export class ContactPageComponent {
  readonly data = inject(UniversityDataService);
}
