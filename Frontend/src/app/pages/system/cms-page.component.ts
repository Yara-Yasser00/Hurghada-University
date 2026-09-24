import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideCalendarDays,
  LucideGlobe,
  LucideNewspaper,
  LucidePlus,
  LucideSave,
  LucideTrash2,
} from '@lucide/angular';
import { ToastService } from '../../core/toast.service';
import {
  ApiSiteEvent,
  ApiSiteNews,
  ApiSiteProfile,
  UniversityApiService,
} from '../../core/university-api.service';
import { PageHeaderComponent, PanelComponent } from '../../shared/ui.components';
import { ImageUploadComponent } from '../../shared/image-upload.component';

type CmsTab = 'profile' | 'news' | 'events';

@Component({
  selector: 'app-cms-page',
  standalone: true,
  imports: [
    FormsModule,
    PageHeaderComponent,
    PanelComponent,
    LucideGlobe,
    LucideNewspaper,
    LucideCalendarDays,
    LucidePlus,
    LucideSave,
    LucideTrash2,
    ImageUploadComponent,
  ],
  template: `
    <app-page-header
      eyebrow="pages.cms.eyebrow"
      title="pages.cms.title"
      subtitle="pages.cms.subtitle"
    />

    <div class="cms-tabs">
      <button type="button" [class.active]="tab() === 'profile'" (click)="tab.set('profile')">
        <svg lucideGlobe [size]="16"></svg> Profile
      </button>
      <button type="button" [class.active]="tab() === 'news'" (click)="tab.set('news')">
        <svg lucideNewspaper [size]="16"></svg> News
      </button>
      <button type="button" [class.active]="tab() === 'events'" (click)="tab.set('events')">
        <svg lucideCalendarDays [size]="16"></svg> Events
      </button>
    </div>

    @if (tab() === 'profile' && profile()) {
      <app-panel title="pages.cms.profile" subtitle="pages.cms.profileSub">
        <div class="form-grid">
          <label><span>Brand (AR)</span><input [(ngModel)]="profile()!.brandNameAr" /></label>
          <label><span>Brand (EN)</span><input [(ngModel)]="profile()!.brandNameEn" /></label>
          <label class="full"><span>Tagline (AR)</span><input [(ngModel)]="profile()!.tagline" /></label>
          <label class="full"><span>Tagline (EN)</span><input [(ngModel)]="profile()!.taglineEn" /></label>
          <label class="full"><span>About intro (AR)</span><textarea rows="4" [(ngModel)]="profile()!.aboutIntro"></textarea></label>
          <label class="full"><span>About intro (EN)</span><textarea rows="4" [(ngModel)]="profile()!.aboutIntroEn"></textarea></label>
          <label class="full"><span>Address (AR, one line per row)</span><textarea rows="4" [(ngModel)]="profile()!.addressLines"></textarea></label>
          <label class="full"><span>Address (EN, one line per row)</span><textarea rows="4" [(ngModel)]="profile()!.addressLinesEn"></textarea></label>
          <label><span>Phone</span><input [(ngModel)]="profile()!.phone" /></label>
          <label><span>Email</span><input [(ngModel)]="profile()!.email" /></label>
          <label><span>Website</span><input [(ngModel)]="profile()!.website" /></label>
          <div class="full">
            <span style="display:block;margin-bottom:0.4rem;font-weight:600">Hero image</span>
            <app-image-upload
              label="Homepage hero"
              [value]="profile()!.heroImageUrl"
              (valueChange)="setProfileField('heroImageUrl', $event)"
            />
          </div>
          <div class="full">
            <span style="display:block;margin-bottom:0.4rem;font-weight:600">Campus / global image</span>
            <app-image-upload
              label="Campus image"
              [value]="profile()!.globalImageUrl"
              (valueChange)="setProfileField('globalImageUrl', $event)"
            />
          </div>
          <label><span>President name</span><input [(ngModel)]="profile()!.presidentName" /></label>
          <label><span>President title (AR)</span><input [(ngModel)]="profile()!.presidentTitle" /></label>
          <label><span>President title (EN)</span><input [(ngModel)]="profile()!.presidentTitleEn" /></label>
        </div>
        <div class="drawer-actions" style="margin-top:16px">
          <button class="primary-button" type="button" (click)="saveProfile()">
            <svg lucideSave [size]="17"></svg> Save profile
          </button>
        </div>
      </app-panel>
    }

    @if (tab() === 'news') {
      <app-panel title="pages.cms.news" subtitle="pages.cms.newsSub">
        <div class="drawer-actions" style="margin-bottom:16px">
          <button class="primary-button" type="button" (click)="creatingNews.set(true); editingNewsId.set(null); resetNewsDraft()">
            <svg lucidePlus [size]="17"></svg> Add news
          </button>
        </div>
        @if (creatingNews() || editingNewsId()) {
          <div class="form-grid" style="margin-bottom:20px">
            <label><span>Category (AR)</span><input [(ngModel)]="newsDraft.category" /></label>
            <label><span>Category (EN)</span><input [(ngModel)]="newsDraft.categoryEn" /></label>
            <label><span>Date label</span><input [(ngModel)]="newsDraft.publishedLabel" /></label>
            <label class="full"><span>Title (AR)</span><input [(ngModel)]="newsDraft.title" /></label>
            <label class="full"><span>Title (EN)</span><input [(ngModel)]="newsDraft.titleEn" /></label>
            <label class="full"><span>Summary (AR)</span><textarea rows="3" [(ngModel)]="newsDraft.summary"></textarea></label>
            <label class="full"><span>Summary (EN)</span><textarea rows="3" [(ngModel)]="newsDraft.summaryEn"></textarea></label>
            <div class="full">
              <span style="display:block;margin-bottom:0.4rem;font-weight:600">News image</span>
              <app-image-upload
                label="News cover"
                [value]="newsDraft.imageUrl"
                (valueChange)="newsDraft.imageUrl = $event"
              />
            </div>
            <label><span>Featured</span><input type="checkbox" [(ngModel)]="newsDraft.isFeatured" /></label>
            <label><span>Sort</span><input type="number" [(ngModel)]="newsDraft.sortOrder" /></label>
            @if (editingNewsId()) {
              <label><span>Published</span><input type="checkbox" [(ngModel)]="newsDraft.isPublished" /></label>
            }
          </div>
          <div class="drawer-actions" style="margin-bottom:20px">
            <button class="secondary-button" type="button" (click)="cancelNewsForm()">Cancel</button>
            <button class="primary-button" type="button" (click)="saveNews()">
              {{ editingNewsId() ? 'Save changes' : 'Publish' }}
            </button>
          </div>
        }
        <div class="announce-list">
          @for (n of news(); track n.id) {
            <article class="announce-card">
              <div>
                <strong>{{ n.title }}</strong>
                <p>{{ n.summary }}</p>
                <small>{{ n.category }} · {{ n.publishedLabel }} · {{ n.isPublished ? 'Published' : 'Hidden' }}</small>
              </div>
              <button class="text-button" type="button" (click)="startEditNews(n)">Edit</button>
              <button class="text-button" type="button" (click)="toggleNews(n)">
                {{ n.isPublished ? 'Hide' : 'Show' }}
              </button>
              <button class="text-button" type="button" (click)="removeNews(n.id)">
                <svg lucideTrash2 [size]="16"></svg>
              </button>
            </article>
          }
        </div>
      </app-panel>
    }

    @if (tab() === 'events') {
      <app-panel title="pages.cms.events" subtitle="pages.cms.eventsSub">
        <div class="drawer-actions" style="margin-bottom:16px">
          <button class="primary-button" type="button" (click)="creatingEvent.set(true); editingEventId.set(null); resetEventDraft()">
            <svg lucidePlus [size]="17"></svg> Add event
          </button>
        </div>
        @if (creatingEvent() || editingEventId()) {
          <div class="form-grid" style="margin-bottom:20px">
            <label><span>Day</span><input [(ngModel)]="eventDraft.day" /></label>
            <label><span>Month (AR)</span><input [(ngModel)]="eventDraft.month" /></label>
            <label><span>Month (EN)</span><input [(ngModel)]="eventDraft.monthEn" /></label>
            <label class="full"><span>Title (AR)</span><input [(ngModel)]="eventDraft.title" /></label>
            <label class="full"><span>Title (EN)</span><input [(ngModel)]="eventDraft.titleEn" /></label>
            <label class="full"><span>Location (AR)</span><input [(ngModel)]="eventDraft.location" /></label>
            <label class="full"><span>Location (EN)</span><input [(ngModel)]="eventDraft.locationEn" /></label>
            <label><span>Category (AR)</span><input [(ngModel)]="eventDraft.category" /></label>
            <label><span>Category (EN)</span><input [(ngModel)]="eventDraft.categoryEn" /></label>
            <label><span>Sort</span><input type="number" [(ngModel)]="eventDraft.sortOrder" /></label>
            @if (editingEventId()) {
              <label><span>Published</span><input type="checkbox" [(ngModel)]="eventDraft.isPublished" /></label>
            }
          </div>
          <div class="drawer-actions" style="margin-bottom:20px">
            <button class="secondary-button" type="button" (click)="cancelEventForm()">Cancel</button>
            <button class="primary-button" type="button" (click)="saveEvent()">
              {{ editingEventId() ? 'Save changes' : 'Publish' }}
            </button>
          </div>
        }
        <div class="announce-list">
          @for (e of events(); track e.id) {
            <article class="announce-card">
              <div>
                <strong>{{ e.day }} {{ e.month }} — {{ e.title }}</strong>
                <p>{{ e.location }}</p>
                <small>{{ e.category }} · {{ e.isPublished ? 'Published' : 'Hidden' }}</small>
              </div>
              <button class="text-button" type="button" (click)="startEditEvent(e)">Edit</button>
              <button class="text-button" type="button" (click)="toggleEvent(e)">
                {{ e.isPublished ? 'Hide' : 'Show' }}
              </button>
              <button class="text-button" type="button" (click)="removeEvent(e.id)">
                <svg lucideTrash2 [size]="16"></svg>
              </button>
            </article>
          }
        </div>
      </app-panel>
    }
  `,
  styles: `
    .cms-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .cms-tabs button {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      border: 1px solid color-mix(in srgb, var(--navy, #0b2a4a) 18%, transparent);
      background: #fff;
      color: inherit;
      padding: 0.55rem 0.9rem;
      border-radius: 0.55rem;
      cursor: pointer;
      font-weight: 600;
    }
    .cms-tabs button.active {
      background: var(--navy, #0b2a4a);
      color: #fff;
      border-color: transparent;
    }
  `,
})
export class CmsPageComponent implements OnInit {
  private api = inject(UniversityApiService);
  private toast = inject(ToastService);

