import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-projection-badge',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <span
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px]
             bg-surface text-text-secondary border border-border"
    >
      💨 {{ 'PROJECTION.' + projection | translate }}
    </span>
  `,
})
export class ProjectionBadgeComponent {
  @Input({ required: true }) projection = 'MODERATE';
}
