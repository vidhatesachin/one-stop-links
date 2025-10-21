import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/auth/callback/callback.component').then(m => m.CallbackComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'business/:id/edit',
    loadComponent: () => import('./features/business-edit/business-edit.component').then(m => m.BusinessEditComponent),
    canActivate: [authGuard],
  },
  {
    path: ':slug',
    loadComponent: () => import('./features/preview/preview.component').then(m => m.PreviewComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
