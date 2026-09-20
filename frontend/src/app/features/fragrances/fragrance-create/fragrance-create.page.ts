import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { FragranceService } from '../../../core/services/fragrance.service';
import { CatalogReferenceService, CatalogRef } from '../../../core/services/catalog-reference.service';
import { Concentration, FragranceGender } from '../../../core/models/fragrance.model';

@Component({
  selector: 'app-fragrance-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonSpinner,
  ],
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start"><ion-back-button defaultHref="/fragrances"></ion-back-button></ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="px-4 pb-24 max-w-lg mx-auto">
        <h1 class="font-display text-2xl text-primary mb-1">{{ 'CREATE_FRAGRANCE.TITLE' | translate }}</h1>
        <p class="text-text-secondary text-sm mb-6">{{ 'CREATE_FRAGRANCE.SUBTITLE' | translate }}</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label class="text-xs text-text-secondary">{{ 'CREATE_FRAGRANCE.NAME' | translate }}</label>
            <input
              type="text"
              formControlName="name"
              class="w-full mt-1 px-3.5 py-2.5 rounded-button bg-surface border border-border text-sm text-text-primary outline-none focus:border-primary"
            />
          </div>

          <!-- Marca: elegir existente o escribir una nueva -->
          <div>
            <label class="text-xs text-text-secondary">{{ 'CREATE_FRAGRANCE.BRAND' | translate }}</label>
            @if (!creatingNewBrand()) {
              <select
                formControlName="brandId"
                class="w-full mt-1 px-3 py-2 rounded-button bg-surface border border-border text-sm text-text-primary"
              >
                <option value="" disabled>{{ 'CREATE_FRAGRANCE.SELECT_BRAND' | translate }}</option>
                @for (b of brands(); track b.id) {
                  <option [value]="b.id">{{ b.name }}</option>
                }
              </select>
              <button type="button" (click)="creatingNewBrand.set(true)" class="text-primary text-xs mt-1.5">
                {{ 'CREATE_FRAGRANCE.NEW_BRAND_CTA' | translate }}
              </button>
            } @else {
              <input
                type="text"
                [(ngModel)]="newBrandName"
                [ngModelOptions]="{ standalone: true }"
                [placeholder]="'CREATE_FRAGRANCE.NEW_BRAND_PLACEHOLDER' | translate"
                class="w-full mt-1 px-3.5 py-2.5 rounded-button bg-surface border border-border text-sm text-text-primary outline-none focus:border-primary"
              />
              <button type="button" (click)="creatingNewBrand.set(false)" class="text-text-muted text-xs mt-1.5">
                {{ 'CREATE_FRAGRANCE.USE_EXISTING_BRAND_CTA' | translate }}
              </button>
            }
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs text-text-secondary">{{ 'CREATE_FRAGRANCE.CONCENTRATION' | translate }}</label>
              <select
                formControlName="concentration"
                class="w-full mt-1 px-3 py-2 rounded-button bg-surface border border-border text-sm text-text-primary"
              >
                @for (opt of concentrationOptions; track opt) {
                  <option [value]="opt">{{ opt }}</option>
                }
              </select>
            </div>
            <div>
              <label class="text-xs text-text-secondary">{{ 'CREATE_FRAGRANCE.GENDER' | translate }}</label>
              <select
                formControlName="gender"
                class="w-full mt-1 px-3 py-2 rounded-button bg-surface border border-border text-sm text-text-primary"
              >
                @for (opt of genderOptions; track opt) {
                  <option [value]="opt">{{ 'GENDER.' + opt | translate }}</option>
                }
              </select>
            </div>
          </div>

          <div>
            <label class="text-xs text-text-secondary">{{ 'CREATE_FRAGRANCE.RELEASE_YEAR' | translate }}</label>
            <input
              type="number"
              formControlName="releaseYear"
              class="w-full mt-1 px-3.5 py-2.5 rounded-button bg-surface border border-border text-sm text-text-primary outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="text-xs text-text-secondary">{{ 'CREATE_FRAGRANCE.IMAGE_URL' | translate }}</label>
            <input
              type="url"
              formControlName="imageUrl"
              placeholder="https://..."
              class="w-full mt-1 px-3.5 py-2.5 rounded-button bg-surface border border-border text-sm text-text-primary outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="text-xs text-text-secondary">{{ 'CREATE_FRAGRANCE.DESCRIPTION' | translate }}</label>
            <textarea
              formControlName="description"
              rows="3"
              class="w-full mt-1 px-3 py-2 rounded-button bg-surface border border-border text-sm text-text-primary outline-none focus:border-primary"
            ></textarea>
          </div>

          <div>
            <label class="text-xs text-text-secondary">{{ 'CREATE_FRAGRANCE.FAMILIES' | translate }}</label>
            <div class="flex flex-wrap gap-1.5 mt-1.5">
              @for (fam of families(); track fam.id) {
                <button
                  type="button"
                  (click)="toggleFamily(fam.id)"
                  class="px-2.5 py-1 rounded-full text-xs border"
                  [class]="selectedFamilyIds().has(fam.id) ? 'bg-primary text-bg border-primary' : 'bg-transparent text-text-secondary border-border'"
                >
                  {{ fam.name }}
                </button>
              }
            </div>
          </div>

          <div>
            <label class="text-xs text-text-secondary">{{ 'CREATE_FRAGRANCE.NOTES' | translate }}</label>
            <div class="flex flex-wrap gap-1.5 mt-1.5">
              @for (n of notes(); track n.id) {
                <button
                  type="button"
                  (click)="toggleNote(n.id)"
                  class="px-2.5 py-1 rounded-full text-xs border"
                  [class]="selectedNoteIds().has(n.id) ? 'bg-primary text-bg border-primary' : 'bg-transparent text-text-secondary border-border'"
                >
                  {{ n.name }}
                </button>
              }
            </div>
          </div>

          @if (errorMessage()) {
            <p class="text-danger text-xs">{{ errorMessage() }}</p>
          }

          <button
            type="submit"
            [disabled]="form.invalid || submitting() || (creatingNewBrand() && !newBrandName.trim())"
            class="w-full py-3 rounded-button bg-primary text-bg font-medium text-sm disabled:opacity-50
                   flex items-center justify-center gap-2"
          >
            @if (submitting()) {
              <ion-spinner name="dots"></ion-spinner>
            } @else {
              {{ 'CREATE_FRAGRANCE.SUBMIT' | translate }}
            }
          </button>
        </form>
      </div>
    </ion-content>
  `,
})
export class FragranceCreatePage {
  private readonly fb = inject(FormBuilder);
  private readonly fragranceService = inject(FragranceService);
  private readonly catalogReferenceService = inject(CatalogReferenceService);
  private readonly router = inject(Router);

  readonly concentrationOptions = Object.values(Concentration);
  readonly genderOptions = Object.values(FragranceGender);

  readonly brands = signal<CatalogRef[]>([]);
  readonly families = signal<CatalogRef[]>([]);
  readonly notes = signal<CatalogRef[]>([]);

  readonly creatingNewBrand = signal(false);
  newBrandName = '';

  readonly selectedFamilyIds = signal<Set<string>>(new Set());
  readonly selectedNoteIds = signal<Set<string>>(new Set());

  readonly submitting = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    brandId: ['', Validators.required],
    concentration: [Concentration.EDP],
    gender: [FragranceGender.UNISEX],
    releaseYear: [new Date().getFullYear()],
    imageUrl: [''],
    description: [''],
  });

  constructor() {
    this.catalogReferenceService.listBrands().subscribe((b) => this.brands.set(b));
    this.catalogReferenceService.listFamilies().subscribe((f) => this.families.set(f));
    this.catalogReferenceService.listNotes().subscribe((n) => this.notes.set(n));
  }

  toggleFamily(id: string): void {
    const set = new Set(this.selectedFamilyIds());
    set.has(id) ? set.delete(id) : set.add(id);
    this.selectedFamilyIds.set(set);
  }

  toggleNote(id: string): void {
    const set = new Set(this.selectedNoteIds());
    set.has(id) ? set.delete(id) : set.add(id);
    this.selectedNoteIds.set(set);
  }

  submit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.errorMessage.set('');

    const buildAndSubmit = (brandId: string) => {
      const raw = this.form.getRawValue();
      this.fragranceService
        .create({
          name: raw.name,
          brandId,
          concentration: raw.concentration,
          gender: raw.gender,
          releaseYear: raw.releaseYear || undefined,
          description: raw.description || undefined,
          imageUrl: raw.imageUrl || undefined,
          familyIds: Array.from(this.selectedFamilyIds()),
          noteIds: Array.from(this.selectedNoteIds()),
        })
        .subscribe({
          next: (created) => {
            this.submitting.set(false);
            void this.router.navigate(['/fragrances', created.id]);
          },
          error: (err) => {
            this.submitting.set(false);
            this.errorMessage.set(err?.error?.message ?? 'No pudimos crear la fragancia.');
          },
        });
    };

    if (this.creatingNewBrand() && this.newBrandName.trim()) {
      this.catalogReferenceService.createBrand(this.newBrandName.trim()).subscribe({
        next: (brand) => buildAndSubmit(brand.id),
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err?.error?.message ?? 'No pudimos crear la marca.');
        },
      });
    } else {
      buildAndSubmit(this.form.getRawValue().brandId);
    }
  }
}
