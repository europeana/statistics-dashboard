import { Component } from '@angular/core';
import { SubscriptionManager } from '../subscription-manager/subscription.manager';
import { facetNames } from '../_data';
import {
  Facet,
  FacetField,
  IdValue,
  NameValuePercent,
  RawFacet
} from '../_models';
import { APIService } from '../_services';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent extends SubscriptionManager {
  barColour = '#0771ce';
  facetParam = facetNames
    .map((s: string) => {
      return `&facet=${s}`;
    })
    .join('');
  isLoading = true;
  splashData: {
    [facetName: string]: Array<NameValuePercent> | Array<IdValue>;
  } = {};
  totalsData: { [facetName: string]: number } = {};
  url = `?query=*&rows=0&profile=facets${this.facetParam}`;

  constructor(private api: APIService) {
    super();
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    const sub = this.api
      .loadAPIData(this.url)
      .subscribe((rawResult: RawFacet) => {
        this.isLoading = false;

        rawResult.facets.forEach((f: Facet) => {
          this.totalsData[f.name] = f.fields.reduce(function (
            prev: FacetField,
            curr: FacetField
          ) {
            return {
              label: '',
              count: prev.count + curr.count
            };
          }).count;

          this.splashData[f.name] = f.fields.map((ff: FacetField) => {
            return {
              name: ff.label,
              value: ff.count,
              percent: this.percent(ff.count, this.totalsData[f.name])
            };
          });
        });
      });
    this.subs.push(sub);
  }

  percent(figure: number, total: number): number {
    return parseFloat(((figure / total) * 100).toFixed(2));
  }
}
