import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UtilityBarComponent } from '../utility-bar/utility-bar.component';
import { MainNavigationComponent } from '../main-navigation/main-navigation.component';
import { MobileNavigationComponent } from '../mobile-navigation/mobile-navigation.component';
import { SearchOverlayComponent } from '../search-overlay/search-overlay.component';
import { UniversityDataService } from '../../core/services/university-data.service';
import { LocaleService } from '../../core/services/locale.service';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-university-header',
  imports: [
    RouterLink,
    UtilityBarComponent,
    MainNavigationComponent,
    MobileNavigationComponent,
    SearchOverlayComponent,
    TranslatePipe,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class UniversityHeaderComponent {
  readonly data = inject(UniversityDataService);
  readonly locale = inject(LocaleService);
  readonly menuOpen = signal(false);
  readonly searchOpen = signal(false);

  openSearch(): void {
    this.menuOpen.set(false);
    this.searchOpen.set(true);
  }

  closeSearch(): void {
    this.searchOpen.set(false);
  }

  toggleMenu(): void {
    this.searchOpen.set(false);
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
