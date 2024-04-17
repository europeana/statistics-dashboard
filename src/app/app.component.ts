import { Location, NgIf, PopStateEvent } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  Inject,
  LOCALE_ID,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterOutlet } from '@angular/router';
import {
  MaintenanceItem,
  MaintenanceScheduleService,
  MaintenanceSettings,
  MaintenanceUtilsModule
} from '@europeana/metis-ui-maintenance-utils';

import { cookieConsentConfig } from '../environments/eu-cm-settings';
import { maintenanceSettings } from '../environments/maintenance-settings';
import { SubscriptionManager } from './subscription-manager';
import { AppDateAdapter } from './_helpers';
import { APIService, ClickService } from './_services';
import {
  BreakdownResult,
  CountPercentageValue,
  GeneralResults,
  GeneralResultsFormatted
} from './_models';
import { LandingComponent } from './landing';
import { OverviewComponent } from './overview';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    NgIf,
    MaintenanceUtilsModule,
    HeaderComponent,
    RouterOutlet,
    FooterComponent
  ]
})
export class AppComponent extends SubscriptionManager implements OnInit {
  private readonly maintenanceService = inject(MaintenanceScheduleService);

  formCTZero: FormGroup<{ contentTierZero: FormControl<boolean> }>;
  landingData: GeneralResultsFormatted;
  landingComponentRef: LandingComponent;
  paramNameCTZero = 'content-tier-zero';
  showPageTitle: boolean;
  lastSetContentTierZeroValue = false;
  skipLocationUpdate = false;
  maintenanceInfo?: MaintenanceItem = undefined;

  @ViewChild('header') header: HeaderComponent;
  @ViewChild('consentContainer', { read: ViewContainerRef })
  consentContainer: ViewContainerRef;

  constructor(
    private readonly api: APIService,
    private readonly clickService: ClickService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly location: Location,
    @Inject(LOCALE_ID) private readonly locale: string,
    @Inject(LOCALE_ID) private readonly dateAdapter: AppDateAdapter
  ) {
    super();
    document.title = 'Statistics Dashboard';
    this.checkIfMaintenanceDue(maintenanceSettings);
    this.showCookieConsent();
  }

  checkIfMaintenanceDue(settings: MaintenanceSettings): void {
    this.maintenanceService.setApiSettings(settings);
    this.subs.push(
      this.maintenanceService
        .loadMaintenanceItem()
        .subscribe((item: MaintenanceItem | undefined) => {
          this.maintenanceInfo = item;
          if (item?.maintenanceMessage && this.landingComponentRef) {
            this.landingComponentRef.isLoading = false;
          }
        })
    );
  }

  /** buildForm
   * - builds single-field form for the general data content-tier zero option
   **/
  buildForm(): void {
    this.formCTZero = new FormBuilder().group({
      contentTierZero: this.lastSetContentTierZeroValue
    });

    this.subs.push(
      this.formCTZero.valueChanges.subscribe(() => {
        this.lastSetContentTierZeroValue =
          this.formCTZero.value.contentTierZero;

        if (!this.skipLocationUpdate) {
          this.updateLocation();
        } else {
          this.skipLocationUpdate = false;
        }
        this.loadLandingData(this.lastSetContentTierZeroValue);
      })
    );
  }

  /** documentClick
   * - global document click handler
   * - push the clicked element to the clickService
   **/
  @HostListener('document:click', ['$event'])
  documentClick(event: { target: HTMLElement }): void {
    this.clickService.documentClickedTarget.next(event.target);
  }

  /** getCtrlCTZero
   * - convenience function
   * @returns the contentTierZero input as a FormControl
   **/
  getCtrlCTZero(): FormControl {
    return this.formCTZero.get('contentTierZero') as FormControl;
  }

