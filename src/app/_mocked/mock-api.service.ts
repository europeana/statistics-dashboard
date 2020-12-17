import { Observable, of } from 'rxjs';
import { ProviderDatum, RawFacet } from '../_models';

const DataProviderData = [
  {
    name: 'Aa aaa aaaaa',
    providers: ['a1', 'a2', 'a3'],
    dataProvidersShowing: true
  },
  {
    name: 'Bb bbb bbbbb',
    providers: ['b1', 'b2', 'b3'],
    dataProvidersShowing: true
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
          label: 'Data Provider A',
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
      return of(({ items: [], totalResults: 0 } as any) as RawFacet);
    }
    return of(MockAPIData);
  }

  loadDataProviderData(): Observable<Array<ProviderDatum>> {
    return of(DataProviderData);
  }
}

export class MockAPIServiceErrors extends MockAPIService {
  errorMode = true;
}
