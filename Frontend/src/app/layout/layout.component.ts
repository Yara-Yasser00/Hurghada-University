import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  LucideBell,
  LucideBookOpen,
  LucideBuilding2,
  LucideCalendarDays,
  LucideChevronLeft,
  LucideClipboardCheck,
  LucideFileCheck2,
  LucideGraduationCap,
  LucideGrid2x2,
  LucideGlobe,
  LucideHome,
  LucideLogOut,
  LucideMegaphone,
  LucideMenu,
  LucideSearch,
  LucideSettings,
  LucideShieldCheck,
  LucideUserRound,
  LucideUsersRound,
  LucideWallet,
  LucideWalletCards,
  LucideX,
} from '@lucide/angular';
import { AuthService, PortalRole } from '../core/auth.service';
import { I18nService } from '../core/i18n.service';
import { TranslatePipe } from '../core/translate.pipe';
import { NotificationService } from '../core/notification.service';

const portals = {
  student: {
    labelKey: 'portal.student',
    nav: [
      ['overview', 'nav.home'],
      ['courses', 'nav.myCourses'],
      ['schedule', 'nav.schedule'],
      ['grades', 'nav.grades'],
      ['absences', 'nav.attendance'],
      ['fees', 'nav.fees'],
      ['announcements', 'nav.announcements'],
    ] as const,
  },
  instructor: {
    labelKey: 'portal.instructor',
    nav: [
      ['overview', 'nav.home'],
      ['courses', 'nav.myCourses'],
      ['grades', 'nav.gradeEntry'],
      ['schedule', 'nav.schedule'],
      ['absences', 'nav.attendance'],
      ['announcements', 'nav.announcements'],
    ] as const,
  },
  admin: {
    labelKey: 'portal.admin',
    nav: [
      ['overview', 'nav.home'],
      ['faculties', 'nav.faculties'],
      ['departments', 'nav.departments'],
      ['admins', 'nav.admins'],
      ['students', 'nav.students'],
      ['courses', 'nav.courseCatalog'],
      ['exams', 'nav.exams'],
      ['registration', 'nav.registration'],
      ['cms', 'nav.cms'],
      ['announcements', 'nav.announcements'],
    ] as const,
  },
  hr: {
    labelKey: 'portal.hr',
    nav: [
      ['overview', 'nav.home'],
      ['staff', 'nav.staff'],
      ['payroll', 'nav.payroll'],
      ['announcements', 'nav.announcements'],
    ] as const,
  },
} as const;

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideBell,
    LucideBookOpen,
    LucideBuilding2,
    LucideCalendarDays,
    LucideChevronLeft,
    LucideClipboardCheck,
    LucideFileCheck2,
    LucideGraduationCap,
    LucideGrid2x2,
    LucideGlobe,
    LucideHome,
    LucideLogOut,
    LucideMegaphone,
    LucideMenu,
    LucideSearch,
    LucideSettings,
    LucideShieldCheck,
    LucideUserRound,
    LucideUsersRound,
    LucideWallet,
    LucideWalletCards,
    LucideX,
    TranslatePipe,
  ],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  auth = inject(AuthService);
  i18n = inject(I18nService);
  notifications = inject(NotificationService);
  readonly publicSiteUrl = environment.publicSiteUrl || '/';

  collapsed = signal(false);
  mobileOpen = signal(false);
  notifOpen = signal(false);
  contentEntering = signal(true);

  constructor() {
    void this.notifications.ensureLoaded();

    effect(() => {
      this.currentLabel();
      this.i18n.lang();
      document.title = `${this.currentLabel()} · HU Portal`;
    });

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.contentEntering.set(false);
        requestAnimationFrame(() => {
          this.contentEntering.set(true);
          document.getElementById('portal-main')?.focus({ preventScroll: true });
        });
      });
  }

  private url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  role = toSignal(
    this.route.data.pipe(map((d) => d['role'] as PortalRole)),
    { initialValue: (this.route.snapshot.data['role'] as PortalRole) || 'admin' }
  );

  portal = computed(() => portals[this.role()]);
  portalLabel = computed(() => {
    this.i18n.lang();
    return this.i18n.t(this.portal().labelKey);
  });
  displayName = computed(() => this.auth.user()?.name || this.portalLabel());

  pathSegment = computed(() => {
    const parts = this.url().split('/').filter(Boolean);
    return parts[1] || 'overview';
  });

  segment = computed(() => {
    const seg = this.pathSegment();
    return seg === 'college-admins' ? 'admins' : seg;
  });

  currentLabel = computed(() => {
    this.i18n.lang();
    const found = this.portal().nav.find(([key]) => key === this.segment());
    return this.i18n.t(found?.[1] || 'nav.home');
  });

  initials = computed(() =>
    this.displayName()
      .split(' ')
      .slice(0, 2)
      .map((v) => v[0])
      .join('')
  );

  navTo(key: string): string {
    const role = this.role();
    if (key === 'overview') return `/${role}`;
    const path = key === 'admins' ? 'college-admins' : key;
    return `/${role}/${path}`;
  }

  toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
  }

  toggleMobile(open?: boolean): void {
    this.mobileOpen.update((v) => (open === undefined ? !v : open));
  }

  toggleNotif(): void {
    this.notifOpen.update((v) => !v);
  }

  openNotification(id: string, href?: string): void {
    this.notifications.markRead(id);
    this.notifOpen.set(false);
    if (href && href.startsWith(`/${this.role()}`)) {
      this.router.navigateByUrl(href);
    } else {
      this.router.navigateByUrl(`/${this.role()}/announcements`);
    }
  }

  signOut(): void {
    this.auth.logout();
  }
}