  tab = signal<CmsTab>('profile');
  profile = signal<ApiSiteProfile | null>(null);
  news = signal<ApiSiteNews[]>([]);
  events = signal<ApiSiteEvent[]>([]);
  creatingNews = signal(false);
  creatingEvent = signal(false);
  editingNewsId = signal<string | null>(null);
  editingEventId = signal<string | null>(null);

  newsDraft = {
    category: 'أخبار',
    categoryEn: '',
    title: '',
    titleEn: '',
    summary: '',
    summaryEn: '',
    imageUrl: '',
    publishedLabel: String(new Date().getFullYear()),
    isFeatured: false,
    isPublished: true,
    sortOrder: 0,
  };

  eventDraft = {
    day: '01',
    month: 'أبر',
    monthEn: '',
    title: '',
    titleEn: '',
    location: 'جامعة الغردقة',
    locationEn: '',
    category: 'فعالية',
    categoryEn: '',
    isPublished: true,
    sortOrder: 0,
  };

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  setProfileField(key: keyof ApiSiteProfile, value: string): void {
    this.profile.update((p) => (p ? { ...p, [key]: value } : p));
  }

  private async reload(): Promise<void> {
    try {
      const [profile, news, events] = await Promise.all([
        this.api.getCmsProfile(),
        this.api.getCmsNews(),
        this.api.getCmsEvents(),
      ]);
      this.profile.set(profile);
      this.news.set(news);
      this.events.set(events);
    } catch {
      this.toast.warning('Could not load CMS', 'Check API connection and admin login.');
    }
  }

