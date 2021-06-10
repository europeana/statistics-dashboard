import { Component } from '@angular/core';
import { SubscriptionManager } from '../subscription-manager/subscription.manager';
import { Facet, FacetField, IdValue, NameValue, RawFacet } from '../_models';
import { APIService } from '../_services';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent extends SubscriptionManager {
  barColour = '#0771ce';
  facetNames = [
    'contentTier',
    'COUNTRY',
    'DATA_PROVIDER',
    'metadataTier',
    'PROVIDER',
    'RIGHTS',
    'TYPE'
  ];
  facetParam = this.facetNames
    .map((s: string) => {
      return `&facet=${s}`;
    })
    .join('');
  isLoading = true;
  splashData: { [facetName: string]: Array<NameValue> | Array<IdValue> } = {};
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
          this.splashData[f.name] = f.fields.map((f: FacetField) => {
            return {
              name: f.label,
              value: f.count
            };
          });
          this.totalsData[f.name] = f.fields.reduce(function (
            prev: FacetField,
            curr: FacetField
          ) {
            return {
              label: '',
              count: prev.count + curr.count
            };
          }).count;
        });
      });
    this.subs.push(sub);
  }

  percent(figure: number, total: number): number {
    return parseFloat(((figure / total) * 100).toFixed(2));
  }
}
