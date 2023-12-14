import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { LandingComponent } from './landing/landing.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';

const routes: Routes = [
  {
    path: 'data/:facet',
    component: OverviewComponent
  },
  {
    path: 'cookie-policy',
    component: CookiePolicyComponent
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent
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
