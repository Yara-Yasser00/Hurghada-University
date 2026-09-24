import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { UniversityStore } from './university-store.service';

export type PortalRole = 'student' | 'instructor' | 'admin' | 'hr';

export interface SessionUser {
  role: PortalRole;
  name: string;
  id: string;
  token?: string;
  userId?: string;
}

const roleProfiles: Record<PortalRole, SessionUser> = {
  student: { role: 'student', name: 'Nour Ahmed', id: '2024010001' },
  instructor: { role: 'instructor', name: 'Dr. Salma Hassan', id: 'HU-1028' },
  admin: { role: 'admin', name: 'Ahmed El-Masry', id: 'HU-ADMIN' },
  hr: { role: 'hr', name: 'Mariam Fouad', id: 'HU-HR01' },
};

const roleApiMap: Record<PortalRole, string> = {
  student: 'Student',
  instructor: 'Instructor',
  admin: 'Admin',
  hr: 'Hr',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly key = 'hu_session';
  private readonly http = inject(HttpClient);
  private readonly store = inject(UniversityStore);
  readonly user = signal<SessionUser | null>(this.read());

  readonly isLoggedIn = computed(() => !!this.user());

  constructor(private router: Router) {
    const existing = this.user();
    if (existing?.token) {
      void this.store.loadAll(existing.role === 'student' ? existing.id : undefined).catch(() => undefined);
    }
  }

  async login(role: PortalRole, username?: string, password?: string): Promise<void> {
    const id = (username || roleProfiles[role].id).trim();
    const pwd = password || 'hurghada';

    const res = await firstValueFrom(
      this.http.post<{
        accessToken: string;
        userId: string;
        username: string;
        displayName: string;
        role: string;
      }>(`${environment.apiUrl}/api/auth/login`, {
        username: id,
        password: pwd,
        preferredRole: roleApiMap[role],
      })
    );

    const session: SessionUser = {
      role,
      name: res.displayName,
      id: res.username,
      token: res.accessToken,
      userId: res.userId,
    };
    localStorage.setItem(this.key, JSON.stringify(session));
    sessionStorage.setItem('hu_last_door', role === 'student' ? 'student' : 'staff');
    this.user.set(session);
    await this.store.loadAll(role === 'student' ? session.id : undefined);
    await this.router.navigateByUrl(`/${role}`);
  }

  logout(): void {
    const door = this.user()?.role === 'student' ? 'student' : 'staff';
    sessionStorage.setItem('hu_last_door', door);
    localStorage.removeItem(this.key);
    this.user.set(null);
    void this.router.navigate(['/login'], { queryParams: { door } });
  }

  requireRole(role: PortalRole): boolean {
    return this.user()?.role === role;
  }

  private read(): SessionUser | null {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      return null;
    }
  }
}
