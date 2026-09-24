import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search, notificationsOutline, star } from 'ionicons/icons';
import { AuthService } from '../../core/services/auth.service';
import { FragranceService } from '../../core/services/fragrance.service';
import { ShelfService, RecommendedFragrance } from '../../core/services/shelf.service';
import { FragranceSummary } from '../../core/models/fragrance.model';
import { FragranceCardComponent } from '../../shared/components/fragrance-card/fragrance-card.component';
import { AppSkeletonComponent } from '../../shared/components/app-skeleton/app-skeleton.component';
import { AppErrorStateComponent } from '../../shared/components/app-error-state/app-error-state.component';

addIcons({ search, 'notifications-outline': notificationsOutline, star });

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    IonContent,
    IonIcon,
    FragranceCardComponent,
    AppSkeletonComponent,
    AppErrorStateComponent,
  ],
  template: `
    <ion-content [fullscreen]="true">
      <div class="px-4 pt-4 pb-24 max-w-3xl mx-auto">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4 relative">
          <span class="font-display text-xl text-primary">OLFATTO</span>
          <button type="button" (click)="showNotifications.set(!showNotifications())" class="relative">
            <ion-icon name="notifications-outline" class="text-xl text-text-secondary"></ion-icon>
          </button>

          @if (showNotifications()) {
            <div class="absolute top-8 right-0 w-64 ol-elevated rounded-card p-3 z-50 shadow-lg">
              <p class="text-xs font-medium text-text-primary mb-2">{{ 'NOTIFICATIONS.TITLE' | translate }}</p>
              <p class="text-text-muted text-xs">{{ 'NOTIFICATIONS.EMPTY' | translate }}</p>
            </div>
          }
        </div>

        <h1 class="text-xl font-medium text-text-primary">
          {{ 'HOME.GREETING' | translate: { name: userName() } }}
        </h1>
        <p class="text-text-secondary text-sm mb-4">{{ 'HOME.SUBTITLE' | translate }}</p>

        <a
          routerLink="/fragrances"
          class="flex items-center gap-2 px-4 py-3 rounded-button bg-surface border border-border
                 text-text-muted text-sm mb-6"
        >
          <ion-icon name="search"></ion-icon>
          {{ 'HOME.SEARCH_PLACEHOLDER' | translate }}
        </a>

        <!-- Para tu piel — point 24, real compatibility score -->
        <section class="mb-6">
          <h2 class="text-sm font-medium text-text-primary mb-3">{{ 'HOME.FOR_YOUR_SKIN' | translate }}</h2>
          @switch (forYouState()) {
            @case ('loading') {
              <app-skeleton [count]="2" [columns]="2"></app-skeleton>
            }
            @case ('error') {
              <app-error-state [message]="'COMMON.LOAD_ERROR' | translate" (retry)="loadForYou()"></app-error-state>
            }
            @case ('success') {
              @if (forYou().length === 0) {
                <p class="text-text-muted text-xs">{{ 'HOME.NO_RECOMMENDATIONS_YET' | translate }}</p>
              } @else {
                <div class="grid grid-cols-2 gap-3">
                  @for (item of forYou(); track item.fragranceId) {
                    <a
                      [routerLink]="['/fragrances', item.fragranceId]"
                      class="block rounded-card overflow-hidden ol-elevated p-3"
                    >
                      <p class="text-sm font-medium text-text-primary truncate">{{ item.name }}</p>
                      <p class="text-xs text-text-secondary truncate">{{ item.brandName }}</p>
                      <div class="flex items-center justify-between mt-2 pt-2 border-t border-border text-[11px]">
                        <span class="text-primary font-medium">{{ item.compatibilityScore }}% {{ 'HOME.COMPATIBLE' | translate }}</span>
                        @if (item.averageDurationHours !== null) {
                          <span class="text-text-muted">{{ item.averageDurationHours.toFixed(1) }}h</span>
                        }
                      </div>
                    </a>
                  }
                </div>
              }
            }
          }
        </section>

        <!-- Tendencias -->
        <section>
          <h2 class="text-sm font-medium text-text-primary mb-3">{{ 'HOME.TRENDING' | translate }}</h2>
          @switch (trendingState()) {
            @case ('loading') {
              <app-skeleton [count]="3" [columns]="1"></app-skeleton>
            }
            @case ('error') {
              <app-error-state [message]="'COMMON.LOAD_ERROR' | translate" (retry)="loadTrending()"></app-error-state>
            }
            @case ('success') {
              <div class="space-y-3">
                @for (item of trending(); track item.id) {
                  <app-fragrance-card [fragrance]="item"></app-fragrance-card>
                }
              </div>
            }
          }
        </section>
      </div>
    </ion-content>
  `,
})
export class HomePage {
  private readonly authService = inject(AuthService);
  private readonly fragranceService = inject(FragranceService);
  private readonly shelfService = inject(ShelfService);

  readonly userName = computed(() => this.authService.currentUser()?.name.split(' ')[0] ?? '');
  readonly showNotifications = signal(false);

  readonly forYou = signal<RecommendedFragrance[]>([]);
  readonly forYouState = signal<LoadState>('loading');

  readonly trending = signal<FragranceSummary[]>([]);
  readonly trendingState = signal<LoadState>('loading');

  constructor() {
    this.loadForYou();
    this.loadTrending();
  }

  loadForYou(): void {
    this.forYouState.set('loading');
    this.shelfService.getRecommendations().subscribe({
      next: (res) => {
        this.forYou.set(res.data);
        this.forYouState.set('success');
      },
      error: () => this.forYouState.set('error'),
    });
  }

  loadTrending(): void {
    this.trendingState.set('loading');
    this.fragranceService.list({ sortBy: 'mostReviewed', limit: 3 }).subscribe({
      next: (res) => {
        this.trending.set(res.data);
        this.trendingState.set('success');
      },
      error: () => this.trendingState.set('error'),
    });
  }
}
