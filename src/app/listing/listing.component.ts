import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import {
  DataProviderDatum,
  Facet,
  FacetField,
  ProviderDatum,
  RawFacet
} from '../_models';

import { SubscriptionManager } from '../subscription-manager/subscription.manager';
import { APIService } from '../_services';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent extends SubscriptionManager {
  @Input() showing?: boolean;

  dataProviderData: Array<ProviderDatum> = [];
  api: APIService;
  searchForm: FormGroup;
  filter: RegExp;

  constructor(api: APIService, fb: FormBuilder) {
    super();
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

  showHide(itemName: string, tf: boolean, linkDisabled = false): void {
    if (linkDisabled) {
      return;
    }

    const item = this.dataProviderData.filter((datum: ProviderDatum) => {
      return datum.name === itemName;
    })[0];

    item.dataProvidersShowing = tf;

    if (!item.dataProviders) {
      this.subs.push(this.setDataProviders(item).subscribe());
    }
    if (this.getIsFiltered()) {
      if (!item.dataProvidersForce) {
        item.dataProvidersShowing = false;
        item.dataProvidersForce = true;
      }
    }
  }

  getRootUrl(): string {
    const limitN = 1000;
    const limitS = `&f.DEFAULT.facet.limit=${limitN}`;
    return `?rows=0&${limitS}&profile=facets&facet=PROVIDER`;
  }

  loadProviderNames(): void {
    const url = `${this.getRootUrl()}&query=*`;
    this.subs.push(
      this.api.loadAPIData(url).subscribe((data: RawFacet) => {
        this.dataProviderData = data.facets[0].fields.map(
          (field: FacetField) => {
            return {
              name: field.label,
              count: field.count
            };
          }
        );
        this.batchLoad();
      })
    );
  }

  batchLoad(): void {
    const batchSize = 4;
    const batchToLoad = this.dataProviderData
      .filter((datum: ProviderDatum) => {
        return !datum.dataProviders;
      })
      .slice(0, batchSize)
      .map((datum: ProviderDatum) => {
        return this.setDataProviders(datum);
      });
    if (batchToLoad.length > 0) {
      const batch = forkJoin(batchToLoad).subscribe(() => {
        this.batchLoad();
        batch.unsubscribe();
      });
    }
  }

  setDataProviders(item: ProviderDatum): Observable<boolean> {
    const name = encodeURIComponent(item.name.replace(/\"/g, '\\"'));
    const nameParam = `&qf=PROVIDER:"${name}"`;
    const url = `${this.getRootUrl()}&facet=DATA_PROVIDER&query=*${nameParam}`;

    return this.api.loadAPIData(url).pipe(
      switchMap((data: RawFacet) => {
        const facet = data.facets
          .filter((facet: Facet) => {
            return facet.name === 'DATA_PROVIDER';
          })
          .pop();

        const dataProviders = facet.fields.map((field: FacetField) => {
          return {
            count: field.count,
            name: field.label
          } as DataProviderDatum;
        });

        dataProviders.unshift({
          count: item.count,
          name: item.name,
          isProvider: true
        } as DataProviderDatum);

        item.dataProviders = dataProviders;
        return of(true);
      })
    );
  }

  search(): void {
    const term = this.searchForm.value.searchTerm.replace(/\\/g, '');
    this.setFilter(term);
    this.clearForce();
  }

  clearForce(): void {
    this.dataProviderData.forEach((datum: ProviderDatum) => {
      datum.dataProvidersForce = false;
    });
  }

  resetSearchTerm(): void {
    this.searchForm.controls.searchTerm.setValue('');
  }

  getIsFiltered(): boolean {
    return this.searchForm.value.searchTerm.length > 0;
  }

  getFiltered(): Array<ProviderDatum> {
    return !this.getIsFiltered()
      ? this.dataProviderData
      : this.dataProviderData.map((datum: ProviderDatum) => {
          const innerList = datum.dataProviders
            ? datum.dataProviders.filter((item: DataProviderDatum) => {
                return item.name.match(this.filter);
              })
            : [];

          const dataProvidersShowing = datum.dataProvidersForce
            ? datum.dataProvidersShowing
            : innerList
            ? innerList.length > 0
            : false;

          return {
            count: datum.count,
            name: datum.name,
            dataProviders: innerList,
            dataProvidersShowing: dataProvidersShowing
          } as ProviderDatum;
        });
  }

  getUrl(dataProvider: string, isProvider = false): string {
    dataProvider = dataProvider.replace(/\"/g, '\\"');
    const server = 'https://www.europeana.eu/en/search';
    const facet = isProvider ? 'PROVIDER' : 'DATA_PROVIDER';
    return `${server}?qf=${facet}:"${encodeURIComponent(dataProvider)}"`;
  }
}
