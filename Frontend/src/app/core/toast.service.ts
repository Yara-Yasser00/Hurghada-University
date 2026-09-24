import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  kind: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  detail?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly messages = signal<ToastMessage[]>([]);

  show(kind: ToastMessage['kind'], title: string, detail?: string): void {
    const id = ++this.seq;
    this.messages.update((list) => [...list, { id, kind, title, detail }]);
    setTimeout(() => this.dismiss(id), 3500);
  }

  success(title: string, detail?: string): void {
    this.show('success', title, detail);
  }

  warning(title: string, detail?: string): void {
    this.show('warning', title, detail);
  }

  danger(title: string, detail?: string): void {
    this.show('danger', title, detail);
  }

  info(title: string, detail?: string): void {
    this.show('info', title, detail);
  }

  dismiss(id: number): void {
    this.messages.update((list) => list.filter((m) => m.id !== id));
  }
}
