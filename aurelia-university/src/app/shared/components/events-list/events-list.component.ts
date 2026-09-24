import { Component, Input } from '@angular/core';
import { UniversityEvent } from '../../../core/models/university.models';

@Component({
  selector: 'app-events-list',
  standalone: true,
  template: `
    <ul class="list">
      @for (event of events; track event.id) {
        <li>
          <div class="date" aria-hidden="true">
            <strong>{{ event.day }}</strong>
            <span>{{ event.month }}</span>
          </div>
          <div>
            <span class="cat">{{ event.category }}</span>
            <h3>{{ event.title }}</h3>
            <p>{{ event.location }}</p>
          </div>
        </li>
      }
    </ul>
  `,
  styles: `
    .list {
      list-style: none;
      margin: 0;
      padding: 0;
      background: var(--surface);
      border: 1px solid var(--line);
    }

    li {
      display: grid;
      grid-template-columns: 4.75rem 1fr;
      gap: 1.1rem;
      padding: 1.15rem 1.15rem;
      border-bottom: 1px solid var(--line);
    }

    li:last-child {
      border-bottom: 0;
    }

    .date {
      display: grid;
      place-content: center;
      text-align: center;
      background: var(--secondary);
      border: 1px solid var(--line);
      min-height: 4.5rem;
    }

    .date strong {
      font-family: var(--font-serif);
      font-size: 1.5rem;
      color: var(--primary-deep);
      line-height: 1;
    }

    .date span {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent);
    }

    .cat {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--accent);
    }

    h3 {
      margin: 0.25rem 0 0.2rem;
      font-family: var(--font-serif);
      font-size: 1.15rem;
      color: var(--primary-deep);
      line-height: 1.25;
    }

    p {
      margin: 0;
      color: var(--muted);
      font-size: 0.92rem;
    }
  `,
})
export class EventsListComponent {
  @Input({ required: true }) events: UniversityEvent[] = [];
}
