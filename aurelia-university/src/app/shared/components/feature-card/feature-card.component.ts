import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FeatureCard } from '../../../core/models/university.models';
import { TranslatePipe } from '../../../core/translate.pipe';

@Component({
  selector: 'app-feature-card',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <a class="card" [routerLink]="card.path">
      <div class="media">
        <img [src]="card.image" [alt]="card.title" loading="lazy" width="640" height="420" />
      </div>
      <div class="body">
        <span class="cat">{{ card.category }}</span>
        <h3>{{ card.title }}</h3>
        <p>{{ card.description }}</p>
        <span class="more">{{ 'home.study.more' | translate }} <span class="au-arrow" aria-hidden="true">←</span></span>
      </div>
    </a>
  `,
  styles: `
    .card {
      display: flex;
      flex-direction: column;
      height: 100%;
      text-decoration: none;
      color: inherit;
      background: var(--surface);
      border: 1px solid var(--line);
      overflow: hidden;
      transition: border-color var(--transition);
    }

    .card:hover {
      border-color: var(--line-strong);
    }

    .media {
      overflow: hidden;
      aspect-ratio: 16 / 11;
    }

    .media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .card:hover img {
      transform: scale(1.04);
    }

    .body {
      padding: 1.1rem 1.1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      flex: 1;
    }

    .cat {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--accent);
    }

    h3 {
      margin: 0;
      font-family: var(--font-serif);
      font-size: 1.2rem;
      color: var(--primary-deep);
      line-height: 1.25;
    }

    p {
      margin: 0;
      color: var(--muted);
      font-size: 0.9375rem;
      flex: 1;
    }

    .more {
      margin-top: 0.45rem;
      font-weight: 600;
      color: var(--primary);
      font-size: 0.9375rem;
    }
  `,
})
export class FeatureCardComponent {
  @Input({ required: true }) card!: FeatureCard;
}
