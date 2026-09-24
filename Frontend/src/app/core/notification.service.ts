import { Injectable, computed, inject, signal } from '@angular/core';
import { UniversityApiService } from './university-api.service';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(UniversityApiService);
  readonly items = signal<AppNotification[]>([]);
  readonly unreadCount = computed(() => this.items().filter((n) => !n.read).length);
  private loaded = false;

  async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    try {
      const list = await this.api.getNotifications();
      this.items.set(
        list.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          time: formatRelative(n.createdAtUtc),
          read: n.isRead,
          href: n.href || undefined,
        }))
      );
      this.loaded = true;
    } catch {
      /* keep empty when offline / unauthorized */
    }
  }

  async markRead(id: string): Promise<void> {
    this.items.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await this.api.markNotificationRead(id);
    } catch {
      /* ignore */
    }
  }

  async markAllRead(): Promise<void> {
    this.items.update((list) => list.map((n) => ({ ...n, read: true })));
    try {
      await this.api.markAllNotificationsRead();
    } catch {
      /* ignore */
    }
  }
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}