  async saveProfile(): Promise<void> {
    const p = this.profile();
    if (!p) return;
    try {
      const saved = await this.api.updateCmsProfile({
        brandNameAr: p.brandNameAr,
        brandNameEn: p.brandNameEn,
        tagline: p.tagline,
        taglineEn: p.taglineEn ?? '',
        aboutIntro: p.aboutIntro,
        aboutIntroEn: p.aboutIntroEn ?? '',
        addressLines: p.addressLines,
        addressLinesEn: p.addressLinesEn ?? '',
        phone: p.phone,
        email: p.email,
        website: p.website,
        heroImageUrl: p.heroImageUrl,
        globalImageUrl: p.globalImageUrl,
        presidentName: p.presidentName,
        presidentTitle: p.presidentTitle,
        presidentTitleEn: p.presidentTitleEn ?? '',
      });
      this.profile.set(saved);
      this.toast.success('Website profile saved');
    } catch {
      this.toast.warning('Save failed', 'Check API connection and try again.');
    }
  }

  async createNews(): Promise<void> {
    await this.saveNews();
  }

  resetNewsDraft(): void {
    this.newsDraft = {
      category: 'أخبار',
      categoryEn: '',
      title: '',
      titleEn: '',
      summary: '',
      summaryEn: '',
      imageUrl: '',
      publishedLabel: String(new Date().getFullYear()),
      isFeatured: false,
      isPublished: true,
      sortOrder: 0,
    };
  }

