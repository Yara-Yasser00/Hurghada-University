import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UniversityDataService } from '../../core/services/university-data.service';
import { TranslatePipe } from '../../core/translate.pipe';
import { HeroComponent } from '../../shared/components/hero/hero.component';
import { AudienceLinksComponent } from '../../shared/components/audience-links/audience-links.component';
import { FeatureCardComponent } from '../../shared/components/feature-card/feature-card.component';
import { ResearchFeatureComponent } from '../../shared/components/research-feature/research-feature.component';
import { StatisticsComponent } from '../../shared/components/statistics/statistics.component';
import { NewsCardComponent } from '../../shared/components/news-card/news-card.component';
import { EventsListComponent } from '../../shared/components/events-list/events-list.component';
import { CollegeCardComponent } from '../../shared/components/college-card/college-card.component';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    RouterLink,
    TranslatePipe,
    HeroComponent,
    AudienceLinksComponent,
    FeatureCardComponent,
    ResearchFeatureComponent,
    StatisticsComponent,
    NewsCardComponent,
    EventsListComponent,
    CollegeCardComponent,
    RevealDirective,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent {
  readonly data = inject(UniversityDataService);

  isExternal(path: string): boolean {
    return path.startsWith('mailto:') || path.startsWith('http');
  }
}
