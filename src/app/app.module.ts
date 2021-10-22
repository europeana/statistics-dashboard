import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClickOutsideModule } from 'ng-click-outside';

import { IsScrollableDirective } from './_directives';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  HighlightMatchPipe,
  RenameApiFacetPipe,
  RenameApiFacetShortPipe,
  RenameRightsPipe
} from './_translate';
import { BarComponent, MapComponent } from './chart';
import { CheckboxComponent } from './checkbox';
import { DatesComponent } from './dates/dates.component';
import { ExportComponent } from './export';
import { FilterComponent } from './filter';
import { FooterComponent } from './footer';
import { HeaderComponent } from './header';
import { GridComponent } from './grid';
import { GridPaginatorComponent } from './grid-paginator';
import { GridSummaryComponent } from './grid-summary';
import { LandingComponent } from './landing/landing.component';
import { OverviewComponent } from './overview/overview.component';
import { ResizeComponent } from './resize';
import { SnapshotsComponent } from './snapshots/snapshots.component';
import { TruncateComponent } from './truncate';

@NgModule({
  declarations: [
    AppComponent,
    BarComponent,
    CheckboxComponent,
    DatesComponent,
    ExportComponent,
    FilterComponent,
    FooterComponent,
    GridComponent,
    GridPaginatorComponent,
    GridSummaryComponent,
    HeaderComponent,
    HighlightMatchPipe,
    LandingComponent,
    MapComponent,
    OverviewComponent,
    RenameApiFacetPipe,
    RenameApiFacetShortPipe,
    RenameRightsPipe,
    ResizeComponent,
    SnapshotsComponent,
    TruncateComponent,
    IsScrollableDirective
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