  startEditNews(n: ApiSiteNews): void {
    this.creatingNews.set(false);
    this.editingNewsId.set(n.id);
    this.newsDraft = {
      category: n.category,
      categoryEn: n.categoryEn ?? '',
      title: n.title,
      titleEn: n.titleEn ?? '',
      summary: n.summary,
      summaryEn: n.summaryEn ?? '',
      imageUrl: n.imageUrl,
      publishedLabel: n.publishedLabel,
      isFeatured: n.isFeatured,
      isPublished: n.isPublished,
      sortOrder: n.sortOrder,
    };
  }

  cancelNewsForm(): void {
    this.creatingNews.set(false);
    this.editingNewsId.set(null);
    this.resetNewsDraft();
  }

  private newsPayload() {
    return {
      category: this.newsDraft.category,
      categoryEn: this.newsDraft.categoryEn,
      title: this.newsDraft.title,
      titleEn: this.newsDraft.titleEn,
      summary: this.newsDraft.summary,
      summaryEn: this.newsDraft.summaryEn,
      imageUrl: this.newsDraft.imageUrl,
      publishedLabel: this.newsDraft.publishedLabel,
      isFeatured: this.newsDraft.isFeatured,
      sortOrder: this.newsDraft.sortOrder,
    };
  }

  async saveNews(): Promise<void> {
    if (!this.newsDraft.title.trim()) {
      this.toast.warning('Title is required');
      return;
    }
    try {
      const id = this.editingNewsId();
      if (id) {
        const updated = await this.api.updateCmsNews(id, {
          ...this.newsPayload(),
          isPublished: this.newsDraft.isPublished,
        });
        this.news.update((list) => list.map((x) => (x.id === id ? updated : x)));
        this.toast.success('News updated');
      } else {
        const created = await this.api.createCmsNews(this.newsPayload());
        this.news.update((list) => [created, ...list]);
        this.toast.success('News published to website');
      }
      this.cancelNewsForm();
    } catch {
      this.toast.warning('Could not save news');
    }
  }

  async removeNews(id: string): Promise<void> {
    try {
      await this.api.deleteCmsNews(id);
      this.news.update((list) => list.filter((n) => n.id !== id));
      this.toast.info('News removed');
    } catch {
      this.toast.warning('Could not remove news');
    }
  }

