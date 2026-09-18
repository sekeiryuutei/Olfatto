import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

// Feature-based, lazily loaded (point 43/44) — mirrors the folder structure
// in the spec: core/shared/features.
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: 'rankings',
    loadComponent: () => import('./features/rankings/rankings.page').then((m) => m.RankingsPage),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.page').then((m) => m.ProfilePage),
    canActivate: [authGuard],
  },
  {
    path: 'fragrances',
    loadChildren: () =>
      import('./features/fragrances/fragrances.routes').then((m) => m.FRAGRANCES_ROUTES),
  },
  { path: '**', redirectTo: 'home' },
];
