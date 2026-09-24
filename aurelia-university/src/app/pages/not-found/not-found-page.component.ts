import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <section class="au-section">
      <div class="au-container box">
        <p class="au-eyebrow">404</p>
        <h1>{{ 'pages.notFound.title' | translate }}</h1>
        <p>{{ 'pages.notFound.lede' | translate }}</p>
        <div class="actions">
          <a class="au-btn au-btn-primary" routerLink="/">{{ 'pages.notFound.home' | translate }}</a>
          <a class="au-btn au-btn-dark" routerLink="/faculties">{{ 'nav.faculties' | translate }}</a>
          <a class="au-btn au-btn-dark" routerLink="/contact">{{ 'common.contact' | translate }}</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .box { max-width: 36rem; }
    h1 { margin: 0 0 1rem; font-family: var(--font-serif); font-size: clamp(2rem, 4vw, 2.8rem); color: var(--primary-deep); }
    p { margin: 0 0 1.5rem; color: var(--muted); line-height: 1.7; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; }
  `,
})
export class NotFoundPageComponent {}
