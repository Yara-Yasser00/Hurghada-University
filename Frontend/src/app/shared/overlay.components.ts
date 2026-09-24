import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { TranslatePipe } from '../core/translate.pipe';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [LucideX, TranslatePipe],
  template: `
    @if (open) {
      <button class="drawer-scrim" type="button" [attr.aria-label]="'common.cancel' | translate" (click)="closed.emit()"></button>
      <aside class="drawer-panel" role="dialog" aria-modal="true">
        <header class="drawer-head">
          <div>
            @if (eyebrow) {
              <span class="eyebrow">{{ eyebrow | translate }}</span>
            }
            <h3>{{ title | translate }}</h3>
            @if (subtitle) {
              <p>{{ subtitle | translate }}</p>
            }
          </div>
          <button class="icon-button" type="button" (click)="closed.emit()" [attr.aria-label]="'common.cancel' | translate">
            <svg lucideX [size]="18"></svg>
          </button>
        </header>
        <div class="drawer-body"><ng-content /></div>
        <footer class="drawer-foot"><ng-content select="[actions]" /></footer>
      </aside>
    }
  `,
})
export class DrawerComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() eyebrow = '';
  @Output() closed = new EventEmitter<void>();
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [LucideX, TranslatePipe],
  template: `
    @if (open) {
      <button class="modal-scrim" type="button" [attr.aria-label]="'common.cancel' | translate" (click)="closed.emit()"></button>
      <div class="modal-panel" role="dialog" aria-modal="true">
        <header class="modal-head">
          <div>
            <h3>{{ title | translate }}</h3>
            @if (subtitle) {
              <p>{{ subtitle | translate }}</p>
            }
          </div>
          <button class="icon-button" type="button" (click)="closed.emit()" [attr.aria-label]="'common.cancel' | translate">
            <svg lucideX [size]="18"></svg>
          </button>
        </header>
        <div class="modal-body"><ng-content /></div>
        <footer class="modal-foot"><ng-content select="[actions]" /></footer>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Output() closed = new EventEmitter<void>();
}
