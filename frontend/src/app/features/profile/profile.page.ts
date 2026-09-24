import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, camera } from 'ionicons/icons';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { FragranceService } from '../../core/services/fragrance.service';
import { ShelfService } from '../../core/services/shelf.service';
import { BillingService, MySubscription } from '../../core/services/billing.service';
import {
  Climate,
  PreferredDuration,
  ProjectionLevel,
  SkinType,
  UserProfile,
} from '../../core/models/user.model';
import { FragranceSummary } from '../../core/models/fragrance.model';
import { AppEmptyStateComponent } from '../../shared/components/app-empty-state/app-empty-state.component';
import { placeholderImageDataUri } from '../../shared/utils/placeholder-image';

addIcons({ 'log-out-outline': logOutOutline, camera });

type ShelfTab = 'collection' | 'wishlist' | 'favorites';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    IonContent,
    IonIcon,
    IonSpinner,
    AppEmptyStateComponent,
  ],
  template: `
    <ion-content>
      <div class="px-4 pt-6 pb-24 max-w-2xl mx-auto">
        <!-- point 26 header -->
        <div class="flex flex-col items-center text-center mb-6">
          <label class="relative cursor-pointer">
            <img
              [src]="avatarSrc()"
              (error)="avatarFailed.set(true)"
              class="w-20 h-20 rounded-full object-cover mb-3 border border-border"
            />
            <span class="absolute bottom-3 right-0 w-6 h-6 rounded-full bg-primary text-bg text-xs flex items-center justify-center">
              @if (uploadingAvatar()) {
                <ion-spinner name="dots" style="width:12px;height:12px"></ion-spinner>
              } @else {
                <ion-icon name="camera" class="text-[13px]"></ion-icon>
              }
            </span>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" (change)="onAvatarSelected($event)" />
          </label>
          @if (avatarError()) {
            <p class="text-danger text-[11px] mb-2">{{ avatarError() | translate }}</p>
          }

          <p class="text-lg font-medium text-text-primary">{{ authService.currentUser()?.name }}</p>
          @if (profile(); as p) {
            <p class="text-text-secondary text-sm">{{ 'SKIN_TYPE.' + p.skinType | translate }}</p>
          }
          <p class="text-text-muted text-xs mt-1">
            {{ collectionCount() }} {{ 'PROFILE.FRAGRANCES' | translate }} · {{ reviewCount() }} {{ 'FRAGRANCE.REVIEWS' | translate }}
          </p>
        </div>

        <!-- Olfatto Club (monetización 1) -->
        <section class="rounded-card p-4 mb-4 border" [class]="subscription()?.isActive ? 'border-primary bg-primary/10' : 'ol-elevated'">
          <div class="flex items-center justify-between mb-1">
            <p class="font-display text-lg text-primary">Olfatto Club</p>
            @if (subscription()?.isActive) {
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-primary text-bg font-medium">{{ 'CLUB.ACTIVE_BADGE' | translate }}</span>
            }
          </div>

          @if (subscription()?.isActive) {
            <p class="text-text-secondary text-xs mb-3">{{ 'CLUB.ACTIVE_HINT' | translate }}</p>
            <button
              type="button"
              (click)="openBillingPortal()"
              [disabled]="billingLoading()"
              class="w-full py-2.5 rounded-button border border-border text-text-primary text-sm font-medium disabled:opacity-50"
            >
              {{ 'CLUB.MANAGE_CTA' | translate }}
            </button>
          } @else {
            <p class="text-text-secondary text-xs mb-3">{{ 'CLUB.PITCH' | translate }}</p>
            <button
              type="button"
              (click)="startCheckout()"
              [disabled]="billingLoading()"
              class="w-full py-2.5 rounded-button bg-primary text-bg text-sm font-medium disabled:opacity-50
                     flex items-center justify-center gap-2"
            >
              @if (billingLoading()) {
                <ion-spinner name="dots"></ion-spinner>
              } @else {
                {{ 'CLUB.JOIN_CTA' | translate }}
              }
            </button>
          }
          @if (billingError()) {
            <p class="text-danger text-[11px] mt-2">{{ billingError() }}</p>
          }
        </section>

        <!-- Editar perfil olfativo -->
        @if (profile(); as p) {
          <section class="ol-elevated rounded-card p-4 mb-4">
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

        <!-- Cambiar contraseña -->
        <section class="ol-elevated rounded-card p-4 mb-6">
          <button type="button" (click)="showPasswordForm.set(!showPasswordForm())" class="text-sm font-medium text-text-primary w-full text-left">
            {{ 'PROFILE.CHANGE_PASSWORD' | translate }}
          </button>

          @if (showPasswordForm()) {
            <form [formGroup]="passwordForm" (ngSubmit)="submitPasswordChange()" class="space-y-3 mt-3">
              <div>
                <label class="text-xs text-text-secondary">{{ 'PROFILE.CURRENT_PASSWORD' | translate }}</label>
                <input
                  type="password"
                  formControlName="currentPassword"
                  class="w-full mt-1 px-3.5 py-2.5 rounded-button bg-surface border border-border text-sm text-text-primary outline-none focus:border-primary"
                />
              </div>
              <div>
                <label class="text-xs text-text-secondary">{{ 'PROFILE.NEW_PASSWORD' | translate }}</label>
                <input
                  type="password"
                  formControlName="newPassword"
                  class="w-full mt-1 px-3.5 py-2.5 rounded-button bg-surface border border-border text-sm text-text-primary outline-none focus:border-primary"
                />
                <p class="text-[11px] text-text-muted mt-1">{{ 'AUTH.PASSWORD_HINT' | translate }}</p>
              </div>

              @if (passwordError()) {
                <p class="text-danger text-xs">{{ passwordError() }}</p>
              }
              @if (passwordSuccess()) {
                <p class="text-success text-xs">{{ 'PROFILE.PASSWORD_CHANGED' | translate }}</p>
              }

              <button
                type="submit"
                [disabled]="passwordForm.invalid || changingPassword()"
                class="w-full py-2.5 rounded-button bg-surface-elevated border border-border text-text-primary text-sm font-medium disabled:opacity-50
                       flex items-center justify-center gap-2"
              >
                @if (changingPassword()) {
                  <ion-spinner name="dots"></ion-spinner>
                } @else {
                  {{ 'PROFILE.UPDATE_PASSWORD_CTA' | translate }}
                }
              </button>
            </form>
          }
        </section>

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

        @if (shelfLoading()) {
          <p class="text-text-muted text-xs text-center py-8">{{ 'COMMON.LOADING' | translate }}</p>
        } @else if (shelfItems().length === 0) {
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
          class="w-full mt-8 py-3 rounded-button border border-danger text-danger text-sm font-medium
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
  private readonly billingService = inject(BillingService);
  private readonly fb = inject(FormBuilder);

  readonly skinTypeOptions = Object.values(SkinType);
  readonly durationOptions = Object.values(PreferredDuration);
  readonly projectionOptions = Object.values(ProjectionLevel);
  readonly climateOptions = Object.values(Climate);

  readonly profile = signal<UserProfile | null>(null);
  readonly saved = signal(false);

  // ---- Olfatto Club ----
  readonly subscription = signal<MySubscription | null>(null);
  readonly billingLoading = signal(false);
  readonly billingError = signal('');

  startCheckout(): void {
    this.billingLoading.set(true);
    this.billingError.set('');
    this.billingService.startCheckout().subscribe({
      next: (res) => (window.location.href = res.checkoutUrl),
      error: (err) => {
        this.billingLoading.set(false);
        this.billingError.set(err?.error?.message ?? 'CLUB.CHECKOUT_ERROR');
      },
    });
  }

  openBillingPortal(): void {
    this.billingLoading.set(true);
    this.billingError.set('');
    this.billingService.openBillingPortal().subscribe({
      next: (res) => (window.location.href = res.portalUrl),
      error: (err) => {
        this.billingLoading.set(false);
        this.billingError.set(err?.error?.message ?? 'CLUB.PORTAL_ERROR');
      },
    });
  }

  // ---- Avatar ----
  readonly uploadingAvatar = signal(false);
  readonly avatarFailed = signal(false);
  readonly avatarError = signal('');
  readonly avatarSrc = () => {
    const url = this.authService.currentUser()?.avatarUrl;
    return url && !this.avatarFailed() ? url : placeholderImageDataUri(this.authService.currentUser()?.name ?? '?');
  };

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingAvatar.set(true);
    this.avatarError.set('');
    this.userService.uploadAvatar(file).subscribe({
      next: (user) => {
        this.authService.updateCachedUser({ avatarUrl: user.avatarUrl });
        this.avatarFailed.set(false);
        this.uploadingAvatar.set(false);
      },
      error: (err) => {
        this.uploadingAvatar.set(false);
        this.avatarError.set(err?.error?.message ?? 'PROFILE.AVATAR_ERROR');
      },
    });
    input.value = '';
  }

  // ---- Perfil olfativo ----
  editSkinType: SkinType = SkinType.UNKNOWN;
  editPreferredDuration: PreferredDuration = PreferredDuration.MODERATE;
  editPreferredProjection: ProjectionLevel = ProjectionLevel.MODERATE;
  editClimate: Climate = Climate.TEMPERATE;

  // ---- Cambiar contraseña ----
  readonly showPasswordForm = signal(false);
  readonly changingPassword = signal(false);
  readonly passwordError = signal('');
  readonly passwordSuccess = signal(false);

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
      ],
    ],
  });

  submitPasswordChange(): void {
    if (this.passwordForm.invalid) return;
    this.changingPassword.set(true);
    this.passwordError.set('');
    this.passwordSuccess.set(false);

    this.authService.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordSuccess.set(true);
        this.passwordForm.reset();
      },
      error: (err) => {
        this.changingPassword.set(false);
        this.passwordError.set(err?.error?.message ?? 'No pudimos cambiar tu contraseña.');
      },
    });
  }

  // ---- Estante (Colección/Wishlist/Favoritos) ----
  readonly shelfTab = signal<ShelfTab>('collection');
  readonly shelfItems = signal<FragranceSummary[]>([]);
  readonly shelfLoading = signal(true);
  readonly collectionCount = signal(0);
  readonly reviewCount = signal(0); // NOTE: no dedicated "my reviews" endpoint yet (see PROGRESS.md)

  constructor() {
    this.userService.getProfile().subscribe((p) => {
      this.profile.set(p);
      this.editSkinType = p.skinType;
      this.editPreferredDuration = p.preferredDuration ?? PreferredDuration.MODERATE;
      this.editPreferredProjection = p.preferredProjection ?? ProjectionLevel.MODERATE;
      this.editClimate = p.climate ?? Climate.TEMPERATE;
    });
    this.billingService.getMySubscription().subscribe((sub) => this.subscription.set(sub));
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
    this.shelfLoading.set(true);
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

          // Each fragrance is fetched independently with its own catchError —
          // one missing/deleted fragrance must not blank out the whole shelf
          // (forkJoin fails the entire batch on a single inner error otherwise).
          const fetches = res.data.map((entry) =>
            this.fragranceService.getById(entry.fragranceId).pipe(catchError(() => of(null))),
          );

          return forkJoin(fetches).pipe(
            switchMap((results) => {
              const items = results
                .filter((d): d is NonNullable<typeof d> => d !== null)
                .map((d) => ({
                  id: d.id,
                  name: d.name,
                  brandId: d.brand?.id ?? '',
                  concentration: d.concentration,
                  gender: d.gender,
                  imageUrl: d.imageUrl,
                  averageRating: d.performance.averageRating,
                  reviewCount: d.performance.reviewCount,
                  averageDurationHours: d.performance.averageDurationHours,
                }));
              return of(items);
            }),
          );
        }),
      )
      .subscribe({
        next: (items) => {
          this.shelfItems.set(items);
          this.shelfLoading.set(false);
        },
        error: () => {
          this.shelfItems.set([]);
          this.shelfLoading.set(false);
        },
      });
  }
}
