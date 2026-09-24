import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UniversityDataService } from '../../../core/services/university-data.service';
import { TranslatePipe } from '../../../core/translate.pipe';

@Component({
  selector: 'app-research-feature',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="head">
      <p class="au-eyebrow">{{ 'home.research.eyebrow' | translate }}</p>
      <h2>{{ 'home.research.title' | translate }}</h2>
      <p class="sub">
        {{ 'home.research.sub' | translate }}
      </p>
    </div>
    <div class="layout">
      @if (featured; as item) {
        <a class="featured" routerLink="/research">
          <img [src]="item.image" [alt]="item.title" loading="lazy" width="1200" height="800" />
          <div class="overlay">
            <span>{{ item.area }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
          </div>
        </a>
      }
      <div class="side">
        @for (item of others; track item.id) {
          <a routerLink="/research">
            <span>{{ item.area }}</span>
            <strong>{{ item.title }}</strong>
          </a>
        }
        <a class="all" routerLink="/research">{{ 'home.research.viewAll' | translate }} <span class="au-arrow" aria-hidden="true">←</span></a>
      </div>
    </div>
  `,
  styles: `
    .head { max-width: 40rem; margin-bottom: 2rem; }
    .au-eyebrow { color: rgba(255, 255, 255, 0.7); }
    h2 {
      margin: 0 0 0.65rem;
      font-family: var(--font-serif);
      font-size: clamp(1.85rem, 3.5vw, 2.55rem);
      color: #fff;
      line-height: 1.25;
      font-weight: 700;
    }
    .sub { margin: 0; color: rgba(255, 255, 255, 0.78); font-size: 1.05rem; line-height: 1.6; }
    .layout { display: grid; grid-template-columns: 1.45fr 1fr; gap: 1.75rem; }
    .featured {
      position: relative;
      display: block;
      min-height: 420px;
      overflow: hidden;
      text-decoration: none;
      color: #fff;
    }
    .featured img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .featured:hover img { transform: scale(1.04); }
    .overlay {
      position: absolute;
      inset: auto 0 0;
      padding: 1.5rem;
      background: linear-gradient(180deg, transparent, rgba(6, 50, 71, 0.92));
    }
    .overlay span { font-size: 0.875rem; font-weight: 600; color: var(--accent-soft); }
    .overlay h3 {
      margin: 0.4rem 0 0.5rem;
      font-family: var(--font-serif);
      font-size: clamp(1.45rem, 2.8vw, 1.9rem);
      line-height: 1.3;
    }
    .overlay p { margin: 0; color: rgba(255, 255, 255, 0.85); font-size: 0.95rem; }
    .side { display: flex; flex-direction: column; }
    .side a {
      display: block;
      padding: 1.05rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.18);
      text-decoration: none;
      color: #fff;
    }
    .side span { display: block; font-size: 0.875rem; color: var(--accent-soft); margin-bottom: 0.3rem; }
    .side strong { font-family: var(--font-serif); font-size: 1.15rem; font-weight: 700; line-height: 1.35; }
    .side a:hover strong { color: var(--accent-soft); }
    .all {
      margin-top: auto;
      font-weight: 600;
      border-bottom: 0 !important;
      color: #fff !important;
      padding-top: 1.35rem !important;
    }
    .all:hover { color: var(--accent-soft) !important; }
    @media (max-width: 900px) {
      .layout { grid-template-columns: 1fr; }
      .featured { min-height: 300px; }
    }
  `,
})
export class ResearchFeatureComponent {
  private readonly data = inject(UniversityDataService);

  get featured() {
    return this.data.getFeaturedResearch();
  }

  get others() {
    return this.data.researchItems.filter((r) => !r.featured);
  }
}
