import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UniversityDataService } from '../../core/services/university-data.service';
import { ResearchFeatureComponent } from '../../shared/components/research-feature/research-feature.component';
import { PageBannerComponent } from '../../shared/components/page-banner/page-banner.component';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-research-page',
  standalone: true,
  imports: [ResearchFeatureComponent, RouterLink, PageBannerComponent, TranslatePipe],
  template: `
    <app-page-banner
      [eyebrow]="'pages.research.eyebrow' | translate"
      [title]="'pages.research.title' | translate"
      [lede]="'pages.research.lede' | translate"
      [image]="data.researchBannerImage"
    />
    <section class="au-section dark">
      <div class="au-container">
        <app-research-feature />
      </div>
    </section>
    <section class="au-section">
      <div class="au-container">
        <div class="gallery">
          @for (item of data.researchItems; track item.id) {
            <a class="tile" [routerLink]="'/research/' + (item.id === 'r1' ? 'projects' : item.id === 'r2' ? 'centres' : item.id === 'r3' ? 'awards' : 'libraries')">
              <img [src]="item.image" [alt]="item.title" loading="lazy" width="640" height="420" />
              <div>
                <span>{{ item.area }}</span>
                <strong>{{ item.title }}</strong>
              </div>
            </a>
          }
        </div>
        <div class="pillars">
          @for (link of data.mainNav[3].children; track link.path) {
            <a [routerLink]="link.path">
              <h2>{{ link.labelKey | translate }}</h2>
              <span>{{ 'common.readMore' | translate }}</span>
            </a>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .dark { background: var(--primary); color: #fff; }
    .gallery {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .tile {
      position: relative;
      display: block;
      min-height: 220px;
      overflow: hidden;
      text-decoration: none;
      color: #fff;
    }
    .tile img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .tile:hover img { transform: scale(1.05); }
    .tile > div {
      position: absolute;
      inset: auto 0 0;
      padding: 1.15rem;
      background: linear-gradient(180deg, transparent, rgba(6, 50, 71, 0.92));
    }
    .tile span { display: block; color: var(--accent-soft); font-size: 0.85rem; font-weight: 600; margin-bottom: 0.3rem; }
    .tile strong { font-family: var(--font-serif); font-size: 1.15rem; line-height: 1.35; }
    .pillars { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .pillars a {
      display: block;
      padding: 1.25rem;
      border: 1px solid var(--line);
      text-decoration: none;
      background: var(--surface);
      transition: background 0.25s ease, transform 0.25s ease;
    }
    .pillars a:hover { background: var(--teal-mist); transform: translateY(-2px); }
    .pillars h2 { margin: 0 0 0.5rem; font-family: var(--font-serif); font-size: 1.1rem; color: var(--primary-deep); }
    .pillars span { color: var(--teal); font-weight: 600; font-size: 0.92rem; }
    @media (max-width: 900px) {
      .gallery, .pillars { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 560px) {
      .gallery, .pillars { grid-template-columns: 1fr; }
    }
  `,
})
export class ResearchPageComponent {
  readonly data = inject(UniversityDataService);
}
