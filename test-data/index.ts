import * as url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { TestDataServer } from '../tools/test-data-server/test-data-server';
import { RawFacet, Facet, FacetField, IHashArray } from '../src/app/_models';
import { facetNames, STATIC_DATA_RIGHTS } from '../src/app/_data';
import {
  CHO,
  CountryDescriptor,
  DataProviderDescriptor,
  ProviderDescriptor
} from './_models/test-models';
import {
  STATIC_COUNTRIES,
  STATIC_DATA_PROVIDERS,
  STATIC_PROVIDERS
} from './static-data';

new (class extends TestDataServer {
  serverName = 'statistics-dashboard';

  getParamMap(route: string): IHashArray {
    const params = url.parse(route, true).query;
    const qfMap: IHashArray = {};

    // function for adding a string to the qf parameter map
    const addToQF = (qf: string): void => {
      const param = qf.split(':');
      const paramName = param[0];
      const paramValue = this.unwrap(param[1]);

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

    const paramArray = Array.isArray(params['qf'])
      ? params['qf']
      : [params['qf']];

    paramArray.forEach((qf: string) => {
      addToQF(qf);
    });

    return qfMap;
  }

  generateCHOs = (totalCHO: number): Array<CHO> => {
    const getCountry = (i: number): CountryDescriptor => {
      const pool = STATIC_COUNTRIES.filter((descriptor: CountryDescriptor) => {
        return descriptor.dataProviders.length > 0;
      });
      return pool[i % pool.length];
    };

    const getProvider = (
      dataProvider: DataProviderDescriptor,
      i: number
    ): ProviderDescriptor => {
      const resId = dataProvider.providers[i % dataProvider.providers.length];
      return STATIC_PROVIDERS.find((dp: ProviderDescriptor) => {
        return dp.id === resId;
      });
    };

    const getDataProvider = (
      country: CountryDescriptor,
      i: number
    ): DataProviderDescriptor => {
      const resId = country.dataProviders[i % country.dataProviders.length];
      return STATIC_DATA_PROVIDERS.find((dp: DataProviderDescriptor) => {
        return dp.id === resId;
      });
    };

    const getRights = (i: number) => {
      const keys = Object.keys(STATIC_DATA_RIGHTS);
      const index = i % keys.length;
      return STATIC_DATA_RIGHTS[keys[index]];
    };

    const types = ['TEXT', 'IMAGE', 'SOUND', 'VIDEO', '3D'];
    const metadataTiers = ['0', 'A', 'B', 'C'];

    // the init the mega object representing all generated records
    return Array.from(Array(totalCHO).keys()).map((i: number) => {
      const random = i % 9 == 0 ? (i % 7 == 0 ? (i % 5 == 0 ? 0 : 1) : 2) : i;
      const type = types[random % types.length];
      const country = getCountry(i % (type.length * type.length));
      const dProvider = getDataProvider(country, i);
      return {
        datasetName: `dataset_${i}`,
        date: 0,
        contentTier: types.indexOf(type),
        COUNTRY: country.name,
        metadataTier: metadataTiers[random % 4],
        PROVIDER: getProvider(dProvider, i).name,
        DATA_PROVIDER: dProvider.name,
        TYPE: type,
        RIGHTS: getRights(i * dProvider.name.length),
        exclusions: []
      };
    });
  };

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

    if (request.method === 'OPTIONS') {
      response.setHeader(
        'Access-Control-Allow-Headers',
        'authorization,X-Requested-With,content-type'
      );
      response.setHeader(
        'Access-Control-Allow-Methods',
        'GET,HEAD,POST,PUT,DELETE,OPTIONS'
      );
      response.setHeader('Access-Control-Max-Age', '1800');
      response.setHeader(
        'Allow',
        'GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS, PATCH'
      );
      response.setHeader('Connection', 'Keep-Alive');
      response.end();
      return;
    }
    response.setHeader('Content-Type', 'application/json;charset=UTF-8');
    response.statusCode = 200;

    const allCHOs = this.generateCHOs(1000);
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

    // addCHO... all of them or a subset, depending on filter

    const paramMap = this.getParamMap(request.url as string);

    //if (!params['qf']) {
    if (Object.keys(paramMap).length === 0) {
      allCHOs.forEach((cho: CHO) => {
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

      allCHOs.forEach((cho: CHO) => {
        let includeRecord = true;

        Object.keys(paramMap).forEach((key: string) => {
          if (!testParam(cho, key, paramMap[key])) {
            includeRecord = false;
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
      allCHOs.forEach((cho: CHO) => {
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
            return a.count > b.count ? 1 : b.count > a.count ? -1 : 0;
          })
      });
    });
    response.end(JSON.stringify(convertedToResult));
  };
})();
