import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import {
  DataProviderDatum,
  ProviderDatum,
  Facet,
  FacetField,
  RawFacet
} from '../_models';
import { APIService } from '../_services';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent {
  @Input() showing?: boolean;

  dataProviderData: Array<ProviderDatum> = [];
  api: APIService;
  searchForm: FormGroup;
  filter: RegExp;
  server = 'https://api.europeana.eu/record/v2/search.json';

  constructor(api: APIService, fb: FormBuilder) {
    this.api = api;
    this.setFilter();
    this.loadProviderNames();
    this.searchForm = fb.group({
      searchTerm: ['']
    });
  }

  setFilter(term?: string): void {
    this.filter = new RegExp(term ? term : '.*');
  }

  showHide(itemName: string, tf: boolean): void {
    const item = this.dataProviderData.filter((datum: ProviderDatum) => {
      return datum.name === itemName;
    })[0];
    item.dataProvidersShowing = tf;

    if (!item.dataProviders) {
      this.setDataProviders(item);
    }
  }

  loadProviderNames(): void {
    const url = `${this.server}?wskey=api2demo&rows=0&profile=facets&facet=PROVIDER&query=*`;
    const sub = this.api.loadAPIData(url).subscribe((data: RawFacet) => {
      this.dataProviderData = data.facets[0].fields.map((field: FacetField) => {
        return {
          name: field.label
        };
      });
      this.chainLoad();
      setTimeout(() => {
        sub.unsubscribe();
      }, 1);
    });
  }

  chainLoad(): void {
    const nextToLoad = this.dataProviderData.find((datum: ProviderDatum) => {
      return !datum.dataProviders;
    });
    if (nextToLoad) {
      this.setDataProviders(nextToLoad, true);
    }
  }

  setDataProviders(item: ProviderDatum, doChainLoad = false): void {
    const name = encodeURIComponent(item.name);
    const nameParam = `&qf=PROVIDER:"${name}"`;
    const url = `${this.server}?wskey=api2demo&rows=0&profile=facets&facet=PROVIDER&facet=DATA_PROVIDER&query=*${nameParam}`;

    const sub = this.api
      .loadAPIData(url)
      .pipe(
        switchMap((data: RawFacet) => {
          const res = data.facets
            .filter((facet: Facet) => {
              return facet.name === 'DATA_PROVIDER';
            })
            .pop()
            .fields.map((field: FacetField) => {
              return {
                name: field.label
              } as DataProviderDatum;
            });

          res.unshift({
            name: item.name,
            isProvider: true
          } as DataProviderDatum);

          return of(res);
        })
      )
      .subscribe((dataProviders: Array<DataProviderDatum>) => {
        item.dataProviders = dataProviders;
        if (doChainLoad) {
          this.chainLoad();
        }
        setTimeout(() => {
          sub.unsubscribe();
        }, 1);
      });
  }

  search(): void {
    const term = this.searchForm.value.searchTerm;
    this.setFilter(term);
  }

  resetSearchTerm(): void {
    this.searchForm.controls.searchTerm.setValue('');
  }

  getIsFiltered(): boolean {
    return this.searchForm.value.searchTerm.length > 0;
  }

  getFiltered(): Array<ProviderDatum> {
    const filtered = this.getIsFiltered();

    return this.dataProviderData.map((datum: ProviderDatum) => {
      const innerList =
        filtered && datum.dataProviders
          ? datum.dataProviders.filter((item: DataProviderDatum) => {
              return item.name.match(this.filter);
            })
          : datum.dataProviders;

      const dataProvidersShowing = filtered
        ? innerList
          ? innerList.length > 0
          : false
        : datum.dataProvidersShowing;

      return {
        name: datum.name,
        dataProviders: innerList,
        dataProvidersShowing: dataProvidersShowing
      } as ProviderDatum;
    });
  }

  getUrl(dataProvider: string, isProvider = false): string {
    const server = 'https://www.europeana.eu/en/search';
    const facet = isProvider ? 'PROVIDER' : 'DATA_PROVIDER';
    return `${server}?qf=${facet}:"${encodeURIComponent(dataProvider)}"`;
  }
}
