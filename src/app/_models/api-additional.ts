import { IHash, NonFacetFilterNames } from './';

const additionalFilters: IHash<string> = {};
additionalFilters[NonFacetFilterNames.contentTierZero] = 'content-tier-zero';
additionalFilters[NonFacetFilterNames.dateFrom] = 'date-from';
additionalFilters[NonFacetFilterNames.dateTo] = 'date-to';
additionalFilters[NonFacetFilterNames.datasetId] = 'dataset-id';

export const nonFacetFilters = additionalFilters;
