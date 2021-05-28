import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OverviewComponent } from './overview/overview.component';

import { SplashComponent } from './splash/splash.component';

const routes: Routes = [
  {
    path: 'data/:facet',
    component: OverviewComponent
  },
  {
    path: '',
    component: SplashComponent
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
