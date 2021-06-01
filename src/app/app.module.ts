import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ClickOutsideModule } from 'ng-click-outside';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { RenameApiFacetPipe } from './_translate';

import { BarComponent, MapComponent, PieComponent } from './chart';

//import { BarComponent } from './chart/bar.component';
//import { MapComponent } from './chart/map.component';
//import { PieComponent } from './chart/pie.component';

import { ListingComponent } from './listing/listing.component';
import { OverviewComponent } from './overview/overview.component';
import { SplashComponent } from './splash/splash.component';

@NgModule({
  declarations: [
    AppComponent,
    BarComponent,
    ListingComponent,
    MapComponent,
    OverviewComponent,
    PieComponent,
    RenameApiFacetPipe,
    SplashComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    ClickOutsideModule,
    NgxChartsModule,
    NgxDatatableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
