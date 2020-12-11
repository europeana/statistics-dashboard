import { Component } from '@angular/core';

import { DataProviderDatum, Facet, FacetField, RawFacet } from '../_models';
import { APIService } from '../_services';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent {
  dataProviderData: Array<DataProviderDatum>;
  api: APIService;

  constructor(api: APIService) {
    this.api = api;
    this.loadDataProviderNames();
  }

  showHide(item: DataProviderDatum, tf: boolean) {
    item.providersShowing = tf;
    if (tf && !item.providers) {
      this.setProviders(item);
    }
  }

  loadDataProviderNames(): void {
    const url = `https://api.europeana.eu/record/v2/search.json?wskey=api2demo&rows=0&profile=facets&facet=DATA_PROVIDER&query=*`;

    this.api.loadAPIData(url).subscribe((data: RawFacet) => {
      this.dataProviderData = data.facets[0].fields.map((field: FacetField) => {
        return {
          name: field.label
        };
      });
    });
  }

  setProviders(item: DataProviderDatum): void {
    const name = encodeURIComponent(item.name);
    const nameParam = `&qf=DATA_PROVIDER:"${name}"`;
    const url = `https://api.europeana.eu/record/v2/search.json?wskey=api2demo&rows=0&profile=facets&facet=PROVIDER&facet=DATA_PROVIDER&query=*${nameParam}`;

    this.api.loadAPIData(url).subscribe((data: RawFacet) => {
      item.providers = data.facets
        .filter((facet: Facet) => {
          return facet.name === 'PROVIDER';
        })
        .pop()
        .fields.map((field: FacetField) => {
          console.log('adding ' + field.label);
          return field.label;
        });
    });
  }
}
