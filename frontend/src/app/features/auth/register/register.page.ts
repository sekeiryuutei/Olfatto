import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule, IonContent, IonSpinner],
  template: `
    <ion-content [fullscreen]="true">
      <div class="min-h-full flex flex-col justify-center px-6 py-12 max-w-sm mx-auto">
        <h1 class="font-display text-4xl text-primary mb-1">Olfatto</h1>
        <p class="text-text-secondary text-sm mb-8">{{ 'AUTH.REGISTER_SUBTITLE' | translate }}</p>

        <!-- point 10: registration only asks for name/email/password —
             the olfactive profile is completed later. -->
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="text-xs text-text-secondary">{{ 'AUTH.NAME' | translate }}</label>
            <input
              type="text"
              formControlName="name"
              class="w-full mt-1 px-3.5 py-2.5 rounded-button bg-surface border border-border
                     text-text-primary text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="text-xs text-text-secondary">{{ 'AUTH.EMAIL' | translate }}</label>
            <input
              type="email"
              formControlName="email"
              class="w-full mt-1 px-3.5 py-2.5 rounded-button bg-surface border border-border
                     text-text-primary text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="text-xs text-text-secondary">{{ 'AUTH.PASSWORD' | translate }}</label>
            <input
              type="password"
              formControlName="password"
              class="w-full mt-1 px-3.5 py-2.5 rounded-button bg-surface border border-border
                     text-text-primary text-sm outline-none focus:border-primary"
            />
            <p class="text-[11px] text-text-muted mt-1">{{ 'AUTH.PASSWORD_HINT' | translate }}</p>
          </div>

          @if (errorMessage()) {
            <p class="text-danger text-xs">{{ errorMessage() }}</p>
          }

          <button
            type="submit"
            [disabled]="form.invalid || loading()"
            class="w-full py-3 rounded-button bg-primary text-bg font-medium text-sm
                   disabled:opacity-50 flex items-center justify-center gap-2"
          >
            @if (loading()) {
              <ion-spinner name="dots"></ion-spinner>
            } @else {
              {{ 'AUTH.REGISTER_CTA' | translate }}
            }
          </button>
        </form>

        <p class="text-center text-text-secondary text-xs mt-6">
          {{ 'AUTH.HAS_ACCOUNT' | translate }}
          <a routerLink="/auth/login" class="text-primary">{{ 'AUTH.LOGIN_CTA' | translate }}</a>
        </p>
      </div>
    </ion-content>
  `,
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
      ],
    ],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl('/home'),
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'No pudimos crear tu cuenta.');
      },
    });
  }
}
