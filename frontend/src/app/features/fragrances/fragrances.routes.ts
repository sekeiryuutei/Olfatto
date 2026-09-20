import { Routes } from '@angular/router';

export const FRAGRANCES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./fragrance-list/fragrance-list.page').then((m) => m.FragranceListPage),
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./fragrance-create/fragrance-create.page').then((m) => m.FragranceCreatePage),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./fragrance-detail/fragrance-detail.page').then((m) => m.FragranceDetailPage),
  },
];
