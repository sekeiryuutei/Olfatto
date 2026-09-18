import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { star, heartOutline, heart } from 'ionicons/icons';
import { FragranceSummary } from '../../../core/models/fragrance.model';
import { ShelfService } from '../../../core/services/shelf.service';
import { AuthService } from '../../../core/services/auth.service';

addIcons({ star, 'heart-outline': heartOutline, heart });

@Component({
  selector: 'app-fragrance-card',
  standalone: true,
  imports: [CommonModule, RouterLink, IonIcon, TranslateModule],
  template: `
    <a
      [routerLink]="['/fragrances', fragrance.id]"
      class="block rounded-card overflow-hidden ol-elevated transition-transform active:scale-[0.98]"
    >
      <div class="relative aspect-square bg-surface flex items-center justify-center">
        @if (fragrance.imageUrl) {
          <img [src]="fragrance.imageUrl" [alt]="fragrance.name" class="w-full h-full object-cover" />
        } @else {
          <span class="font-display text-3xl text-text-muted">{{ fragrance.name[0] }}</span>
        }
        <button
          type="button"
          (click)="toggleWishlist($event)"
          class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-bg/60 backdrop-blur
                 flex items-center justify-center"
          [class.text-primary]="inWishlist()"
          [class.text-text-primary]="!inWishlist()"
          [attr.aria-label]="'FRAGRANCE.ADD_TO_WISHLIST' | translate"
        >
          <ion-icon [name]="inWishlist() ? 'heart' : 'heart-outline'"></ion-icon>
        </button>
      </div>

      <div class="p-3">
        <p class="text-sm font-medium text-text-primary truncate">{{ fragrance.name }}</p>
        <p class="text-xs text-text-secondary">{{ fragrance.concentration }}</p>

        @if (fragrance.averageRating !== null) {
          <div class="flex items-center gap-1 mt-1.5 text-xs text-primary">
            <ion-icon name="star"></ion-icon>
            <span>{{ fragrance.averageRating.toFixed(1) }}</span>
          </div>
        }

        <div class="flex items-center justify-between mt-2 pt-2 border-t border-border text-[11px]">
          <div>
            <p class="text-text-primary font-medium">
              {{ fragrance.averageDurationHours !== null ? fragrance.averageDurationHours.toFixed(1) + 'h' : '—' }}
            </p>
            <p class="text-text-muted">{{ 'FRAGRANCE.DURATION' | translate }}</p>
          </div>
          <div class="text-right">
            <p class="text-text-primary font-medium">{{ fragrance.reviewCount }}</p>
            <p class="text-text-muted">{{ 'FRAGRANCE.REVIEWS' | translate }}</p>
          </div>
        </div>
      </div>
    </a>
  `,
})
export class FragranceCardComponent {
  @Input({ required: true }) fragrance!: FragranceSummary;

  private readonly shelfService = inject(ShelfService);
  private readonly authService = inject(AuthService);

  // NOTE: reflects only what happened in THIS session — the catalog list
  // endpoint doesn't return per-user wishlist state, so a fragrance
  // already wishlisted from a previous session shows as un-hearted until
  // toggled again. Fixing that means adding wishlist membership to the
  // catalog response — noted in PROGRESS.md.
  readonly inWishlist = signal(false);

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.authService.isAuthenticated()) return;

    const next = !this.inWishlist();
    this.inWishlist.set(next);
    const action = next
      ? this.shelfService.addToWishlist(this.fragrance.id)
      : this.shelfService.removeFromWishlist(this.fragrance.id);
    action.subscribe({ error: () => this.inWishlist.set(!next) }); // revert on failure
  }
}
