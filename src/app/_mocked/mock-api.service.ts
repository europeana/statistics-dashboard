import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  BreakdownRequest,
  BreakdownResults,
  DimensionName,
  GeneralResults,
  IHash,
  IHashArray,
  RequestFilter,
  TargetCountryData,
  TargetData,
  TargetMetaData
} from '../_models';

const rightsCategories = [
  'CC0',
  'CC BY',
  'CC BY-SA',
  'CC BY-ND',
  'CC BY-NC',
  'CC BY-NC-SA',
  'CC BY-NC-ND',
  'No Copyright - Non Commercial Re-Use Only',
  'No Copyright - Other Known Legal Restriction',
  'In Copyright - Educational Use Permitted',
  'In Copyright - EU Orphan Work',
  'In Copyright',
  'Copyright Not Evaluated'
];

export const MockGeneralResults = {
  allBreakdowns: [
    {
      breakdownBy: DimensionName.contentTier,
      results: [
        {
          count: 181,
          percentage: 18.1,
          value: '0'
        },
        {
          count: 190,
          percentage: 19,
          value: '1'
        },
        {
          count: 274,
          percentage: 27.4,
          value: '2'
        },
        {
          count: 178,
          percentage: 17.8,
          value: '3'
        },
        {
          count: 177,
          percentage: 17.7,
          value: '4'
        }
      ]
    },
    {
      breakdownBy: DimensionName.country,
      results: [
        {
          count: 61,
          percentage: 6.1,
          value: 'Austria'
        },
        {
          count: 95,
          percentage: 9.5,
          value: 'Belgium'
        },
        {
          count: 95,
          percentage: 9.5,
          value: 'Bulgaria'
        },
        {
          count: 96,
          percentage: 9.6,
          value: 'Croatia'
        },
        {
          count: 15,
          percentage: 1.5,
          value: 'Czech Republic'
        },
        {
          count: 52,
          percentage: 5.2,
          value: 'Denmark'
        },
        {
          count: 50,
          percentage: 5,
          value: 'Estonia'
        },
        {
          count: 51,
          percentage: 5.1,
          value: 'Europe'
        }
      ]
    },
    {
      breakdownBy: DimensionName.dataProvider,
      results: [
        {
          count: 61,
          percentage: 6.1,
          value:
            'Österreichische Nationalbibliothek - Austrian National Library'
        },
        {
          count: 95,
          percentage: 9.5,
          value: 'Meise Botanic Garden'
        },
        {
          count: 95,
          percentage: 9.5,
          value: 'WebFolk Bulgaria'
        },
        {
          count: 96,
          percentage: 9.6,
          value: 'Muzej za umjetnost i obrt, Zagreb'
        },
        {
          count: 15,
          percentage: 1.5,
          value: 'Národní památkový ústav'
        },
        {
          count: 22,
          percentage: 2.2,
          value: 'The Danish Agency for Culture'
        },
        {
          count: 50,
          percentage: 5,
          value: 'Eesti Sõjamuuseum - Kindral Laidoneri Muuseum'
        },
        {
          count: 51,
          percentage: 5.1,
          value: 'Catwalkpictures'
        }
      ]
    },
    {
      breakdownBy: DimensionName.metadataTier,
      results: [
        {
          count: 226,
          percentage: 22.6,
          value: '0'
        },
        {
          count: 234,
          percentage: 23.4,
          value: 'A'
        },
        {
          count: 318,
          percentage: 31.8,
          value: 'B'
        },
        {
          count: 222,
          percentage: 22.2,
          value: 'C'
        }
      ]
    },
    {
      breakdownBy: DimensionName.provider,
      results: [
        {
          count: 78,
          percentage: 7.8,
          value: 'The European Library'
        },
        {
          count: 34,
          percentage: 3.4,
          value: "HOPE - Heritage of the People's Europe"
        },
        {
          count: 95,
          percentage: 9.5,
          value: 'Athena'
        },
        {
          count: 146,
          percentage: 14.6,
          value: 'AthenaPlus'
        },
        {
          count: 40,
          percentage: 4,
          value: 'Europeana Sounds'
        },
        {
          count: 5,
          percentage: 0.5,
          value: 'eSbírky'
        },
        {
          count: 46,
          percentage: 4.6,
          value: 'CARARE'
        },
        {
          count: 50,
          percentage: 5,
          value: 'E-varamu'
        }
      ]
    },
    {
      breakdownBy: DimensionName.rightsCategory,
      results: [
        {
          count: 50,
          percentage: 5,
          value: rightsCategories[0]
        },
        {
          count: 39,
          percentage: 3.9,
          value: rightsCategories[1]
        },
        {
          count: 92,
          percentage: 9.2,
          value: rightsCategories[2]
        },
        {
          count: 16,
          percentage: 1.6,
          value: rightsCategories[3]
        },
        {
          count: 20,
          percentage: 2,
          value: rightsCategories[4]
        },
        {
          count: 18,
          percentage: 1.8,
          value: rightsCategories[5]
        },
        {
          count: 14,
          percentage: 1.4,
          value: rightsCategories[6]
        },
        {
          count: 13,
          percentage: 1.3,
          value: rightsCategories[7]
        }
      ]
    },
    {
      breakdownBy: DimensionName.type,
      results: [
        {
          count: 181,
          percentage: 18.1,
          value: 'TEXT'
        },
        {
          count: 190,
          percentage: 19,
          value: 'IMAGE'
        },
        {
          count: 274,
          percentage: 27.4,
          value: 'SOUND'
        },
        {
          count: 178,
          percentage: 17.8,
          value: 'VIDEO'
        },
        {
          count: 177,
          percentage: 17.7,
          value: '3D'
        }
      ]
    }
  ]
} as GeneralResults;

