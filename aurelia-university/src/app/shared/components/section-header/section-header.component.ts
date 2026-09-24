import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  template: `
    <header class="head" [class.center]="align === 'center'">
      @if (eyebrow) {
        <p class="au-eyebrow">{{ eyebrow }}</p>
      }
      <h2>{{ title }}</h2>
      @if (subtitle) {
        <p class="sub">{{ subtitle }}</p>
      }
    </header>
  `,
  styles: `
    .head { max-width: 40rem; margin-bottom: 2rem; }
    .head.center { margin-inline: auto; text-align: center; }
    h2 { margin: 0 0 .65rem; font-family: var(--font-serif); font-size: clamp(1.85rem, 3.5vw, 2.6rem); color: var(--primary-deep); line-height: 1.15; font-weight: 700; }
    .sub { margin: 0; color: var(--muted); font-size: 1.05rem; line-height: 1.55; }
    :host-context(.home-research) h2,
    :host-context(.dark) h2 { color: #fff; }
    :host-context(.home-research) .sub,
    :host-context(.dark) .sub { color: rgba(255,255,255,.78); }
    :host-context(.home-research) .au-eyebrow,
    :host-context(.dark) .au-eyebrow { color: var(--accent-soft); }
  `,
})
export class SectionHeaderComponent {
  @Input() eyebrow = '';
  @Input({ required: true }) title!: string;
  @Input() subtitle = '';
  @Input() align: 'left' | 'center' = 'left';
}
