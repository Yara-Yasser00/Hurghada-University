import { Component, inject } from '@angular/core';
import { UniversityDataService } from '../../core/services/university-data.service';
import { EventsListComponent } from '../../shared/components/events-list/events-list.component';
import { PageBannerComponent } from '../../shared/components/page-banner/page-banner.component';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [EventsListComponent, PageBannerComponent, TranslatePipe],
  template: `
    <app-page-banner
      [eyebrow]="'pages.events.eyebrow' | translate"
      [title]="'pages.events.title' | translate"
      [lede]="'pages.events.lede' | translate"
      [image]="data.eventsImage"
    />
    <section class="au-section">
      <div class="au-container layout">
        <figure class="visual">
          <img [src]="data.eventsImage" [attr.alt]="'pages.events.imageAlt' | translate" loading="lazy" width="800" height="600" />
        </figure>
        <div class="list">
          <app-events-list [events]="data.events" />
        </div>
      </div>
    </section>
  `,
  styles: `
    .layout {
      display: grid;
      grid-template-columns: 0.9fr 1.1fr;
      gap: 1.75rem;
      align-items: start;
    }
    .visual {
      margin: 0;
      overflow: hidden;
      border-top: 4px solid var(--accent);
    }
    .visual img {
      width: 100%;
      min-height: 320px;
      object-fit: cover;
    }
    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
    }
  `,
})
export class EventsPageComponent {
  readonly data = inject(UniversityDataService);
}
