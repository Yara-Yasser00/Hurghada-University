import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  LucideArrowRight,
  LucideBuilding2,
  LucideGraduationCap,
  LucideLockKeyhole,
  LucideShieldCheck,
  LucideUsersRound,
} from '@lucide/angular';
import { AuthService, PortalRole } from '../../core/auth.service';
import { I18nService } from '../../core/i18n.service';
import { ToastService } from '../../core/toast.service';
import { TranslatePipe } from '../../core/translate.pipe';
import { environment } from '../../../environments/environment';

type Door = 'student' | 'staff';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    TranslatePipe,
    LucideArrowRight,
    LucideBuilding2,
    LucideGraduationCap,
    LucideLockKeyhole,
    LucideShieldCheck,
    LucideUsersRound,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  readonly i18n = inject(I18nService);
  readonly publicSiteUrl = environment.publicSiteUrl || '/';
  readonly portalHubUrl = `${environment.publicSiteUrl}/portal`;

  door = signal<Door | null>(null);
  selected = signal<PortalRole>('student');
  username = signal('2024010001');
  password = signal('hurghada');
  busy = signal(false);

  private readonly allRoles: {
    id: PortalRole;
    icon: string;
    defaultId: string;
    door: Door;
  }[] = [
    { id: 'student', icon: 'grad', defaultId: '2024010001', door: 'student' },
    { id: 'instructor', icon: 'users', defaultId: 'HU-1028', door: 'staff' },
    { id: 'admin', icon: 'shield', defaultId: 'HU-ADMIN', door: 'staff' },
    { id: 'hr', icon: 'building', defaultId: 'HU-HR01', door: 'staff' },
  ];

  roles = computed(() => {
    this.i18n.lang();
    const d = this.door();
    if (!d) return [];
    return this.allRoles
      .filter((r) => r.door === d)
      .map((r) => ({
        ...r,
        label: this.i18n.t(`login.roles.${r.id}.label`),
        detail: this.i18n.t(`login.roles.${r.id}.detail`),
      }));
  });

  headline = computed(() => {
    this.i18n.lang();
    return this.door() === 'student'
      ? this.i18n.t('login.studentHeadline')
      : this.i18n.t('login.staffHeadline');
  });

  subtitle = computed(() => {
    this.i18n.lang();
    return this.door() === 'student'
      ? this.i18n.t('login.studentSubtitle')
      : this.i18n.t('login.staffSubtitle');
  });

  selectedLabel = computed(() => {
    this.i18n.lang();
    return (
      this.roles().find((r) => r.id === this.selected())?.label ||
      this.i18n.t('login.roles.student.label')
    );
  });

  accessLabel = computed(() => {
    this.i18n.lang();
    return this.i18n.t('login.accessPortal').replace('{{role}}', this.selectedLabel());
  });

  ngOnInit(): void {
    const raw = (this.route.snapshot.queryParamMap.get('door') || '').toLowerCase();
    if (raw !== 'student' && raw !== 'staff') {
      window.location.replace(this.portalHubUrl);
      return;
    }

    this.door.set(raw);
    const first = this.roles()[0];
    if (first) this.selectRole(first.id);
  }

  selectRole(id: PortalRole): void {
    this.selected.set(id);
    const def = this.allRoles.find((r) => r.id === id)?.defaultId;
    if (def) this.username.set(def);
  }

  async signIn(): Promise<void> {
    if (!this.username().trim() || !this.password().trim()) {
      this.toast.warning(this.i18n.t('login.enterCredentials'));
      return;
    }
    this.busy.set(true);
    try {
      await this.auth.login(this.selected(), this.username(), this.password());
      this.toast.success(
        this.i18n.t('login.signedIn'),
        this.i18n.t('login.welcome').replace('{{role}}', this.selectedLabel())
      );
    } catch {
      this.toast.warning(this.i18n.t('login.signInFailed'), this.i18n.t('login.signInFailedDetail'));
    } finally {
      this.busy.set(false);
    }
  }
}
