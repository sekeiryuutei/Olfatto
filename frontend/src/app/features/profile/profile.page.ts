import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, checkmarkCircle } from 'ionicons/icons';
import { forkJoin, of, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { FragranceService } from '../../core/services/fragrance.service';
import { ShelfService, CollectionStatus } from '../../core/services/shelf.service';
import {
  Climate,
  PreferredDuration,
  ProjectionLevel,
  RetentionLevel,
  SkinType,
  UserProfile,
} from '../../core/models/user.model';
import { FragranceSummary } from '../../core/models/fragrance.model';
import { AppEmptyStateComponent } from '../../shared/components/app-empty-state/app-empty-state.component';

addIcons({ 'log-out-outline': logOutOutline, 'checkmark-circle': checkmarkCircle });

type ShelfTab = 'collection' | 'wishlist' | 'favorites';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, IonContent, IonIcon, AppEmptyStateComponent],
  template: `
    <ion-content>
      <div class="px-4 pt-6 pb-24 max-w-2xl mx-auto">
        <!-- point 26 header -->
        <div class="flex flex-col items-center text-center mb-6">
          <div class="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center mb-3">
            <span class="font-display text-2xl text-primary">{{ (authService.currentUser()?.name ?? '?')[0] }}</span>
          </div>
          <p class="text-lg font-medium text-text-primary">{{ authService.currentUser()?.name }}</p>
          @if (profile(); as p) {
            <p class="text-text-secondary text-sm">{{ 'SKIN_TYPE.' + p.skinType | translate }}</p>
          }
          <p class="text-text-muted text-xs mt-1">
            {{ collectionCount() }} {{ 'PROFILE.FRAGRANCES' | translate }} · {{ reviewCount() }} {{ 'FRAGRANCE.REVIEWS' | translate }}
          </p>
        </div>

        <!-- Editar perfil olfativo -->
        @if (profile(); as p) {
          <section class="ol-elevated rounded-card p-4 mb-6">
            <h2 class="text-sm font-medium text-text-primary mb-3">{{ 'PROFILE.EDIT_TITLE' | translate }}</h2>

            <div class="space-y-3">
              <div>
                <label class="text-xs text-text-secondary">{{ 'PROFILE.SKIN_TYPE' | translate }}</label>
                <select
                  [(ngModel)]="editSkinType"
                  class="w-full mt-1 px-3 py-2 rounded-button bg-surface border border-border text-sm text-text-primary"
                >
                  @for (opt of skinTypeOptions; track opt) {
                    <option [value]="opt">{{ 'SKIN_TYPE.' + opt | translate }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="text-xs text-text-secondary">{{ 'PROFILE.PREFERRED_DURATION' | translate }}</label>
                <select
                  [(ngModel)]="editPreferredDuration"
                  class="w-full mt-1 px-3 py-2 rounded-button bg-surface border border-border text-sm text-text-primary"
                >
                  @for (opt of durationOptions; track opt) {
                    <option [value]="opt">{{ 'PREFERRED_DURATION.' + opt | translate }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="text-xs text-text-secondary">{{ 'PROFILE.PREFERRED_PROJECTION' | translate }}</label>
                <select
                  [(ngModel)]="editPreferredProjection"
                  class="w-full mt-1 px-3 py-2 rounded-button bg-surface border border-border text-sm text-text-primary"
                >
                  @for (opt of projectionOptions; track opt) {
                    <option [value]="opt">{{ 'PROJECTION.' + opt | translate }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="text-xs text-text-secondary">{{ 'PROFILE.CLIMATE' | translate }}</label>
                <select
                  [(ngModel)]="editClimate"
                  class="w-full mt-1 px-3 py-2 rounded-button bg-surface border border-border text-sm text-text-primary"
                >
                  @for (opt of climateOptions; track opt) {
                    <option [value]="opt">{{ 'CLIMATE.' + opt | translate }}</option>
                  }
                </select>
              </div>
            </div>

            <button
              type="button"
              (click)="saveProfile()"
              class="w-full mt-4 py-2.5 rounded-button bg-primary text-bg text-sm font-medium"
            >
              {{ saved() ? ('PROFILE.SAVED' | translate) : ('PROFILE.SAVE' | translate) }}
            </button>
          </section>
        }

        <!-- Tabs de estante (point 26) -->
        <div class="flex gap-2 mb-4">
          <button type="button" (click)="setShelfTab('collection')"
            class="flex-1 py-2 rounded-button text-xs font-medium border"
            [class]="shelfTab() === 'collection' ? 'bg-primary text-bg border-primary' : 'bg-transparent text-text-secondary border-border'">
            {{ 'PROFILE.COLLECTION' | translate }}
          </button>
          <button type="button" (click)="setShelfTab('wishlist')"
            class="flex-1 py-2 rounded-button text-xs font-medium border"
            [class]="shelfTab() === 'wishlist' ? 'bg-primary text-bg border-primary' : 'bg-transparent text-text-secondary border-border'">
            {{ 'PROFILE.WISHLIST' | translate }}
          </button>
          <button type="button" (click)="setShelfTab('favorites')"
            class="flex-1 py-2 rounded-button text-xs font-medium border"
            [class]="shelfTab() === 'favorites' ? 'bg-primary text-bg border-primary' : 'bg-transparent text-text-secondary border-border'">
            {{ 'PROFILE.FAVORITES' | translate }}
          </button>
        </div>

        @if (shelfItems().length === 0) {
          <app-empty-state icon="🗂️" [message]="'PROFILE.SHELF_EMPTY' | translate">
            <a routerLink="/fragrances" class="text-primary text-sm">{{ 'PROFILE.EXPLORE_CTA' | translate }}</a>
          </app-empty-state>
        } @else {
          <div class="grid grid-cols-2 gap-3">
            @for (item of shelfItems(); track item.id) {
              <a [routerLink]="['/fragrances', item.id]" class="block rounded-card ol-elevated p-3">
                <p class="text-sm font-medium text-text-primary truncate">{{ item.name }}</p>
                <p class="text-xs text-text-secondary">{{ item.concentration }}</p>
              </a>
            }
          </div>
        }

        <button
          type="button"
          (click)="authService.logout()"
          class="w-full mt-8 py-2.5 rounded-button border border-border text-danger text-sm
                 flex items-center justify-center gap-2"
        >
          <ion-icon name="log-out-outline"></ion-icon>
          {{ 'PROFILE.LOGOUT' | translate }}
        </button>
      </div>
    </ion-content>
  `,
})
export class ProfilePage {
  readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly fragranceService = inject(FragranceService);
  private readonly shelfService = inject(ShelfService);

