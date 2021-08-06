import * as url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { TestDataServer } from '../tools/test-data-server/test-data-server';
import { Facet, FacetField, IHashStringArray } from '../src/app/_models';
import { facetNames } from '../src/app/_data';
import { CHO } from './_models/test-models';
import { DataGenerator } from './data-generator';

new (class extends TestDataServer {
  serverName = 'api-server';

  constructor() {
    super();
    this.allCHOs = new DataGenerator().generateCHOs(1000);
  }

  // url parse utility
  getQueryMap(route: string): IHashStringArray {
    const params = url.parse(route, true).query;
    const qfMap: IHashStringArray = {};
    if (!params || !params['qf']) {
      return qfMap;
    }

    // function for adding a string to the qf parameter map
    const addToQF = (qf: string): void => {
      const paramIndex = qf.indexOf(':');
      const paramName = qf.slice(0, paramIndex);
      const paramValue = this.unwrap(qf.slice(paramIndex + 1));

      if (paramName === 'contentTier') {
        if (!qfMap['contentTier']) {
          qfMap['contentTier'] = paramValue.split(' OR ').map((str) => str);
        }
      } else if (!qfMap[paramName]) {
        qfMap[paramName] = [paramValue];
      } else {
        qfMap[paramName].push(paramValue);
      }
    };

    (Array.isArray(params['qf']) ? params['qf'] : [params['qf']]).forEach(
      (qf: string) => {
        addToQF(qf);
      }
    );

    return qfMap;
  }

  /** remove trailing and leading characters from a string
   **/
  unwrap(s: string): string {
    return s.slice(1, -1);
  }

  handleRequest = (
    request: IncomingMessage,
    response: ServerResponse
  ): void => {
    response.setHeader('Access-Control-Allow-Origin', '*');

    this.clearExclusions();

    if (request.method === 'OPTIONS') {
      this.handleOptions(response);
      return;
    }

    response.setHeader('Content-Type', 'application/json;charset=UTF-8');
    response.statusCode = 200;

    // temp structure used to aggregate CHOs
    const facetNameMap = {};

    facetNames.forEach((facetName: string) => {
      facetNameMap[facetName] = {};
    });

    let totalAdded = 0;

    // define function that adds a CHO's data into the facet map
    const addCHO = (cho: CHO): void => {
      totalAdded++;
      Object.keys(facetNameMap).forEach((key: string) => {
        const choFacetVal = cho[key];
        if (!facetNameMap[key][choFacetVal]) {
          facetNameMap[key][choFacetVal] = { label: choFacetVal, count: 1 };
        } else {
          facetNameMap[key][choFacetVal].count += 1;
        }
      });
    };

    // Add CHOs: all of them or a subset, depending on filter

    const paramMap = this.getQueryMap(request.url as string);

    if (Object.keys(paramMap).length === 0) {
      this.allCHOs.forEach((cho: CHO) => {
        addCHO(cho);
      });
    } else {
      // define parameter map and add selectively

      // filter condition utility
      const testParam = (
        cho: CHO,
        paramName: string,
        acceptValues: Array<unknown>
      ): boolean => {
        return acceptValues.includes(`${cho[paramName]}`);
      };

      this.allCHOs.forEach((cho: CHO) => {
        let includeRecord = true;

        Object.keys(paramMap).forEach((key: string) => {
          if (!testParam(cho, key, paramMap[key])) {
            includeRecord = false;
            // record that this record was excluded by this filter
            cho.exclusions.push(key);
          }
        });

        if (includeRecord) {
          addCHO(cho);
        }
      });
    }

    // init result-format object
    const convertedToResult = {
      totalResults: totalAdded,
      facets: []
    };

    // populate result-format object
    Object.keys(facetNameMap).forEach((facetName: string) => {
      const innerMap = facetNameMap[facetName];

      // supply facet options other than the actual selection
      this.allCHOs.forEach((cho: CHO) => {
        if (cho.exclusions.length === 1 && cho.exclusions[0] === facetName) {
          innerMap[cho[facetName]] = { label: cho[facetName], count: 0 };
        }
      });

      // convert map to array
      convertedToResult.facets.push({
        name: facetName,
        fields: Object.keys(innerMap)
          .map((key: string) => {
            return {
              label: key,
              count: innerMap[key].count
            } as FacetField;
          })
          .sort((a: FacetField, b: FacetField) => {
            return a.count > b.count ? -1 : b.count > a.count ? 1 : 0;
          })
      });
    });
    response.end(JSON.stringify(convertedToResult));
  };
})();
