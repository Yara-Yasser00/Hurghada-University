import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UniversityDataService } from '../../core/services/university-data.service';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-main-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './main-navigation.component.html',
  styleUrl: './main-navigation.component.scss',
})
export class MainNavigationComponent {
  private readonly data = inject(UniversityDataService);

  readonly links = this.data.mainNav;
}
