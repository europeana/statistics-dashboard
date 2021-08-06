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
  GeneralResults,
  IHashStringArray,
  RawFacet,
  RequestFilter
} from '../src/app/_models';
import { facetNames } from '../src/app/_data';
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
      by: filterName,
      results: possibleValues.map((val: string) => {
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
                filterNames.slice(1, filterNames.length)
              )
            : undefined;

        return {
          count: valueCHOs.length,
          percentage: percentage,
          value: val,
          breakdown: nestedBreakdown
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
        this.sendResponse(response, JSON.parse(body) as BreakdownRequest);
      });
    } else {
      const result: GeneralResults = {
        allBreakdowns: facetNames.map((fName: string) => {
          return this.asBreakdown(this.allCHOs, [fName], this.generalShowTop);
        })
      };
      response.end(JSON.stringify(result));
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
          return !['createdDate', 'datasetName'].includes(fName);
        })
        .forEach((fName: string) => {
          const filter = breakdownRequest.filters[fName] as RequestFilter;
          if (filter.values) {
            if (!filter.values.includes(encodeURIComponent(cho[fName]))) {
              cho.exclusions.push(fName);
              res = false;
            }
          }
        });
      return res;
    });

    const filterOptions = facetNames.reduce(
      (result: IHashStringArray, fName: string) => {
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
        filterOptions: filterOptions,
        results: {
          value: 'ALL RECORDS',
          count: filteredCHOs.length,
          percentage: 100,
          breakdown: this.asBreakdown(
            filteredCHOs,
            Object.keys(breakdownRequest.filters)
          )
        }
      } as BreakdownResults)
    );
  }
})();
