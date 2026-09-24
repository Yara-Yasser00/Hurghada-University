import { Component, HostListener, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UniversityDataService } from '../../core/services/university-data.service';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-mobile-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <div class="panel" [class.open]="open()" [attr.aria-hidden]="!open()">
      <nav [attr.aria-label]="'common.mobileNav' | translate">
        @for (group of mainLinks; track group.path) {
          <a
            [routerLink]="group.path"
            routerLinkActive="is-active"
            [routerLinkActiveOptions]="{ exact: group.path === '/' }"
            (click)="onNavClick()"
          >
            {{ group.labelKey | translate }}
          </a>
          @for (child of group.children; track child.path + child.labelKey) {
            <a class="child" [routerLink]="child.path" (click)="onNavClick()">{{ child.labelKey | translate }}</a>
          }
        }
      </nav>
      <div class="util">
        @for (link of utilityLinks; track link.labelKey) {
          @if (isExternal(link.path)) {
            <a [href]="link.path" target="_blank" rel="noopener noreferrer" (click)="onNavClick()">{{
              link.labelKey | translate
            }}</a>
          } @else {
            <a [routerLink]="link.path" (click)="onNavClick()">{{ link.labelKey | translate }}</a>
          }
        }
      </div>
    </div>
  `,
  styles: `
    .panel {
      display: block;
      position: absolute;
      inset: 100% 0 auto;
      background: #fff;
      border-bottom: 3px solid var(--teal);
      padding: 0 1.25rem;
      box-shadow: var(--shadow-lift);
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease, padding 0.3s ease;
      z-index: 40;
    }
    .panel.open {
      max-height: 80vh;
      opacity: 1;
      overflow: auto;
      padding: 1rem 1.25rem 1.5rem;
    }
    nav,
    .util {
      display: flex;
      flex-direction: column;
    }
    a {
      text-decoration: none;
      color: var(--primary-deep);
      font-weight: 600;
      padding: 0.85rem 0;
      border-bottom: 1px solid var(--line);
      transition: color 0.2s ease, padding-inline-start 0.2s ease;
    }
    a:hover,
    a.is-active {
      color: var(--teal);
      padding-inline-start: 0.35rem;
    }
    a.child {
      font-weight: 500;
      font-size: 0.92rem;
      color: var(--muted);
      padding-inline-start: 1rem;
    }
    a.child:hover {
      padding-inline-start: 1.25rem;
    }
    .util {
      margin-top: 0.75rem;
    }
    .util a {
      font-weight: 500;
      color: var(--muted);
      font-size: 0.92rem;
    }
    @media (min-width: 961px) {
      :host {
        display: none;
      }
    }
  `,
})
export class MobileNavigationComponent {
  private readonly data = inject(UniversityDataService);
  readonly open = input(false);
  readonly closed = output<void>();
  readonly mainLinks = this.data.mainNav;
  readonly utilityLinks = this.data.utilityLinks;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.close();
  }

  isExternal(path: string): boolean {
    return path.startsWith('mailto:') || path.startsWith('http');
  }

  close(): void {
    this.closed.emit();
  }

  onNavClick(): void {
    this.close();
  }
}
