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

  // url parse utility
  // or:
  // http://localhost:3000/?filters={%22contentTier%22:{%22values%22:null},%22TYPE%22:{%22breakdown%22:0,%22values%22:[%22IMAGE%22,%22SOUND%22]},%22COUNTRY%22:{%22values%22:[%22Netherlands%22,%22France%22]}}
  // or:
  // http://localhost:3000/?filters={%22contentTier%22:{%22xvalues%22:null},%22TYPE%22:{%22breakdown%22:0,%22values%22:[%22TEXT%22,%22IMAGE%22,%22SOUND%22,%22VIDEO%22]},%22COUNTRY%22:{%22values%22:[%22Germany%22,%22Netherlands%22,%22France%22,%22Italy%22,%22Slovenia%22]}}
  getBreakdownRequest(route: string): BreakdownRequest {
    const params = url.parse(route, true).query;
    const res = { filters: { contentTier: {} } };

    if (params && params.filters) {
      // TODO: handlle POST

      const parsed = JSON.parse(params.filters as string);

      console.log('parsed parameter: ' + JSON.stringify(parsed, null, 4));
      res.filters = parsed;
    }
    return res as BreakdownRequest;
  }

  getDistinctValues(chos: Array<CHO>, filterName: string): Array<string> {
    return Object.keys(
      chos.reduce((map: IHashBoolean, cho: CHO) => {
        map[cho[filterName]] = true;
        return map;
      }, {})
    );
  }

  asBreakdown(
    chos: Array<CHO>,
    breakdownRequest: BreakdownRequest,
    depth = 0
  ): BreakdownResult {
    const filterNames = Object.keys(breakdownRequest.filters);
    const filterName = filterNames[depth];
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
          Object.keys(breakdownRequest.filters).length > depth + 1
            ? this.asBreakdown(valueCHOs, breakdownRequest, depth + 1)
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

    const breakdownRequest = this.getBreakdownRequest(request.url as string);

    const filteredCHOs = this.allCHOs.slice().filter((cho: CHO) => {
      let res = true;
      Object.keys(breakdownRequest.filters).forEach((fName: string) => {
        const filter = breakdownRequest.filters[fName] as RequestFilter;
        if (filter.values) {
          if (!filter.values.includes(cho[fName])) {
            res = false;
          }
        }
      });
      return res;
    });

    const filterOptions = Object.keys(breakdownRequest.filters).map(
      (fName: string) => {
        const possibleValues = this.getDistinctValues(filteredCHOs, fName);
        return {
          filter: fName,
          availableOptions: possibleValues
        };
      }
    );

    response.end(
      JSON.stringify({
        filterOptions: filterOptions,
        results: [this.asBreakdown(filteredCHOs, breakdownRequest)]
      } as BreakdownResults)
    );
  };
})();
