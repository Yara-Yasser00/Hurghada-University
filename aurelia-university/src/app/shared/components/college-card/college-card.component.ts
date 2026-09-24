import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { College } from '../../../core/models/university.models';

@Component({
  selector: 'app-college-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a class="card" [routerLink]="['/faculties', college.id]">
      <img [src]="college.image" [alt]="college.name" loading="lazy" width="800" height="560" />
      <div class="body">
        <h3>{{ college.name }}</h3>
        <p>{{ college.description }}</p>
      </div>
    </a>
  `,
  styles: `
    .card { display: block; text-decoration: none; color: inherit; border: 1px solid var(--line); background: var(--surface); overflow: hidden; transition: box-shadow var(--transition); }
    .card:hover { box-shadow: var(--shadow-soft); }
    img { width: 100%; aspect-ratio: 16/11; object-fit: cover; transition: transform .45s ease; }
    .card:hover img { transform: scale(1.04); }
    .body { padding: 1.15rem 1.2rem 1.4rem; }
    h3 { margin: 0 0 .45rem; font-family: var(--font-serif); font-size: 1.3rem; color: var(--primary-deep); }
    p { margin: 0; color: var(--muted); font-size: .95rem; }
  `,
})
export class CollegeCardComponent {
  @Input({ required: true }) college!: College;
}
