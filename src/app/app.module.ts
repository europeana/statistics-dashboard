import {
  HttpClientModule,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Inject, Injectable, LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  NativeDateAdapter
} from '@angular/material/core';

import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  maintenanceInterceptor,
  MaintenanceUtilsModule
} from '@europeana/metis-ui-maintenance-utils';

import { MatomoConsentMode, MatomoModule } from 'ngx-matomo-client';
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
import { maintenanceSettings } from '../environments/maintenance-settings';
import { matomoSettings } from '../environments/matomo-settings';

@Injectable()
class AppDateAdapter extends NativeDateAdapter {
  public static readonly preferredFormat = 'DD/MM/YYYY';

  // used to display dates closed and open
  format(date: Date, displayFormat: Object): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    if (
      displayFormat === 'input' ||
      displayFormat === AppDateAdapter.preferredFormat
    ) {
      return getDateAsISOString(date).split('-').reverse().join('/');
    }
    return date.toLocaleDateString(this.locale, options);
  }

  // Used when user types date into input
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
  declarations: [AppComponent],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MaintenanceUtilsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatomoModule.forRoot({
      requireConsent: MatomoConsentMode.COOKIE,
      scriptUrl: matomoSettings.matomoScriptUrl,
      trackers: [
        {
          trackerUrl: matomoSettings.matomoTrackerUrl,
          siteId: matomoSettings.matomoSiteId
        }
      ],
      enableLinkTracking: true
    }),
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
  providers: [
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
    },
    provideHttpClient(
      withInterceptors([maintenanceInterceptor(maintenanceSettings)])
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    @Inject(LOCALE_ID) private readonly locale: string,
    private readonly dateAdapter: DateAdapter<unknown>
  ) {
    this.dateAdapter.setLocale(locale);
  }
}
