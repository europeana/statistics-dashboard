import { Component } from '@angular/core';

import { environment } from '../../environments/environment';
import { SubscriptionManager } from '../subscription-manager/subscription.manager';
import { FacetField, IdValue, NameValue, RawFacet } from '../_models';
import { APIService } from '../_services';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent extends SubscriptionManager {
  splashData: { [facetName: string]: Array<NameValue> | Array<IdValue> } = {};

  constructor(private api: APIService) {
    super();
    this.loadData('COUNTRY');
  }

  getUrl(facet: string): string {
    return `${environment.serverAPI}?query=*&wskey=api2demo&rows=0&profile=facets&facet=${facet}`;
  }

  loadData(facetName: string): void {
    const sub = this.api
      .loadAPIData(this.getUrl(facetName))
      .subscribe((rawResult: RawFacet) => {
        if (rawResult.facets) {
          this.splashData[facetName] = rawResult.facets[0].fields.map(
            (f: FacetField) => {
              return {
                name: f.label,
                value: f.count
              };
            }
          );
        }
      });
    this.subs.push(sub);
  }
}
