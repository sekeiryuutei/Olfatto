import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-skin-type-badge',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <span
      class="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px]
             bg-surface text-text-secondary border border-border"
    >
      {{ 'SKIN_TYPE.' + skinType | translate }}
    </span>
  `,
})
export class SkinTypeBadgeComponent {
  @Input({ required: true }) skinType = 'UNKNOWN';
}
