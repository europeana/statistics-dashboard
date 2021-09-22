import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { SplashComponent } from './splash/splash.component';
import { LandingComponent } from './landing/landing.component';
import { environment } from '../environments/environment';

const routes: Routes = [
  {
    path: 'data/:facet',
    component: OverviewComponent
  },
  {
    path: '',
    component: environment.useDataServer ? LandingComponent : SplashComponent
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
