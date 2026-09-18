import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule, IonContent, IonIcon, IonSpinner],
  template: `
    <ion-content [fullscreen]="true" class="ol-auth">
      <div class="min-h-full flex flex-col justify-center px-6 py-12 max-w-sm mx-auto">
        <h1 class="font-display text-4xl text-primary mb-1">Olfatto</h1>
        <p class="text-text-secondary text-sm mb-8">{{ 'AUTH.LOGIN_SUBTITLE' | translate }}</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
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
              {{ 'AUTH.LOGIN_CTA' | translate }}
            }
          </button>
        </form>

        <p class="text-center text-text-secondary text-xs mt-6">
          {{ 'AUTH.NO_ACCOUNT' | translate }}
          <a routerLink="/auth/register" class="text-primary">{{ 'AUTH.REGISTER_CTA' | translate }}</a>
        </p>
      </div>
    </ion-content>
  `,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => void this.router.navigateByUrl('/home'),
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Email o contraseña incorrectos.');
      },
    });
  }
}
