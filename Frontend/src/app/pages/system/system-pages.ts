import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideBell, LucideCheck, LucideMegaphone, LucidePlus, LucideWallet } from '@lucide/angular';
import { AuthService } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import { NotificationService } from '../../core/notification.service';
import { ToastService } from '../../core/toast.service';
import { UniversityStore } from '../../core/university-store.service';
import { environment } from '../../../environments/environment';
import { PageHeaderComponent, PanelComponent, StatusComponent } from '../../shared/ui.components';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, PanelComponent, TranslatePipe],
  template: `
    <app-page-header
      eyebrow="ACCOUNT"
      title="settings.title"
      subtitle="settings.subtitle"
    />
    <div class="settings-grid">
      <app-panel title="settings.languageTitle" subtitle="settings.languageSubtitle">
        <div class="settings-row">
          <div>
            <strong>{{ 'settings.displayLanguage' | translate }}</strong>
            <small>{{ 'settings.currently' | translate }} {{ i18n.lang() === 'AR' ? ('settings.arabic' | translate) : ('settings.english' | translate) }}</small>
          </div>
          <button class="secondary-button" type="button" (click)="i18n.toggle()">
            {{ i18n.lang() === 'EN' ? ('settings.switchToAr' | translate) : ('settings.switchToEn' | translate) }}
          </button>
        </div>
      </app-panel>
      <app-panel title="settings.notificationsTitle" subtitle="settings.notificationsSubtitle">
        <label class="settings-check"><input type="checkbox" [(ngModel)]="emailAlerts" /> {{ 'settings.emailAlerts' | translate }}</label>
        <label class="settings-check"><input type="checkbox" [(ngModel)]="examAlerts" /> {{ 'settings.examAlerts' | translate }}</label>
        <label class="settings-check"><input type="checkbox" [(ngModel)]="gradeAlerts" /> {{ 'settings.gradeAlerts' | translate }}</label>
        <button class="primary-button" type="button" (click)="save()">{{ 'common.save' | translate }}</button>
      </app-panel>
      <app-panel title="settings.securityTitle" subtitle="settings.securitySubtitle">
        <div class="settings-row">
          <div>
            <strong>{{ 'settings.signedInAs' | translate }}</strong>
            <small>{{ auth.user()?.name }} · {{ auth.user()?.id }}</small>
          </div>
          <button class="secondary-button" type="button" (click)="auth.logout()">{{ 'nav.signOut' | translate }}</button>
        </div>
      </app-panel>
    </div>
  `,
})
export class SettingsPageComponent {
  auth = inject(AuthService);
  i18n = inject(I18nService);
  private toast = inject(ToastService);
  emailAlerts = true;
  examAlerts = true;
  gradeAlerts = true;

  save(): void {
    this.toast.success('Preferences saved');
  }
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [PageHeaderComponent, PanelComponent, StatusComponent],
  template: `
    <app-page-header
      eyebrow="pages.profile.eyebrow"
      title="pages.profile.title"
      subtitle="pages.profile.subtitle"
    />
    <div class="profile-hero">
      <div class="avatar large">{{ initials }}</div>
      <div>
        <h3>{{ auth.user()?.name }}</h3>
        <p>{{ auth.user()?.id }} · {{ auth.user()?.role }}</p>
        <app-status>Verified account</app-status>
      </div>
    </div>
    <app-panel title="pages.profile.contact">
      <dl class="detail-grid">
        <div><dt>University ID</dt><dd>{{ auth.user()?.id }}</dd></div>
        <div><dt>Portal</dt><dd>{{ auth.user()?.role }}</dd></div>
        <div><dt>Email</dt><dd>{{ email }}</dd></div>
        <div><dt>Campus</dt><dd>Hurghada · Red Sea</dd></div>
      </dl>
    </app-panel>
  `,
})
export class ProfilePageComponent {
  auth = inject(AuthService);
  get initials(): string {
    return (this.auth.user()?.name || 'U')
      .split(' ')
      .slice(0, 2)
      .map((v) => v[0])
      .join('');
  }
  get email(): string {
    const id = this.auth.user()?.id || 'user';
    return `${id.toLowerCase()}@hu.edu.eg`;
  }
}

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [PageHeaderComponent, PanelComponent, LucideBell, LucideCheck, TranslatePipe],
  template: `
    <app-page-header
      eyebrow="pages.notifications.eyebrow"
      title="pages.notifications.title"
      subtitle="pages.notifications.subtitle"
    >
      <button class="secondary-button" type="button" (click)="notifications.markAllRead()">
        <svg lucideCheck [size]="16"></svg> {{ 'common.markAllRead' | translate }}
      </button>
    </app-page-header>
    <app-panel title="pages.notifications.recent" [subtitle]="notifications.unreadCount() + ' ' + ('pages.notifications.unread' | translate)">
      <div class="notif-list">
        @for (n of notifications.items(); track n.id) {
          <article [class.unread]="!n.read" (click)="open(n.id, n.href)">
            <span class="notif-icon"><svg lucideBell [size]="16"></svg></span>
            <div>
              <strong>{{ n.title }}</strong>
              <p>{{ n.body }}</p>
              <small>{{ n.time }}</small>
            </div>
          </article>
        }
      </div>
    </app-panel>
  `,
})
export class NotificationsPageComponent {
  notifications = inject(NotificationService);
  private toast = inject(ToastService);

  open(id: string, href?: string): void {
    this.notifications.markRead(id);
    if (href) {
      // navigation handled by routerLink alternative — toast for now if external role mismatch
      this.toast.info('Opened notification');
    }
  }
}

