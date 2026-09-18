import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonSkeletonText } from '@ionic/angular/standalone';

// Point 82: skeleton loading state, reused across catalog/detail/reviews.
@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule, IonSkeletonText],
  template: `
    <div class="grid gap-3" [style.grid-template-columns]="'repeat(' + columns + ', minmax(0, 1fr))'">
      @for (i of items; track i) {
        <div class="rounded-card overflow-hidden ol-elevated">
          <ion-skeleton-text [animated]="true" class="!m-0 aspect-square"></ion-skeleton-text>
          <div class="p-3 space-y-2">
            <ion-skeleton-text [animated]="true" style="width: 80%"></ion-skeleton-text>
            <ion-skeleton-text [animated]="true" style="width: 50%"></ion-skeleton-text>
          </div>
        </div>
      }
    </div>
  `,
})
export class AppSkeletonComponent {
  @Input() count = 6;
  @Input() columns = 2;
  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
