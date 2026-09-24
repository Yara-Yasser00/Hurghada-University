import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  template: `
    <div class="toast-host" aria-live="polite">
      @for (t of toast.messages(); track t.id) {
        <div class="toast" [class]="t.kind">
          <div>
            <strong>{{ t.title }}</strong>
            @if (t.detail) {
              <p>{{ t.detail }}</p>
            }
          </div>
          <button type="button" (click)="toast.dismiss(t.id)" aria-label="Dismiss">×</button>
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  toast = inject(ToastService);
}