export const MockBreakdowns = {
  filteringOptions: {
    contentTier: ['0', '1', '2', '3'],
    country: [
      'Denmark',
      'Ireland',
      'Norway',
      'Finland',
      'Germany',
      'Portugal',
      'Poland',
      'Italy',
      'Holy See (Vatican City State)',
      'Croatia',
      'Iceland'
    ],
    dataProvider: [
      'The Danish Agency for Culture',
      'University College Cork',
      'The National Archives of Norway',
      'National Library of Finland',
      'Bildarchiv Foto Marburg',
      'Biblioteca Pública Municipal do Porto',
      'Wielkopolska Biblioteka Cyfrowa',
      'Internet Culturale',
      'Biblioteca Apostolica Vatican',
      'Muzej za umjetnost i obrt, Zagreb',
      'National Library of Spain'
    ],
    metadataTier: ['B', 'C'],
    provider: [
      'CARARE',
      'European Commission',
      'LoCloud',
      'The European Library',
      'Museu',
      'Federacja Bibliotek Cyfrowych',
      'Linked Heritage',
      'AthenaPlus'
    ],
    rightsCategory: rightsCategories,
    type: ['IMAGE', 'SOUND', 'VIDEO']
  },
  results: {
    value: 'ALL RECORDS',
    count: 11,
    percentage: 100,
    breakdowns: {
      breakdownBy: DimensionName.country,
      results: [
        {
          count: 1,
          percentage: 9.09,
          value: 'Denmark',
          breakdowns: {
            breakdownBy: DimensionName.rightsCategory,
            results: [
              {
                count: 1,
                percentage: 100,
                value: rightsCategories[7],
                breakdowns: {
                  breakdownBy: DimensionName.contentTier,
                  results: [
                    {
                      count: 1,
                      percentage: 100,
                      value: '1'
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          count: 1,
          percentage: 9.09,
          value: 'Ireland',
          breakdowns: {
            breakdownBy: DimensionName.rightsCategory,
            results: [
              {
                count: 1,
                percentage: 100,
                value: rightsCategories[8],
                breakdowns: {
                  breakdownBy: DimensionName.contentTier,
                  results: [
                    {
                      count: 1,
                      percentage: 100,
                      value: '1'
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          count: 1,
          percentage: 9.09,
          value: 'Norway',
          breakdowns: {
            breakdownBy: DimensionName.rightsCategory,
            results: [
              {
                count: 1,
                percentage: 100,
                value: rightsCategories[9],
                breakdowns: {
                  breakdownBy: DimensionName.contentTier,
                  results: [
                    {
                      count: 1,
                      percentage: 100,
                      value: '1'
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          count: 1,
          percentage: 9.09,
          value: 'Finland',
          breakdowns: {
            breakdownBy: DimensionName.rightsCategory,
            results: [
              {
                count: 1,
                percentage: 100,
                value: rightsCategories[10],
                breakdowns: {
                  breakdownBy: DimensionName.contentTier,
                  results: [
                    {
                      count: 1,
                      percentage: 100,
                      value: '2'
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          count: 1,
          percentage: 9.09,
          value: 'Germany',
          breakdowns: {
            breakdownBy: DimensionName.rightsCategory,
            results: [
              {
                count: 1,
                percentage: 100,
                value: rightsCategories[11],
                breakdowns: {
                  breakdownBy: DimensionName.contentTier,
                  results: [
                    {
                      count: 1,
                      percentage: 100,
                      value: '1'
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          count: 1,
          percentage: 9.09,
          value: 'Portugal',
          breakdowns: {
            breakdownBy: DimensionName.rightsCategory,
            results: [
              {
                count: 1,
                percentage: 100,
                value: rightsCategories[12],
                breakdowns: {
                  breakdownBy: DimensionName.contentTier,
                  results: [
                    {
                      count: 1,
                      percentage: 100,
                      value: '3'
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          count: 1,
          percentage: 9.09,
          value: 'Poland',
          breakdowns: {
            breakdownBy: DimensionName.rightsCategory,
            results: [
              {
                count: 1,
                percentage: 100,
                value: rightsCategories[0],
                breakdowns: {
                  breakdownBy: DimensionName.contentTier,
                  results: [
                    {
                      count: 1,
                      percentage: 100,
                      value: '2'
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          count: 1,
          percentage: 9.09,
          value: 'Italy',
          breakdowns: {
            breakdownBy: DimensionName.rightsCategory,
            results: [
              {
                count: 1,
                percentage: 100,
                value: rightsCategories[1],
                breakdowns: {
                  breakdownBy: DimensionName.contentTier,
                  results: [
                    {
                      count: 1,
                      percentage: 100,
                      value: '2'
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          count: 1,
          percentage: 9.09,
          value: 'Holy See (Vatican City State)',
          breakdowns: {
            breakdownBy: DimensionName.rightsCategory,
            results: [
              {
                count: 1,
                percentage: 100,
                value: rightsCategories[2],
                breakdowns: {
                  breakdownBy: DimensionName.contentTier,
                  results: [
                    {
                      count: 1,
                      percentage: 100,
                      value: '3'
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          count: 1,
          percentage: 9.09,
          value: 'Croatia',
          breakdowns: {
            breakdownBy: DimensionName.rightsCategory,
            results: [
              {
                count: 1,
                percentage: 100,
                value: rightsCategories[3],
                breakdowns: {
                  breakdownBy: DimensionName.contentTier,
                  results: [
                    {
                      count: 1,
                      percentage: 100,
                      value: '3'
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          count: 1,
          percentage: 9.09,
          value: 'Iceland',
          breakdowns: {
            breakdownBy: DimensionName.rightsCategory,
            results: [
              {
                count: 1,
                percentage: 100,
                value: rightsCategories[4],
                breakdowns: {
                  breakdownBy: DimensionName.contentTier,
                  results: [
                    {
                      count: 1,
                      percentage: 100,
                      value: '2'
                    }
                  ]
                }
              }
            ]
          }
        }
      ]
    }
  }
} as BreakdownResults;

export class MockAPIService {
  errorMode = false;

  loadIsoCountryCodes(): IHash<string> {
    return {
      Belgium: 'BE'
    };
  }

  getBreakdowns(br: BreakdownRequest): Observable<BreakdownResults> {
    if (this.errorMode) {
      return of({ filteringOptions: {}, results: {} } as BreakdownResults).pipe(
        delay(1)
      );
    } else if (br.filters.datasetId) {
      const datasetFilter = br.filters.datasetId as RequestFilter;
      if (datasetFilter.values[0] === 'EMPTY') {
        return of({} as unknown as BreakdownResults).pipe(delay(1));
      }
    }
    return of(MockBreakdowns).pipe(delay(1));
  }

  getGeneralResults(): Observable<GeneralResults> {
    return of(MockGeneralResults).pipe(delay(1));
  }

  getRightsCategoryUrls(
    rightsCategories: Array<string>
  ): Observable<Array<string>> {
    return of([`${rightsCategories[0]}/1.0`, `${rightsCategories[0]}/2.0`]);
  }

  getTargetMetaData(): Observable<IHash<IHashArray<TargetMetaData>>> {
    return of({});
  }

  loadCountryData(): Observable<Array<TargetCountryData>> {
    return of([]);
  }

  getCountryData(): Observable<IHash<Array<TargetData>>> {
    return of({});
  }
}

export class MockAPIServiceErrors extends MockAPIService {
  errorMode = true;
}
