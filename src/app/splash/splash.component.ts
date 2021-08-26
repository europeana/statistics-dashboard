import { Component } from '@angular/core';
import { externalLinks, facetNames } from '../_data';
import { Facet, FacetField, NameValuePercent, RawFacet } from '../_models';
import { APIService } from '../_services';
import { DataPollingComponent } from '../data-polling';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent extends DataPollingComponent {
  public externalLinks = externalLinks;
  barColour = '#0771ce';
  facetParam = facetNames
    .map((s: string) => {
      return `&facet=${s}`;
    })
    .join('');
  isLoading = true;
  splashData: {
    [facetName: string]: Array<NameValuePercent>;
  } = {};
  totalsData: { [facetName: string]: number } = {};
  url = `?query=*&rows=0&profile=facets${this.facetParam}`;

  constructor(private api: APIService) {
    super();
    this.beginPolling();
  }

  beginPolling(): void {
    this.createNewDataPoller(
      60 * 100000,
      () => {
        this.isLoading = true;
        return this.api.loadAPIData(this.url);
      },
      (rawResult: RawFacet) => {
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
      }
    );
  }

  percent(figure: number, total: number): number {
    return parseFloat(((figure / total) * 100).toFixed(2));
  }
}
