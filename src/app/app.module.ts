import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClickOutsideModule } from 'ng-click-outside';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { OverviewComponent } from './overview/overview.component';

@NgModule({
  declarations: [AppComponent, OverviewComponent],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    ClickOutsideModule,
    NgxChartsModule,
    NgxDatatableModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
