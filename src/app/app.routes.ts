import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { ApiService } from './services/api.service';

// Blocks pages that need a logged-in user.
const authGuard: CanActivateFn = () =>
  inject(ApiService).user ? true : inject(Router).parseUrl('/login');

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/register.page').then(m => m.RegisterPage) },
  { path: 'users', canActivate: [authGuard], loadComponent: () => import('./pages/users.page').then(m => m.UsersPage) },
  { path: 'incidents', canActivate: [authGuard], loadComponent: () => import('./pages/incidents.page').then(m => m.IncidentsPage) },
];
