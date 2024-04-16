import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { LandingComponent } from './landing/landing.component';
import { CountryComponent } from './country/country.component';

const routes: Routes = [
  {
    path: 'country',
    component: CountryComponent,

    data: {
      reuseComponent: true
    },

    children: [
      {
        path: 'x',
        loadComponent: async (): Promise<typeof DocArrowsComponent> => {
          const { DocArrowsComponent } = await import(
            './doc-arrows/doc-arrows.component'
          );
          return DocArrowsComponent;
        },
        data: {
          reuseComponent: true
        }
      }
    ]
  },
  {
    path: 'data/:facet',
    component: OverviewComponent
  },
  {
    path: 'cookie-policy',
    loadComponent: async () =>
      (await import('./cookie-policy/cookie-policy.component'))
        .CookiePolicyComponent
  },
  {
    path: 'privacy-policy',
    loadComponent: async () =>
      (await import('./privacy-policy/privacy-policy.component'))
        .PrivacyPolicyComponent
  },
  {
    path: '',
    component: LandingComponent
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
