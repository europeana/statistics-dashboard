import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ProviderDatum, RawFacet } from '../_models';

const DataProviderData = [
  {
    name: 'Aa aaa aaaaa',
    dataProviders: [
      { name: 'a1', count: 1 },
      { name: 'a2', count: 2 },
      { name: 'a3', count: 3 }
    ],
    dataProvidersShowing: true,
    count: 18787
  },
  {
    name: 'Bb bbb bbbbb',
    dataProviders: [
      { name: 'b1', count: 1 },
      { name: 'b2', count: 2 },
      { name: 'b3', count: 3 }
    ],
    dataProvidersShowing: true,
    count: 21355
  },
  {
    name: 'Cc ccc ccccc',
    dataProvidersShowing: false,
    count: 6529
  }
];

const MockAPIData = {
  facets: [
    {
      name: 'contentTier',
      fields: [
        {
          label: '4',
          count: 17050500
        },
        {
          label: '1',
          count: 16916984
        }
      ]
    },
    {
      name: 'metadataTier',
      fields: [
        {
          label: 'A',
          count: 2
        },
        {
          label: 'B',
          count: 3
        }
      ]
    },
    {
      name: 'COUNTRY',
      fields: [
        {
          label: 'France',
          count: 684
        },
        {
          label: 'Netherlands',
          count: 3170
        }
      ]
    },
    {
      name: 'TYPE',
      fields: [
        {
          label: 'Text',
          count: 2
        },
        {
          label: 'Video',
          count: 3
        }
      ]
    },
    {
      name: 'RIGHTS',
      fields: [
        {
          label: 'http://this.rights',
          count: 684
        },
        {
          label: 'http://that.rights',
          count: 3170
        }
      ]
    },
    {
      name: 'DATA_PROVIDER',
      fields: [
        {
          label: 'Data Provider A1',
          count: 2
        },
        {
          label: 'Data Provider A2',
          count: 2
        },
        {
          label: 'Data Provider B',
          count: 3
        }
      ]
    },
    {
      name: 'PROVIDER',
      fields: [
        {
          label: 'Provider A',
          count: 2
        },
        {
          label: 'Provider B',
          count: 3
        }
      ]
    }
  ],
  totalResults: 5
} as RawFacet;

export class MockAPIService {
  errorMode = false;

  loadAPIData(_: string): Observable<RawFacet> {
    if (this.errorMode) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return of({ items: [], totalResults: 0 } as any as RawFacet).pipe(
        delay(1)
      );
    }
    return of(MockAPIData).pipe(delay(1));
  }

  loadDataProviderData(): Observable<Array<ProviderDatum>> {
    return of(DataProviderData).pipe(delay(1));
  }
}

export class MockAPIServiceErrors extends MockAPIService {
  errorMode = true;
}
