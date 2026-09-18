import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Point 82: every screen that lists API data needs an explicit empty state.
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center text-center py-16 px-6">
      <div class="text-4xl mb-3">{{ icon }}</div>
      <p class="text-text-secondary text-sm mb-4">{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
})
export class AppEmptyStateComponent {
  @Input() icon = '🔍';
  @Input({ required: true }) message = '';
}
