import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsArticle } from '../../../core/models/university.models';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <article class="card" [class.featured]="featured" [class.compact]="!featured">
      @if (featured) {
        <a [routerLink]="['/news', article.id]" class="media">
          <img [src]="article.image" [alt]="article.title" loading="lazy" width="800" height="520" />
        </a>
        <div class="body">
          <div class="meta"><span>{{ article.category }}</span><time>{{ article.date }}</time></div>
          <h3><a [routerLink]="['/news', article.id]">{{ article.title }}</a></h3>
          <p>{{ article.description }}</p>
        </div>
      } @else {
        <a [routerLink]="['/news', article.id]" class="compact-link">
          <div class="thumb">
            <img [src]="article.image" [alt]="" loading="lazy" width="200" height="140" />
          </div>
          <div class="compact-body">
            <div class="meta"><span>{{ article.category }}</span><time>{{ article.date }}</time></div>
            <h3>{{ article.title }}</h3>
          </div>
        </a>
      }
    </article>
  `,
  styles: `
    .card.featured {
      display: grid;
      gap: 1rem;
    }

    .media {
      display: block;
      overflow: hidden;
      aspect-ratio: 16 / 10;
    }

    .media img,
    .thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.45s ease;
    }

    .media:hover img,
    .compact-link:hover .thumb img {
      transform: scale(1.04);
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--accent);
    }

    time {
      color: var(--muted);
    }

    .featured h3 {
      margin: 0.35rem 0 0.5rem;
      font-family: var(--font-serif);
      font-size: clamp(1.45rem, 2.4vw, 1.9rem);
      line-height: 1.2;
    }

    .featured h3 a {
      text-decoration: none;
      color: var(--primary-deep);
    }

    .featured h3 a:hover {
      color: var(--teal);
    }

    .featured p {
      margin: 0;
      color: var(--muted);
      font-size: 0.98rem;
    }

    .compact {
      border-bottom: 1px solid var(--line);
    }

    .compact:last-child {
      border-bottom: 0;
    }

    .compact-link {
      display: grid;
      grid-template-columns: 7.5rem 1fr;
      gap: 1rem;
      padding: 1rem 0;
      text-decoration: none;
      color: inherit;
    }

    .thumb {
      overflow: hidden;
      aspect-ratio: 4 / 3;
      background: var(--secondary);
    }

    .compact-body h3 {
      margin: 0.35rem 0 0;
      font-family: var(--font-serif);
      font-size: 1.05rem;
      line-height: 1.3;
      color: var(--primary-deep);
      font-weight: 700;
    }

    .compact-link:hover h3 {
      color: var(--teal);
    }

    @media (max-width: 480px) {
      .compact-link {
        grid-template-columns: 5.5rem 1fr;
        gap: 0.75rem;
      }
    }
  `,
})
export class NewsCardComponent {
  @Input({ required: true }) article!: NewsArticle;
  @Input() featured = false;
}
