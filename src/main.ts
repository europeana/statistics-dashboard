import {
  enableProdMode,
  importProvidersFrom,
  provideExperimentalZonelessChangeDetection
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi
} from '@angular/common/http';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { matomoSettings } from './environments/matomo-settings';
import { maintenanceSettings } from './environments/maintenance-settings';
import { routes } from './app/app.routes';

import {
  provideMatomo,
  withRouter,
  withRouterInterceptors,
  MatomoConsentMode,
  MatomoRouteDataInterceptor
} from 'ngx-matomo-client';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppDateAdapter } from './app/_helpers';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { maintenanceInterceptor } from '@europeana/metis-ui-maintenance-utils';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
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
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations()
  ]
}).catch((err) => console.error(err));
