import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UniversityDataService } from '../../core/services/university-data.service';
import { LocaleService } from '../../core/services/locale.service';
import { TranslatePipe } from '../../core/translate.pipe';

@Component({
  selector: 'app-university-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class UniversityFooterComponent {
  readonly data = inject(UniversityDataService);
  readonly locale = inject(LocaleService);
  readonly currentYear = new Date().getFullYear();

  readonly columns = [
    {
      titleKey: 'footer.columns.faculties',
      links: [
        { labelKey: 'footer.links.edu', path: '/faculties/edu' },
        { labelKey: 'footer.links.tourism', path: '/faculties/tourism' },
        { labelKey: 'footer.links.alsun', path: '/faculties/alsun' },
        { labelKey: 'footer.links.fci', path: '/faculties/fci' },
        { labelKey: 'footer.links.sci', path: '/faculties/sci' },
      ],
    },
    {
      titleKey: 'footer.columns.academic',
      links: [
        { labelKey: 'footer.links.programs', path: '/academic/programs' },
        { labelKey: 'footer.links.graduate', path: '/academic/graduate' },
        { labelKey: 'footer.links.quality', path: '/academic/quality' },
        { labelKey: 'footer.links.eservices', path: '/e-services' },
      ],
    },
    {
      titleKey: 'footer.columns.students',
      links: [
        { labelKey: 'footer.links.studentServices', path: '/students/services' },
        { labelKey: 'footer.links.activities', path: '/students/activities' },
        { labelKey: 'footer.links.scholarships', path: '/students/scholarships' },
        { labelKey: 'footer.links.agenda', path: '/agenda' },
      ],
    },
    {
      titleKey: 'footer.columns.about',
      links: [
        { labelKey: 'footer.links.history', path: '/about/history' },
        { labelKey: 'footer.links.leadership', path: '/about/leadership' },
        { labelKey: 'footer.links.community', path: '/community' },
        { labelKey: 'footer.links.staff', path: '/staff' },
      ],
    },
    {
      titleKey: 'footer.columns.connect',
      links: [
        { labelKey: 'footer.links.home', path: '/' },
        { labelKey: 'footer.links.news', path: '/news' },
        { labelKey: 'footer.links.links', path: '/links' },
        { labelKey: 'footer.links.contact', path: '/contact' },
        { labelKey: 'footer.links.portal', path: '/portal' },
      ],
    },
  ];

  isExternal(path: string): boolean {
    return path.startsWith('mailto:') || path.startsWith('http');
  }

  readonly legalLinks = [
    { labelKey: 'footer.legal.privacy', path: '/about/privacy' },
    { labelKey: 'footer.legal.terms', path: '/about/terms' },
  ];

  readonly social = [
    { labelKey: 'footer.officialSite', href: 'http://www.hurghada.edu.eg/', short: 'hurghada.edu.eg' },
  ];
}
