import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  ActivatedRoute,
  Event,
  NavigationEnd,
  Params,
  Router
} from '@angular/router';
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
  ctZeroForm: FormGroup;
  isLoading = true;
  landingData: GeneralResultsFormatted;
  landingComponentRef: LandingComponent;
  showPageTitle: boolean;

  constructor(
    private readonly api: APIService,
    private readonly clickService: ClickService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    super();
    document.title = 'Statistics Dashboard';
  }

  /** buildForm
   * - builds single-field form for the general data content-tier zero option
   **/
  buildForm(): void {
    this.ctZeroForm = new FormBuilder().group({
      contentTierZero: false
    });

    this.ctZeroForm.valueChanges.subscribe(()=> {
      console.log('TODO: update data');
    })
  }

  /** documentClick
   * - global document click handler
   * - push the clicked element to the clickService
   **/
  @HostListener('document:click', ['$event'])
  documentClick(event: { target: HTMLElement }): void {
    this.clickService.documentClickedTarget.next(event.target);
  }

  /** loadLandingData
  /* - loads the general breakdown data
  */
  loadLandingData(): void {
    this.subs.push(
      this.api.getGeneralResults().subscribe((general: GeneralResults) => {
        this.isLoading = false;
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
        if (this.landingComponentRef) {
          this.landingComponentRef.landingData = this.landingData;
        }
      })
    );
  }

  /** ngOnInit
  /* - subscribe to query param events
  */
  ngOnInit(): void {
    this.subs.push(
      this.route.queryParams.subscribe((params: Params) => {
        console.log('content-tier-zero = ' + params['content-tier-zero']);
        // TODO update the form to reflect the url
      })
    );
  }

  /** onOutletLoaded
  /* - invoked when router component loads: assing data if it's the landing page
  /* - (since @Input() is unavailable in router-outlet)
  */
  onOutletLoaded(component: LandingComponent | OverviewComponent): void {
    if (component instanceof LandingComponent) {
      this.landingComponentRef = component;
      component.landingData = this.landingData;
      this.showPageTitle = true;

      if (!this.ctZeroForm) {
        this.buildForm();
        this.loadLandingData();
      }
    } else {
      this.showPageTitle = false;
    }
  }
}
