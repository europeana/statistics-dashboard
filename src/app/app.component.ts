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
import { isoCountryCodes } from './_data';
import { AppDateAdapter } from './_helpers';
import { APIService, ClickService } from './_services';
import {
  BreakdownResult,
  CountPercentageValue,
  CountryTotalInfo,
  GeneralResults,
  GeneralResultsFormatted
} from './_models';
import { CountryComponent } from './country';
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
  countryComponentRef: CountryComponent;
  paramNameCTZero = 'content-tier-zero';
  showPageTitle: number;
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

        // load landing data if on the landing page
        if (this.location.path().split('?')[0] === '') {
          this.loadLandingData(this.lastSetContentTierZeroValue);
        } else {
          this.countryComponentRef.includeCTZero =
            this.lastSetContentTierZeroValue;
        }
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

  /*** loadLandingData
   * - resets local landingData object
   * - loads the general breakdown data / reconstructs local object
   * - sets landingComponentRef landingData to local object
   * - derives countryTotalMap data and assigns to header component
   * @param { boolean: includeCTZero } - request content-tier-zero
   ***/
  loadLandingData(includeCTZero: boolean): void {
    if (this.landingComponentRef) {
      this.landingComponentRef.isLoading = true;
    }

    const countryTotalMap: { [key: string]: CountryTotalInfo } = {};

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
            if (br.breakdownBy === 'country') {
              br.results.forEach((result: CountPercentageValue) => {
                countryTotalMap[result.value] = {
                  total: result.count,
                  code: isoCountryCodes[result.value]
                };
              });
            }
          });

          if (this.landingComponentRef) {
            this.landingComponentRef.includeCTZero = includeCTZero;
            this.landingComponentRef.landingData = this.landingData;
            this.landingComponentRef.isLoading = false;
          }

          // assign country data
          this.header.countryTotalMap = countryTotalMap;
        })
    );
  }

  /**
   * handleLocationPopState
   * capture "back" and "forward" events / sync with form data
   * @param { PopStateEvent } state - the event
   **/
  handleLocationPopState(state: PopStateEvent): void {
    /* if there's a landing page in memory then get its form ctrl
       and align its value with that in the (popped) url, flagging
       (via skipLocationUpdate) that the form should not trigger
       another url change in turn
    */
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
    this.buildForm();
    this.loadLandingData(this.formCTZero.value.contentTierZero);
  }

  /** onOutletLoaded
  /* - invoked when router component loads
  /*    - handles component data binding
  /*    - sets showPageTitle
  /* - if it's the landing page (and ct-zero control value matches):
  /*      - assigns landing data
  /* - if ct-zero control value doesn't match:
  /*    - updates control (triggers data reload)
  /* - (OverviewComponent)
  /*    - unassigns landingComponentRef
  /*
  /* @param { LandingComponent | OverviewComponent | CountryComponent: component } - route component
  */
  onOutletLoaded(
    component: LandingComponent | OverviewComponent | CountryComponent
  ): void {
    const ctrlCTZero = this.getCtrlCTZero();
    const setCTZeroInputToLastSetValue = (): void => {
      this.skipLocationUpdate = true;
      ctrlCTZero.setValue(this.lastSetContentTierZeroValue);
    };

    if (component instanceof LandingComponent) {
      this.showPageTitle = HeaderComponent.PAGE_TITLE_SHOWING;
      this.landingComponentRef = component;
      this.landingComponentRef.includeCTZero = this.lastSetContentTierZeroValue;
      if (this.lastSetContentTierZeroValue !== ctrlCTZero.value) {
        setCTZeroInputToLastSetValue();
      } else {
        if (this.landingComponentRef && this.landingData) {
          this.landingComponentRef.landingData = this.landingData;
        }
      }
    } else {
      this.landingComponentRef = undefined;
      this.showPageTitle = HeaderComponent.PAGE_TITLE_HIDDEN;

      if (component instanceof OverviewComponent) {
        component.locale = this.locale;
      } else if (component instanceof CountryComponent) {
        this.countryComponentRef = component;
        component.includeCTZero = this.lastSetContentTierZeroValue;

        this.showPageTitle = HeaderComponent.PAGE_TITLE_MINIFIED;

        if (this.lastSetContentTierZeroValue !== ctrlCTZero.value) {
          setCTZeroInputToLastSetValue();
        }
      }
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
  /* - toggle this.paramNameCTZero in window location
  */
  updateLocation(): void {
    const path = this.location.path().split('?')[0];

    if (this.formCTZero.value.contentTierZero) {
      this.location.go(`${path}?${this.paramNameCTZero}=true`);
    } else {
      this.location.go(path);
    }
  }
}
