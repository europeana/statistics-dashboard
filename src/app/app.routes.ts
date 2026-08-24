import { Routes } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { LandingComponent } from './landing/landing.component';
import { CountryComponent } from './country/country.component';

const pageTitle = 'Statistics Dashboard';

export const routes: Routes = [
  {
    title: `${pageTitle} | Filters`,
    path: 'country/:country',
    component: CountryComponent
  },
  {
    path: 'data/:facet',
    component: OverviewComponent
  },
  {
    path: 'cookie-policy',
    title: `${pageTitle} | Cookie Policy`,
    loadComponent: async () =>
      (await import('./cookie-policy/cookie-policy.component'))
        .CookiePolicyComponent
  },
  {
    path: 'privacy-statement',
    title: `${pageTitle} | Privacy Policy`,
    loadComponent: async () =>
      (await import('./privacy-statement/privacy-statement.component'))
        .PrivacyStatementComponent
  },
  {
    title: pageTitle,
    path: '',
    component: LandingComponent
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
