import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  NativeDateAdapter
} from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ClickAwareDirective, IsScrollableDirective } from './_directives';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  HighlightMatchPipe,
  RenameApiFacetPipe,
  RenameApiFacetShortPipe
} from './_translate';
import { BarComponent, MapComponent } from './chart';
import { CheckboxComponent } from './checkbox';
import { CTZeroControlComponent } from './ct-zero-control';
import { DatesComponent } from './dates';
import { ExportComponent } from './export';
import { FilterComponent } from './filter';
import { FooterComponent } from './footer';
import { HeaderComponent } from './header';
import { GridComponent } from './grid';
import { GridPaginatorComponent } from './grid-paginator';
import { GridSummaryComponent } from './grid-summary';
import { LandingComponent } from './landing';
import { OverviewComponent } from './overview';
import { ResizeComponent } from './resize';
import { SnapshotsComponent } from './snapshots';
import { TruncateComponent } from './truncate';

import { getDateAsISOString } from './_helpers';

class AppDateAdapter extends NativeDateAdapter {
  public static preferredFormat = 'DD/MM/YYYY';

  format(date: Date, displayFormat: Object): string {
    if (
      displayFormat === 'input' ||
      displayFormat === AppDateAdapter.preferredFormat
    ) {
      return getDateAsISOString(date).split('-').reverse().join('/');
    }
    return date.toDateString();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parse(value: any): Date | null {
    if (typeof value === 'string' && value.indexOf('/') > -1) {
      const str = value.split('/');
      const year = Number(str[2]);
      const month = Number(str[1]) - 1;
      const date = Number(str[0]);
      return new Date(year, month, date);
    }
    return null;
  }
}

@NgModule({
  declarations: [
    AppComponent,
    BarComponent,
    CheckboxComponent,
    CTZeroControlComponent,
    ClickAwareDirective,
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
    ResizeComponent,
    SnapshotsComponent,
    TruncateComponent,
    IsScrollableDirective
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatNativeDateModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: AppDateAdapter },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: AppDateAdapter.preferredFormat
        },
        dateInput: AppDateAdapter.preferredFormat,
        display: {
          dateInput: AppDateAdapter.preferredFormat,
          monthYearLabel: 'MM YYYY',
          dateA11yLabel: 'MM',
          monthYearA11yLabel: 'MMMM YYYY'
        }
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
