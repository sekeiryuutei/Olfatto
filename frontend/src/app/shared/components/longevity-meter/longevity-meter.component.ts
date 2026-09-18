import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DurationBucket } from '../../../core/models/fragrance.model';

// Point 16: a histogram, not just an averaged number.
@Component({
  selector: 'app-longevity-meter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-1.5">
      @for (bucket of buckets; track bucket.label) {
        <div class="flex items-center gap-2 text-xs">
          <span class="w-12 text-text-secondary">{{ bucket.label }}</span>
          <div class="flex-1 h-2 rounded-full bg-surface overflow-hidden">
            <div
              class="h-full bg-primary rounded-full transition-all"
              [style.width.%]="bucket.percentage"
            ></div>
          </div>
          <span class="w-9 text-right text-text-muted">{{ bucket.percentage }}%</span>
        </div>
      }
    </div>
  `,
})
export class LongevityMeterComponent {
  @Input({ required: true }) buckets: DurationBucket[] = [];
}
