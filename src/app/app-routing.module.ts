import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { LandingComponent } from './landing/landing.component';
import {
  MatomoRouterModule,
  MatomoRouteDataInterceptor
} from 'ngx-matomo-client';
import { CountryComponent } from './country/country.component';

const pageTitle = 'Statistics Dashboard';
const routes: Routes = [
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
    path: 'privacy-policy',
    title: `${pageTitle} | Privacy Policy`,
    loadComponent: async () =>
      (await import('./privacy-policy/privacy-policy.component'))
        .PrivacyPolicyComponent
  },
  {
    title: pageTitle,
    path: '',
    component: LandingComponent
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    MatomoRouterModule.forRoot({
      // Declare built-in MatomoRouteDataInterceptor
      interceptors: [MatomoRouteDataInterceptor]
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
