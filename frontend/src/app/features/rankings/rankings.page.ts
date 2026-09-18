import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { RankingService, RankedFragrance, RankingTab } from '../../core/services/ranking.service';
import { UserService } from '../../core/services/user.service';
import { SkinType } from '../../core/models/user.model';
import { AppSkeletonComponent } from '../../shared/components/app-skeleton/app-skeleton.component';
import { AppErrorStateComponent } from '../../shared/components/app-error-state/app-error-state.component';
import { AppEmptyStateComponent } from '../../shared/components/app-empty-state/app-empty-state.component';

type LoadState = 'loading' | 'success' | 'error' | 'empty';

const TABS: { value: RankingTab; labelKey: string }[] = [
  { value: 'global', labelKey: 'RANKINGS.GLOBAL' },
  { value: 'skin', labelKey: 'RANKINGS.MY_SKIN' },
  { value: 'longevity', labelKey: 'RANKINGS.LONGEVITY' },
];

@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    IonContent,
    IonHeader,
    IonToolbar,
    AppSkeletonComponent,
    AppErrorStateComponent,
    AppEmptyStateComponent,
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <div class="px-4 pt-2">
          <h1 class="font-display text-2xl text-primary">{{ 'RANKINGS.TITLE' | translate }}</h1>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="px-4 pb-24 max-w-2xl mx-auto">
        <div class="flex gap-2 mb-4">
          @for (t of tabs; track t.value) {
            <button
              type="button"
              (click)="setTab(t.value)"
              class="flex-1 py-2 rounded-button text-xs font-medium border"
              [class]="activeTab() === t.value
                ? 'bg-primary text-bg border-primary'
                : 'bg-transparent text-text-secondary border-border'"
            >
              {{ t.labelKey | translate }}
            </button>
          }
        </div>

        @if (activeTab() === 'skin' && !userSkinType()) {
          <p class="text-text-muted text-xs mb-4">{{ 'RANKINGS.NO_SKIN_TYPE' | translate }}</p>
        }

        @switch (state()) {
          @case ('loading') {
            <app-skeleton [count]="6" [columns]="1"></app-skeleton>
          }
          @case ('error') {
            <app-error-state [message]="'COMMON.LOAD_ERROR' | translate" (retry)="load()"></app-error-state>
          }
          @case ('empty') {
            <app-empty-state icon="🏆" [message]="'RANKINGS.EMPTY' | translate"></app-empty-state>
          }
          @case ('success') {
            <div class="space-y-2">
              @for (item of items(); track item.fragranceId; let i = $index) {
                <a
                  [routerLink]="['/fragrances', item.fragranceId]"
                  class="flex items-center gap-3 p-3 rounded-card ol-elevated"
                >
                  <span class="font-display text-xl text-primary w-7 text-center shrink-0">{{ i + 1 }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-text-primary truncate">{{ item.name }}</p>
                    <p class="text-xs text-text-secondary truncate">{{ item.brandName }}</p>
                  </div>
                  <div class="text-right shrink-0">
                    <p class="text-sm text-primary font-medium">★ {{ item.averageRating.toFixed(1) }}</p>
                    <p class="text-[11px] text-text-muted">
                      {{ activeTab() === 'longevity' ? item.averageDurationHours.toFixed(1) + 'h' : item.reviewCount + ' reseñas' }}
                    </p>
                  </div>
                </a>
              }
            </div>
          }
        }
      </div>
    </ion-content>
  `,
})
export class RankingsPage {
  private readonly rankingService = inject(RankingService);
  private readonly userService = inject(UserService);

  readonly tabs = TABS;
  readonly activeTab = signal<RankingTab>('global');
  readonly items = signal<RankedFragrance[]>([]);
  readonly state = signal<LoadState>('loading');
  readonly userSkinType = signal<SkinType | null>(null);

  constructor() {
    this.userService.getProfile().subscribe({
      next: (profile) => this.userSkinType.set(profile.skinType !== SkinType.UNKNOWN ? profile.skinType : null),
      error: () => this.userSkinType.set(null),
    });
    this.load();
  }

  setTab(tab: RankingTab): void {
    this.activeTab.set(tab);
    this.load();
  }

  load(): void {
    this.state.set('loading');
    this.rankingService.getRanking(this.activeTab(), this.userSkinType() ?? undefined).subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.state.set(res.data.length === 0 ? 'empty' : 'success');
      },
      error: () => this.state.set('error'),
    });
  }
}
