import {
  Component,
  ElementRef,
  HostListener,
  effect,
  inject,
  input,
  output,
  signal,
  computed,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UniversityDataService } from '../../core/services/university-data.service';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-search-overlay',
  standalone: true,
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './search-overlay.component.html',
  styleUrl: './search-overlay.component.scss',
})
export class SearchOverlayComponent {
  private readonly data = inject(UniversityDataService);

  readonly open = input(false);
  readonly closed = output<void>();

  readonly query = signal('');
  readonly results = computed(() => this.data.search(this.query()));

  get suggested(): string[] {
    return this.data.suggestedSearches;
  }

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    effect(() => {
      if (this.open()) {
        queueMicrotask(() => this.inputRef()?.nativeElement.focus());
      } else {
        this.query.set('');
      }
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
  }

  applySuggestion(value: string): void {
    this.query.set(value);
  }

  close(): void {
    this.closed.emit();
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.open()) this.close();
  }
}