  readonly skinTypeOptions = Object.values(SkinType);
  readonly durationOptions = Object.values(PreferredDuration);
  readonly projectionOptions = Object.values(ProjectionLevel);
  readonly climateOptions = Object.values(Climate);

  readonly profile = signal<UserProfile | null>(null);
  readonly saved = signal(false);

  editSkinType: SkinType = SkinType.UNKNOWN;
  editPreferredDuration: PreferredDuration = PreferredDuration.MODERATE;
  editPreferredProjection: ProjectionLevel = ProjectionLevel.MODERATE;
  editClimate: Climate = Climate.TEMPERATE;

  readonly shelfTab = signal<ShelfTab>('collection');
  readonly shelfItems = signal<FragranceSummary[]>([]);
  readonly collectionCount = signal(0);
  readonly reviewCount = signal(0); // NOTE: no dedicated "my reviews" endpoint yet — stays 0 until that's built (see PROGRESS.md)

  constructor() {
    this.userService.getProfile().subscribe((p) => {
      this.profile.set(p);
      this.editSkinType = p.skinType;
      this.editPreferredDuration = p.preferredDuration ?? PreferredDuration.MODERATE;
      this.editPreferredProjection = p.preferredProjection ?? ProjectionLevel.MODERATE;
      this.editClimate = p.climate ?? Climate.TEMPERATE;
    });
    this.loadShelf();
  }

  setShelfTab(tab: ShelfTab): void {
    this.shelfTab.set(tab);
    this.loadShelf();
  }

  saveProfile(): void {
    this.userService
      .updateProfile({
        skinType: this.editSkinType,
        preferredDuration: this.editPreferredDuration,
        preferredProjection: this.editPreferredProjection,
        climate: this.editClimate,
      })
      .subscribe((p) => {
        this.profile.set(p);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 2000);
      });
  }

  private loadShelf(): void {
    const entries$ =
      this.shelfTab() === 'collection'
        ? this.shelfService.listCollection()
        : this.shelfTab() === 'wishlist'
          ? this.shelfService.listWishlist()
          : this.shelfService.listFavorites();

    entries$
      .pipe(
        switchMap((res) => {
          if (this.shelfTab() === 'collection') this.collectionCount.set(res.data.length);
          if (res.data.length === 0) return of([] as FragranceSummary[]);
          return forkJoin(res.data.map((entry) => this.fragranceService.getById(entry.fragranceId))).pipe(
            switchMap((details) =>
              of(
                details.map((d) => ({
                  id: d.id,
                  name: d.name,
                  brandId: d.brand?.id ?? '',
                  concentration: d.concentration,
                  gender: d.gender,
                  imageUrl: d.imageUrl,
                  averageRating: d.performance.averageRating,
                  reviewCount: d.performance.reviewCount,
                  averageDurationHours: d.performance.averageDurationHours,
                })),
              ),
            ),
          );
        }),
      )
      .subscribe({
        next: (items) => this.shelfItems.set(items),
        error: () => this.shelfItems.set([]),
      });
  }
}
