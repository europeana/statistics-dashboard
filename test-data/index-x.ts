import * as url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { TestDataServer } from '../tools/test-data-server/test-data-server';
import {
  BreakdownRequest,
  BreakdownResult,
  BreakdownResults,
  CountPercentageValue,
  Facet,
  FacetField,
  FilterOption,
  IHashStringArray,
  RawFacet,
  RequestFilter
} from '../src/app/_models';
import { facetNames } from '../src/app/_data';
import { CHO, IHashBoolean } from './_models/test-models';
import { DataGenerator } from './data-generator';

new (class extends TestDataServer {
  serverName = 'statistics-data-server';
  allCHOs: Array<CHO>;

  constructor() {
    super(3001);
    this.allCHOs = new DataGenerator().generateCHOs(1000);
  }

  // remove filter-exclusion data
  clearExclusions(): void {
    this.allCHOs.forEach((cho: CHO) => {
      cho.exclusions = [];
    });
  }

  getDistinctValues(chos: Array<CHO>, filterName: string): Array<string> {
    return Object.keys(
      chos.reduce((map: IHashBoolean, cho: CHO) => {
        map[cho[filterName]] = true;
        return map;
      }, {})
    );
  }

  asBreakdown(chos: Array<CHO>, filterNames: Array<string>): BreakdownResult {
    const filterName = filterNames[0];
    const possibleValues = this.getDistinctValues(chos, filterName);

    return {
      by: filterName,
      breakdown: possibleValues.map((val: string) => {
        const valueCHOs = chos.filter((cho: CHO) => {
          return `${cho[filterName]}` === `${val}`;
        });

        const percentage = parseFloat(
          ((valueCHOs.length / chos.length) * 100).toFixed(2)
        );

        const nestedBreakdown =
          filterNames.length > 0
            ? this.asBreakdown(
                valueCHOs,
                filterNames.slice(1, filterNames.length)
              )
            : undefined;

        return {
          count: valueCHOs.length,
          percentage: percentage,
          value: val,
          results: nestedBreakdown
        };
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
        this.sendResponse(response, [JSON.parse(body) as BreakdownRequest]);
      });
    } else {
      this.sendResponse(
        response,
        facetNames.map((fName: string) => {
          const res = { filters: {} };
          res.filters[fName] = {};
          return res;
        }),
        true
      );
    }
  };

  sendResponse(
    response: ServerResponse,
    breakdownRequests: Array<BreakdownRequest>,
    general = false
  ): void {
    const filteredCHOs = general
      ? this.allCHOs
      : this.allCHOs.slice().filter((cho: CHO) => {
          let res = true;
          Object.keys(breakdownRequests[0].filters)
            .filter((fName: string) => {
              return !['createdDate', 'datasetName'].includes(fName);
            })
            .forEach((fName: string) => {
              const filter = breakdownRequests[0].filters[
                fName
              ] as RequestFilter;
              if (filter.values) {
                if (!filter.values.includes(encodeURIComponent(cho[fName]))) {
                  cho.exclusions.push(fName);
                  res = false;
                }
              }
            });
          return res;
        });

    const filterOptions = general
      ? undefined
      : facetNames.map((fName: string) => {
          const nonExcluded = this.allCHOs.filter((cho: CHO) => {
            return (
              cho.exclusions.length === 0 ||
              (cho.exclusions.length === 1 && cho.exclusions[0] === fName)
            );
          });
          const possibleValues = this.getDistinctValues(nonExcluded, fName);
          return {
            filter: fName,
            availableOptions: possibleValues
          };
        });

    response.end(
      JSON.stringify({
        filterOptions: filterOptions,
        results: breakdownRequests.map((br: BreakdownRequest) => {
          return this.asBreakdown(filteredCHOs, Object.keys(br.filters));
        })
      } as BreakdownResults)
    );
  }
})();
