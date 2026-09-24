import { KeyValuePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideDownload,
  LucideFilter,
  LucidePencil,
  LucideSearch,
  LucideToggleLeft,
  LucideUserPlus,
} from '@lucide/angular';
import { ToastService } from '../../core/toast.service';
import { UniversityStore } from '../../core/university-store.service';
import { I18nService } from '../../core/i18n.service';
import { TranslatePipe } from '../../core/translate.pipe';
import { DrawerComponent, ModalComponent } from '../../shared/overlay.components';
import { PageHeaderComponent, PanelComponent, StatusComponent } from '../../shared/ui.components';
import { ImageUploadComponent } from '../../shared/image-upload.component';

type DirType = 'students' | 'staff' | 'faculties' | 'departments' | 'admins';

@Component({
  selector: 'app-directory-page',
  standalone: true,
  imports: [
    FormsModule,
    KeyValuePipe,
    PageHeaderComponent,
    PanelComponent,
    StatusComponent,
    DrawerComponent,
    ModalComponent,
    ImageUploadComponent,
    TranslatePipe,
    LucideDownload,
    LucideFilter,
    LucidePencil,
    LucideSearch,
    LucideToggleLeft,
    LucideUserPlus,
  ],
  templateUrl: './directory-page.component.html',
})
export class DirectoryPageComponent {
  type = input<DirType>('students');
  query = signal('');
  drawerOpen = signal(false);
  modalOpen = signal(false);
  selected = signal<any | null>(null);

  form = signal<Record<string, string>>({});

  private store = inject(UniversityStore);
  private toast = inject(ToastService);
  private i18n = inject(I18nService);

  source = computed(() => {
    switch (this.type()) {
      case 'students':
        return this.store.students();
      case 'staff':
        return this.store.staff();
      case 'faculties':
        return this.store.faculties();
      case 'departments':
        return this.store.departments();
      case 'admins':
        return this.store.collegeAdmins();
    }
  });

  filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.source();
    return this.source().filter((x) => JSON.stringify(x).toLowerCase().includes(q));
  });

  title = computed(() => {
    this.i18n.lang();
    return (
      {
        students: 'pages.directory.titleStudents',
        staff: 'pages.directory.titleStaff',
        faculties: 'pages.directory.titleFaculties',
        departments: 'pages.directory.titleDepartments',
        admins: 'pages.directory.titleAdmins',
      } as const
    )[this.type()];
  });

  addLabel = computed(() => {
    this.i18n.lang();
    return (
      {
        students: 'pages.directory.addStudent',
        staff: 'pages.directory.addStaff',
        faculties: 'pages.directory.addFaculty',
        departments: 'pages.directory.addDepartment',
        admins: 'pages.directory.addAdmin',
      } as const
    )[this.type()];
  });

  allTitle = computed(() => {
    this.i18n.lang();
    return `${this.i18n.t('pages.directory.allPrefix')} ${this.i18n.t(this.title())}`;
  });

  searchPlaceholder = computed(() => {
    this.i18n.lang();
    return `${this.i18n.t('pages.directory.searchPrefix')} ${this.i18n.t(this.title())}...`;
  });

  initials(name: string): string {
    return name
      .split(' ')
      .map((v) => v[0])
      .slice(0, 2)
      .join('');
  }

  trackKey(row: { apiId?: string; id?: string; slug?: string; name?: string }): string {
    return String(row.apiId || row.id || row.slug || row.name || '');
  }

  openView(row: any): void {
    this.selected.set(row);
    this.drawerOpen.set(true);
  }

  openCreate(): void {
    const type = this.type();
    const blanks: Record<DirType, Record<string, string>> = {
      students: { id: '', name: '', faculty: 'Computers & Artificial Intelligence', level: 'First', gpa: '0.00', status: 'Active' },
      staff: { id: '', name: '', role: 'Lecturer', department: 'Computer Science', contract: 'Full-time', since: '2026' },
      faculties: { name: '', arabic: '', dean: '', departments: '1', students: '0', status: 'Active', imageUrl: '', description: '', slug: '' },
      departments: { id: '', name: '', faculty: 'Education', head: '', programs: '1', status: 'Active' },
      admins: { id: '', name: '', faculty: 'Education', email: '', status: 'Active' },
    };
    this.form.set({ ...blanks[type] });
    this.modalOpen.set(true);
  }

  openEdit(row: any): void {
    this.form.set({ ...row, departments: String(row.departments ?? ''), programs: String(row.programs ?? '') });
    this.modalOpen.set(true);
    this.drawerOpen.set(false);
  }

  async saveForm(): Promise<void> {
    const type = this.type();
    const f = this.form();
    if (!f['name']?.trim()) {
      this.toast.warning('Name is required');
      return;
    }

    try {
      if (type === 'students') {
        const id = f['id'] || `2026${String(Math.floor(Math.random() * 9000) + 1000)}`;
        const existing = this.store.students().find((s) => s.id === id);
        const payload = {
          id,
          name: f['name'],
          faculty: f['faculty'],
          level: f['level'],
          gpa: f['gpa'] || '0.00',
          status: f['status'] || 'Active',
        };
        if (existing) await this.store.updateStudent(id, payload);
        else await this.store.addStudent(payload);
      } else if (type === 'staff') {
        const id = f['id'] || `HU-${Math.floor(Math.random() * 9000) + 1000}`;
        const existing = this.store.staff().find((s) => s.id === id);
        const payload = {
          id,
          name: f['name'],
          role: f['role'],
          department: f['department'],
          contract: f['contract'],
          since: f['since'] || '2026',
        };
        if (existing) await this.store.updateStaff(id, payload);
        else await this.store.addStaff(payload);
      } else if (type === 'faculties') {
        const name = f['name'];
        const payload = {
          name,
          arabic: f['arabic'] || name,
          dean: f['dean'] || 'TBD',
          departments: Number(f['departments'] || 1),
          students: f['students'] || '0',
          status: f['status'] || 'Active',
          enabled: (f['status'] || 'Active') === 'Active',
          imageUrl: f['imageUrl'] || undefined,
          description: f['description'] || undefined,
          slug: f['slug'] || undefined,
        };
        if (this.store.faculties().some((x) => x.name === name)) await this.store.updateFaculty(name, payload);
        else await this.store.addFaculty(payload);
      } else if (type === 'departments') {
        const id = f['id'] || `D-${Math.floor(Math.random() * 90) + 10}`;
        const payload = {
          id,
          name: f['name'],
          faculty: f['faculty'],
          head: f['head'] || 'TBD',
          programs: Number(f['programs'] || 1),
          status: (f['status'] as 'Active' | 'Inactive') || 'Active',
        };
        if (this.store.departments().some((d) => d.id === id)) await this.store.updateDepartment(id, payload);
        else await this.store.addDepartment(payload);
      } else if (type === 'admins') {
        const id = f['id'] || `CA-${Math.floor(Math.random() * 90) + 10}`;
        const payload = {
          id,
          name: f['name'],
          faculty: f['faculty'],
          email: f['email'] || `${f['name'].toLowerCase().replace(/\s+/g, '.')}@hu.edu.eg`,
          status: (f['status'] as 'Active' | 'Inactive') || 'Active',
        };
        if (this.store.collegeAdmins().some((a) => a.id === id)) await this.store.updateCollegeAdmin(id, payload);
        else await this.store.addCollegeAdmin(payload);
      }

      this.modalOpen.set(false);
      this.toast.success('Record saved', `${f['name']} was updated successfully.`);
    } catch {
      this.toast.warning('Could not save', 'Check API connection and try again.');
    }
  }

  async deleteRow(row: any): Promise<void> {
    const type = this.type();
    try {
      if (type === 'students') await this.store.deleteStudent(row.id);
      else if (type === 'staff') await this.store.deleteStaff(row.id);
      else if (type === 'faculties') await this.store.deleteFaculty(row.name);
      else if (type === 'departments') await this.store.deleteDepartment(row.id);
      else if (type === 'admins') await this.store.deleteCollegeAdmin(row.id);
      this.drawerOpen.set(false);
      this.toast.info('Record removed', row.name || row.id);
    } catch {
      this.toast.warning('Could not delete', 'Check API connection and try again.');
    }
  }

  async toggleEnabled(row: any): Promise<void> {
    const type = this.type();
    try {
      if (type === 'faculties') {
        await this.store.toggleFaculty(row.name);
        this.toast.info('Faculty status updated', row.name);
      } else if (type === 'admins') {
        await this.store.toggleCollegeAdmin(row.id);
        this.toast.info('Admin account status updated', row.name);
      }
    } catch {
      this.toast.warning('Could not update status', 'Check API connection and try again.');
    }
  }

  exportCsv(): void {
    this.toast.success('Export started', `${this.filtered().length} ${this.type()} records.`);
  }

  setField(key: string, value: string): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  affiliation(row: any): string {
    return row.faculty || row.department || row.dean || row.head || 'Academic Affairs';
  }

  details(row: any): string {
    return row.level || row.role || row.email || (row.departments != null ? `${row.departments} departments` : `${row.programs ?? ''} programs`);
  }

  statusOf(row: any): string {
    return row.status || (row.enabled === false ? 'Inactive' : 'Active');
  }

  rowMeta(row: any, i: number): string {
    return row.id || row.arabic || row.email || `HU-${2040 + i}`;
  }
}