  /** loadLandingData
  /* - loads the general breakdown data
  /* - sets data on landingComponentRef
  /* @param { boolean: includeCTZero } - request content-tier-zero
  */
  loadLandingData(includeCTZero: boolean): void {
    this.landingComponentRef.isLoading = true;
    this.subs.push(
      this.api
        .getGeneralResults(includeCTZero)
        .subscribe((general: GeneralResults) => {
          this.landingData = {};
          general.allBreakdowns.forEach((br: BreakdownResult) => {
            this.landingData[br.breakdownBy] = br.results.map(
              (cpv: CountPercentageValue) => {
                return {
                  name: cpv.value,
                  value: cpv.count,
                  percent: cpv.percentage
                };
              }
            );
          });
          this.landingComponentRef.includeCTZero = includeCTZero;
          this.landingComponentRef.landingData = this.landingData;
          this.landingComponentRef.isLoading = false;
        })
    );
  }

  /**
   * handleLocationPopState
   * capture "back" and "forward" events / sync with form data
   * @param { PopStateEvent } state - the event
   **/
  handleLocationPopState(state: PopStateEvent): void {
    if (this.landingComponentRef) {
      const ctrlCTZero = this.getCtrlCTZero();
      this.lastSetContentTierZeroValue =
        `${state.url}`.indexOf('content-tier-zero=true') > -1;

      if (this.lastSetContentTierZeroValue !== ctrlCTZero.value) {
        this.skipLocationUpdate = true;
        ctrlCTZero.setValue(this.lastSetContentTierZeroValue);
      }
    }
  }

  /** ngOnInit
  /* - bind queryParam events to lastSetContentTierZeroValue
  /* - bind location back / forward events to form
  */
  ngOnInit(): void {
    this.subs.push(
      this.route.queryParams.subscribe((params: Params) => {
        // set default for form initalisation / track changes coming from either page
        this.lastSetContentTierZeroValue =
          params[this.paramNameCTZero] === 'true';
      })
    );
    this.location.subscribe(this.handleLocationPopState.bind(this));
  }

  /** onOutletLoaded
  /* - invoked when router component loads
  /*    - handles component data binding (since @Input() is unavailable in router-outlet)
  /*    - sets showPageTitle
  /* - if it's the landing page (first visit):
  /*      - builds the form
  /*      - loads the landing data
  /*    - sets landingComponentRef data
  /*    - and if it's the first arrival it:
  /* - (subsequent vist)
  /*    - reassigns existing landing data to landingComponentRef unless stale
  /*    - triggers data reload if form data is stale
  /* - (OverviewComponent)
  /*    - unassigns landingComponentRef
  /*
  /* @param { LandingComponent | OverviewComponent: component } - route component
  */
  onOutletLoaded(component: LandingComponent | OverviewComponent): void {
    if (component instanceof LandingComponent) {
      this.showPageTitle = true;
      this.landingComponentRef = component;
      this.landingComponentRef.includeCTZero = this.lastSetContentTierZeroValue;

      if (!this.formCTZero) {
        this.buildForm();
        this.loadLandingData(this.formCTZero.value.contentTierZero);
      } else {
        const ctrlCTZero = this.getCtrlCTZero();
        if (this.lastSetContentTierZeroValue !== ctrlCTZero.value) {
          this.skipLocationUpdate = true;
          ctrlCTZero.setValue(this.lastSetContentTierZeroValue);
        } else {
          this.landingComponentRef.landingData = this.landingData;
        }
      }
    } else {
      component.locale = this.locale;
      this.landingComponentRef = undefined;
      this.showPageTitle = false;
    }
  }

  /**
   * showCookieConsent
   * - calls show on cookieConsent
   **/
  async showCookieConsent(force = false): Promise<void> {
    const CookieConsentComponent = (
      await import('@europeana/metis-ui-consent-management')
    ).CookieConsentComponent;

    this.consentContainer.clear();

    const cookieConsent = this.consentContainer.createComponent(
      CookieConsentComponent
    );

    cookieConsent.setInput('translations', cookieConsentConfig.translations);
    cookieConsent.setInput('services', cookieConsentConfig.services);
    cookieConsent.setInput('fnLinkClick', (): void => {
      cookieConsent.instance.shrink();
      this.router.navigate(['/cookie-policy']);
    });

    if (force) {
      cookieConsent.instance.show();
    }
  }

  /** updateLocation
  /* - track form state in window location
  */
  updateLocation(): void {
    if (this.formCTZero.value.contentTierZero) {
      this.location.go(`/?${this.paramNameCTZero}=true`);
    } else {
      this.location.go('/');
    }
  }
}
