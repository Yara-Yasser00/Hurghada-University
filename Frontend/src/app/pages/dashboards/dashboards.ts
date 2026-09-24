import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideBarChart3,
  LucideBookOpen,
  LucideCalendarDays,
  LucideCheckCircle2,
  LucideClock3,
  LucideGraduationCap,
  LucideTrendingUp,
  LucideUserPlus,
  LucideUsersRound,
  LucideWalletCards,
} from '@lucide/angular';
import { UniversityStore } from '../../core/university-store.service';
import { gpaTrend, gradeDistribution } from '../../data/mock-data';
import {
  PageHeaderComponent,
  PanelComponent,
  ProgressComponent,
  StatCardComponent,
  StatusComponent,
} from '../../shared/ui.components';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    StatCardComponent,
    PanelComponent,
    ProgressComponent,
    StatusComponent,
    LucideBookOpen,
    LucideTrendingUp,
    LucideCheckCircle2,
    LucideClock3,
  ],
  templateUrl: './student-dashboard.component.html',
})
export class StudentDashboardComponent {
  private store = inject(UniversityStore);
  courses = computed(() => this.store.courses().slice(0, 4));
  gpaTrend = gpaTrend;
  gpaPoints = gpaTrend
    .map((p, i) => {
      const x = 40 + i * 70;
      const y = 160 - ((p.value - 2.8) / 1.2) * 120;
      return `${x},${y}`;
    })
    .join(' ');
}

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    StatCardComponent,
    PanelComponent,
    ProgressComponent,
    LucideBookOpen,
    LucideUsersRound,
    LucideClock3,
    LucideCalendarDays,
    LucideCheckCircle2,
  ],
  templateUrl: './instructor-dashboard.component.html',
})
export class InstructorDashboardComponent {
  private store = inject(UniversityStore);
  courses = computed(() => this.store.courses().slice(0, 4));
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    StatCardComponent,
    PanelComponent,
    LucideGraduationCap,
    LucideUsersRound,
    LucideBookOpen,
    LucideBarChart3,
    LucideUserPlus,
    DecimalPipe,
  ],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private store = inject(UniversityStore);
  faculties = computed(() => this.store.faculties());
  stats = computed(() => this.store.adminStats());
  distribution = gradeDistribution;
  maxDist = Math.max(...gradeDistribution.map((d) => d.value));

  ngOnInit(): void {
    if (!this.store.loaded()) {
      void this.store.loadAll();
    }
  }
}

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [
    PageHeaderComponent,
    StatCardComponent,
    PanelComponent,
    ProgressComponent,
    StatusComponent,
    LucideUsersRound,
    LucideGraduationCap,
    LucideUserPlus,
    LucideWalletCards,
  ],
  templateUrl: './hr-dashboard.component.html',
})
export class HrDashboardComponent {
  private store = inject(UniversityStore);
  staff = computed(() => this.store.staff().slice(0, 4));
  mix = [
    ['Academic staff', 59],
    ['Administration', 24],
    ['Technical staff', 11],
    ['Contractors', 6],
  ] as const;

  initials(name: string): string {
    return name
      .split(' ')
      .slice(-2)
      .map((v) => v[0])
      .join('');
  }
}