@Component({
  selector: 'app-announcements-page',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, PanelComponent, LucideMegaphone, LucidePlus],
  template: `
    <app-page-header
      eyebrow="pages.announcements.eyebrow"
      title="pages.announcements.title"
      subtitle="pages.announcements.subtitle"
    >
      @if (auth.user()?.role === 'admin') {
        <button class="primary-button" type="button" (click)="startCreate()">
          <svg lucidePlus [size]="17"></svg> New announcement
        </button>
      }
    </app-page-header>
    @if (editing()) {
      <app-panel
        [title]="editingId() ? 'Edit announcement' : 'Compose announcement'"
        subtitle="pages.announcements.visible"
      >
        <div class="form-grid">
          <label><span>Title</span><input [(ngModel)]="draftTitle" /></label>
          <label><span>Audience</span><input [(ngModel)]="draftAudience" /></label>
          <label class="full"><span>Body</span><textarea rows="3" [(ngModel)]="draftBody"></textarea></label>
        </div>
        <div class="drawer-actions" style="margin-top:16px">
          <button class="secondary-button" type="button" (click)="cancelEdit()">Cancel</button>
          <button class="primary-button" type="button" (click)="save()">
            {{ editingId() ? 'Save changes' : 'Publish' }}
          </button>
        </div>
      </app-panel>
    }
    <div class="announce-list">
      @for (a of store.announcements(); track a.id) {
        <article class="announce-card">
          <span class="faculty-icon"><svg lucideMegaphone [size]="17"></svg></span>
          <div>
            <strong>{{ a.title }}</strong>
            <p>{{ a.body }}</p>
            <small>{{ a.audience }} · {{ a.date }}</small>
          </div>
          @if (auth.user()?.role === 'admin') {
            <button class="text-button" type="button" (click)="startEdit(a)">Edit</button>
            <button class="text-button" type="button" (click)="remove(a.id)">Delete</button>
          }
        </article>
      }
    </div>
  `,
})
export class AnnouncementsPageComponent {
  store = inject(UniversityStore);
  auth = inject(AuthService);
  private toast = inject(ToastService);
  editing = signal(false);
  editingId = signal<string | null>(null);
  draftTitle = '';
  draftBody = '';
  draftAudience = 'All students';

  startCreate(): void {
    this.editingId.set(null);
    this.draftTitle = '';
    this.draftBody = '';
    this.draftAudience = 'All students';
    this.editing.set(true);
  }

  startEdit(a: { id: string; title: string; body: string; audience: string }): void {
    this.editingId.set(a.id);
    this.draftTitle = a.title;
    this.draftBody = a.body;
    this.draftAudience = a.audience;
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
    this.editingId.set(null);
  }

  async save(): Promise<void> {
    if (!this.draftTitle.trim()) {
      this.toast.warning('Title is required');
      return;
    }
    try {
      if (this.editingId()) {
        await this.store.updateAnnouncement(this.editingId()!, {
          title: this.draftTitle.trim(),
          body: this.draftBody.trim() || 'No details provided.',
          audience: this.draftAudience.trim() || 'University',
        });
        this.toast.success('Announcement updated');
      } else {
        await this.store.addAnnouncement({
          title: this.draftTitle.trim(),
          body: this.draftBody.trim() || 'No details provided.',
          audience: this.draftAudience.trim() || 'University',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        });
        this.toast.success('Announcement published');
      }
      this.draftTitle = '';
      this.draftBody = '';
      this.cancelEdit();
    } catch {
      this.toast.warning('Could not save', 'Check API connection and try again.');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.store.deleteAnnouncement(id);
      this.toast.info('Announcement removed');
    } catch {
      this.toast.warning('Could not remove', 'Check API connection and try again.');
    }
  }
}

@Component({
  selector: 'app-fees-page',
  standalone: true,
  imports: [PageHeaderComponent, PanelComponent, StatusComponent, LucideWallet],
  template: `
    <app-page-header
      eyebrow="pages.fees.eyebrow"
      title="pages.fees.title"
      subtitle="pages.fees.subtitle"
    />
    <div class="fee-summary">
      <div><span>Tuition</span><b>{{ fee.tuition }}</b></div>
      <div><span>Paid</span><b>{{ fee.paid }}</b></div>
      <div><span>Balance due</span><b>{{ fee.due }}</b></div>
      <div><span>Due date</span><b>{{ fee.dueDate }}</b></div>
    </div>
    <app-panel title="pages.fees.paymentStatus" subtitle="pages.fees.paymentSub">
      <div class="settings-row">
        <div>
          <strong>Current status</strong>
          <small>Pay remaining balance before the deadline to keep registration active.</small>
        </div>
        <app-status [kind]="fee.status === 'Partial' ? 'warning' : 'success'">{{ fee.status }}</app-status>
      </div>
      <button class="primary-button" type="button" (click)="pay()">
        <svg lucideWallet [size]="17"></svg> Pay remaining balance
      </button>
    </app-panel>
  `,
})
export class FeesPageComponent {
  private store = inject(UniversityStore);
  private toast = inject(ToastService);

  get fee() {
    return this.store.feeStatus();
  }

  async pay(): Promise<void> {
    try {
      await this.store.payFees();
      this.toast.success('Payment recorded', 'Your remaining balance is now cleared.');
    } catch {
      this.toast.warning('Payment failed', 'Sign in as the seeded student to pay fees.');
    }
  }
}

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [],
  template: `
    <div class="not-found">
      <span class="eyebrow">404</span>
      <h2>Page not found</h2>
      <p>This route is not part of the Hurghada University portal.</p>
      <a [href]="publicSiteUrl" class="primary-button">Back to university website</a>
    </div>
  `,
})
export class NotFoundPageComponent {
  readonly publicSiteUrl = environment.publicSiteUrl || '/';
}
