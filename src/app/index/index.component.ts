import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { DataProviderDatum, Facet, FacetField, RawFacet } from '../_models';
import { APIService } from '../_services';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent {
  @Input() showing?: boolean;

  dataProviderData: Array<DataProviderDatum> = [];
  api: APIService;
  searchForm: FormGroup;
  filter: RegExp;

  constructor(api: APIService, fb: FormBuilder) {
    this.api = api;
    this.setFilter();
    this.loadDataProviderNames();
    this.searchForm = fb.group({
      searchTerm: ['']
    });
  }

  setFilter(term?: string): void {
    this.filter = new RegExp(term ? term : '.*');
  }

  showHide(itemName: string, tf: boolean): void {
    const item = this.dataProviderData.filter((datum: DataProviderDatum) => {
      return datum.name === itemName;
    })[0];
    item.providersShowing = tf;

    if (!item.providers) {
      this.setProviders(item);
    }
  }

  loadDataProviderNames(): void {
    const url = `https://api.europeana.eu/record/v2/search.json?wskey=api2demo&rows=0&profile=facets&facet=DATA_PROVIDER&query=*`;

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
    const nextToLoad = this.dataProviderData.find(
      (datum: DataProviderDatum) => {
        return !datum.providers;
      }
    );
    if (nextToLoad) {
      this.setProviders(nextToLoad, true);
    }
  }

  setProviders(item: DataProviderDatum, doChainLoad = false): void {
    const name = encodeURIComponent(item.name);
    const nameParam = `&qf=DATA_PROVIDER:"${name}"`;
    const server = 'https://api.europeana.eu/record/v2/search.json';
    const url = `${server}?wskey=api2demo&rows=0&profile=facets&facet=PROVIDER&facet=DATA_PROVIDER&query=*${nameParam}`;

    const sub = this.api
      .loadAPIData(url)
      .pipe(
        switchMap((data: RawFacet) => {
          return of(
            data.facets
              .filter((facet: Facet) => {
                return facet.name === 'PROVIDER';
              })
              .pop()
              .fields.map((field: FacetField) => {
                return field.label;
              })
          );
        })
      )
      .subscribe((providers: Array<string>) => {
        item.providers = providers;
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

  getFiltered(): Array<DataProviderDatum> {
    const filtered = this.searchForm.value.searchTerm.length > 0;
    return this.dataProviderData.map((datum: DataProviderDatum) => {
      const innerList =
        filtered && datum.providers
          ? datum.providers.filter((name: string) => {
              return name.match(this.filter);
            })
          : datum.providers;
      const providersShowing = filtered
        ? innerList
          ? innerList.length > 0
          : false
        : datum.providersShowing;
      return {
        name: datum.name,
        providers: innerList,
        providersShowing: providersShowing
      };
    });
  }

  getUrl(provider: string): string {
    const server = 'https://www.europeana.eu/en/search';
    return `${server}?qf=PROVIDER:"${encodeURIComponent(provider)}"`;
  }
}
