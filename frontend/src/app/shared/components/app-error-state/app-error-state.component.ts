import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// Point 82: every screen that calls the API needs an explicit error state
// with a retry action.
@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="flex flex-col items-center justify-center text-center py-16 px-6">
      <p class="text-text-secondary text-sm mb-4">{{ message }}</p>
      <button
        type="button"
        (click)="retry.emit()"
        class="px-4 py-2 rounded-button bg-surface-elevated text-text-primary text-sm border border-border"
      >
        {{ 'COMMON.RETRY' | translate }}
      </button>
    </div>
  `,
})
export class AppErrorStateComponent {
  @Input() message = '';
  @Output() retry = new EventEmitter<void>();
}
