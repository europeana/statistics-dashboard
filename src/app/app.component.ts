import { Location, PopStateEvent } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  LOCALE_ID,
  OnInit
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SubscriptionManager } from './subscription-manager';
import { APIService, ClickService } from './_services';
import {
  BreakdownResult,
  CountPercentageValue,
  GeneralResults,
  GeneralResultsFormatted
} from './_models';
import { LandingComponent } from './landing';
import { OverviewComponent } from './overview';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent extends SubscriptionManager implements OnInit {
  formCTZero: UntypedFormGroup;
  landingData: GeneralResultsFormatted;
  landingComponentRef: LandingComponent;
  paramNameCTZero = 'content-tier-zero';
  showPageTitle: boolean;
  lastSetContentTierZeroValue = false;
  skipLocationUpdate = false;

  constructor(
    private readonly api: APIService,
    private readonly clickService: ClickService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly location: Location,
    @Inject(LOCALE_ID) private readonly locale: string
  ) {
    super();
    document.title = 'Statistics Dashboard';
  }

  /** buildForm
   * - builds single-field form for the general data content-tier zero option
   **/
  buildForm(): void {
    this.formCTZero = new UntypedFormBuilder().group({
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
  getCtrlCTZero(): UntypedFormControl {
    return this.formCTZero.get('contentTierZero') as UntypedFormControl;
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

    this.location.subscribe((state: PopStateEvent) => {
      if (this.landingComponentRef) {
        // capture "back" and "forward" events / sync with form data
        const ctrlCTZero = this.getCtrlCTZero();
        this.lastSetContentTierZeroValue =
          `${state.url}`.indexOf('content-tier-zero=true') > -1;

        if (this.lastSetContentTierZeroValue !== ctrlCTZero.value) {
          this.skipLocationUpdate = true;
          ctrlCTZero.setValue(this.lastSetContentTierZeroValue);
        }
      }
    });
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
