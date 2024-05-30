import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { matomoSettings } from './environments/matomo-settings';
import { MatomoModule, MatomoConsentMode } from 'ngx-matomo-client';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app/app-routing.module';
import { maintenanceSettings } from './environments/maintenance-settings';
import {
  maintenanceInterceptor,
  MaintenanceUtilsModule
} from '@europeana/metis-ui-maintenance-utils';
import {
  provideHttpClient,
  withInterceptors,
  withInterceptorsFromDi
} from '@angular/common/http';
import { AppDateAdapter } from './app/_helpers';
import { targetsInterceptor } from './app/_services';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      AppRoutingModule,
      BrowserModule,
      FormsModule,
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
      })
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
      withInterceptors([
        maintenanceInterceptor(maintenanceSettings),
        targetsInterceptor()
      ])
    ),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi())
  ]
}).catch((err) => console.error(err));
