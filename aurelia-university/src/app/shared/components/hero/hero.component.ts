import {
  Component,
  DestroyRef,
  NgZone,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { UniversityDataService } from '../../../core/services/university-data.service';
import { LocaleService } from '../../../core/services/locale.service';
import { TranslatePipe } from '../../../core/translate.pipe';

export interface HeroSlide {
  id: string;
  image: string;
  titleKey: string;
  bodyKey: string;
}

const SLIDE_MS = 3000;

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements OnInit {
  readonly data = inject(UniversityDataService);
  private readonly locale = inject(LocaleService);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  readonly slides: HeroSlide[] = [
    {
      id: 'campus',
      image: '/assets/campus/hero.png',
      titleKey: 'home.hero.slides.campus.title',
      bodyKey: 'home.hero.slides.campus.body',
    },
    {
      id: 'academic',
      image: '/assets/campus/study.png',
      titleKey: 'home.hero.slides.academic.title',
      bodyKey: 'home.hero.slides.academic.body',
    },
    {
      id: 'life',
      image: '/assets/campus/life.png',
      titleKey: 'home.hero.slides.life.title',
      bodyKey: 'home.hero.slides.life.body',
    },
    {
      id: 'research',
      image: '/assets/images/research.jpg',
      titleKey: 'home.hero.slides.research.title',
      bodyKey: 'home.hero.slides.research.body',
    },
    {
      id: 'community',
      image: '/assets/campus/faculty.png',
      titleKey: 'home.hero.slides.community.title',
      bodyKey: 'home.hero.slides.community.body',
    },
  ];

  readonly index = signal(0);
  readonly paused = signal(false);
  readonly reducedMotion = signal(false);
  readonly slideMs = SLIDE_MS;

  readonly active = computed(() => this.slides[this.index()] ?? this.slides[0]);
  readonly brand = computed(() => {
    this.locale.lang();
    return this.data.brandName || this.locale.t('home.hero.brandFallback');
  });

  private timerId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion.set(mq.matches);
    const onMq = () => {
      this.reducedMotion.set(mq.matches);
      this.syncAutoplay();
    };
    mq.addEventListener('change', onMq);
    this.destroyRef.onDestroy(() => {
      mq.removeEventListener('change', onMq);
      this.stopAutoplay();
    });
    this.syncAutoplay();
  }

  goTo(i: number): void {
    const n = this.slides.length;
    this.index.set(((i % n) + n) % n);
    this.syncAutoplay();
  }

  next(): void {
    this.goTo(this.index() + 1);
  }

  prev(): void {
    this.goTo(this.index() - 1);
  }

  /** Pause only while interacting with controls — not the whole full-bleed hero. */
  pauseControls(): void {
    this.paused.set(true);
    this.stopAutoplay();
  }

  resumeControls(event?: FocusEvent): void {
    if (event) {
      const root = event.currentTarget as Node | null;
      const next = event.relatedTarget as Node | null;
      if (root && next && root.contains(next)) return;
    }
    this.paused.set(false);
    this.syncAutoplay();
  }

  private syncAutoplay(): void {
    this.stopAutoplay();
    if (this.reducedMotion() || this.paused()) return;

    this.zone.runOutsideAngular(() => {
      this.timerId = setInterval(() => {
        this.zone.run(() => {
          this.index.update((i) => (i + 1) % this.slides.length);
        });
      }, SLIDE_MS);
    });
  }

  private stopAutoplay(): void {
    if (this.timerId != null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
