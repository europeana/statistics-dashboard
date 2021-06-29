import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ClickOutsideModule } from 'ng-click-outside';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { RenameApiFacetPipe, RenameRightsPipe } from './_translate';

import { BarComponent, MapComponent } from './chart';
import { CheckboxComponent } from './checkbox';
import { FilterComponent } from './filter';
import { FooterComponent } from './footer';
import { HeaderComponent } from './header';

import { ListingComponent } from './listing/listing.component';
import { OverviewComponent } from './overview/overview.component';
import { SplashComponent } from './splash/splash.component';
import { TruncateComponent } from './truncate';
import { DatesComponent } from './dates/dates.component';

@NgModule({
  declarations: [
    AppComponent,
    BarComponent,
    CheckboxComponent,
    DatesComponent,
    FilterComponent,
    FooterComponent,
    HeaderComponent,
    ListingComponent,
    MapComponent,
    OverviewComponent,
    RenameApiFacetPipe,
    RenameRightsPipe,
    SplashComponent,
    TruncateComponent
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
    NgxDatatableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
