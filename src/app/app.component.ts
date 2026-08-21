import { Location, NgIf, PopStateEvent } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  Inject,
  LOCALE_ID,
  OnInit,
  viewChild,
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
import { APIService, ClickService, FilterStateService } from './_services';
import { GeneralResults, GeneralResultsFormatted } from './_models';
import { CookiePolicyComponent } from './cookie-policy';
import { CountryComponent } from './country';
import { LandingComponent } from './landing';
import { OverviewComponent } from './overview';
import { PrivacyStatementComponent } from './privacy-statement';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
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
  public filterStateService = inject(FilterStateService);

  formCTZero: FormGroup<{ contentTierZero: FormControl<boolean> }>;
  landingData: GeneralResultsFormatted;
  paramNameCTZero = 'content-tier-zero';
  showPageTitle: number;
  lastSetContentTierZeroValue = false;
  skipLocationUpdate = false;
  maintenanceInfo?: MaintenanceItem = undefined;

  consentContainer = viewChild('consentContainer', { read: ViewContainerRef });

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
          this.filterStateService.landingDataIsLoading.set(false);
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
          !!this.formCTZero.value.contentTierZero;
        this.filterStateService.includeCTZero.set(
          this.lastSetContentTierZeroValue
        );

        if (!this.skipLocationUpdate) {
          this.updateLocation();
        } else {
          this.skipLocationUpdate = false;
        }

        const basePath = this.location.path().split('?')[0];

        if (
          basePath === '' ||
          basePath === '/' ||
          basePath.startsWith('/country')
        ) {
          this.loadLandingData(this.lastSetContentTierZeroValue);
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
   * @returns the contentTierZero value as a FormControl
   **/
  getCtrlCTZero(): FormControl {
    return this.formCTZero.get('contentTierZero') as FormControl;
  }

  /*** loadLandingData
   * - binds rawGeneralData in filterStateService to api
   * @param { boolean: includeCTZero } - request content-tier-zero
   ***/
  loadLandingData(includeCTZero: boolean): void {
    this.filterStateService.landingDataIsLoading.set(true);
    this.subs.push(
      this.api
        .getGeneralResults(includeCTZero)
        .subscribe((general: GeneralResults) => {
          this.filterStateService.rawGeneralData.set(general);
          this.filterStateService.landingDataIsLoading.set(false);
        })
    );
  }

  /** setContentTierZeroValue
   *
   * - updates lastSetContentTierZeroValue
   * - aligns the content-tier zero control's value,
   *   flagging (via skipLocationUpdate) that the
   *   value change should not trigger another url
   *
   * @param { boolean } value - the value to set
   **/
  setContentTierZeroValue(value: boolean): void {
    const ctrlCTZero = this.getCtrlCTZero();
    this.lastSetContentTierZeroValue = value;
    this.filterStateService.includeCTZero.set(value);

    if (value !== ctrlCTZero.value) {
      this.skipLocationUpdate = true;
      ctrlCTZero.setValue(value);
    }
  }

  /**
   * handleLocationPopState
   * capture "back" and "forward" events and align the value of
   * the content-tier zero control with that in the (popped) url,
   * flagging (via skipLocationUpdate) that the value change
   * should not trigger another url change in turn
   *
   * @param { PopStateEvent } state - the event
   **/
  handleLocationPopState(state: PopStateEvent): void {
    const targetUrlString = state?.url || window.location.href;
    this.setContentTierZeroValue(
      `${targetUrlString}`.includes('content-tier-zero=true')
    );
  }

  /**
   * ngOnInit
   * - bind queryParam events to lastSetContentTierZeroValue
   * - bind location back / forward events to form
   **/
  ngOnInit(): void {
    this.subs.push(
      this.route.queryParams.subscribe((params: Params) => {
        const hasParam = params[this.paramNameCTZero] === 'true';
        this.filterStateService.includeCTZero.set(hasParam);
        this.lastSetContentTierZeroValue = hasParam;
      })
    );
    this.location.subscribe(this.handleLocationPopState.bind(this));
    this.buildForm();
  }

  setCTZeroInputToLastSetValue(ctrlCTZero: FormControl): void {
    if (!ctrlCTZero) return;
    this.skipLocationUpdate = true;
    ctrlCTZero.setValue(this.lastSetContentTierZeroValue);
  }

  /**
   * onOutletLoaded
   * Handles component rendering states
   **/
  onOutletLoaded(
    component:
      | LandingComponent
      | OverviewComponent
      | CountryComponent
      | PrivacyStatementComponent
      | CookiePolicyComponent
  ): void {
    const ctrlCTZero = this.getCtrlCTZero();
    const hasCountryMapData = this.filterStateService.hasCountryMapData();
    const isLanding = component instanceof LandingComponent;

    this.updateHeaderTitleState(component);
    this.handleComponentSetup(component);
    this.syncGlobalModeInputs(component, ctrlCTZero, hasCountryMapData);

    if (!isLanding && !hasCountryMapData) {
      this.loadLandingData(this.filterStateService.includeCTZero());
    }
  }

  private updateHeaderTitleState(component: unknown): void {
    if (component instanceof LandingComponent) {
      this.showPageTitle = HeaderComponent.PAGE_TITLE_SHOWING;
    } else if (component instanceof CountryComponent) {
      this.showPageTitle = HeaderComponent.PAGE_TITLE_MINIFIED;
    } else {
      this.showPageTitle = HeaderComponent.PAGE_TITLE_HIDDEN;
    }
  }

  private handleComponentSetup(component: unknown): void {
    if (component instanceof OverviewComponent) {
      component.locale = this.locale;
    }
  }

  private syncGlobalModeInputs(
    component: unknown,
    ctrlCTZero: FormControl,
    hasCountryMapData: boolean
  ): void {
    if (!ctrlCTZero) return;

    const isLanding = component instanceof LandingComponent;
    const isCountryMissingMap =
      component instanceof CountryComponent && !hasCountryMapData;

    if (isLanding || isCountryMissingMap) {
      this.setCTZeroInputToLastSetValue(ctrlCTZero);
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

    const container = this.consentContainer();
    if (!container) {
      console.warn('Consent container view child is not available yet.');
      return;
    }

    container.clear();
    const cookieConsent = container.createComponent(CookieConsentComponent);

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

  /**
   * updateLocation
   * toggle this.paramNameCTZero in window location
   **/
  updateLocation(): void {
    const path = this.location.path().split('?');
    const queryParams = this.filterStateService.includeCTZero()
      ? `?${this.paramNameCTZero}=true`
      : '';
    this.location.go(`${path[0]}${queryParams}`);
  }
}
