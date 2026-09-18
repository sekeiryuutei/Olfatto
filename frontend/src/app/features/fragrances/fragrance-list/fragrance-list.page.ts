import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonContent, IonIcon, IonBackButton, IonButtons, IonToolbar, IonHeader } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { FragranceService } from '../../../core/services/fragrance.service';
import { FragranceSortBy, FragranceSummary } from '../../../core/models/fragrance.model';
import { FragranceCardComponent } from '../../../shared/components/fragrance-card/fragrance-card.component';
import { AppSkeletonComponent } from '../../../shared/components/app-skeleton/app-skeleton.component';
import { AppErrorStateComponent } from '../../../shared/components/app-error-state/app-error-state.component';
import { AppEmptyStateComponent } from '../../../shared/components/app-empty-state/app-empty-state.component';

addIcons({ search });

type LoadState = 'loading' | 'success' | 'error' | 'empty';

const SORT_OPTIONS: { value: FragranceSortBy; labelKey: string }[] = [
  { value: 'relevance', labelKey: 'CATALOG.SORT.RELEVANCE' },
  { value: 'rating', labelKey: 'CATALOG.SORT.RATING' },
  { value: 'duration', labelKey: 'CATALOG.SORT.DURATION' },
  { value: 'mostReviewed', labelKey: 'CATALOG.SORT.MOST_REVIEWED' },
  { value: 'mostRecent', labelKey: 'CATALOG.SORT.MOST_RECENT' },
];

@Component({
  selector: 'app-fragrance-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    IonContent,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    FragranceCardComponent,
    AppSkeletonComponent,
    AppErrorStateComponent,
    AppEmptyStateComponent,
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/home"></ion-back-button></ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="px-4 pb-24 max-w-3xl mx-auto">
        <div class="flex items-center gap-2 px-3.5 py-2.5 rounded-button bg-surface border border-border mb-3">
          <ion-icon name="search" class="text-text-muted"></ion-icon>
          <input
            type="search"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange($event)"
            [placeholder]="'HOME.SEARCH_PLACEHOLDER' | translate"
            class="flex-1 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
          />
        </div>

        <div class="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
          @for (opt of sortOptions; track opt.value) {
            <button
              type="button"
              (click)="setSort(opt.value)"
              class="px-3 py-1.5 rounded-full text-xs whitespace-nowrap border"
              [class]="sortBy() === opt.value
                ? 'bg-primary text-bg border-primary'
                : 'bg-transparent text-text-secondary border-border'"
            >
              {{ opt.labelKey | translate }}
            </button>
          }
        </div>

        @switch (state()) {
          @case ('loading') {
            <app-skeleton [count]="6" [columns]="2"></app-skeleton>
          }
          @case ('error') {
            <app-error-state [message]="'COMMON.LOAD_ERROR' | translate" (retry)="load()"></app-error-state>
          }
          @case ('empty') {
            <app-empty-state icon="🔍" [message]="'CATALOG.EMPTY' | translate"></app-empty-state>
          }
          @case ('success') {
            <div class="grid grid-cols-2 gap-3">
              @for (item of items(); track item.id) {
                <app-fragrance-card [fragrance]="item"></app-fragrance-card>
              }
            </div>
          }
        }
      </div>
    </ion-content>
  `,
})
export class FragranceListPage {
  private readonly fragranceService = inject(FragranceService);
  private readonly searchChanged = new Subject<string>();

  readonly sortOptions = SORT_OPTIONS;
  searchTerm = '';
  readonly sortBy = signal<FragranceSortBy>('relevance');
  readonly items = signal<FragranceSummary[]>([]);
  readonly state = signal<LoadState>('loading');

  constructor() {
    this.searchChanged.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => this.load());
    this.load();
  }

  onSearchChange(value: string): void {
    this.searchChanged.next(value);
  }

  setSort(value: FragranceSortBy): void {
    this.sortBy.set(value);
    this.load();
  }

  load(): void {
    this.state.set('loading');
    this.fragranceService
      .list({ search: this.searchTerm || undefined, sortBy: this.sortBy(), limit: 20 })
      .subscribe({
        next: (res) => {
          this.items.set(res.data);
          this.state.set(res.data.length === 0 ? 'empty' : 'success');
        },
        error: () => this.state.set('error'),
      });
  }
}
