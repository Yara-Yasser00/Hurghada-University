import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideArrowUpRight, LucideMoreHorizontal } from '@lucide/angular';
import { TranslatePipe } from '../core/translate.pipe';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="page-header">
      <div>
        @if (eyebrow) {
          <span class="eyebrow">{{ eyebrow | translate }}</span>
        }
        <h2>{{ title | translate }}</h2>
        <p>{{ subtitle | translate }}</p>
      </div>
      <ng-content />
    </div>
  `,
})
export class PageHeaderComponent {
  @Input() eyebrow = '';
  @Input({ required: true }) title!: string;
  @Input({ required: true }) subtitle!: string;
}

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, LucideArrowUpRight, TranslatePipe],
  template: `
    <div class="stat-card" [class.gold]="tone === 'gold'" [class.alert]="tone === 'alert'">
      <div class="stat-icon"><ng-content select="[icon]" /></div>
      <div class="stat-copy">
        <span>{{ label | translate }}</span>
        <strong>{{ value }}</strong>
        <small>{{ note | translate }}</small>
      </div>
      <svg lucideArrowUpRight class="stat-arrow flip-rtl" [size]="17"></svg>
    </div>
  `,
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string;
  @Input({ required: true }) note!: string;
  @Input() tone = '';
}

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule, LucideMoreHorizontal, TranslatePipe],
  template: `
    <section class="panel" [class]="className ? 'panel ' + className : 'panel'">
      <div class="panel-head">
        <div>
          <h3>{{ title | translate }}</h3>
          @if (subtitle) {
            <p>{{ subtitle | translate }}</p>
          }
        </div>
        <ng-content select="[actions]" />
        @if (!hasActions) {
          <button class="more" type="button" [attr.aria-label]="'common.more' | translate">
            <svg lucideMoreHorizontal [size]="19"></svg>
          </button>
        }
      </div>
      <ng-content />
    </section>
  `,
})
export class PanelComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle = '';
  @Input() className = '';
  @Input() hasActions = false;
}

@Component({
  selector: 'app-progress',
  standalone: true,
  template: `
    <div class="progress">
      <span [style.width.%]="value" [class.warning]="warning"></span>
    </div>
  `,
})
export class ProgressComponent {
  @Input({ required: true }) value!: number;
  @Input() warning = false;
}

@Component({
  selector: 'app-status',
  standalone: true,
  template: `
    <span class="status {{ kind }}"><i></i><ng-content /></span>
  `,
})
export class StatusComponent {
  @Input() kind: 'success' | 'warning' | 'neutral' | 'danger' = 'success';
}
