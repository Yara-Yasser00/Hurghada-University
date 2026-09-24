import { Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UniversityDataService } from '../../core/services/university-data.service';
import { LocaleService } from '../../core/services/locale.service';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-utility-bar',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './utility-bar.component.html',
  styleUrl: './utility-bar.component.scss',
})
export class UtilityBarComponent {
  private readonly data = inject(UniversityDataService);
  readonly locale = inject(LocaleService);

  readonly links = this.data.utilityLinks;
  readonly searchClick = output<void>();

  isExternal(path: string): boolean {
    return path.startsWith('mailto:') || path.startsWith('http');
  }

  onSearch(): void {
    this.searchClick.emit();
  }
}
