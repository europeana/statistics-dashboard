import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClickOutsideModule } from 'ng-click-outside';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { RenameApiFacetPipe, RenameRightsPipe } from './_translate';

import { BarComponent, MapComponent } from './chart';
import { CheckboxComponent } from './checkbox';
import { FilterComponent } from './filter';
import { FooterComponent } from './footer';
import { HeaderComponent } from './header';
import { GridComponent } from './grid';
import { GridPaginatorComponent } from './grid-paginator';
import { OverviewComponent } from './overview/overview.component';
import { ResizeComponent } from './resize';
import { SplashComponent } from './splash/splash.component';
import { SnapshotsComponent } from './snapshots/snapshots.component';
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
    GridComponent,
    GridPaginatorComponent,
    HeaderComponent,
    MapComponent,
    OverviewComponent,
    RenameApiFacetPipe,
    RenameRightsPipe,
    ResizeComponent,
    SplashComponent,
    SnapshotsComponent,
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
    ClickOutsideModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
