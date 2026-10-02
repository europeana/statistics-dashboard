import {
  ApplicationConfig,
  importProvidersFrom,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi
} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

// Third-Party Vendors
import {
  MatomoConsentMode,
  MatomoRouteDataInterceptor,
  provideMatomo,
  withRouter,
  withRouterInterceptors
} from 'ngx-matomo-client';
import { maintenanceInterceptor } from '@europeana/metis-ui-maintenance-utils';

// Application Imports
import { routes } from './app.routes';
import { matomoSettings } from '../environments/matomo-settings';
import { maintenanceSettings } from '../environments/maintenance-settings';
import { AppDateAdapter } from './_helpers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),

    provideMatomo(
      {
        requireConsent: MatomoConsentMode.COOKIE,
        scriptUrl: matomoSettings.matomoScriptUrl,
        trackers: [
          {
            trackerUrl: matomoSettings.matomoTrackerUrl,
            siteId: matomoSettings.matomoSiteId
          }
        ],
        enableLinkTracking: true
      },
      withRouter(),
      withRouterInterceptors([MatomoRouteDataInterceptor])
    ),

    importProvidersFrom(
      FormsModule,
      MatDatepickerModule,
      MatDialogModule,
      MatFormFieldModule,
      ReactiveFormsModule
    ),

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
      withInterceptors([maintenanceInterceptor(maintenanceSettings)]),
      withInterceptorsFromDi()
    ),

    provideAnimationsAsync()
  ]
};
