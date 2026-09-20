import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, heartOutline, heart, close } from 'ionicons/icons';
import { FragranceService } from '../../../core/services/fragrance.service';
import { ReviewService } from '../../../core/services/review.service';
import { ShelfService, CollectionStatus } from '../../../core/services/shelf.service';
import { FragranceDetail } from '../../../core/models/fragrance.model';
import { Review } from '../../../core/models/review.model';
import { ProjectionLevel } from '../../../core/models/user.model';
import { LongevityMeterComponent } from '../../../shared/components/longevity-meter/longevity-meter.component';
import { SkinTypeBadgeComponent } from '../../../shared/components/skin-type-badge/skin-type-badge.component';
import { ProjectionBadgeComponent } from '../../../shared/components/projection-badge/projection-badge.component';
import { AppErrorStateComponent } from '../../../shared/components/app-error-state/app-error-state.component';
import { AppEmptyStateComponent } from '../../../shared/components/app-empty-state/app-empty-state.component';

addIcons({ star, 'heart-outline': heartOutline, heart, close });

type LoadState = 'loading' | 'success' | 'error';

@Component({
  selector: 'app-fragrance-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonSpinner,
    LongevityMeterComponent,
    SkinTypeBadgeComponent,
    ProjectionBadgeComponent,
    AppErrorStateComponent,
    AppEmptyStateComponent,
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/fragrances"></ion-back-button></ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      @if (shelfMessage()) {
        <div class="fixed top-3 left-4 right-4 z-50 bg-danger/90 text-white text-xs rounded-button px-3 py-2 text-center">
          {{ shelfMessage() | translate }}
        </div>
      }
      @switch (state()) {
        @case ('loading') {
          <div class="animate-pulse px-4 space-y-4">
            <div class="aspect-square rounded-card bg-surface"></div>
            <div class="h-4 w-1/2 bg-surface rounded"></div>
          </div>
        }
        @case ('error') {
          <app-error-state [message]="'COMMON.LOAD_ERROR' | translate" (retry)="load()"></app-error-state>
        }
        @case ('success') {
          @if (fragrance(); as f) {
            <div class="pb-24 max-w-2xl mx-auto">
              <!-- Hero -->
              <div class="relative aspect-square bg-surface flex items-center justify-center mx-4 rounded-card overflow-hidden">
                @if (f.imageUrl) {
                  <img [src]="f.imageUrl" [alt]="f.name" class="w-full h-full object-cover" />
                } @else {
                  <span class="font-display text-6xl text-text-muted">{{ f.name[0] }}</span>
                }
                <button
                  type="button"
                  (click)="toggleFavorite()"
                  class="absolute top-3 right-3 w-9 h-9 rounded-full bg-bg/60 backdrop-blur flex items-center justify-center"
                  [class.text-primary]="isFavorite()"
                >
                  <ion-icon [name]="isFavorite() ? 'heart' : 'heart-outline'"></ion-icon>
                </button>
              </div>

              <div class="px-4 mt-4">
                <p class="text-text-secondary text-xs">{{ f.brand?.name }}</p>
                <h1 class="text-2xl font-medium text-text-primary">{{ f.name }}</h1>
                <p class="text-text-secondary text-sm">{{ f.concentration }}</p>

                <div class="flex items-center gap-1.5 mt-2 text-primary text-sm">
                  <ion-icon name="star"></ion-icon>
                  <span class="font-medium">{{ f.performance.averageRating.toFixed(1) }}</span>
                  <span class="text-text-muted text-xs">
                    · {{ f.performance.reviewCount }} {{ 'FRAGRANCE.REVIEWS' | translate }}
                  </span>
                </div>

                <!-- Estante virtual (point 25) -->
                <div class="flex gap-2 mt-3">
                  <button
                    type="button"
                    (click)="setCollectionStatus('OWNED')"
                    class="flex-1 py-2 rounded-button text-xs font-medium border"
                    [class]="collectionStatus() === 'OWNED' ? 'bg-primary text-bg border-primary' : 'border-border text-text-secondary'"
                  >
                    {{ collectionStatus() === 'OWNED' ? ('SHELF.OWNED_DONE' | translate) : ('SHELF.MARK_OWNED' | translate) }}
                  </button>
                  <button
                    type="button"
                    (click)="setCollectionStatus('TESTED')"
                    class="flex-1 py-2 rounded-button text-xs font-medium border"
                    [class]="collectionStatus() === 'TESTED' ? 'bg-primary text-bg border-primary' : 'border-border text-text-secondary'"
                  >
                    {{ collectionStatus() === 'TESTED' ? ('SHELF.TESTED_DONE' | translate) : ('SHELF.MARK_TESTED' | translate) }}
                  </button>
                </div>

                <!-- Métricas principales (point 15) -->
                <div class="grid grid-cols-3 gap-2 mt-5 text-center">
                  <div class="ol-elevated rounded-card py-3">
                    <p class="text-lg font-medium text-text-primary">{{ f.performance.averageDurationHours.toFixed(1) }}h</p>
                    <p class="text-[11px] text-text-muted">{{ 'FRAGRANCE.DURATION' | translate }}</p>
                  </div>
                  <div class="ol-elevated rounded-card py-3">
                    <p class="text-lg font-medium text-text-primary">
                      {{ f.performance.dominantProjection ?? '—' }}
                    </p>
                    <p class="text-[11px] text-text-muted">{{ 'FRAGRANCE.PROJECTION' | translate }}</p>
                  </div>
                  <div class="ol-elevated rounded-card py-3">
                    <p class="text-lg font-medium text-text-primary">{{ f.releaseYear ?? '—' }}</p>
                    <p class="text-[11px] text-text-muted">{{ 'FRAGRANCE.YEAR' | translate }}</p>
                  </div>
                </div>

                @if (f.description) {
                  <p class="text-text-secondary text-sm mt-5 leading-relaxed">{{ f.description }}</p>
                }

                <!-- Familias y notas (point 18) -->
                @if (f.families.length) {
                  <h2 class="text-sm font-medium text-text-primary mt-6 mb-2">{{ 'FRAGRANCE.FAMILIES' | translate }}</h2>
                  <div class="flex flex-wrap gap-1.5">
                    @for (fam of f.families; track fam.id) {
                      <span class="px-2.5 py-1 rounded-full bg-surface border border-border text-xs text-text-secondary">{{ fam.name }}</span>
                    }
                  </div>
                }
                @if (f.notes.length) {
                  <h2 class="text-sm font-medium text-text-primary mt-4 mb-2">{{ 'FRAGRANCE.NOTES' | translate }}</h2>
                  <div class="flex flex-wrap gap-1.5">
                    @for (n of f.notes; track n.id) {
                      <span class="px-2.5 py-1 rounded-full bg-surface border border-border text-xs text-text-secondary">{{ n.name }}</span>
                    }
                  </div>
                }

                <!-- Duración experimentada (point 16) -->
                @if (f.performance.reviewCount > 0) {
                  <h2 class="text-sm font-medium text-text-primary mt-6 mb-3">{{ 'FRAGRANCE.DURATION_DISTRIBUTION' | translate }}</h2>
                  <app-longevity-meter [buckets]="f.performance.durationDistribution"></app-longevity-meter>

                  <!-- Rendimiento por piel (point 17) -->
                  @if (f.performance.skinPerformance.length) {
                    <h2 class="text-sm font-medium text-text-primary mt-6 mb-3">{{ 'FRAGRANCE.SKIN_PERFORMANCE' | translate }}</h2>
                    <div class="space-y-3">
                      @for (entry of f.performance.skinPerformance; track entry.skinType) {
                        <div class="ol-elevated rounded-card p-3">
                          <div class="flex items-center justify-between mb-1.5">
                            <app-skin-type-badge [skinType]="entry.skinType"></app-skin-type-badge>
                            <app-projection-badge [projection]="entry.dominantProjection"></app-projection-badge>
                          </div>
                          <div class="flex items-center justify-between text-xs text-text-secondary">
                            <span>{{ 'FRAGRANCE.DURATION' | translate }}: {{ entry.averageDurationHours }}h</span>
                            <span>★ {{ entry.averageRating }}</span>
                            <span>{{ entry.reviewCount }} {{ 'FRAGRANCE.REVIEWS' | translate }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  }
                } @else {
                  <p class="text-text-muted text-xs mt-6">{{ 'FRAGRANCE.NO_REVIEWS_YET' | translate }}</p>
                }

                <!-- Composer de reseña (point 19) -->
                <h2 class="text-sm font-medium text-text-primary mt-8 mb-3">{{ 'FRAGRANCE.REVIEWS' | translate }}</h2>

                @if (!showComposer()) {
                  <button
                    type="button"
                    (click)="showComposer.set(true)"
                    class="w-full mb-4 py-2.5 rounded-button border border-primary text-primary text-sm font-medium"
                  >
                    {{ 'REVIEW.WRITE_CTA' | translate }}
                  </button>
                } @else {
                  <form [formGroup]="reviewForm" (ngSubmit)="submitReview()" class="ol-elevated rounded-card p-4 mb-4 space-y-4">
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-medium text-text-primary">{{ 'REVIEW.HOW_WAS_IT' | translate }}</p>
                      <button type="button" (click)="showComposer.set(false)" class="text-text-muted">
                        <ion-icon name="close"></ion-icon>
                      </button>
                    </div>

                    <div class="flex gap-2">
                      <button
                        type="button"
                        (click)="reviewForm.patchValue({ liked: true })"
                        class="flex-1 py-2 rounded-button border text-sm"
                        [class]="reviewForm.value.liked === true ? 'bg-success/20 border-success text-success' : 'border-border text-text-secondary'"
                      >
                        👍 {{ 'REVIEW.LIKED' | translate }}
                      </button>
                      <button
                        type="button"
                        (click)="reviewForm.patchValue({ liked: false })"
                        class="flex-1 py-2 rounded-button border text-sm"
                        [class]="reviewForm.value.liked === false ? 'bg-danger/20 border-danger text-danger' : 'border-border text-text-secondary'"
                      >
                        👎 {{ 'REVIEW.DISLIKED' | translate }}
                      </button>
                    </div>

                    <div>
                      <label class="text-xs text-text-secondary flex justify-between">
                        <span>{{ 'REVIEW.RATING' | translate }}</span>
                        <span class="text-primary">{{ reviewForm.value.rating }}★</span>
                      </label>
                      <input type="range" min="0" max="5" step="0.5" formControlName="rating" class="w-full accent-primary" />
                    </div>

                    <div>
                      <label class="text-xs text-text-secondary flex justify-between">
                        <span>{{ 'REVIEW.DURATION' | translate }}</span>
                        <span class="text-primary">{{ reviewForm.value.durationHours }}h</span>
                      </label>
                      <input type="range" min="1" max="24" step="0.5" formControlName="durationHours" class="w-full accent-primary" />
                    </div>

                    <div>
                      <label class="text-xs text-text-secondary">{{ 'REVIEW.PROJECTION' | translate }}</label>
                      <select
                        formControlName="projection"
                        class="w-full mt-1 px-3 py-2 rounded-button bg-surface border border-border text-sm text-text-primary"
                      >
                        @for (opt of projectionOptions; track opt) {
                          <option [value]="opt">{{ 'PROJECTION.' + opt | translate }}</option>
                        }
                      </select>
                    </div>

                    <div>
                      <label class="text-xs text-text-secondary flex justify-between">
                        <span>{{ 'REVIEW.COMMENT' | translate }}</span>
                        <span class="text-text-muted">{{ reviewForm.value.comment?.length ?? 0 }}/280</span>
                      </label>
                      <textarea
                        formControlName="comment"
                        maxlength="280"
                        rows="3"
                        class="w-full mt-1 px-3 py-2 rounded-button bg-surface border border-border text-sm text-text-primary outline-none focus:border-primary"
                      ></textarea>
                    </div>

                    @if (reviewError()) {
                      <p class="text-danger text-xs">{{ reviewError() }}</p>
                    }

                    <button
                      type="submit"
                      [disabled]="reviewForm.invalid || submittingReview()"
                      class="w-full py-2.5 rounded-button bg-primary text-bg text-sm font-medium disabled:opacity-50
                             flex items-center justify-center gap-2"
                    >
                      @if (submittingReview()) {
                        <ion-spinner name="dots"></ion-spinner>
                      } @else {
                        {{ 'REVIEW.PUBLISH' | translate }}
                      }
                    </button>
                  </form>
                }

                <h2 class="text-sm font-medium text-text-primary mt-8 mb-1">{{ 'FRAGRANCE.TOP_REVIEWS' | translate }}</h2>
                <p class="text-text-muted text-[11px] mb-3">{{ 'FRAGRANCE.TOP_REVIEWS_HINT' | translate }}</p>

                @if (reviews().length === 0) {
                  <app-empty-state icon="✍️" [message]="'FRAGRANCE.NO_REVIEWS_YET' | translate"></app-empty-state>
                } @else {
                  <div class="space-y-3">
                    @for (r of reviews(); track r.id) {
                      <div class="ol-elevated rounded-card p-3">
                        <div class="flex items-center gap-2 mb-2">
                          @if (r.authorAvatarUrl) {
                            <img [src]="r.authorAvatarUrl" class="w-7 h-7 rounded-full object-cover" [alt]="r.authorName ?? ''" />
                          } @else {
                            <div class="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center text-xs text-primary shrink-0">
                              {{ (r.authorName ?? '?')[0] }}
                            </div>
                          }
                          <span class="text-sm text-text-primary font-medium flex-1 truncate">{{ r.authorName }}</span>
                          <span class="text-primary text-xs shrink-0">★ {{ r.rating.toFixed(1) }}</span>
                        </div>
                        <div class="flex items-center gap-2 mb-2">
                          <app-skin-type-badge [skinType]="r.skinTypeSnapshot"></app-skin-type-badge>
                          <app-projection-badge [projection]="r.projection"></app-projection-badge>
                          <span class="text-[11px] text-text-muted">⏱ {{ r.durationHours }}h</span>
                        </div>
                        @if (r.comment) {
                          <p class="text-text-secondary text-sm mb-2">{{ r.comment }}</p>
                        }
                        <button
                          type="button"
                          (click)="toggleHelpful(r)"
                          class="flex items-center gap-1.5 text-xs"
                          [class.text-primary]="markedHelpful().has(r.id)"
                          [class.text-text-muted]="!markedHelpful().has(r.id)"
                        >
                          <ion-icon [name]="markedHelpful().has(r.id) ? 'heart' : 'heart-outline'"></ion-icon>
                          <span>{{ r.helpfulCount }} · {{ 'REVIEW.HELPFUL' | translate }}</span>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        }
      }
    </ion-content>
  `,
})
export class FragranceDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly fragranceService = inject(FragranceService);
  private readonly reviewService = inject(ReviewService);
  private readonly shelfService = inject(ShelfService);
  private readonly fb = inject(FormBuilder);

  readonly fragrance = signal<FragranceDetail | null>(null);
  readonly reviews = signal<Review[]>([]);
  readonly state = signal<LoadState>('loading');
  readonly isFavorite = signal(false);
  readonly collectionStatus = signal<CollectionStatus | null>(null);
  readonly shelfMessage = signal('');
  readonly markedHelpful = signal<Set<string>>(new Set());

  readonly projectionOptions = Object.values(ProjectionLevel);
  readonly showComposer = signal(false);
  readonly submittingReview = signal(false);
  readonly reviewError = signal('');

  readonly reviewForm = this.fb.nonNullable.group({
    liked: [true as boolean],
    rating: [4],
    durationHours: [6],
    projection: [ProjectionLevel.MODERATE],
    comment: ['', Validators.maxLength(280)],
  });

  private readonly fragranceId = this.route.snapshot.paramMap.get('id')!;

  constructor() {
    this.load();
  }

  load(): void {
    this.state.set('loading');
    this.fragranceService.getById(this.fragranceId).subscribe({
      next: (detail) => {
        this.fragrance.set(detail);
        this.state.set('success');
        this.reviewService.listForFragrance(this.fragranceId).subscribe({
          next: (res) => this.reviews.set(res.data),
          error: () => this.reviews.set([]),
        });
      },
      error: () => this.state.set('error'),
    });
  }

  toggleFavorite(): void {
    const next = !this.isFavorite();
    this.isFavorite.set(next);
    const action = next
      ? this.shelfService.addFavorite(this.fragranceId)
      : this.shelfService.removeFavorite(this.fragranceId);
    action.subscribe({
      error: () => {
        this.isFavorite.set(!next);
        this.flashShelfMessage('SHELF.ERROR');
      },
    });
  }

  setCollectionStatus(status: CollectionStatus): void {
    const previous = this.collectionStatus();
    // Tapping the same status again clears it (toggle-off); otherwise
    // OWNED/TESTED are mutually exclusive per point 25.
    const next = previous === status ? null : status;
    this.collectionStatus.set(next);

    const action = next
      ? this.shelfService.addToCollection(this.fragranceId, next)
      : this.shelfService.removeFromCollection(this.fragranceId);
    action.subscribe({
      error: () => {
        this.collectionStatus.set(previous);
        this.flashShelfMessage('SHELF.ERROR');
      },
    });
  }

  toggleHelpful(review: Review): void {
    const marked = this.markedHelpful();
    const alreadyMarked = marked.has(review.id);
    const action = alreadyMarked
      ? this.reviewService.unmarkHelpful(review.id)
      : this.reviewService.markHelpful(review.id);

    action.subscribe({
      next: () => {
        const updated = new Set(marked);
        alreadyMarked ? updated.delete(review.id) : updated.add(review.id);
        this.markedHelpful.set(updated);
        review.helpfulCount += alreadyMarked ? -1 : 1;
      },
      error: () => this.flashShelfMessage('REVIEW.HELPFUL_ERROR'),
    });
  }

  private flashShelfMessage(key: string): void {
    this.shelfMessage.set(key);
    setTimeout(() => this.shelfMessage.set(''), 3000);
  }

  submitReview(): void {
    if (this.reviewForm.invalid) return;
    this.submittingReview.set(true);
    this.reviewError.set('');

    this.reviewService.create(this.fragranceId, this.reviewForm.getRawValue()).subscribe({
      next: () => {
        this.submittingReview.set(false);
        this.showComposer.set(false);
        this.reviewForm.reset({
          liked: true,
          rating: 4,
          durationHours: 6,
          projection: ProjectionLevel.MODERATE,
          comment: '',
        });
        this.load(); // refresh performance stats + reviews list with the new data
      },
      error: (err) => {
        this.submittingReview.set(false);
        this.reviewError.set(err?.error?.message ?? 'No pudimos publicar tu reseña.');
      },
    });
  }
}