  async toggleNews(n: ApiSiteNews): Promise<void> {
    try {
      const updated = await this.api.updateCmsNews(n.id, {
        category: n.category,
        categoryEn: n.categoryEn ?? '',
        title: n.title,
        titleEn: n.titleEn ?? '',
        summary: n.summary,
        summaryEn: n.summaryEn ?? '',
        imageUrl: n.imageUrl,
        publishedLabel: n.publishedLabel,
        isFeatured: n.isFeatured,
        isPublished: !n.isPublished,
        sortOrder: n.sortOrder,
      });
      this.news.update((list) => list.map((x) => (x.id === n.id ? updated : x)));
      this.toast.success(updated.isPublished ? 'News published' : 'News hidden');
    } catch {
      this.toast.warning('Could not update news');
    }
  }

  async createEvent(): Promise<void> {
    await this.saveEvent();
  }

  resetEventDraft(): void {
    this.eventDraft = {
      day: '01',
      month: 'أبر',
      monthEn: '',
      title: '',
      titleEn: '',
      location: 'جامعة الغردقة',
      locationEn: '',
      category: 'فعالية',
      categoryEn: '',
      isPublished: true,
      sortOrder: 0,
    };
  }

  startEditEvent(e: ApiSiteEvent): void {
    this.creatingEvent.set(false);
    this.editingEventId.set(e.id);
    this.eventDraft = {
      day: e.day,
      month: e.month,
      monthEn: e.monthEn ?? '',
      title: e.title,
      titleEn: e.titleEn ?? '',
      location: e.location,
      locationEn: e.locationEn ?? '',
      category: e.category,
      categoryEn: e.categoryEn ?? '',
      isPublished: e.isPublished,
      sortOrder: e.sortOrder,
    };
  }

  cancelEventForm(): void {
    this.creatingEvent.set(false);
    this.editingEventId.set(null);
    this.resetEventDraft();
  }

  private eventPayload() {
    return {
      day: this.eventDraft.day,
      month: this.eventDraft.month,
      monthEn: this.eventDraft.monthEn,
      title: this.eventDraft.title,
      titleEn: this.eventDraft.titleEn,
      location: this.eventDraft.location,
      locationEn: this.eventDraft.locationEn,
      category: this.eventDraft.category,
      categoryEn: this.eventDraft.categoryEn,
      sortOrder: this.eventDraft.sortOrder,
    };
  }

  async saveEvent(): Promise<void> {
    if (!this.eventDraft.title.trim()) {
      this.toast.warning('Title is required');
      return;
    }
    try {
      const id = this.editingEventId();
      if (id) {
        const updated = await this.api.updateCmsEvent(id, {
          ...this.eventPayload(),
          isPublished: this.eventDraft.isPublished,
        });
        this.events.update((list) => list.map((x) => (x.id === id ? updated : x)));
        this.toast.success('Event updated');
      } else {
        const created = await this.api.createCmsEvent(this.eventPayload());
        this.events.update((list) => [created, ...list]);
        this.toast.success('Event published to website');
      }
      this.cancelEventForm();
    } catch {
      this.toast.warning('Could not save event');
    }
  }

  async removeEvent(id: string): Promise<void> {
    try {
      await this.api.deleteCmsEvent(id);
      this.events.update((list) => list.filter((e) => e.id !== id));
      this.toast.info('Event removed');
    } catch {
      this.toast.warning('Could not remove event');
    }
  }

  async toggleEvent(e: ApiSiteEvent): Promise<void> {
    try {
      const updated = await this.api.updateCmsEvent(e.id, {
        day: e.day,
        month: e.month,
        monthEn: e.monthEn ?? '',
        title: e.title,
        titleEn: e.titleEn ?? '',
        location: e.location,
        locationEn: e.locationEn ?? '',
        category: e.category,
        categoryEn: e.categoryEn ?? '',
        isPublished: !e.isPublished,
        sortOrder: e.sortOrder,
      });
      this.events.update((list) => list.map((x) => (x.id === e.id ? updated : x)));
      this.toast.success(updated.isPublished ? 'Event published' : 'Event hidden');
    } catch {
      this.toast.warning('Could not update event');
    }
  }
}
