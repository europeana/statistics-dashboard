import * as url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { TestDataServer } from '../tools/test-data-server/test-data-server';
import {
  BreakdownRequest,
  BreakdownResult,
  BreakdownResults,
  CountPercentageValue,
  DimensionName,
  FilterOption,
  GeneralResults,
  IHashArray,
  RequestFilter
} from '../src/app/_models';
import { facetNames } from '../src/app/_data';
import { STATIC_RIGHTS } from './static-data';
import { CHO, IHashBoolean } from './_models/test-models';
import { DataGenerator } from './data-generator';

new (class extends TestDataServer {
  serverName = 'statistics-data-server';
  generalShowTop = 8;

  constructor() {
    super(3001);
    this.allCHOs = new DataGenerator().generateCHOs(1000);
  }

  getDistinctValues(
    chos: Array<CHO>,
    filterName: string,
    top?: number
  ): Array<string> {
    let res = Object.keys(
      chos.reduce((map: IHashBoolean, cho: CHO) => {
        map[cho[filterName]] = true;
        return map;
      }, {})
    );
    if (top) {
      res = res.slice(0, top);
    }
    return res;
  }

  asBreakdown(
    chos: Array<CHO>,
    filterNames: Array<string>,
    top?: number
  ): BreakdownResult {
    const filterName = filterNames[0];
    const possibleValues = this.getDistinctValues(chos, filterName, top);

    return {
      breakdownBy: filterName,
      results: possibleValues
        .map((val: string) => {
          const valueCHOs = chos.filter((cho: CHO) => {
            return `${cho[filterName]}` === `${val}`;
          });
          const percentage = parseFloat(
            ((valueCHOs.length / chos.length) * 100).toFixed(2)
          );

          const nestedBreakdown =
            filterNames.length > 1
              ? this.asBreakdown(
                  valueCHOs,
                  filterNames.slice(1, filterNames.length),
                  top
                )
              : undefined;

          return {
            count: valueCHOs.length,
            percentage: percentage,
            value: val,
            breakdowns: nestedBreakdown
          };
        })
        .sort((cpv1: CountPercentageValue, cpv2: CountPercentageValue) => {
          if (!!top) {
            if (cpv1.count > cpv2.count) {
              return -1;
            } else if (cpv2.count > cpv1.count) {
              return 1;
            }
          }
          return 0;
        })
    };
  }

  handleRequest = (
    request: IncomingMessage,
    response: ServerResponse
  ): void => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    if (request.method === 'OPTIONS') {
      this.handleOptions(response);
      return;
    }

    response.setHeader('Content-Type', 'application/json;charset=UTF-8');
    response.statusCode = 200;

    this.clearExclusions();

    if (request.method === 'POST') {
      let body = '';
      request.on('data', (chunk) => {
        body += chunk;
      });
      request.on('end', () => {
        this.sendResponse(response, JSON.parse(body) as BreakdownRequest);
      });
    } else {
      const route = request.url as string;
      const params = url.parse(route, true).query;

      if (params['rightsCategory']) {
        const regExp = new RegExp(params['rightsCategory'] as string, 'gi');
        response.end(
          JSON.stringify(
            STATIC_RIGHTS.filter((url: string) => {
              return regExp.exec(url);
            })
          )
        );
      } else {
        const ctZero = params['content-tier-zero'] === 'true';

        let resultCHOs = this.allCHOs;

        if (!ctZero) {
          resultCHOs = resultCHOs.filter((cho: CHO) => {
            return cho[DimensionName.contentTier] !== '0';
          });
        }

        const result: GeneralResults = {
          allBreakdowns: facetNames.map((fName: string) => {
            return this.asBreakdown(resultCHOs, [fName], this.generalShowTop);
          })
        };
        response.end(JSON.stringify(result));
      }
    }
  };

  /** sendResponse
  /* @param { BreakdownRequest: breakdownRequests }
  */
  sendResponse(
    response: ServerResponse,
    breakdownRequest: BreakdownRequest
  ): void {
    const filteredCHOs = this.allCHOs.slice().filter((cho: CHO) => {
      let res = true;
      Object.keys(breakdownRequest.filters)
        .filter((fName: string) => {
          return !['updatedDate'].includes(fName);
        })
        .forEach((fName: string) => {
          const filter = breakdownRequest.filters[fName] as RequestFilter;
          if (filter.values) {
            if (fName === 'datasetId') {
              if (!filter.values.includes(cho.datasetId)) {
                res = false;
              }
            } else if (!filter.values.includes(cho[fName])) {
              cho.exclusions.push(fName);
              res = false;
            }
          }
        });
      return res;
    });

    const filterOptions = facetNames.reduce(
      (result: IHashArray<string>, fName: string) => {
        const nonExcluded = this.allCHOs.filter((cho: CHO) => {
          return (
            cho.exclusions.length === 0 ||
            (cho.exclusions.length === 1 && cho.exclusions[0] === fName)
          );
        });
        const possibleValues = this.getDistinctValues(nonExcluded, fName);
        result[fName] = possibleValues;
        return result;
      },
      {}
    );

    response.end(
      JSON.stringify({
        filteringOptions: filterOptions,
        results: {
          value: 'ALL RECORDS',
          count: filteredCHOs.length,
          percentage: 100,
          breakdowns: this.asBreakdown(
            filteredCHOs,
            Object.keys(breakdownRequest.filters)
          )
        }
      } as BreakdownResults)
    );
  }
})();
