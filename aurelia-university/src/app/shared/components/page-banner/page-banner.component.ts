import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-banner',
  standalone: true,
  template: `
    <section class="banner" [class.banner--media]="!!image" [attr.aria-label]="ariaLabel || 'Page'">
      @if (image) {
        <div class="banner__media" aria-hidden="true">
          <img [src]="image" alt="" width="1600" height="640" />
        </div>
      }
      <div class="banner__inner au-container">
        @if (eyebrow) {
          <p class="au-eyebrow">{{ eyebrow }}</p>
        }
        <h1>{{ title }}</h1>
        @if (lede) {
          <p class="lede">{{ lede }}</p>
        }
        <ng-content />
      </div>
    </section>
  `,
  styles: `
    .banner {
      position: relative;
      overflow: hidden;
      background: var(--secondary);
      border-bottom: 1px solid var(--line);
      padding: clamp(2.75rem, 6vw, 4.5rem) 0;
    }

    .banner--media {
      color: #fff;
      min-height: clamp(220px, 36vh, 340px);
      display: flex;
      align-items: flex-end;
      padding: 0;
      border-bottom: 0;
    }

    .banner__media {
      position: absolute;
      inset: 0;
    }

    .banner__media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scale(1.03);
    }

    .banner__media::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        105deg,
        rgba(6, 50, 71, 0.92) 0%,
        rgba(6, 50, 71, 0.72) 45%,
        rgba(10, 77, 110, 0.45) 100%
      );
    }

    .banner__inner {
      position: relative;
      z-index: 1;
      padding-block: clamp(2.5rem, 6vw, 4rem);
      max-width: min(var(--container-width), calc(100% - 2rem));
    }

    .banner--media .au-eyebrow {
      color: var(--accent-soft);
    }

    h1 {
      margin: 0;
      font-family: var(--font-serif);
      font-size: clamp(1.9rem, 4.2vw, 2.85rem);
      line-height: 1.2;
      color: var(--primary-deep);
      max-width: 40rem;
    }

    .banner--media h1 {
      color: #fff;
    }

    .lede {
      margin: 0.85rem 0 0;
      max-width: 40rem;
      color: var(--muted);
      font-size: 1.08rem;
      line-height: 1.65;
    }

    .banner--media .lede {
      color: rgba(255, 255, 255, 0.88);
    }
  `,
})
export class PageBannerComponent {
  @Input() eyebrow = '';
  @Input({ required: true }) title!: string;
  @Input() lede = '';
  @Input() image = '';
  @Input() ariaLabel = '';
}
