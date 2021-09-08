import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  BreakdownRequest,
  BreakdownResults,
  DimensionName,
  GeneralResults,
  IHashString,
  RawFacet
} from '../_models';

export const MockAPIData = {
  facets: [
    {
      name: DimensionName.contentTier,
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
      name: DimensionName.RIGHTS,
      fields: [
        {
          label: 'http://creativecommons.org/licenses/by-nc-nd',
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

export const MockGeneralResults = {
  allBreakdowns: [
    {
      by: DimensionName.contentTier,
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
      by: 'COUNTRY',
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
      by: 'DATA_PROVIDER',
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
      by: 'metadataTier',
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
      by: 'PROVIDER',
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
      by: DimensionName.RIGHTS,
      results: [
        {
          count: 50,
          percentage: 5,
          value: 'https://creativecommons.org/licenses/by-nc-nd'
        },
        {
          count: 39,
          percentage: 3.9,
          value: 'https://creativecommons.org/licenses/by-nc-sa/4.0'
        },
        {
          count: 92,
          percentage: 9.2,
          value: 'https://creativecommons.org/licenses/by-nd/2.5/pl'
        },
        {
          count: 16,
          percentage: 1.6,
          value: 'https://creativecommons.org/licenses/by-nd/3.0/pl'
        },
        {
          count: 20,
          percentage: 2,
          value: 'https://rightsstatements.org/vocab/CNE/1.0'
        },
        {
          count: 18,
          percentage: 1.8,
          value: 'https://creativecommons.org/licenses/by/3.0/de'
        },
        {
          count: 14,
          percentage: 1.4,
          value: 'https://creativecommons.org/licenses/by/2.0/uk'
        },
        {
          count: 13,
          percentage: 1.3,
          value: 'https://rightsstatements.org/vocab/InC/1.0'
        }
      ]
    },
    {
      by: 'TYPE',
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
  filterOptions: {
    contentTier: ['0', '1', '2', '3'],
    COUNTRY: [
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
    DATA_PROVIDER: [
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
    PROVIDER: [
      'CARARE',
      'European Commission',
      'LoCloud',
      'The European Library',
      'Museu',
      'Federacja Bibliotek Cyfrowych',
      'Linked Heritage',
      'AthenaPlus'
    ],
    RIGHTS: [
      'https://creativecommons.org/licenses/by-nc-sa/4.0',
      'https://creativecommons.org/licenses/by-nd/2.5/pl',
      'https://creativecommons.org/licenses/by-nd/3.0/pl',
      'https://rightsstatements.org/vocab/CNE/1.0',
      'https://creativecommons.org/licenses/by/2.0/uk',
      'https://rightsstatements.org/vocab/InC/1.0',
      'https://creativecommons.org/licenses/by-nc-sa/3.0',
      'https://creativecommons.org/licenses/by-sa/3.0/de',
      'https://creativecommons.org/licenses/by/2.5/pl',
      'https://rightsstatements.org/vocab/InC-EDU/1.0',
      'https://creativecommons.org/licenses/by/3.0/pl',
      'https://creativecommons.org/licenses/by-nc-nd/3.0',
      'https://creativecommons.org/licenses/by/3.0/de',
      'https://creativecommons.org/licenses/by-sa',
      'https://creativecommons.org/licenses/by-sa/3.0/nl',
      'https://creativecommons.org/licenses/by-nc-sa/3.0/pl',
      'https://creativecommons.org/licenses/by-nc-sa/3.0/de',
      'https://creativecommons.org/licenses/by-nc-nd/3.0/pl',
      'https://creativecommons.org/licenses/by-nc/3.0/nl',
      'https://creativecommons.org/licenses/by-nc-nd/2.5/pl',
      'https://creativecommons.org/licenses/by-sa/4.0',
      'https://creativecommons.org/licenses/by/2.5',
      'https://creativecommons.org/licenses/by-nd/4.0',
      'https://creativecommons.org/licenses/by-nc-sa/2.5/pl',
      'https://creativecommons.org/licenses/by-nc-nd/3.0/de',
      'https://creativecommons.org/licenses/by-sa/3.0/',
      'https://creativecommons.org/licenses/by-nc/2.5/se',
      'https://creativecommons.org/licenses/by-nc-sa/3.0/ie',
      'https://creativecommons.org/licenses/by/3.0',
      'https://rightsstatements.org/vocab/NoC-NC/1.0',
      'https://creativecommons.org/licenses/by-nc-nd',
      'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de',
      'https://creativecommons.org/licenses/by-nc-nd/2.5/pt',
      'https://creativecommons.org/licenses/by-sa/2.5',
      'https://creativecommons.org/licenses/by-nc/3.0/de',
      'https://creativecommons.org/licenses/by-nc/2.5/pl',
      'https://rightsstatements.org/page/InC/1.0',
      'https://creativecommons.org/licenses/by-nc-sa/2.5/fr',
      'https://creativecommons.org/licenses/by-nc-nd/4.0',
      'https://creativecommons.org/licenses/by-nc/3.0/pl',
      'https://rightsstatements.org/vocab/InC-OW-EU/1.0',
      'https://creativecommons.org/licenses/by/4.0',
      'https://creativecommons.org/licenses/by-nc-nd/3.0/gr',
      'https://creativecommons.org/licenses/by/2.0/',
      'https://creativecommons.org/licenses/by-nc/4.0',
      'https://www.europeana.eu/rights/rr-f',
      'https://creativecommons.org/licenses/by-nd/3.0',
      'https://creativecommons.org/licenses/by-nc-nd/2.5',
      'https://creativecommons.org/publicdomain/mark/1.0',
      'https://creativecommons.org/licenses/by-nc/2.0/at',
      'https://creativecommons.org/licenses/by-nc-nd/3.0/es/deed.ca',
      'https://creativecommons.org/licenses/by-nd/3.0/de',
      'https://creativecommons.org/licenses/by-sa/3.0/pl',
      'https://creativecommons.org/licenses/by-nc-sa/2.5',
      'https://www.europeana.eu/rights/out-of-copyright-non-commercial',
      'https://creativecommons.org/licenses/by-nc-nd/2.0',
      'https://creativecommons.org/publicdomain/zero/1.0',
      'https://creativecommons.org/licenses/by-nc/3.0/pt',
      'https://creativecommons.org/licenses/by-sa/3.0',
      'https://creativecommons.org/licenses/by-nc/2.0',
      'https://creativecommons.org/licenses/by-nc-sa/3.0/es',
      'https://creativecommons.org/licenses/by-nc-nd/2.5/ch',
      'https://creativecommons.org/licenses/by-nc/3.0',
      'https://rightsstatements.org/vocab/NoC-OKLR/1.0'
    ],
    TYPE: ['IMAGE', 'SOUND', 'VIDEO']
  },
  results: {
    value: 'ALL RECORDS',
    count: 11,
    percentage: 100,
    breakdown: {
      by: 'COUNTRY',
      results: [
        {
          count: 1,
          percentage: 9.09,
          value: 'Denmark',
          breakdown: {
            by: DimensionName.RIGHTS,
            results: [
              {
                count: 1,
                percentage: 100,
                value: 'https://creativecommons.org/licenses/by/2.0/uk',
                breakdown: {
                  by: DimensionName.contentTier,
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
          breakdown: {
            by: DimensionName.RIGHTS,
            results: [
              {
                count: 1,
                percentage: 100,
                value: 'https://creativecommons.org/licenses/by/2.0/uk',
                breakdown: {
                  by: DimensionName.contentTier,
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
          breakdown: {
            by: DimensionName.RIGHTS,
            results: [
              {
                count: 1,
                percentage: 100,
                value: 'https://creativecommons.org/licenses/by/2.0/uk',
                breakdown: {
                  by: DimensionName.contentTier,
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
          breakdown: {
            by: DimensionName.RIGHTS,
            results: [
              {
                count: 1,
                percentage: 100,
                value: 'https://creativecommons.org/licenses/by/2.0/uk',
                breakdown: {
                  by: DimensionName.contentTier,
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
          breakdown: {
            by: DimensionName.RIGHTS,
            results: [
              {
                count: 1,
                percentage: 100,
                value: 'https://creativecommons.org/licenses/by/2.0/uk',
                breakdown: {
                  by: DimensionName.contentTier,
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
          breakdown: {
            by: DimensionName.RIGHTS,
            results: [
              {
                count: 1,
                percentage: 100,
                value: 'https://creativecommons.org/licenses/by/2.0/uk',
                breakdown: {
                  by: DimensionName.contentTier,
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
          breakdown: {
            by: DimensionName.RIGHTS,
            results: [
              {
                count: 1,
                percentage: 100,
                value: 'https://creativecommons.org/licenses/by/2.0/uk',
                breakdown: {
                  by: DimensionName.contentTier,
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
          breakdown: {
            by: DimensionName.RIGHTS,
            results: [
              {
                count: 1,
                percentage: 100,
                value: 'https://creativecommons.org/licenses/by/2.0/uk',
                breakdown: {
                  by: DimensionName.contentTier,
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
          breakdown: {
            by: DimensionName.RIGHTS,
            results: [
              {
                count: 1,
                percentage: 100,
                value: 'https://creativecommons.org/licenses/by/2.0/uk',
                breakdown: {
                  by: DimensionName.contentTier,
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
          breakdown: {
            by: DimensionName.RIGHTS,
            results: [
              {
                count: 1,
                percentage: 100,
                value: 'https://creativecommons.org/licenses/by/2.0/uk',
                breakdown: {
                  by: DimensionName.contentTier,
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
          breakdown: {
            by: DimensionName.RIGHTS,
            results: [
              {
                count: 1,
                percentage: 100,
                value: 'https://creativecommons.org/licenses/by/2.0/uk',
                breakdown: {
                  by: DimensionName.contentTier,
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

  loadAPIData(_: string): Observable<RawFacet> {
    if (this.errorMode) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return of({ items: [], totalResults: 0 } as any as RawFacet).pipe(
        delay(1)
      );
    }
    return of(MockAPIData).pipe(delay(1));
  }

  loadISOCountryCodes(): IHashString {
    return {
      Belgium: 'BE'
    };
  }

  getBreakdowns(_: BreakdownRequest): Observable<BreakdownResults> {
    if (this.errorMode) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return of({ filterOptions: {}, results: {} } as BreakdownResults).pipe(
        delay(1)
      );
    }
    return of(MockBreakdowns).pipe(delay(1));
  }

  getGeneralResults(): Observable<GeneralResults> {
    return of(MockGeneralResults).pipe(delay(1));
  }
}

export class MockAPIServiceErrors extends MockAPIService {
  errorMode = true;
}
